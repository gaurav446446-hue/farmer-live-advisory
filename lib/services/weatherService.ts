// Open-Meteo API service for live weather data (no API key required)
// https://open-meteo.com/

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

const FORECAST_BASE_URL = "https://api.open-meteo.com/v1/forecast"
const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search"

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

// ---------------------------------------------------------------------------
// WMO Weather Interpretation Code mapping
// ---------------------------------------------------------------------------

interface WeatherCondition {
  main: string
  description: string
  icon: string
}

function wmoCodeToCondition(code: number, isDay = true): WeatherCondition {
  const suffix = isDay ? "d" : "n"
  if (code === 0) return { main: "Clear", description: "clear sky", icon: `01${suffix}` }
  if (code === 1) return { main: "Clear", description: "mainly clear", icon: `01${suffix}` }
  if (code === 2) return { main: "Clouds", description: "partly cloudy", icon: `02${suffix}` }
  if (code === 3) return { main: "Clouds", description: "overcast", icon: `04${suffix}` }
  if (code === 45 || code === 48) return { main: "Fog", description: "fog", icon: `50${suffix}` }
  if (code === 51) return { main: "Drizzle", description: "light drizzle", icon: `09${suffix}` }
  if (code === 53) return { main: "Drizzle", description: "moderate drizzle", icon: `09${suffix}` }
  if (code === 55) return { main: "Drizzle", description: "dense drizzle", icon: `09${suffix}` }
  if (code === 56 || code === 57) return { main: "Drizzle", description: "freezing drizzle", icon: `09${suffix}` }
  if (code === 61) return { main: "Rain", description: "slight rain", icon: `10${suffix}` }
  if (code === 63) return { main: "Rain", description: "moderate rain", icon: `10${suffix}` }
  if (code === 65) return { main: "Rain", description: "heavy rain", icon: `10${suffix}` }
  if (code === 66 || code === 67) return { main: "Rain", description: "freezing rain", icon: `13${suffix}` }
  if (code === 71) return { main: "Snow", description: "slight snow", icon: `13${suffix}` }
  if (code === 73) return { main: "Snow", description: "moderate snow", icon: `13${suffix}` }
  if (code === 75) return { main: "Snow", description: "heavy snow", icon: `13${suffix}` }
  if (code === 77) return { main: "Snow", description: "snow grains", icon: `13${suffix}` }
  if (code === 80) return { main: "Rain", description: "slight rain showers", icon: `09${suffix}` }
  if (code === 81) return { main: "Rain", description: "moderate rain showers", icon: `09${suffix}` }
  if (code === 82) return { main: "Rain", description: "violent rain showers", icon: `09${suffix}` }
  if (code === 85 || code === 86) return { main: "Snow", description: "snow showers", icon: `13${suffix}` }
  if (code === 95) return { main: "Thunderstorm", description: "thunderstorm", icon: `11${suffix}` }
  if (code === 96 || code === 99) return { main: "Thunderstorm", description: "thunderstorm with hail", icon: `11${suffix}` }
  return { main: "Unknown", description: "unknown", icon: `50${suffix}` }
}

// ---------------------------------------------------------------------------
// Geocoding helper (city name → coordinates)
// ---------------------------------------------------------------------------

interface GeoResult {
  lat: number
  lon: number
  name: string
  country: string
}

async function geocodeCity(city: string): Promise<GeoResult> {
  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Geocoding request failed (HTTP ${res.status})`)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await res.json() as Record<string, any>
  if (!data.results || (data.results as unknown[]).length === 0) {
    throw new Error(`City "${city}" not found.`)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = data.results[0] as Record<string, any>
  return {
    lat: result.latitude as number,
    lon: result.longitude as number,
    name: result.name as string,
    country: (result.country_code as string) ?? "",
  }
}

/**
 * Reverse-geocode coordinates to a human-readable location name.
 * Uses the Nominatim OpenStreetMap API (free, no key required).
 * Falls back to a formatted coordinate string on error.
 */
async function reverseGeocode(lat: number, lon: number): Promise<{ name: string; country: string }> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    const res = await fetch(url, {
      headers: { "Accept-Language": "en", "User-Agent": "farmer-live-advisory/1.0" },
    })
    if (!res.ok) return { name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, country: "" }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await res.json() as Record<string, any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const address = data.address as Record<string, any> | undefined
    const name =
      (address?.city as string | undefined) ??
      (address?.town as string | undefined) ??
      (address?.village as string | undefined) ??
      (address?.county as string | undefined) ??
      `${lat.toFixed(2)}, ${lon.toFixed(2)}`
    const country = (address?.country_code as string | undefined)?.toUpperCase() ?? ""
    return { name, country }
  } catch {
    return { name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, country: "" }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch current weather by geographic coordinates using Open-Meteo.
 * No API key required.
 */
export async function fetchWeatherByCoords(
  lat: number,
  lon: number,
  units: "metric" | "imperial" = "metric"
): Promise<WeatherData> {
  const cacheKey = `weather:coords:${lat}:${lon}:${units}`
  const cached = getCached<WeatherData>(cacheKey)
  if (cached) return cached

  const tempUnit = units === "imperial" ? "fahrenheit" : "celsius"
  const windUnit = units === "imperial" ? "mph" : "kmh"
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "visibility",
      "surface_pressure",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(","),
    daily: "temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max",
    temperature_unit: tempUnit,
    wind_speed_unit: windUnit,
    forecast_days: "1",
    timezone: "auto",
  })

  const res = await fetch(`${FORECAST_BASE_URL}?${params}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch weather (HTTP ${res.status})`)
  }

  const raw = await res.json()
  const geo = await reverseGeocode(lat, lon)
  const data = mapCurrentWeather(raw, geo.name, geo.country)
  setCached(cacheKey, data)
  return data
}

/**
 * Fetch current weather by city name.
 * Geocodes the city using Open-Meteo Geocoding API, then fetches weather by coordinates.
 */
export async function fetchWeatherByCity(
  city: string,
  units: "metric" | "imperial" = "metric"
): Promise<WeatherData> {
  const cacheKey = `weather:city:${city.toLowerCase()}:${units}`
  const cached = getCached<WeatherData>(cacheKey)
  if (cached) return cached

  const geo = await geocodeCity(city)
  const data = await fetchWeatherByCoords(geo.lat, geo.lon, units)
  const result: WeatherData = { ...data, location: geo.name, country: geo.country }
  setCached(cacheKey, result)
  return result
}

/**
 * Fetch 5-day forecast by coordinates using Open-Meteo.
 * No API key required.
 */
export async function fetchForecastByCoords(
  lat: number,
  lon: number,
  units: "metric" | "imperial" = "metric"
): Promise<WeatherForecast> {
  const cacheKey = `forecast:coords:${lat}:${lon}:${units}`
  const cached = getCached<WeatherForecast>(cacheKey)
  if (cached) return cached

  const tempUnit = units === "imperial" ? "fahrenheit" : "celsius"
  const windUnit = units === "imperial" ? "mph" : "kmh"
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "weather_code",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "relative_humidity_2m_mean",
    ].join(","),
    temperature_unit: tempUnit,
    wind_speed_unit: windUnit,
    forecast_days: "5",
    timezone: "auto",
  })

  const res = await fetch(`${FORECAST_BASE_URL}?${params}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch forecast (HTTP ${res.status})`)
  }

  const raw = await res.json()
  const geo = await reverseGeocode(lat, lon)
  const data = mapForecast(raw, geo.name, geo.country)
  setCached(cacheKey, data)
  return data
}

// ---------------------------------------------------------------------------
// Internal mappers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCurrentWeather(raw: Record<string, any>, location: string, country: string): WeatherData {
  const current = raw.current as Record<string, number>
  const daily = raw.daily as Record<string, (number | string)[]>

  const sunriseMs = daily?.sunrise?.[0] ? new Date(daily.sunrise[0] as string).getTime() : 0
  const sunsetMs = daily?.sunset?.[0] ? new Date(daily.sunset[0] as string).getTime() : 0
  const nowMs = Date.now()
  const isDay = sunriseMs > 0 && sunsetMs > 0 ? nowMs >= sunriseMs && nowMs <= sunsetMs : true

  const condition = wmoCodeToCondition(current.weather_code ?? 0, isDay)

  return {
    location,
    country,
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    tempMin: (daily?.temperature_2m_min?.[0] as number) ?? current.temperature_2m,
    tempMax: (daily?.temperature_2m_max?.[0] as number) ?? current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    weatherMain: condition.main,
    weatherDescription: condition.description,
    weatherIcon: condition.icon,
    cloudiness: current.cloud_cover,
    visibility: current.visibility,
    pressure: current.surface_pressure,
    sunrise: sunriseMs > 0 ? Math.floor(sunriseMs / 1000) : 0,
    sunset: sunsetMs > 0 ? Math.floor(sunsetMs / 1000) : 0,
    precipitationChance: (daily?.precipitation_probability_max?.[0] as number) ?? 0,
    timestamp: Math.floor(nowMs / 1000),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapForecast(raw: Record<string, any>, location: string, country: string): WeatherForecast {
  const daily = raw.daily as Record<string, unknown[]>
  const times = daily.time as string[]

  const days: ForecastDay[] = times.slice(0, 5).map((time, i) => {
    const weatherCode = (daily.weather_code as number[])[i] ?? 0
    const condition = wmoCodeToCondition(weatherCode)
    return {
      date: new Date(time).getTime(),
      tempMin: (daily.temperature_2m_min as number[])[i],
      tempMax: (daily.temperature_2m_max as number[])[i],
      humidity: (daily.relative_humidity_2m_mean as number[])[i] ?? 0,
      weatherMain: condition.main,
      weatherDescription: condition.description,
      weatherIcon: condition.icon,
      precipitationChance: (daily.precipitation_probability_max as number[])[i] ?? 0,
      windSpeed: (daily.wind_speed_10m_max as number[])[i],
    }
  })

  return {
    location,
    country,
    days,
  }
}
