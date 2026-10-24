import { LocaleHome, homeMetadata } from "@/components/locale-pages";

export const metadata = homeMetadata("en");

export default function Page() {
  return <LocaleHome locale="en" />;
}
