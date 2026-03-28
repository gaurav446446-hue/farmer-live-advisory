"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { governmentSchemes, type GovernmentScheme } from "@/lib/crop-data"
import {
  Landmark,
  Shield,
  CreditCard,
  Building2,
  GraduationCap,
  Banknote,
  ExternalLink,
  CheckCircle2,
  Users,
} from "lucide-react"

const categoryIcons: Record<string, typeof Landmark> = {
  subsidy: Banknote,
  insurance: Shield,
  credit: CreditCard,
  infrastructure: Building2,
  training: GraduationCap,
}

const categoryColors: Record<string, string> = {
  subsidy: "bg-primary/15 text-accent-foreground",
  insurance: "bg-secondary/30 text-secondary-foreground",
  credit: "bg-chart-3/15 text-foreground",
  infrastructure: "bg-chart-4/15 text-foreground",
  training: "bg-chart-5/15 text-foreground",
}

function SchemeCard({ scheme }: { scheme: GovernmentScheme }) {
  const { t, language } = useLanguage()
  const Icon = categoryIcons[scheme.category] || Landmark
  const colorClass = categoryColors[scheme.category] || "bg-muted text-foreground"

  return (
    <Card className="border-border bg-card transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
            <Icon className="h-5 w-5 text-accent-foreground" />
          </div>
          <Badge className={`border-none text-xs ${colorClass}`}>
            {t(`schemes.${scheme.category}` as `schemes.${"subsidy" | "insurance" | "credit" | "infrastructure" | "training"}`)}
          </Badge>
        </div>
        <CardTitle className="mt-3 text-base leading-snug text-card-foreground">
          {language === "hi" ? scheme.nameHi : scheme.name}
        </CardTitle>
        <CardDescription className="leading-relaxed">
          {scheme.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <div className="text-xs font-medium text-muted-foreground">{t("schemes.eligibility")}</div>
              <div className="text-sm text-foreground">{scheme.eligibility}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
            <div>
              <div className="text-xs font-medium text-muted-foreground">{t("schemes.benefit")}</div>
              <div className="text-sm text-foreground">{scheme.benefit}</div>
            </div>
          </div>
        </div>
        <a href={scheme.link} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            {t("schemes.apply")}
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </a>
      </CardContent>
    </Card>
  )
}

export function GovernmentSchemes() {
  const { t } = useLanguage()
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const categories = [
    { id: "all", label: t("schemes.all") },
    { id: "subsidy", label: t("schemes.subsidy") },
    { id: "insurance", label: t("schemes.insurance") },
    { id: "credit", label: t("schemes.credit") },
    { id: "infrastructure", label: t("schemes.infrastructure") },
    { id: "training", label: t("schemes.training") },
  ]

  const filteredSchemes =
    activeCategory === "all"
      ? governmentSchemes
      : governmentSchemes.filter((s) => s.category === activeCategory)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t("schemes.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("schemes.subtitle")}</p>
      </div>

      {/* Category Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat.id)}
            className={
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : ""
            }
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Schemes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSchemes.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
      </div>

      {/* Helpline Info */}
      <Card className="mt-8 border-primary/20 bg-accent">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center md:flex-row md:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary">
            <Landmark className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Need Help Applying?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Call the Kisan Call Center at <strong className="text-foreground">1800-180-1551</strong> (toll-free) for assistance in applying for any government scheme. Available in 22 languages.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
