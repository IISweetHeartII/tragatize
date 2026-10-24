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
    <header className="sticky top-0 z-10 border-b border-line bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link href={localePath(locale, "/")} className="font-semibold tracking-tight">
          Tragatize
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Link href={localePath(locale, "/studio")} className="rounded-md px-3 py-1.5 text-muted hover:bg-line/60 hover:text-foreground">
            {STUDIO_LABEL[locale]}
          </Link>
          <label className="relative flex min-h-11 items-center">
            <span className="sr-only">Language</span>
            <span aria-hidden className="pointer-events-none absolute left-2 text-muted">
              🌐
            </span>
            <select
              value={locale}
              onChange={(e) => change(e.target.value as Locale)}
              className="min-h-9 appearance-none rounded-md border border-line bg-background py-1 pl-8 pr-2 text-base text-foreground sm:text-sm"
            >
              {LOCALES.map((l) => (
                <option key={l} value={l}>
                  {LOCALE_NAMES[l]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </nav>
    </header>
  );
}
