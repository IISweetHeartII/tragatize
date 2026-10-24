import { LocaleHome, homeMetadata } from "@/components/locale-pages";

export const metadata = homeMetadata("th");

export default function Page() {
  return <LocaleHome locale="th" />;
}
