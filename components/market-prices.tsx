"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { crops } from "@/lib/crop-data"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  IndianRupee,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

function PriceTrendIcon({ trend }: { trend: "up" | "stable" | "down" }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-accent-foreground" />
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />
  return <Minus className="h-4 w-4 text-muted-foreground" />
}

export function MarketPrices() {
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState("all")

  const filteredCrops =
    activeTab === "all" ? crops : crops.filter((c) => c.season === activeTab)

  const chartData = crops
    .filter((c) => c.mspPrice !== null)
    .map((c) => ({
      name: language === "hi" ? c.nameHi : c.name,
      current: c.pricePerQuintal,
      msp: c.mspPrice || 0,
      trend: c.priceTrend,
    }))
    .sort((a, b) => b.current - a.current)
    .slice(0, 8)

  const upCount = crops.filter((c) => c.priceTrend === "up").length
  const downCount = crops.filter((c) => c.priceTrend === "down").length
  const stableCount = crops.filter((c) => c.priceTrend === "stable").length

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t("market.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("market.subtitle")}</p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
              <TrendingUp className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{upCount}</div>
              <div className="text-sm text-muted-foreground">{t("market.rising")}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <Minus className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stableCount}</div>
              <div className="text-sm text-muted-foreground">{t("market.stable")}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{downCount}</div>
              <div className="text-sm text-muted-foreground">{t("market.falling")}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Chart */}
      <Card className="mb-8 border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <BarChart3 className="h-5 w-5" />
            Price Comparison: Current vs MSP
          </CardTitle>
          <CardDescription>Top crops by current market price (per quintal)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
                />
                <Bar dataKey="current" name="Current Price" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.trend === "up"
                          ? "hsl(var(--primary))"
                          : entry.trend === "down"
                            ? "hsl(var(--destructive))"
                            : "hsl(var(--muted-foreground))"
                      }
                    />
                  ))}
                </Bar>
                <Bar dataKey="msp" name="MSP" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Price Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">All Crop Prices</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="kharif">{t("common.kharif")}</TabsTrigger>
              <TabsTrigger value="rabi">{t("common.rabi")}</TabsTrigger>
              <TabsTrigger value="zaid">{t("common.zaid")}</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="flex flex-col gap-3">
                {filteredCrops.map((crop) => (
                  <div
                    key={crop.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                        <IndianRupee className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {language === "hi" ? crop.nameHi : crop.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {crop.season === "kharif"
                            ? t("common.kharif")
                            : crop.season === "rabi"
                              ? t("common.rabi")
                              : t("common.zaid")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Supply Status */}
                      <div className="flex items-center gap-1.5">
                        {crop.currentSupplyLevel === "surplus" ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                        ) : crop.currentSupplyLevel === "shortage" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent-foreground" />
                        ) : null}
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            crop.currentSupplyLevel === "surplus"
                              ? "border-destructive/30 text-destructive"
                              : crop.currentSupplyLevel === "shortage"
                                ? "border-primary/30 text-accent-foreground"
                                : ""
                          }`}
                        >
                          {crop.currentSupplyLevel === "surplus"
                            ? t("common.surplus")
                            : crop.currentSupplyLevel === "shortage"
                              ? t("common.shortage")
                              : t("common.balanced")}
                        </Badge>
                      </div>

                      {/* MSP */}
                      {crop.mspPrice && (
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">{t("market.msp")}</div>
                          <div className="text-sm text-foreground">{"₹"}{crop.mspPrice.toLocaleString("en-IN")}</div>
                        </div>
                      )}

                      {/* Current Price */}
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">{t("market.current")}</div>
                        <div className="text-base font-bold text-foreground">
                          {"₹"}{crop.pricePerQuintal.toLocaleString("en-IN")}
                        </div>
                      </div>

                      {/* Trend */}
                      <div className="flex items-center gap-1.5">
                        <PriceTrendIcon trend={crop.priceTrend} />
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
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
