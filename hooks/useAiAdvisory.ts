"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { fetchFarmingAdvisory } from "@/lib/services/ollamaService"
import type { AdvisoryContext, AdvisoryData, AdvisoryCategory } from "@/lib/types/advisory"

interface UseAiAdvisoryOptions {
  /** Farming context used to generate relevant advice. */
  context?: AdvisoryContext
  /** Which advisory categories to fetch. Defaults to all five. */
  categories?: AdvisoryCategory[]
  /**
   * Auto-refresh interval in milliseconds.
   * Defaults to 0 (disabled) — advisory is not refreshed automatically
   * because Groq API calls consume quota.
   */
  refreshIntervalMs?: number
}

interface UseAiAdvisoryResult {
  advisory: AdvisoryData | null
  isLoading: boolean
  error: string | null
  /** Manually trigger a fresh fetch of AI advisory. */
  refresh: () => void
}

export function useAiAdvisory({
  context = {},
  categories,
  refreshIntervalMs = 0,
}: UseAiAdvisoryOptions = {}): UseAiAdvisoryResult {
  const [advisory, setAdvisory] = useState<AdvisoryData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stable serialised key so we only re-fetch when context actually changes
  const contextKey = useMemo(() => JSON.stringify(context), [context])
  const categoriesKey = useMemo(() => categories?.join(",") ?? "", [categories])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const parsedContext: AdvisoryContext = JSON.parse(contextKey)
      const items = await fetchFarmingAdvisory(parsedContext, categories)
      setAdvisory({
        items,
        generatedAt: Date.now(),
        context: parsedContext,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch AI advisory.")
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextKey, categoriesKey])

  // Fetch on mount and whenever context / categories change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Optional auto-refresh
  useEffect(() => {
    if (!refreshIntervalMs) return
    const id = setInterval(() => {
      fetchData()
    }, refreshIntervalMs)
    return () => clearInterval(id)
  }, [fetchData, refreshIntervalMs])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { advisory, isLoading, error, refresh }
}
