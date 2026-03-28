"use client"

import { useWeather, type WeatherUnits } from "@/hooks/useWeather"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Eye,
  Gauge,
  RefreshCw,
  AlertTriangle,
  Sun,
  Cloud,
  CloudSnow,
  CloudLightning,
  Cloudy,
} from "lucide-react"

interface WeatherCardProps {
  /** Latitude — takes precedence over `city` when both are provided. */
  lat?: number
  /** Longitude — required when `lat` is provided. */
  lon?: number
  /** City name used when coordinates are not provided. */
  city?: string
  /** Unit system: "metric" (°C, m/s) or "imperial" (°F, mph). Defaults to "metric". */
  units?: WeatherUnits
  /** Whether to show the 5-day forecast section. Defaults to false. */
  showForecast?: boolean
  /** Custom CSS class applied to the outer card. */
  className?: string
}

function WeatherIcon({ main, className }: { main: string; className?: string }) {
  const cls = className ?? "h-8 w-8"
  switch (main?.toLowerCase()) {
    case "clear":
      return <Sun className={cls} />
    case "clouds":
      return <Cloudy className={cls} />
    case "rain":
    case "drizzle":
      return <CloudRain className={cls} />
    case "snow":
      return <CloudSnow className={cls} />
    case "thunderstorm":
      return <CloudLightning className={cls} />
    default:
      return <Cloud className={cls} />
  }
}

function windDirection(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
  return dirs[Math.round(deg / 45) % 8]
}

function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function WeatherCard({
  lat,
  lon,
  city,
  units = "metric",
  showForecast = false,
  className,
}: WeatherCardProps) {
  const { weather, forecast, isLoading, error, refresh } = useWeather({
    lat,
    lon,
    city,
    units,
    includeForecast: showForecast,
  })

  const tempUnit = units === "metric" ? "°C" : "°F"
  const speedUnit = units === "metric" ? "m/s" : "mph"

  if (isLoading && !weather) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-14 w-32" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`border-destructive/30 ${className ?? ""}`}>
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button size="sm" variant="outline" onClick={refresh}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!weather) return null

  return (
    <Card className={`border-border bg-card ${className ?? ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <WeatherIcon main={weather.weatherMain} className="h-5 w-5 text-primary" />
            {weather.location}
            {weather.country && (
              <Badge variant="outline" className="text-xs">
                {weather.country}
              </Badge>
            )}
          </CardTitle>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={refresh}
            title="Refresh weather"
            aria-label="Refresh weather"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Main temperature block */}
        <div className="flex items-end gap-4">
          <div className="flex items-center gap-3">
            <WeatherIcon main={weather.weatherMain} className="h-12 w-12 text-primary" />
            <div>
              <div className="text-5xl font-bold text-foreground">
                {Math.round(weather.temperature)}{tempUnit}
              </div>
              <div className="text-sm capitalize text-muted-foreground">
                {weather.weatherDescription}
              </div>
            </div>
          </div>
          <div className="mb-1 text-sm text-muted-foreground">
            <div>Feels like {Math.round(weather.feelsLike)}{tempUnit}</div>
            <div>
              H: {Math.round(weather.tempMax)}{tempUnit} / L: {Math.round(weather.tempMin)}{tempUnit}
            </div>
          </div>
        </div>

        {/* Metric grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricTile
            icon={<Droplets className="h-4 w-4 text-blue-500" />}
            label="Humidity"
            value={`${weather.humidity}%`}
          />
          <MetricTile
            icon={<Wind className="h-4 w-4 text-sky-400" />}
            label="Wind"
            value={`${weather.windSpeed} ${speedUnit}`}
            sub={windDirection(weather.windDirection)}
          />
          <MetricTile
            icon={<CloudRain className="h-4 w-4 text-indigo-400" />}
            label="Rain chance"
            value={`${weather.precipitationChance}%`}
          />
          <MetricTile
            icon={<Thermometer className="h-4 w-4 text-orange-400" />}
            label="Pressure"
            value={`${weather.pressure} hPa`}
          />
          <MetricTile
            icon={<Eye className="h-4 w-4 text-muted-foreground" />}
            label="Visibility"
            value={`${(weather.visibility / 1000).toFixed(1)} km`}
          />
          <MetricTile
            icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
            label="Cloud cover"
            value={`${weather.cloudiness}%`}
          />
          <MetricTile
            icon={<Sun className="h-4 w-4 text-yellow-400" />}
            label="Sunrise"
            value={formatTime(weather.sunrise)}
          />
          <MetricTile
            icon={<Sun className="h-4 w-4 text-orange-500" />}
            label="Sunset"
            value={formatTime(weather.sunset)}
          />
        </div>

        {/* 5-day forecast */}
        {showForecast && forecast && forecast.days.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">5-Day Forecast</h3>
            <div className="grid grid-cols-5 gap-2">
              {forecast.days.map((day) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center gap-1 rounded-lg border bg-muted/40 p-2 text-center"
                >
                  <span className="text-xs font-medium text-foreground">
                    {new Date(day.date).toLocaleDateString([], { weekday: "short" })}
                  </span>
                  <WeatherIcon main={day.weatherMain} className="h-5 w-5 text-primary" />
                  <span className="text-xs text-foreground">
                    {Math.round(day.tempMax)}{tempUnit}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(day.tempMin)}{tempUnit}
                  </span>
                  {day.precipitationChance > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-blue-500">
                      <CloudRain className="h-3 w-3" />
                      {day.precipitationChance}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-right text-xs text-muted-foreground">
          Updated {new Date(weather.timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </CardContent>
    </Card>
  )
}

function MetricTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
      {icon}
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  )
}
