import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6">
      <p className="text-lg font-medium">없는 페이지예요.</p>
      <Link href="/" className="rounded-xl bg-foreground px-5 py-3 font-medium text-background">
        처음으로
      </Link>
    </main>
  );
}
