"use client"

import { useState } from "react"
import Link from "next/link"
import { useLanguage, languages } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sprout, Menu, X, Globe } from "lucide-react"

export function SiteHeader() {
  const { language, setLanguage, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/advisor", label: t("nav.advisor") },
    { href: "/market", label: t("nav.market") },
    { href: "/schemes", label: t("nav.schemes") },
  ]

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="CropGuide India Home">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sprout className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight text-foreground">CropGuide</span>
            <span className="text-xs leading-tight text-muted-foreground">India</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={language} onValueChange={(val) => setLanguage(val as typeof language)}>
              <SelectTrigger className="h-8 w-[130px] text-xs" aria-label={t("nav.language")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link href="/advisor">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {t("hero.cta")}
            </Button>
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t bg-card md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 p-4" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex items-center gap-2 border-t pt-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={language} onValueChange={(val) => setLanguage(val as typeof language)}>
                <SelectTrigger className="h-9 flex-1 text-sm" aria-label={t("nav.language")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Link href="/advisor" className="mt-2" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {t("hero.cta")}
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
