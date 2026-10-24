import { LocaleStudio, studioMetadata } from "@/components/locale-pages";

export const metadata = studioMetadata("en");

export default function Page() {
  return <LocaleStudio locale="en" />;
}
