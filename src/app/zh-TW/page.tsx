import { LocaleHome, homeMetadata } from "@/components/locale-pages";

export const metadata = homeMetadata("zh-TW");

export default function Page() {
  return <LocaleHome locale="zh-TW" />;
}
