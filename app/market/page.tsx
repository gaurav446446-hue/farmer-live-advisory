"use client"

import { MarketPrices } from "@/components/market-prices"
import { MarketPricesCard } from "@/components/MarketPricesCard"

export default function MarketPage() {
  return (
    <div>
      <MarketPricesCard className="mx-auto mb-8 max-w-7xl px-4 lg:px-8" />
      <MarketPrices />
    </div>
  )
}
