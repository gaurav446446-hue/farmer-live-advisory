import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Noto_Sans } from "next/font/google"
import { Providers } from "@/components/providers"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const notoSans = Noto_Sans({
  subsets: ["latin", "devanagari"],
  variable: "--font-noto",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "CropGuide India - Smart Crop Advisory for Farmers",
  description:
    "Government-certified platform helping Indian farmers choose the right crops based on soil type, regional supply-demand data, market prices, and weather conditions.",
  keywords: [
    "agriculture",
    "farming",
    "crop advisory",
    "soil analysis",
    "India",
    "government certified",
  ],
}

export const viewport: Viewport = {
  themeColor: "#2d7a3a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSans.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  )
}
