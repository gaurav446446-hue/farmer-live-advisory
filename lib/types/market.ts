// TypeScript interfaces for market price data

/** A single mandi (wholesale market) price record from data.gov.in API */
export interface MandiRecord {
  state: string
  district: string
  market: string
  commodity: string
  variety: string
  grade: string
  arrival_date: string
  min_price: string
  max_price: string
  modal_price: string
}

/** Normalised price entry for a single crop in a single market */
export interface MarketPrice {
  commodity: string
  variety: string
  state: string
  district: string
  market: string
  /** INR per quintal */
  minPrice: number
  /** INR per quintal */
  maxPrice: number
  /** INR per quintal – most representative price */
  modalPrice: number
  arrivalDate: string
}

/** Price summary for a tracked crop, enriched with trend data */
export interface CropPriceSummary {
  /** Matches the id field in CropInfo from crop-data.ts */
  cropId: string
  cropName: string
  cropNameHi: string
  /** Modal price in INR per quintal */
  currentPrice: number
  minPrice: number
  maxPrice: number
  /** Simulated / cached price from the previous trading day */
  previousDayPrice: number | null
  /** Simulated / cached price from one week ago */
  weekAgoPrice: number | null
  /** Percentage change vs previous day (positive = risen) */
  priceChange: number
  /** Percentage change vs one week ago */
  weeklyChange: number
  trend: "up" | "stable" | "down"
  lastUpdated: string
  market: string
  state: string
  /** Whether this price came from the live API (true) or fallback data (false) */
  isLive: boolean
}

/** Full response from the market prices hook */
export interface MarketPricesData {
  crops: CropPriceSummary[]
  /** Unix timestamp of last successful fetch */
  lastFetchedAt: number
  state: string
  /** Whether all crop data is from the live API */
  isLiveData: boolean
}
