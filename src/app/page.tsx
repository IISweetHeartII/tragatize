import Link from "next/link";

const MEMBERS = ["김해청", "김덕환", "김성재", "윤정민"];

const STEPS = [
  { n: 1, title: "대본", body: "상품만 적으면 AI 가 라이브 대본을 써요" },
  { n: 2, title: "촬영", body: "카메라 하나로 대본대로 찍어요" },
  { n: 3, title: "숏폼", body: "AI 가 «사고 싶어지는 순간» 을 골라 잘라요" },
  { n: 4, title: "업로드", body: "릴스·쇼츠에 한·영 캡션과 함께 올려요" },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6 sm:py-20">
      <section>
        <p className="mb-4 inline-block rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
          소상공인 라이브 커머스 · AI 숏폼
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          라이브 한 번이면,
          <br />
          숏폼 홍보까지 끝.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          상품만 고르면 AI 가 라이브 대본을 쓰고, 찍은 영상에서 «사고 싶어지는 순간» 을 골라 릴스로 만들어요.
          외국인 손님용 영어 문구까지.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/studio?demo=1"
            className="rounded-xl bg-foreground px-6 py-3.5 text-center font-medium text-background"
          >
            샘플로 바로 보기
          </Link>
          <Link href="/studio" className="rounded-xl border border-line px-6 py-3.5 text-center font-medium hover:border-foreground">
            내 상품으로 해보기
          </Link>
        </div>
      </section>

      <ol className="mt-16 grid gap-3 sm:grid-cols-4">
        {STEPS.map((s) => (
          <li key={s.n} className="rounded-xl border border-line p-4">
            <p className="font-mono text-xs text-muted">0{s.n}</p>
            <p className="mt-1 font-semibold">{s.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-12 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line p-5">
          <p className="text-sm text-muted">지금: 마케팅 대행사</p>
          <p className="mt-1 text-2xl font-semibold">월 100만 원</p>
          <p className="mt-1 text-sm text-muted">사장님 시간 주 5시간</p>
        </div>
        <div className="rounded-xl border border-foreground p-5">
          <p className="text-sm text-muted">Tragatize</p>
          <p className="mt-1 text-2xl font-semibold">월 20만 원</p>
          <p className="mt-1 text-sm text-muted">방송 1시간 · 비용 약 80% 절감</p>
        </div>
      </section>

      <footer className="mt-16 flex flex-col gap-4 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          <li className="font-medium text-foreground">팀 트라가티제</li>
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
