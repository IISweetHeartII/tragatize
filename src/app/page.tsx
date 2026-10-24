const MEMBERS = ["김해청", "김덕환", "김성재", "윤정민"];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between px-4 sm:px-6 py-12 sm:py-20">
      <header className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted">
        <span>
          <span className="hidden sm:inline">Ambition for Korea · </span>2026.10.24
        </span>
        <span className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          Building
        </span>
      </header>

      <section className="py-16 sm:py-24">
        <p className="mb-4 inline-block rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
          Wildcard · 해외 시장
        </p>
        <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">Tragatize</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
          팀 트라가티제가 오늘 하루 안에 한국에서 세계로 나가는 제품을 만들고 있습니다.
          데모는 이 주소에서 공개됩니다.
        </p>
      </section>

      <footer className="flex flex-col gap-4 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {MEMBERS.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <a
          href="https://github.com/IISweetHeartII/tragatize"
          className="font-mono text-xs underline-offset-4 hover:text-foreground hover:underline"
        >
          github.com/IISweetHeartII/tragatize
        </a>
      </footer>
    </main>
  );
}
