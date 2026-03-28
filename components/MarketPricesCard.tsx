"use client"

import { useState } from "react"
import { useMarketPrices } from "@/hooks/useMarketPrices"
import { useLanguage } from "@/lib/language-context"
import { states } from "@/lib/crop-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  IndianRupee,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function TrendIcon({ trend }: { trend: "up" | "stable" | "down" }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />
  return <Minus className="h-4 w-4 text-muted-foreground" />
}

function formatPrice(price: number): string {
  return price.toLocaleString("en-IN")
}

function formatChange(change: number): string {
  return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`
}

function changeColor(change: number): string {
  if (change > 1) return "text-green-600 dark:text-green-400"
  if (change < -1) return "text-destructive"
  return "text-muted-foreground"
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function PriceRowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-14" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MarketPricesCardProps {
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MarketPricesCard({ className }: MarketPricesCardProps) {
  const { language } = useLanguage()
  const [selectedState, setSelectedState] = useState("Uttar Pradesh")

  const { data, isLoading, error, refresh } = useMarketPrices({ state: selectedState })

  const lastUpdated = data?.lastFetchedAt
    ? new Date(data.lastFetchedAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <IndianRupee className="h-5 w-5" />
              Live Mandi Prices
            </CardTitle>
            <CardDescription className="mt-1">
              {data?.isLiveData ? (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Wifi className="h-3.5 w-3.5" />
                  Live data
                  {lastUpdated && <span className="text-muted-foreground"> · Updated {lastUpdated}</span>}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <WifiOff className="h-3.5 w-3.5" />
                  Reference prices
                  {lastUpdated && <> · {lastUpdated}</>}
                </span>
              )}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {/* State selector */}
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="icon"
              onClick={refresh}
              disabled={isLoading}
              aria-label="Refresh prices"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Error state */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && !data && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PriceRowSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Price list */}
        {data && (
          <div className="flex flex-col gap-3">
            {data.crops.map((crop) => (
              <div
                key={crop.cropId}
                className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 md:flex-row md:items-center md:justify-between"
              >
                {/* Crop identity */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <IndianRupee className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {language === "hi" ? crop.cropNameHi : crop.cropName}
                      </span>
                      {crop.isLive && (
                        <Badge variant="outline" className="border-green-500/40 text-xs text-green-600 dark:text-green-400">
                          Live
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{crop.market}</div>
                  </div>
                </div>

                {/* Price data */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  {/* Min – Max range */}
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Range</div>
                    <div className="text-sm text-foreground">
                      ₹{formatPrice(crop.minPrice)} – ₹{formatPrice(crop.maxPrice)}
                    </div>
                  </div>

                  {/* Modal / current price */}
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Modal price</div>
                    <div className="text-base font-bold text-foreground">
                      ₹{formatPrice(crop.currentPrice)}
                    </div>
                  </div>

                  {/* Day change */}
                  <div className="flex items-center gap-1.5">
                    <TrendIcon trend={crop.trend} />
                    <div>
                      <span className={`text-sm font-medium ${changeColor(crop.priceChange)}`}>
                        {formatChange(crop.priceChange)}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {crop.isLive ? "vs yesterday" : "est. vs yesterday"}
                      </div>
                    </div>
                  </div>

                  {/* Weekly change */}
                  <div className="text-right">
                    <span className={`text-sm font-medium ${changeColor(crop.weeklyChange)}`}>
                      {formatChange(crop.weeklyChange)}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {crop.isLive ? "vs last week" : "est. vs last week"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* API key hint */}
        {data && !data.isLiveData && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Set <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_DATA_GOV_API_KEY</code> in{" "}
            <code className="rounded bg-muted px-1 py-0.5">.env.local</code> to enable real-time mandi prices.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
