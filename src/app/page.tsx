import Link from "next/link";
import { DEMO_PRESETS } from "@/lib/demo";
import { DEMO_VIDEO, ORDER_PHONE } from "@/lib/site";

const MEMBERS = ["김해청", "김덕환", "김성재", "윤정민"];

const DEMO = DEMO_PRESETS[0];

const primary =
  "flex min-h-11 items-center justify-center rounded-xl bg-foreground px-6 py-3 text-center font-medium text-background";
const secondary =
  "flex min-h-11 items-center justify-center rounded-xl border border-line px-6 py-3 text-center font-medium hover:border-foreground";

const PAINS = [
  { label: "마케팅 대행사", value: "월 100만 원", body: "블로그 체험단·SNS 대행. 효과는 잘 안 보여요." },
  { label: "사장님 시간", value: "주 5시간", body: "찍고, 자르고, 문구 쓰고, 올리고. 장사할 시간이 줄어요." },
  { label: "외국인 손님", value: "동네 손님만", body: "영어로 홍보할 사람이 없어 외국인 손님은 지나쳐 가요." },
];

const STEPS = [
  { title: "대본", optional: false, body: "상품과 가격만 적으면 AI 가 구간별 대사·화면 지시가 담긴 홍보 대본을 써요." },
  { title: "영상", optional: false, body: "Lite 는 휴대폰으로 대본대로 찍어 올려요. Premium 은 촬영 없이 AI 가 홍보 영상을 만들어요." },
  { title: "숏폼", optional: false, body: "AI 가 «사고 싶어지는 순간» 3개를 골라 자르고 한·영 후킹 문구·캡션을 붙여요." },
  { title: "전화 응대", optional: true, body: "자주 묻는 질문의 답을 적으면 내 가게 070 번호가 나와요. 전화는 AI 판매원 «티제» 가 받아요." },
  { title: "QR·번호 넣기", optional: true, body: "롱폼·숏폼에 내 제품 사이트 QR 과 전화 주문 번호를 넣어요." },
  { title: "SNS 업로드", optional: true, body: "연결한 인스타그램·유튜브·틱톡에 한 번에 올려요. 캡션에 제품 링크도 넣어요." },
];

const EDGES = [
  {
    title: "왜 이 장면인지 설명하는 AI",
    body: "점수 대신 이유를 보여 줘요. «치즈와 가격이 함께 나와 구매 욕구가 가장 큰 장면» 처럼, 사장님이 납득하고 고를 수 있게요.",
  },
  {
    title: "한국어·영어 후킹을 한 번에",
    body: "같은 장면에 한국어 문구와 영어 문구를 함께 만들어요. 여행 온 외국인 손님에게도 바로 닿아요.",
  },
  {
    title: "촬영이 어려우면 AI 가 대신 만들어요",
    body: "Premium 은 템플릿을 고르고 사진만 올리면 돼요. 내 얼굴 아바타, 원하는 AI 페르소나, 또는 제품만으로 대본대로 홍보 영상을 만들어요.",
  },
  {
    title: "숏폼 속 번호로 전화하면 AI 판매원 «티제»",
    body: "영상을 본 손님이 숏폼에 적힌 번호로 전화하면 티제가 손님의 언어로 주문을 받고, 주문 확인 문자까지 보내요. 사장님은 장사만 하세요.",
  },
];

// 가격은 docs/business.md §2 추천안(C 혼합) 금액을 Lite·Premium 으로 옮긴 것. QR·SNS·전화 응대는 포함(켜고 끄는 선택).
const PLANS = [
  {
    name: "Lite",
    tagline: "직접 찍는 사장님",
    krw: "월 99,000원",
    usd: "월 $99",
    main: false,
    href: "/studio",
    cta: "내 영상으로 해보기",
    items: [
      "AI 대본 + 직접 찍은 영상 숏폼 변환 월 4편",
      "한·영 후킹 문구·캡션·해시태그",
      "영상에 QR·제품 사이트·전화번호 넣기",
      "인스타그램·유튜브·틱톡 바로 올리기",
      "내 가게 070 번호 + AI 판매원 통화 100분",
    ],
  },
  {
    name: "Premium",
    tagline: "촬영 없이 AI 가 만들어요",
    krw: "월 199,000원",
    usd: "월 $199",
    main: true,
    href: "/studio?plan=premium",
    cta: "AI 홍보 영상 만들어 보기",
    items: [
      "Lite 의 모든 기능",
      "AI 홍보 영상 월 2편 (내 얼굴 아바타·AI 페르소나·제품만)",
      "숏폼 변환 월 12편",
      "AI 판매원 «티제» 다국어 통화 300분",
      "주문 확인 문자",
    ],
  },
];

const FAQS = [
  {
    q: "영상 편집을 전혀 못 해도 되나요?",
    a: "네. 대본대로 찍은 영상을 올리기만 하면 AI 가 받아쓰고 장면을 골라 문구까지 붙여요. 편집 프로그램은 필요 없어요.",
  },
  {
    q: "영어를 못 하는데 외국인 손님을 받을 수 있나요?",
    a: "숏폼의 영어 후킹 문구는 AI 가 써 드리고, 전화 주문은 AI 판매원 티제가 손님의 언어로 받아요. 사장님은 한국어로 확인하시면 돼요.",
  },
  {
    q: "인스타그램·유튜브에 자동으로 올라가나요?",
    a: "지금은 캡션·해시태그를 복사해 직접 올리시는 방식이에요. 계정을 연결해 여러 채널에 예약 게시하는 기능은 준비 중이에요.",
  },
  {
    q: "약정이 있나요?",
    a: "없어요. 월 단위로 쓰고 언제든 그만둘 수 있어요. 결제 전에 샘플과 내 상품으로 먼저 해 보세요.",
  },
];

function fmt(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-xs text-accent">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">{title}</h2>
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6">
      <section className="py-12 sm:py-20">
        <p className="mb-4 inline-block rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
          소상공인 숏폼 홍보 · AI 홍보 영상 · AI 전화 주문
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          상품 하나면,
          <br />
          홍보도 주문도 끝.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          직접 찍은 영상이든 AI 가 만든 영상이든, «사고 싶어지는 순간» 을 골라 숏폼으로 자르고 QR·전화번호를 넣어
          SNS 에 올려요. 영상을 본 손님의 전화는 AI 판매원이 받아요.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/studio?demo=1" className={primary}>
            샘플로 바로 보기
          </Link>
          <Link href="/studio" className={secondary}>
            내 상품으로 해보기
          </Link>
        </div>
        <p className="mt-3 text-sm text-muted">가입 없이 15초 안에 결과를 볼 수 있어요.</p>
        <a
          href={`tel:${ORDER_PHONE.replace(/-/g, "")}`}
          className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-accent bg-accent/5 px-5 py-4"
        >
          <span>
            <span className="block text-sm text-muted">지금 전화해 보세요 · AI 판매원 «티제» 가 받아요 (한국어·English·日本語)</span>
            <span className="mt-0.5 block font-mono text-xl font-semibold text-accent">📞 {ORDER_PHONE}</span>
          </span>
          <span className="shrink-0 text-sm font-medium">걸기 →</span>
        </a>
      </section>

      <section className="pb-12 sm:pb-16">
        <p className="mb-3 font-mono text-xs text-accent">87초 데모 · 소리 켜고 보세요</p>
        <video
          src={DEMO_VIDEO.src}
          poster={DEMO_VIDEO.poster}
          controls
          playsInline
          preload="none"
          className="aspect-video w-full rounded-xl border border-line bg-foreground"
        />
      </section>

      <section className="border-t border-line py-12 sm:py-16">
        <SectionTitle eyebrow="문제" title="홍보는 해야 하는데, 돈도 시간도 없어요" />
        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {PAINS.map((p) => (
            <li key={p.label} className="rounded-xl border border-line p-5">
              <p className="text-sm text-muted">{p.label}</p>
              <p className="mt-1 text-2xl font-semibold">{p.value}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line py-12 sm:py-16">
        <SectionTitle eyebrow="작동 방식" title="대본부터 주문 전화까지 한 곳에서" />
        <ol className="mt-8 grid gap-3 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-xl border border-line p-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background">
                {i + 1}
              </span>
              <div>
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {s.title}
                  {s.optional && <span className="rounded-full border border-line px-2 py-0.5 text-xs font-normal text-muted">선택</span>}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line py-12 sm:py-16">
        <SectionTitle eyebrow="차별점" title="잘라 주는 데서 끝나지 않아요" />
        <ul className="mt-8 grid gap-3">
          {EDGES.map((e, i) => (
            <li key={e.title} className={"rounded-xl border p-5 " + (i === EDGES.length - 1 ? "border-foreground" : "border-line")}>
              <p className="font-semibold">{e.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{e.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {DEMO && DEMO.highlights.length > 0 && (
        <section className="border-t border-line py-12 sm:py-16">
          <SectionTitle eyebrow="결과 예시" title={`«${DEMO.product}» 라이브에서 AI 가 고른 숏폼`} />
          <p className="mt-3 text-sm text-muted">약 1분 40초짜리 실제 샘플 라이브를 그대로 돌린 결과예요.</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {DEMO.highlights.slice(0, 3).map((h) => (
              <li key={h.start} className="overflow-hidden rounded-xl border border-line">
                <div className="relative aspect-[9/16] max-h-80 w-full bg-black sm:max-h-none">
                  <video
                    src={`${DEMO.videoUrl}#t=${h.start}`}
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 size-full object-cover opacity-80"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 text-white">
                    <p className="font-mono text-xs opacity-80">
                      {fmt(h.start)}–{fmt(h.end)}
                    </p>
                    <p className="mt-1 text-lg font-semibold leading-snug">{h.hook}</p>
                    <p className="mt-0.5 text-sm opacity-90">{h.hookEn}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium text-accent">AI 가 고른 이유</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{h.why}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Link href="/studio?demo=1" className={primary + " sm:inline-flex"}>
              대본부터 숏폼까지 직접 보기
            </Link>
          </div>
        </section>
      )}

      <section className="border-t border-line py-12 sm:py-16">
        <SectionTitle eyebrow="가격" title="찍으면 Lite, 안 찍으면 Premium" />
        <p className="mt-3 text-sm text-muted">소상공인 마케팅 대행은 월 30만~180만 원대예요(공개 견적 기준). Premium 도 월 100만 원 대행의 약 5분의 1이에요.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {PLANS.map((p) => (
            <div key={p.name} className={"rounded-xl p-5 " + (p.main ? "border-2 border-foreground" : "border border-line")}>
              <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
                {p.name}
                {p.main && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">추천</span>}
              </p>
              <p className="mt-1 font-medium">{p.tagline}</p>
              <p className="mt-2 text-3xl font-semibold">{p.krw}</p>
              <p className="mt-1 text-sm text-muted">해외 매장 {p.usd}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {p.items.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
              <Link href={p.href} className={(p.main ? primary : secondary) + " mt-5"}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          QR·SNS 업로드·전화 응대는 두 요금제 모두 포함이에요. 필요한 것만 켜서 쓰세요. 포함 시간을 넘긴 통화는 분당
          300원(해외 $0.25)이에요.
        </p>
      </section>

      <section className="border-t border-line py-12 sm:py-16">
        <SectionTitle eyebrow="자주 묻는 질문" title="사장님들이 많이 물어보세요" />
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {FAQS.map((f) => (
            <li key={f.q}>
              <details className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium">
                  {f.q}
                  <span className="shrink-0 text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line py-12 text-center sm:py-20">
        <h2 className="text-2xl font-semibold leading-snug tracking-tight sm:text-4xl">
          다음 라이브부터,
          <br />
          홍보는 AI 에게 맡기세요.
        </h2>
        <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/studio?demo=1" className={primary}>
            샘플로 바로 보기
          </Link>
          <Link href="/studio" className={secondary}>
            내 상품으로 해보기
          </Link>
        </div>
      </section>

      <footer className="flex flex-col gap-4 border-t border-line py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          <li className="font-medium text-foreground">팀 트라가티제</li>
          {MEMBERS.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <a
          href="https://github.com/IISweetHeartII/tragatize"
          className="inline-flex min-h-11 items-center font-mono text-xs underline-offset-4 hover:text-foreground hover:underline"
        >
          github.com/IISweetHeartII/tragatize
        </a>
      </footer>
    </main>
  );
}
