import { LocaleStudio, studioMetadata } from "@/components/locale-pages";

export const metadata = studioMetadata("zh-TW");

export default function Page() {
  return <LocaleStudio locale="zh-TW" />;
}
