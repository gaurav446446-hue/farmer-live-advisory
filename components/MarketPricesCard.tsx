"use client"

import { useMarketPrices } from "@/hooks/useMarketPrices"
import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart2,
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
  return Number.isInteger(price) ? price.toString() : price.toFixed(2)
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

  const { data, isLoading, error, refresh } = useMarketPrices()

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
              <BarChart2 className="h-5 w-5" />
              Global Commodity Prices
            </CardTitle>
            <CardDescription className="mt-1">
              {data?.isLiveData ? (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Wifi className="h-3.5 w-3.5" />
                  Live data · Alpha Vantage
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
            {data.crops.map((commodity) => (
              <div
                key={commodity.cropId}
                className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 md:flex-row md:items-center md:justify-between"
              >
                {/* Commodity identity */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <BarChart2 className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {language === "hi" ? commodity.cropNameHi : commodity.cropName}
                      </span>
                      {commodity.isLive && (
                        <Badge variant="outline" className="border-green-500/40 text-xs text-green-600 dark:text-green-400">
                          Live
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {commodity.unit ? `${commodity.market} · ${commodity.unit}` : commodity.market}
                    </div>
                  </div>
                </div>

                {/* Price data */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  {/* Current price */}
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Price</div>
                    <div className="text-base font-bold text-foreground">
                      {formatPrice(commodity.currentPrice)}
                    </div>
                  </div>

                  {/* Month-over-month change */}
                  <div className="flex items-center gap-1.5">
                    <TrendIcon trend={commodity.trend} />
                    <div>
                      <span className={`text-sm font-medium ${changeColor(commodity.priceChange)}`}>
                        {formatChange(commodity.priceChange)}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {commodity.isLive ? "vs last month" : "est. change"}
                      </div>
                    </div>
                  </div>

                  {/* Two-month change */}
                  <div className="text-right">
                    <span className={`text-sm font-medium ${changeColor(commodity.weeklyChange)}`}>
                      {formatChange(commodity.weeklyChange)}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {commodity.isLive ? "vs 2 months ago" : "est. trend"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* API key hint when showing reference data */}
        {data && !data.isLiveData && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Set{" "}
            <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY</code>{" "}
            in{" "}
            <code className="rounded bg-muted px-1 py-0.5">.env.local</code>{" "}
            to enable real-time global commodity prices.{" "}
            <a
              href="https://www.alphavantage.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Get a free key →
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
