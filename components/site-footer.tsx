"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Sprout } from "lucide-react"

export function SiteFooter() {
  const { t } = useLanguage()

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sprout className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">CropGuide India</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
            <nav className="flex flex-col gap-2" aria-label="Footer navigation">
              <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("nav.home")}</Link>
              <Link href="/advisor" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("nav.advisor")}</Link>
              <Link href="/market" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("nav.market")}</Link>
              <Link href="/schemes" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("nav.schemes")}</Link>
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Contact</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>Kisan Call Center: 1800-180-1551</p>
              <p>Email: support@cropguide.gov.in</p>
              <p>Ministry of Agriculture & Farmers Welfare</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CropGuide India. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  )
}
