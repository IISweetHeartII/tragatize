"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LOCALES, LOCALE_NAMES, STUDIO_LABEL, localeFromPath, localePath, stripLocale, type Locale } from "@/lib/i18n";

// /chat·/call 은 연결 확인용으로 주소만 남기고 메뉴에서는 뺀다(심사 동선 집중).
// 번역된 화면은 랜딩·스튜디오뿐 — 다른 화면에서 언어를 바꾸면 그 언어 첫 화면으로 간다.
const TRANSLATED = ["/", "/studio"];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = localeFromPath(pathname);
  const rest = stripLocale(pathname);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function change(next: Locale) {
    const path = TRANSLATED.includes(rest) ? rest : "/";
    router.push(localePath(next, path) + window.location.search);
  }

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link href={localePath(locale, "/")} className="flex min-h-11 items-center gap-2 text-lg font-bold tracking-tight">
          <span aria-hidden className="flex size-7 items-center justify-center rounded-lg bg-foreground font-display text-sm text-background">
            T
          </span>
          Tragatize
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <label className="relative flex min-h-11 items-center">
            <span className="sr-only">Language</span>
            <span aria-hidden className="pointer-events-none absolute left-2 text-muted">
              🌐
            </span>
            <select
              value={locale}
              onChange={(e) => change(e.target.value as Locale)}
              className="min-h-10 appearance-none rounded-full border border-line bg-white py-1 pl-8 pr-3 text-base text-foreground sm:text-sm"
            >
              {LOCALES.map((l) => (
                <option key={l} value={l}>
                  {LOCALE_NAMES[l]}
                </option>
              ))}
            </select>
          </label>
          <Link
            href={localePath(locale, "/studio")}
            className="flex min-h-11 items-center rounded-full bg-foreground px-5 font-semibold text-background hover:bg-foreground/85"
          >
            {STUDIO_LABEL[locale]}
          </Link>
        </div>
      </nav>
    </header>
  );
}
