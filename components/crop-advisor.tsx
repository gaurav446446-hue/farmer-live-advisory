"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  soilTypes,
  states,
  getRecommendedCrops,
  getSupplyDemandAlert,
  type CropInfo,
} from "@/lib/crop-data"
import {
  Sprout,
  Droplets,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ThermometerSun,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

function SupplyDemandBadge({ level }: { level: "safe" | "caution" | "warning" }) {
  const { t } = useLanguage()

  if (level === "safe") {
    return (
      <Badge className="border-none bg-primary/15 text-accent-foreground">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        {t("common.safe")}
      </Badge>
    )
  }
  if (level === "warning") {
    return (
      <Badge className="border-none bg-destructive/15 text-destructive">
        <AlertTriangle className="mr-1 h-3 w-3" />
        {t("common.warning")}
      </Badge>
    )
  }
  return (
    <Badge className="border-none bg-secondary/40 text-secondary-foreground">
      <Info className="mr-1 h-3 w-3" />
      {t("common.caution")}
    </Badge>
  )
}

function DemandLabel({ level }: { level: string }) {
  const { t } = useLanguage()
  const labels: Record<string, string> = {
    low: t("common.low"),
    medium: t("common.medium"),
    high: t("common.high"),
    "very-high": t("common.veryHigh"),
  }
  return <span>{labels[level] || level}</span>
}

function SupplyLabel({ level }: { level: string }) {
  const { t } = useLanguage()
  const labels: Record<string, string> = {
    shortage: t("common.shortage"),
    balanced: t("common.balanced"),
    surplus: t("common.surplus"),
  }
  return <span>{labels[level] || level}</span>
}

function WaterLabel({ level }: { level: string }) {
  const { t } = useLanguage()
  const labels: Record<string, string> = {
    low: t("common.low"),
    medium: t("common.medium"),
    high: t("common.high"),
  }
  return <span>{labels[level] || level}</span>
}

function SeasonLabel({ season }: { season: string }) {
  const { t } = useLanguage()
  const labels: Record<string, string> = {
    kharif: t("common.kharif"),
    rabi: t("common.rabi"),
    zaid: t("common.zaid"),
  }
  return <span>{labels[season] || season}</span>
}

function CropCard({ crop, rank }: { crop: CropInfo; rank: number }) {
  const { t, language } = useLanguage()
  const [expanded, setExpanded] = useState(false)
  const alert = getSupplyDemandAlert(crop)

  const supplyColor =
    crop.currentSupplyLevel === "surplus"
      ? "text-destructive"
      : crop.currentSupplyLevel === "shortage"
        ? "text-accent-foreground"
        : "text-foreground"

  return (
    <Card className="border-border bg-card transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                #{rank}
              </div>
              <div>
                <h3 className="text-base font-semibold text-card-foreground">
                  {language === "hi" ? crop.nameHi : crop.name}
                </h3>
                <span className="text-xs text-muted-foreground">
                  <SeasonLabel season={crop.season} />
                </span>
              </div>
            </div>
            <SupplyDemandBadge level={alert.level} />
          </div>

          {/* Supply/Demand Alert */}
          <div
            className={`rounded-lg p-3 text-sm leading-relaxed ${
              alert.level === "warning"
                ? "bg-destructive/10 text-destructive"
                : alert.level === "safe"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {alert.message}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <BarChart3 className="h-3 w-3" />
                {t("advisor.profitability")}
              </div>
              <div className="flex items-center gap-2">
                <Progress value={crop.profitabilityScore} className="h-2 flex-1" />
                <span className="text-sm font-semibold text-foreground">{crop.profitabilityScore}</span>
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                {t("advisor.demand")}
              </div>
              <div className="text-sm font-semibold text-foreground">
                <DemandLabel level={crop.currentDemandLevel} />
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sprout className="h-3 w-3" />
                {t("advisor.supply")}
              </div>
              <div className={`text-sm font-semibold ${supplyColor}`}>
                <SupplyLabel level={crop.currentSupplyLevel} />
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Droplets className="h-3 w-3" />
                {t("advisor.waterReq")}
              </div>
              <div className="text-sm font-semibold text-foreground">
                <WaterLabel level={crop.waterRequirement} />
              </div>
            </div>
          </div>

          {/* Price Info */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="text-xs text-muted-foreground">{t("market.current")}</div>
              <div className="text-lg font-bold text-foreground">
                {"₹"}{crop.pricePerQuintal.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-muted-foreground"> /{t("market.perQuintal")}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {crop.priceTrend === "up" ? (
                <TrendingUp className="h-4 w-4 text-accent-foreground" />
              ) : crop.priceTrend === "down" ? (
                <TrendingDown className="h-4 w-4 text-destructive" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={`text-sm font-medium ${
                  crop.priceTrend === "up"
                    ? "text-accent-foreground"
                    : crop.priceTrend === "down"
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              >
                {crop.priceChange > 0 ? "+" : ""}{crop.priceChange}%
              </span>
            </div>
          </div>

          {/* Expand Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                {t("advisor.showLess")} <ChevronUp className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                {t("advisor.moreDetails")} <ChevronDown className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>

          {/* Expanded Details */}
          {expanded && (
            <div className="flex flex-col gap-3 border-t pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t("advisor.growingPeriod")}:</span>
                  <span className="font-medium text-foreground">{crop.growingPeriodDays} {t("advisor.days")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ThermometerSun className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t("advisor.temp")}:</span>
                  <span className="font-medium text-foreground">{crop.idealTempRange}</span>
                </div>
              </div>
              {crop.mspPrice && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{t("market.msp")}:</span>
                  <span className="font-medium text-foreground">{"₹"}{crop.mspPrice.toLocaleString("en-IN")} /{t("market.perQuintal")}</span>
                </div>
              )}
              <div className="rounded-lg bg-accent/50 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
                  <Lightbulb className="h-3 w-3" />
                  {t("advisor.tips")}
                </div>
                <ul className="flex flex-col gap-1.5">
                  {crop.tips.map((tip) => (
                    <li key={tip} className="text-xs leading-relaxed text-foreground">
                      &bull; {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function CropAdvisor() {
  const { t } = useLanguage()
  const [selectedSoil, setSelectedSoil] = useState<string>("")
  const [selectedState, setSelectedState] = useState<string>("")
  const [waterAvailability, setWaterAvailability] = useState<string>("")
  const [recommendations, setRecommendations] = useState<CropInfo[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleGetRecommendations = () => {
    if (!selectedSoil || !waterAvailability) return
    const results = getRecommendedCrops(selectedSoil, waterAvailability as "low" | "medium" | "high")
    setRecommendations(results)
    setHasSearched(true)
  }

  const selectedSoilInfo = soilTypes.find((s) => s.id === selectedSoil)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t("advisor.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("advisor.subtitle")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Input Form */}
        <div className="flex flex-col gap-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">{t("advisor.farmDetails")}</CardTitle>
              <CardDescription>{t("advisor.farmDetailsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Soil Type */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor="soil-type">
                  {t("advisor.soil")}
                </label>
                <Select value={selectedSoil} onValueChange={setSelectedSoil}>
                  <SelectTrigger id="soil-type" aria-label={t("advisor.selectSoil")}>
                    <SelectValue placeholder={t("advisor.selectSoil")} />
                  </SelectTrigger>
                  <SelectContent>
                    {soilTypes.map((soil) => (
                      <SelectItem key={soil.id} value={soil.id}>
                        {soil.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* State */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor="state">
                  {t("advisor.state")}
                </label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger id="state" aria-label={t("advisor.selectState")}>
                    <SelectValue placeholder={t("advisor.selectState")} />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Water Availability */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor="water">
                  {t("advisor.water")}
                </label>
                <Select value={waterAvailability} onValueChange={setWaterAvailability}>
                  <SelectTrigger id="water" aria-label={t("advisor.selectWater")}>
                    <SelectValue placeholder={t("advisor.selectWater")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("common.low")} - {t("advisor.waterLow")}</SelectItem>
                    <SelectItem value="medium">{t("common.medium")} - {t("advisor.waterMedium")}</SelectItem>
                    <SelectItem value="high">{t("common.high")} - {t("advisor.waterHigh")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGetRecommendations}
                disabled={!selectedSoil || !waterAvailability}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Sprout className="mr-2 h-4 w-4" />
                {t("advisor.submit")}
              </Button>
            </CardContent>
          </Card>

          {/* Soil Info Card */}
          {selectedSoilInfo && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base text-card-foreground">{selectedSoilInfo.name}</CardTitle>
                <CardDescription>{selectedSoilInfo.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{t("advisor.soilPh")}:</span>
                  <span className="font-medium text-foreground">{selectedSoilInfo.phRange}</span>
                </div>
                <div>
                  <div className="mb-1.5 text-xs text-muted-foreground">{t("advisor.characteristics")}:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSoilInfo.characteristics.map((char) => (
                      <Badge key={char} variant="outline" className="text-xs">
                        {char}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 text-xs text-muted-foreground">{t("advisor.commonRegions")}:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSoilInfo.regions.map((region) => (
                      <Badge key={region} variant="secondary" className="text-xs">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        <div>
          {hasSearched && recommendations.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  {t("advisor.results")} ({recommendations.length})
                </h2>
                <div className="flex items-center gap-2">
                  <Badge className="border-none bg-primary/15 text-accent-foreground">{t("common.safe")}</Badge>
                  <Badge className="border-none bg-secondary/40 text-secondary-foreground">{t("common.caution")}</Badge>
                  <Badge className="border-none bg-destructive/15 text-destructive">{t("common.warning")}</Badge>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {recommendations.map((crop, idx) => (
                  <CropCard key={crop.id} crop={crop} rank={idx + 1} />
                ))}
              </div>
            </div>
          )}
          {hasSearched && recommendations.length === 0 && (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
                <Sprout className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{t("advisor.noResults")}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("advisor.noResultsDesc")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {!hasSearched && (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                  <Sprout className="h-8 w-8 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{t("advisor.emptyTitle")}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("advisor.emptyDesc")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
