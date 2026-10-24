import { LocaleStudio, studioMetadata } from "@/components/locale-pages";

export const metadata = studioMetadata("zh-CN");

export default function Page() {
  return <LocaleStudio locale="zh-CN" />;
}
