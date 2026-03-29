"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchMarketPrices, clearMarketCache } from "@/lib/services/marketService"
import type { MarketPricesData } from "@/lib/types/market"

/** Auto-refresh interval – 30 minutes (same as the service cache TTL) */
const DEFAULT_REFRESH_INTERVAL_MS = 30 * 60 * 1000

interface UseMarketPricesOptions {
  /** Auto-refresh interval in milliseconds. Set to 0 to disable. */
  refreshIntervalMs?: number
}

interface UseMarketPricesResult {
  data: MarketPricesData | null
  isLoading: boolean
  error: string | null
  /** Manually trigger a cache-busting refresh. */
  refresh: () => void
}

export function useMarketPrices({
  refreshIntervalMs = DEFAULT_REFRESH_INTERVAL_MS,
}: UseMarketPricesOptions = {}): UseMarketPricesResult {
  const [data, setData] = useState<MarketPricesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(
    async (bustCache = false) => {
      setIsLoading(true)
      setError(null)
      if (bustCache) clearMarketCache()

      try {
        const result = await fetchMarketPrices()
        setData(result)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch market prices."
        )
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Fetch on mount
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh on an interval
  useEffect(() => {
    if (!refreshIntervalMs) return
    const id = setInterval(() => {
      fetchData(true)
    }, refreshIntervalMs)
    return () => clearInterval(id)
  }, [fetchData, refreshIntervalMs])

  const refresh = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  return { data, isLoading, error, refresh }
}
