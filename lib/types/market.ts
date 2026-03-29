// TypeScript interfaces for market price data

// ---------------------------------------------------------------------------
// Alpha Vantage API types
// ---------------------------------------------------------------------------

/** A single data point returned by the Alpha Vantage commodity endpoints */
export interface AlphaVantageDataPoint {
  date: string
  value: string
}

/** Response envelope from the Alpha Vantage commodity endpoints */
export interface AlphaVantageCommodityResponse {
  name: string
  interval: string
  unit: string
  data: AlphaVantageDataPoint[]
  /** Present when the API returns an error message */
  "Error Message"?: string
  /** Present when the free-tier rate limit is exceeded */
  Information?: string
  /** Present when the API call frequency limit is exceeded */
  Note?: string
}

// ---------------------------------------------------------------------------
// Shared / normalised types
// ---------------------------------------------------------------------------

/** Price summary for a tracked commodity, enriched with trend data */
export interface CropPriceSummary {
  /** Internal commodity identifier */
  cropId: string
  cropName: string
  cropNameHi: string
  /** Current price (USD for Alpha Vantage, INR per quintal for static data) */
  currentPrice: number
  minPrice: number
  maxPrice: number
  /** Price from the previous period (previous month for Alpha Vantage) */
  previousDayPrice: number | null
  /** Price from approximately one week / one period ago */
  weekAgoPrice: number | null
  /** Percentage change vs previous period (positive = risen) */
  priceChange: number
  /** Percentage change vs the period before that */
  weeklyChange: number
  trend: "up" | "stable" | "down"
  lastUpdated: string
  market: string
  state: string
  /** Whether this price came from the live API (true) or fallback data (false) */
  isLive: boolean
  /** Price unit, e.g. "cents/bushel", "USD/barrel" */
  unit?: string
}

/** Full response from the market prices hook */
export interface MarketPricesData {
  crops: CropPriceSummary[]
  /** Unix timestamp of last successful fetch */
  lastFetchedAt: number
  state: string
  /** Whether any commodity data is from the live API */
  isLiveData: boolean
  /** Which data source was used */
  apiSource?: "alpha_vantage" | "static"
}
