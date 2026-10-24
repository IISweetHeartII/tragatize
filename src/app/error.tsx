"use client";

// 화면에서 예외가 나도 빈 화면 대신 안내와 다시 시도 버튼을 보여 준다.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6">
      <p className="text-lg font-medium">잠깐 문제가 생겼어요.</p>
      <p className="text-muted">다시 시도해 주세요. 계속되면 새로고침해 주세요.</p>
      <button onClick={reset} className="rounded-xl bg-foreground px-5 py-3 font-medium text-background">
        다시 시도
      </button>
    </main>
  );
}
