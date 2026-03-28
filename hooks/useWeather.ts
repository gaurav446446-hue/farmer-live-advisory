"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  fetchWeatherByCoords,
  fetchWeatherByCity,
  fetchForecastByCoords,
  type WeatherData,
  type WeatherForecast,
} from "@/lib/services/weatherService"

export type WeatherUnits = "metric" | "imperial"

interface UseWeatherOptions {
  /** Latitude for coordinate-based lookup (takes precedence over city). */
  lat?: number
  /** Longitude for coordinate-based lookup (takes precedence over city). */
  lon?: number
  /** City name used when coordinates are not provided. */
  city?: string
  /** Temperature unit system. Defaults to "metric" (°C). */
  units?: WeatherUnits
  /** Auto-refresh interval in milliseconds. Set to 0 to disable. Defaults to 15 minutes. */
  refreshIntervalMs?: number
  /** Whether to also fetch the 5-day forecast. Defaults to false. */
  includeForecast?: boolean
}

interface UseWeatherResult {
  weather: WeatherData | null
  forecast: WeatherForecast | null
  isLoading: boolean
  error: string | null
  /** Manually trigger a refresh, bypassing the cache. */
  refresh: () => void
}

const DEFAULT_REFRESH_INTERVAL_MS = 15 * 60 * 1000 // 15 minutes

export function useWeather({
  lat,
  lon,
  city,
  units = "metric",
  refreshIntervalMs = DEFAULT_REFRESH_INTERVAL_MS,
  includeForecast = false,
}: UseWeatherOptions = {}): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<WeatherForecast | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const refreshCounterRef = useRef(0)

  const fetchData = useCallback(async () => {
    const hasCoords = lat != null && lon != null
    const hasCity = typeof city === "string" && city.trim().length > 0

    if (!hasCoords && !hasCity) {
      setError("Please provide either coordinates (lat/lon) or a city name.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [currentWeather, forecastData] = await Promise.all([
        hasCoords
          ? fetchWeatherByCoords(lat!, lon!, units)
          : fetchWeatherByCity(city!, units),
        includeForecast && hasCoords
          ? fetchForecastByCoords(lat!, lon!, units)
          : Promise.resolve(null),
      ])

      setWeather(currentWeather)
      if (includeForecast) setForecast(forecastData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data.")
    } finally {
      setIsLoading(false)
    }
  }, [lat, lon, city, units, includeForecast])

  // Fetch on mount and whenever the dependencies change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh on an interval
  useEffect(() => {
    if (!refreshIntervalMs) return
    const id = setInterval(() => {
      refreshCounterRef.current += 1
      fetchData()
    }, refreshIntervalMs)
    return () => clearInterval(id)
  }, [fetchData, refreshIntervalMs])

  const refresh = useCallback(() => {
    refreshCounterRef.current += 1
    fetchData()
  }, [fetchData])

  return { weather, forecast, isLoading, error, refresh }
}
