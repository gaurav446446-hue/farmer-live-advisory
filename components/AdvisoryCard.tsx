"use client"

import { useAiAdvisory } from "@/hooks/useAiAdvisory"
import type { AdvisoryContext, AdvisoryCategory, AdvisoryItem } from "@/lib/types/advisory"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sprout,
  Droplets,
  FlaskConical,
  TrendingUp,
  Bug,
  RefreshCw,
  AlertTriangle,
  Bot,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AdvisoryCardProps {
  /** Farming context used to generate relevant advice. */
  context?: AdvisoryContext
  /** Which advisory categories to show. Defaults to all five. */
  categories?: AdvisoryCategory[]
  /** Custom CSS class applied to the outer wrapper. */
  className?: string
}

// ---------------------------------------------------------------------------
// Category metadata
// ---------------------------------------------------------------------------

const CATEGORY_META: Record<
  AdvisoryCategory,
  { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  planting: { label: "Planting", Icon: Sprout },
  irrigation: { label: "Irrigation", Icon: Droplets },
  fertilizer: { label: "Fertilizer", Icon: FlaskConical },
  market: { label: "Market", Icon: TrendingUp },
  pest: { label: "Pest & Disease", Icon: Bug },
}

const URGENCY_VARIANT: Record<
  "high" | "medium" | "low",
  "destructive" | "default" | "secondary"
> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AdvisoryItemCard({ item }: { item: AdvisoryItem }) {
  const meta = CATEGORY_META[item.category]
  const Icon = meta.Icon

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-semibold text-foreground">{item.title}</span>
        </div>
        {item.urgency && (
          <Badge variant={URGENCY_VARIANT[item.urgency]} className="text-xs capitalize shrink-0">
            {item.urgency}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{item.advice}</p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AdvisoryCard({ context = {}, categories, className }: AdvisoryCardProps) {
  const { advisory, isLoading, error, refresh } = useAiAdvisory({ context, categories })

  return (
    <Card className={`border-border bg-card ${className ?? ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Bot className="h-5 w-5 text-primary" />
            AI Farming Advisory
          </CardTitle>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={refresh}
            disabled={isLoading}
            title="Refresh advice"
            aria-label="Refresh AI advice"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Error state */}
        {error && !isLoading && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button size="sm" variant="outline" onClick={refresh}>
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && !advisory && (
          <>
            {Array.from({ length: categories?.length ?? 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </>
        )}

        {/* Advisory items */}
        {advisory && advisory.items.length > 0 && (
          <>
            {advisory.items.map((item) => (
              <AdvisoryItemCard key={item.category} item={item} />
            ))}
            <p className="text-right text-xs text-muted-foreground">
              Generated{" "}
              {new Date(advisory.generatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </>
        )}

        {/* Empty state after loading */}
        {!isLoading && !error && advisory?.items.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No advisory available. Please check your API key and try again.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
