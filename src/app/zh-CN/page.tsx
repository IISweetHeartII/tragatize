import { LocaleHome, homeMetadata } from "@/components/locale-pages";

export const metadata = homeMetadata("zh-CN");

export default function Page() {
  return <LocaleHome locale="zh-CN" />;
}
