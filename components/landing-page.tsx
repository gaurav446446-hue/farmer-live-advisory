"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sprout,
  BarChart3,
  TrendingUp,
  CloudSun,
  Landmark,
  Droplets,
  ShieldCheck,
  Users,
  MapPin,
  ArrowRight,
} from "lucide-react"

const featureIcons = {
  soil: Sprout,
  demand: BarChart3,
  price: TrendingUp,
  weather: CloudSun,
  scheme: Landmark,
  water: Droplets,
}

export function LandingPage() {
  const { t } = useLanguage()

  const features = [
    { key: "soil" as const, title: t("features.soil.title"), desc: t("features.soil.desc") },
    { key: "demand" as const, title: t("features.demand.title"), desc: t("features.demand.desc") },
    { key: "price" as const, title: t("features.price.title"), desc: t("features.price.desc") },
    { key: "weather" as const, title: t("features.weather.title"), desc: t("features.weather.desc") },
    { key: "scheme" as const, title: t("features.scheme.title"), desc: t("features.scheme.desc") },
    { key: "water" as const, title: t("features.water.title"), desc: t("features.water.desc") },
  ]

  const stats = [
    { value: "2.5M+", label: t("stats.farmers"), icon: Users },
    { value: "45+", label: t("stats.crops"), icon: Sprout },
    { value: "28", label: t("stats.states"), icon: MapPin },
    { value: "15+", label: t("stats.schemes"), icon: Landmark },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-farm.jpg"
            alt="Indian agricultural farmland"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center lg:px-8 lg:py-32">
          <Badge className="mb-6 border-none bg-primary/90 text-primary-foreground">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            {t("hero.certified")}
          </Badge>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-background md:text-5xl lg:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-background/85 md:text-xl">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/advisor">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t("hero.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/market">
              <Button size="lg" variant="outline" className="border-background/30 bg-background/10 text-background hover:bg-background/20">
                {t("features.price.title")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="text-2xl font-bold text-foreground md:text-3xl">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <div className="mb-12 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {t("landing.features.heading")}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t("landing.features.subheading")}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = featureIcons[feature.key]
              return (
                <Card key={feature.key} className="border-border bg-card transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col gap-3 p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent">
                      <Icon className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <div className="mb-12 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {t("landing.howItWorks.heading")}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t("landing.howItWorks.subheading")}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: t("landing.howItWorks.step1.title"),
                desc: t("landing.howItWorks.step1.desc"),
              },
              {
                step: "02",
                title: t("landing.howItWorks.step2.title"),
                desc: t("landing.howItWorks.step2.desc"),
              },
              {
                step: "03",
                title: t("landing.howItWorks.step3.title"),
                desc: t("landing.howItWorks.step3.desc"),
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-8">
          <h2 className="text-balance text-3xl font-bold text-primary-foreground md:text-4xl">
            {t("landing.cta.heading")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            {t("landing.cta.desc")}
          </p>
          <Link href="/advisor" className="mt-8 inline-block">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
              {t("hero.cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
