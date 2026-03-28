// Market prices service – fetches live mandi data from pyPricingAPI (eNAM),
// completely free with no API key required, and falls back to static data
// when the API is unreachable or returns no records.

import { crops as staticCrops } from "@/lib/crop-data"
import type { MandiRecord, MarketPrice, CropPriceSummary, MarketPricesData } from "@/lib/types/market"

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * pyPricingAPI – eNAM (e-National Agricultural Market) commodity prices.
 * No API key required. Free and unlimited.
 * GitHub: https://github.com/ag-chitta/pyPricingAPI
 */
const PYPRICINGAPI_BASE_URL =
  "https://k14y5popkj.execute-api.ap-south-1.amazonaws.com/stage/commodities"

/** How long to keep fetched data in the in-memory cache (30 minutes) */
const CACHE_TTL_MS = 30 * 60 * 1000

/**
 * Factors used to estimate historical prices when only today's live modal
 * price is available from the API.
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
// pyPricingAPI fetcher (no API key required)
// ---------------------------------------------------------------------------

/**
 * Fetch current mandi prices for a given commodity and place from pyPricingAPI.
 * Returns an empty array when the API is unreachable or returns no matching data.
 * No API key is required.
 */
async function fetchMandiPrices(commodity: string, place: string): Promise<MandiRecord[]> {
  const url = new URL(PYPRICINGAPI_BASE_URL)
  url.searchParams.set("place", place)
  url.searchParams.set("commodity", commodity)
  url.searchParams.set("type", "current")

  const res = await fetch(url.toString(), {
    next: { revalidate: 1800 },
  })

  if (!res.ok) {
    throw new Error(`pyPricingAPI error ${res.status} for ${commodity} in ${place}`)
  }

  // pyPricingAPI may return either a bare array of records or a wrapper
  // object with a `records` property, depending on query parameters.
  const json = await res.json() as MandiRecord[] | { records?: MandiRecord[] }
  return Array.isArray(json) ? json : (json.records ?? [])
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
 * Fetch market prices for all tracked crops for the given state/place.
 *
 * Uses pyPricingAPI (eNAM data) – no API key required.
 * Falls back to the bundled static dataset when the API is unreachable or
 * returns no records for a particular crop.
 */
export async function fetchMarketPrices(state = "Uttar Pradesh"): Promise<MarketPricesData> {
  const cacheKey = `market:${state.toLowerCase()}`
  const cached = getCached<MarketPricesData>(cacheKey)
  if (cached) return cached

  // pyPricingAPI uses a 'place' parameter – pass the state name directly.
  const place = state
  const summaries: CropPriceSummary[] = []
  let anyLive = false

  for (const [cropId, meta] of Object.entries(TRACKED_CROPS)) {
    try {
      const records = await fetchMandiPrices(meta.commodity, place)
      const agg = aggregatePrice(records)

      if (agg) {
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
