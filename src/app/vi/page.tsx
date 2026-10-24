import { LocaleHome, homeMetadata } from "@/components/locale-pages";

export const metadata = homeMetadata("vi");

export default function Page() {
  return <LocaleHome locale="vi" />;
}
