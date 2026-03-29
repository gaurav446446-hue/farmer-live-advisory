// Market prices service – fetches global commodity data from the Alpha Vantage
// API when an API key is provided, and falls back to static crop data otherwise.
//
// Sign up for a free key at https://www.alphavantage.co/
// Add to .env.local:  NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_key_here

import { crops as staticCrops } from "@/lib/crop-data"
import type {
  CropPriceSummary,
  MarketPricesData,
  AlphaVantageCommodityResponse,
  AlphaVantageDataPoint,
} from "@/lib/types/market"

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Alpha Vantage commodity prices API.
 * Sign up at https://www.alphavantage.co/ – free tier: 25 requests/day.
 */
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"

/** How long to keep fetched data in the in-memory cache (30 minutes) */
const CACHE_TTL_MS = 30 * 60 * 1000

/**
 * Commodities tracked via Alpha Vantage, keyed by an internal id.
 * `avFunction` is the Alpha Vantage `function` query parameter value.
 */
const TRACKED_COMMODITIES: Record<
  string,
  { avFunction: string; name: string; nameHi: string; unit: string }
> = {
  wheat: { avFunction: "WHEAT", name: "Wheat", nameHi: "गेहूं", unit: "cents/bushel" },
  corn: { avFunction: "CORN", name: "Corn", nameHi: "मक्का", unit: "cents/bushel" },
  cotton: { avFunction: "COTTON", name: "Cotton", nameHi: "कपास", unit: "cents/pound" },
  sugar: { avFunction: "SUGAR", name: "Sugar", nameHi: "चीनी", unit: "cents/pound" },
  coffee: { avFunction: "COFFEE", name: "Coffee", nameHi: "कॉफ़ी", unit: "cents/pound" },
  natural_gas: { avFunction: "NATURAL_GAS", name: "Natural Gas", nameHi: "प्राकृतिक गैस", unit: "USD/MMBtu" },
  crude_oil: { avFunction: "CRUDE_OIL_WTI", name: "Crude Oil (WTI)", nameHi: "कच्चा तेल (WTI)", unit: "USD/barrel" },
  copper: { avFunction: "COPPER", name: "Copper", nameHi: "तांबा", unit: "USD/ton" },
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
 * Parse a numeric price value from an Alpha Vantage data point.
 * Returns null when the value is "." (no data) or not a valid number.
 */
function parseAVValue(point: AlphaVantageDataPoint): number | null {
  const v = parseFloat(point.value)
  return isNaN(v) ? null : v
}

// ---------------------------------------------------------------------------
// Alpha Vantage fetcher
// ---------------------------------------------------------------------------

/**
 * Fetch monthly commodity price series from Alpha Vantage.
 * Returns null when the API key is missing, the rate limit is hit, or the
 * response is invalid.
 */
async function fetchAlphaVantageCommodity(
  avFunction: string,
  apiKey: string
): Promise<AlphaVantageCommodityResponse | null> {
  const url = new URL(ALPHA_VANTAGE_BASE_URL)
  url.searchParams.set("function", avFunction)
  url.searchParams.set("interval", "monthly")
  url.searchParams.set("apikey", apiKey)

  const res = await fetch(url.toString(), {
    next: { revalidate: 1800 },
  })

  if (!res.ok) {
    throw new Error(`Alpha Vantage HTTP ${res.status} for ${avFunction}`)
  }

  const json = (await res.json()) as AlphaVantageCommodityResponse

  // Detect API-level errors / rate limiting
  if (json["Error Message"] || json.Note || json.Information) {
    const msg = json["Error Message"] ?? json.Note ?? json.Information ?? "Unknown error"
    throw new Error(`Alpha Vantage API error for ${avFunction}: ${msg}`)
  }

  if (!Array.isArray(json.data) || json.data.length === 0) {
    return null
  }

  return json
}

// ---------------------------------------------------------------------------
// Static fallback builder
// ---------------------------------------------------------------------------

/**
 * Build a CropPriceSummary from the static crop-data.ts entry for a given
 * commodity id (using the overlapping ids: wheat, corn, cotton, etc.).
 */
function buildFallbackSummary(commodityId: string): CropPriceSummary | null {
  const meta = TRACKED_COMMODITIES[commodityId]
  if (!meta) return null

  // Try to find a matching static crop entry by id
  const staticCrop = staticCrops.find((c) => c.id === commodityId)
  const current = staticCrop?.pricePerQuintal ?? 100

  const prevMonthPrice = staticCrop?.priceChange
    ? Math.round(current / (1 + staticCrop.priceChange / 100))
    : Math.round(current * 0.98)
  const weekAgoPrice = Math.round(current * 0.95)

  return {
    cropId: commodityId,
    cropName: meta.name,
    cropNameHi: meta.nameHi,
    currentPrice: current,
    minPrice: Math.round(current * 0.95),
    maxPrice: Math.round(current * 1.05),
    previousDayPrice: prevMonthPrice,
    weekAgoPrice,
    priceChange: staticCrop?.priceChange ?? pct(current, prevMonthPrice),
    weeklyChange: pct(current, weekAgoPrice),
    trend: staticCrop?.priceTrend ?? "stable",
    lastUpdated: new Date().toISOString(),
    market: "Reference Data",
    state: "Global",
    isLive: false,
    unit: meta.unit,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch market prices for all tracked commodities.
 *
 * Uses the Alpha Vantage API when `NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY` is set
 * in the environment. Falls back to static reference data when the key is
 * absent or the API call fails.
 *
 * Sign up for a free key at https://www.alphavantage.co/
 */
export async function fetchMarketPrices(): Promise<MarketPricesData> {
  const cacheKey = "market:global"
  const cached = getCached<MarketPricesData>(cacheKey)
  if (cached) return cached

  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY ?? ""
  const summaries: CropPriceSummary[] = []
  let anyLive = false

  for (const [commodityId, meta] of Object.entries(TRACKED_COMMODITIES)) {
    if (apiKey) {
      try {
        const avData = await fetchAlphaVantageCommodity(meta.avFunction, apiKey)

        if (avData && avData.data.length > 0) {
          // Data is sorted newest-first
          const points = avData.data
          const currentPrice = parseAVValue(points[0])
          const prevMonthPrice = points.length > 1 ? parseAVValue(points[1]) : null
          const twoMonthsAgoPrice = points.length > 2 ? parseAVValue(points[2]) : null

          if (currentPrice !== null) {
            const priceChange = prevMonthPrice !== null ? pct(currentPrice, prevMonthPrice) : 0
            const weeklyChange = twoMonthsAgoPrice !== null ? pct(currentPrice, twoMonthsAgoPrice) : 0
            const roundedCurrent = Math.round(currentPrice * 100) / 100
            const roundedMin = prevMonthPrice !== null
              ? Math.round(Math.min(currentPrice, prevMonthPrice) * 100) / 100
              : roundedCurrent
            const roundedMax = prevMonthPrice !== null
              ? Math.round(Math.max(currentPrice, prevMonthPrice) * 100) / 100
              : roundedCurrent

            summaries.push({
              cropId: commodityId,
              cropName: meta.name,
              cropNameHi: meta.nameHi,
              currentPrice: roundedCurrent,
              minPrice: roundedMin,
              maxPrice: roundedMax,
              previousDayPrice: prevMonthPrice,
              weekAgoPrice: twoMonthsAgoPrice,
              priceChange,
              weeklyChange,
              trend: deriveTrend(priceChange),
              lastUpdated: points[0].date,
              market: "Global Market",
              state: "Global",
              isLive: true,
              unit: avData.unit || meta.unit,
            })
            anyLive = true
            continue
          }
        }
      } catch {
        // Fall through to static fallback for this commodity
      }
    }

    const fallback = buildFallbackSummary(commodityId)
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
    state: "Global",
    isLiveData: anyLive,
    apiSource: anyLive ? "alpha_vantage" : "static",
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
