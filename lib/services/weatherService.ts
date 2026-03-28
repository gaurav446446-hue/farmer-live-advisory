// OpenWeatherMap API service for live weather data

export interface WeatherData {
  location: string
  country: string
  temperature: number
  feelsLike: number
  tempMin: number
  tempMax: number
  humidity: number
  windSpeed: number
  windDirection: number
  weatherMain: string
  weatherDescription: string
  weatherIcon: string
  cloudiness: number
  visibility: number
  pressure: number
  sunrise: number
  sunset: number
  precipitationChance: number
  timestamp: number
}

export interface ForecastDay {
  date: number
  tempMin: number
  tempMax: number
  humidity: number
  weatherMain: string
  weatherDescription: string
  weatherIcon: string
  precipitationChance: number
  windSpeed: number
}

export interface WeatherForecast {
  location: string
  country: string
  days: ForecastDay[]
}

const BASE_URL = "https://api.openweathermap.org/data/2.5"

// Simple in-memory cache to reduce API calls
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data as T
  }
  cache.delete(key)
  return null
}

function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
  if (!key) {
    throw new Error(
      "OpenWeatherMap API key is not configured. Please set NEXT_PUBLIC_OPENWEATHER_API_KEY in your .env.local file."
    )
  }
  return key
}

/**
 * Fetch current weather by geographic coordinates.
 */
export async function fetchWeatherByCoords(
  lat: number,
  lon: number,
  units: "metric" | "imperial" = "metric"
): Promise<WeatherData> {
  const cacheKey = `weather:coords:${lat}:${lon}:${units}`
  const cached = getCached<WeatherData>(cacheKey)
  if (cached) return cached

  const apiKey = getApiKey()
  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`

  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { message?: string }).message ?? `Failed to fetch weather (HTTP ${res.status})`
    )
  }

  const raw = await res.json()
  const data = mapCurrentWeather(raw)
  setCached(cacheKey, data)
  return data
}

/**
 * Fetch current weather by city name.
 */
export async function fetchWeatherByCity(
  city: string,
  units: "metric" | "imperial" = "metric"
): Promise<WeatherData> {
  const cacheKey = `weather:city:${city.toLowerCase()}:${units}`
  const cached = getCached<WeatherData>(cacheKey)
  if (cached) return cached

  const apiKey = getApiKey()
  const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=${units}&appid=${apiKey}`

  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { message?: string }).message ?? `Failed to fetch weather for "${city}" (HTTP ${res.status})`
    )
  }

  const raw = await res.json()
  const data = mapCurrentWeather(raw)
  setCached(cacheKey, data)
  return data
}

/**
 * Fetch 5-day / 3-hour forecast by coordinates, aggregated into daily data.
 */
export async function fetchForecastByCoords(
  lat: number,
  lon: number,
  units: "metric" | "imperial" = "metric"
): Promise<WeatherForecast> {
  const cacheKey = `forecast:coords:${lat}:${lon}:${units}`
  const cached = getCached<WeatherForecast>(cacheKey)
  if (cached) return cached

  const apiKey = getApiKey()
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`

  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { message?: string }).message ?? `Failed to fetch forecast (HTTP ${res.status})`
    )
  }

  const raw = await res.json()
  const data = mapForecast(raw)
  setCached(cacheKey, data)
  return data
}

// ---------------------------------------------------------------------------
// Internal mappers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCurrentWeather(raw: Record<string, any>): WeatherData {
  return {
    location: raw.name as string,
    country: (raw.sys as Record<string, unknown>)?.country as string,
    temperature: (raw.main as Record<string, number>)?.temp,
    feelsLike: (raw.main as Record<string, number>)?.feels_like,
    tempMin: (raw.main as Record<string, number>)?.temp_min,
    tempMax: (raw.main as Record<string, number>)?.temp_max,
    humidity: (raw.main as Record<string, number>)?.humidity,
    windSpeed: (raw.wind as Record<string, number>)?.speed,
    windDirection: (raw.wind as Record<string, number>)?.deg,
    weatherMain: (raw.weather as Array<Record<string, string>>)?.[0]?.main,
    weatherDescription: (raw.weather as Array<Record<string, string>>)?.[0]?.description,
    weatherIcon: (raw.weather as Array<Record<string, string>>)?.[0]?.icon,
    cloudiness: (raw.clouds as Record<string, number>)?.all,
    visibility: raw.visibility as number,
    pressure: (raw.main as Record<string, number>)?.pressure,
    sunrise: (raw.sys as Record<string, number>)?.sunrise,
    sunset: (raw.sys as Record<string, number>)?.sunset,
    precipitationChance: raw.pop != null ? Math.round((raw.pop as number) * 100) : 0,
    timestamp: raw.dt as number,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapForecast(raw: Record<string, any>): WeatherForecast {
  // Group 3-hour entries by calendar day (UTC date string)
  const byDay = new Map<string, Array<Record<string, unknown>>>()
  for (const item of raw.list as Array<Record<string, unknown>>) {
    const day = new Date((item.dt as number) * 1000).toISOString().slice(0, 10)
    if (!byDay.has(day)) byDay.set(day, [])
    byDay.get(day)!.push(item)
  }

  const days: ForecastDay[] = []
  for (const [, items] of byDay) {
    const temps = items.map((i) => (i.main as Record<string, number>)?.temp)
    const pops = items.map((i) => (i.pop as number) ?? 0)
    const midday = items[Math.floor(items.length / 2)]

    days.push({
      date: (midday.dt as number) * 1000,
      tempMin: Math.min(...temps),
      tempMax: Math.max(...temps),
      humidity: (midday.main as Record<string, number>)?.humidity,
      weatherMain: (midday.weather as Array<Record<string, string>>)?.[0]?.main,
      weatherDescription: (midday.weather as Array<Record<string, string>>)?.[0]?.description,
      weatherIcon: (midday.weather as Array<Record<string, string>>)?.[0]?.icon,
      precipitationChance: Math.round(Math.max(...pops) * 100),
      windSpeed: (midday.wind as Record<string, number>)?.speed,
    })

    if (days.length === 5) break
  }

  return {
    location: (raw.city as Record<string, string>)?.name,
    country: (raw.city as Record<string, string>)?.country,
    days,
  }
}
