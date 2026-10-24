import { LocaleStudio, studioMetadata } from "@/components/locale-pages";

export const metadata = studioMetadata("ja");

export default function Page() {
  return <LocaleStudio locale="ja" />;
}
