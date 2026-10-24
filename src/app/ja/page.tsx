import { LocaleHome, homeMetadata } from "@/components/locale-pages";

export const metadata = homeMetadata("ja");

export default function Page() {
  return <LocaleHome locale="ja" />;
}
