import { LocaleStudio, studioMetadata } from "@/components/locale-pages";

export const metadata = studioMetadata("vi");

export default function Page() {
  return <LocaleStudio locale="vi" />;
}
