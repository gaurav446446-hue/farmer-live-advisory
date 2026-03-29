// TypeScript interfaces for weather data

/** Current weather conditions at a specific location */
export interface WeatherData {
  /** City / location name returned by the API */
  location: string
  /** ISO 3166-1 alpha-2 country code (e.g. "IN") */
  country: string
  /** Current temperature in the requested unit */
  temperature: number
  /** "Feels like" temperature in the requested unit */
  feelsLike: number
  /** Minimum temperature for the current period */
  tempMin: number
  /** Maximum temperature for the current period */
  tempMax: number
  /** Relative humidity percentage (0–100) */
  humidity: number
  /** Wind speed in m/s (metric) or mph (imperial) */
  windSpeed: number
  /** Wind direction in meteorological degrees (0–360) */
  windDirection: number
  /** Short weather group label, e.g. "Clear", "Rain", "Clouds" */
  weatherMain: string
  /** Human-readable weather description, e.g. "light rain" */
  weatherDescription: string
  /** OpenWeatherMap icon code, e.g. "10d" */
  weatherIcon: string
  /** Cloud cover percentage (0–100) */
  cloudiness: number
  /** Visibility in metres */
  visibility: number
  /** Atmospheric pressure in hPa */
  pressure: number
  /** Sunrise time as a Unix timestamp (seconds) */
  sunrise: number
  /** Sunset time as a Unix timestamp (seconds) */
  sunset: number
  /** Probability of precipitation (0–100 %) */
  precipitationChance: number
  /** Data timestamp as a Unix timestamp (seconds) */
  timestamp: number
}

/** Aggregated weather data for a single forecast day */
export interface ForecastDay {
  /**
   * Representative timestamp for the forecast day, in **milliseconds** (ready
   * for `new Date(day.date)`). Unlike `WeatherData.timestamp`, which is
   * returned in seconds by the OpenWeatherMap API, this field is pre-multiplied
   * by 1,000 during response mapping.
   */
  date: number
  tempMin: number
  tempMax: number
  humidity: number
  weatherMain: string
  weatherDescription: string
  /** OpenWeatherMap icon code */
  weatherIcon: string
  /** Probability of precipitation (0–100 %) */
  precipitationChance: number
  windSpeed: number
}

/** 5-day weather forecast for a location */
export interface WeatherForecast {
  location: string
  country: string
  days: ForecastDay[]
}
