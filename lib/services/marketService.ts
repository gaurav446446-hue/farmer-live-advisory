// Market prices service – fetches live mandi data from the Indian Government's
// data.gov.in Open Data API and falls back to static data when the key is absent.

import { crops as staticCrops } from "@/lib/crop-data"
import type { MandiRecord, MarketPrice, CropPriceSummary, MarketPricesData } from "@/lib/types/market"

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** data.gov.in commodity price resource ID */
const DATA_GOV_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
const DATA_GOV_BASE_URL = "https://api.data.gov.in/resource"

/** How long to keep fetched data in the in-memory cache (30 minutes) */
const CACHE_TTL_MS = 30 * 60 * 1000

/**
 * Factors used to estimate historical prices when only today's live modal
 * price is available from the API.  These are rough approximations – the
 * data.gov.in resource does not expose historical series.
 */
const PREV_DAY_FACTOR = 0.98  // approx. previous-trading-day price relative to current
const WEEK_AGO_FACTOR = 0.95  // approx. price one week ago relative to current

/** Crops we actively track, keyed by the internal cropId from crop-data.ts */
const TRACKED_CROPS: Record<string, { commodity: string; nameHi: string }> = {
  rice: { commodity: "Rice", nameHi: "चावल (धान)" },
  wheat: { commodity: "Wheat", nameHi: "गेहूं" },
  cotton: { commodity: "Cotton", nameHi: "कपास" },
  soybean: { commodity: "Soybean", nameHi: "सोयाबीन" },
  sugarcane: { commodity: "Sugarcane", nameHi: "गन्ना" },
  mustard: { commodity: "Mustard", nameHi: "सरसों" },
  chickpea: { commodity: "Gram", nameHi: "चना" },
  maize: { commodity: "Maize", nameHi: "मक्का" },
  groundnut: { commodity: "Groundnut", nameHi: "मूंगफली" },
  turmeric: { commodity: "Turmeric", nameHi: "हल्दी" },
  tomato: { commodity: "Tomato", nameHi: "टमाटर" },
  millet: { commodity: "Bajra(Pearl Millet/Cumbu)", nameHi: "बाजरा / ज्वार" },
}

// ---------------------------------------------------------------------------
// Simple in-memory cache
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (entry && Date.now() < entry.expiresAt) return entry.data as T
  cache.delete(key)
  return null
}

function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function pct(current: number, reference: number): number {
  if (!reference) return 0
  return Math.round(((current - reference) / reference) * 1000) / 10
}

function deriveTrend(change: number): "up" | "stable" | "down" {
  if (change > 1) return "up"
  if (change < -1) return "down"
  return "stable"
}

/**
 * Given a list of raw mandi records for a single commodity, return the
 * aggregate modal price across all markets (simple average).
 */
function aggregatePrice(records: MandiRecord[]): Pick<MarketPrice, "minPrice" | "maxPrice" | "modalPrice" | "market" | "state" | "arrivalDate"> | null {
  if (!records.length) return null

  const modals = records.map((r) => parseFloat(r.modal_price)).filter((v) => !isNaN(v))
  const mins = records.map((r) => parseFloat(r.min_price)).filter((v) => !isNaN(v))
  const maxs = records.map((r) => parseFloat(r.max_price)).filter((v) => !isNaN(v))

  if (!modals.length) return null

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

  return {
    modalPrice: Math.round(avg(modals)),
    minPrice: Math.round(mins.length ? Math.min(...mins) : modals[0]),
    maxPrice: Math.round(maxs.length ? Math.max(...maxs) : modals[0]),
    market: records[0].market,
    state: records[0].state,
    arrivalDate: records[0].arrival_date,
  }
}

// ---------------------------------------------------------------------------
// data.gov.in API fetcher
// ---------------------------------------------------------------------------

/**
 * Fetch mandi prices for a given commodity and state from data.gov.in.
 * Returns an empty array (not an error) when the API key is not configured.
 */
async function fetchMandiPrices(commodity: string, state: string, apiKey: string): Promise<MandiRecord[]> {
  const url = new URL(`${DATA_GOV_BASE_URL}/${DATA_GOV_RESOURCE_ID}`)
  url.searchParams.set("api-key", apiKey)
  url.searchParams.set("format", "json")
  url.searchParams.set("limit", "50")
  url.searchParams.set("filters[State]", state)
  url.searchParams.set("filters[Commodity]", commodity)

  const res = await fetch(url.toString(), {
    // Ensure we get a fresh result from the server (CDN caching is fine)
    next: { revalidate: 1800 },
  })

  if (!res.ok) {
    throw new Error(`data.gov.in API error ${res.status} for ${commodity} in ${state}`)
  }

  const json = await res.json() as { records?: MandiRecord[] }
  return json.records ?? []
}

// ---------------------------------------------------------------------------
// Static fallback builder
// ---------------------------------------------------------------------------

/**
 * Produce a CropPriceSummary from the static crop-data.ts entry.
 * Simulates yesterday/week-ago prices using the existing priceChange field.
 */
function buildFallbackSummary(cropId: string, state: string): CropPriceSummary | null {
  const staticCrop = staticCrops.find((c) => c.id === cropId)
  const meta = TRACKED_CROPS[cropId]
  if (!staticCrop || !meta) return null

  const current = staticCrop.pricePerQuintal
  // Back-calculate the previous-day and week-ago prices from the stored
  // percentage change so the displayed trend is consistent with the static data.
  const previousDayPrice = staticCrop.priceChange
    ? Math.round(current / (1 + staticCrop.priceChange / 100))
    : Math.round(current * PREV_DAY_FACTOR)
  const weekAgoPrice = staticCrop.priceChange
    ? Math.round(current / (1 + (staticCrop.priceChange * 5) / 100))
    : Math.round(current * WEEK_AGO_FACTOR)

  return {
    cropId,
    cropName: staticCrop.name,
    cropNameHi: staticCrop.nameHi,
    currentPrice: current,
    minPrice: Math.round(current * 0.95),
    maxPrice: Math.round(current * 1.05),
    previousDayPrice,
    weekAgoPrice,
    priceChange: staticCrop.priceChange,
    weeklyChange: pct(current, weekAgoPrice),
    trend: staticCrop.priceTrend,
    lastUpdated: new Date().toISOString(),
    market: "National Average",
    state,
    isLive: false,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch market prices for all tracked crops in the given state.
 *
 * - If `NEXT_PUBLIC_DATA_GOV_API_KEY` is set, live mandi data is fetched from
 *   data.gov.in; individual crop prices fall back to static data when the API
 *   returns no records.
 * - If the key is absent, all prices come from the bundled static dataset.
 */
export async function fetchMarketPrices(state = "Uttar Pradesh"): Promise<MarketPricesData> {
  const cacheKey = `market:${state.toLowerCase()}`
  const cached = getCached<MarketPricesData>(cacheKey)
  if (cached) return cached

  const apiKey = process.env.NEXT_PUBLIC_DATA_GOV_API_KEY ?? ""
  const summaries: CropPriceSummary[] = []
  let anyLive = false

  for (const [cropId, meta] of Object.entries(TRACKED_CROPS)) {
    if (apiKey) {
      try {
        const records = await fetchMandiPrices(meta.commodity, state, apiKey)
        const agg = aggregatePrice(records)

        if (agg) {
          // Use the static reference price as a historical baseline so that the
          // percentage change reflects meaningful movement against a known point
          // rather than a constant proportion of today's live price.
          const staticRef = staticCrops.find((c) => c.id === cropId)
          const prevDayPrice = staticRef
            ? Math.round(staticRef.pricePerQuintal * PREV_DAY_FACTOR)
            : Math.round(agg.modalPrice * PREV_DAY_FACTOR)
          const weekAgoPrice = staticRef
            ? staticRef.pricePerQuintal
            : Math.round(agg.modalPrice * WEEK_AGO_FACTOR)
          const priceChange = pct(agg.modalPrice, prevDayPrice)
          summaries.push({
            cropId,
            cropName: meta.commodity,
            cropNameHi: meta.nameHi,
            currentPrice: agg.modalPrice,
            minPrice: agg.minPrice,
            maxPrice: agg.maxPrice,
            previousDayPrice: prevDayPrice,
            weekAgoPrice,
            priceChange,
            weeklyChange: pct(agg.modalPrice, weekAgoPrice),
            trend: deriveTrend(priceChange),
            lastUpdated: agg.arrivalDate,
            market: agg.market,
            state: agg.state,
            isLive: true,
          })
          anyLive = true
          continue
        }
      } catch {
        // Fall through to static data for this crop
      }
    }

    const fallback = buildFallbackSummary(cropId, state)
    if (fallback) summaries.push(fallback)
  }

  // Sort: live data first, then by price descending
  summaries.sort((a, b) => {
    if (a.isLive !== b.isLive) return a.isLive ? -1 : 1
    return b.currentPrice - a.currentPrice
  })

  const result: MarketPricesData = {
    crops: summaries,
    lastFetchedAt: Date.now(),
    state,
    isLiveData: anyLive,
  }

  setCached(cacheKey, result)
  return result
}

/**
 * Clear the market prices cache (useful after a manual refresh).
 */
export function clearMarketCache(): void {
  for (const key of cache.keys()) {
    if (key.startsWith("market:")) cache.delete(key)
  }
}
