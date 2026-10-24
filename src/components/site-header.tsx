import Link from "next/link";

const LINKS = [
  { href: "/studio", label: "스튜디오" },
  { href: "/chat", label: "채팅" },
  { href: "/call", label: "전화" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight">
          Tragatize
        </Link>
        <ul className="flex gap-1 text-sm">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="rounded-md px-3 py-1.5 text-muted hover:bg-line/60 hover:text-foreground">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
