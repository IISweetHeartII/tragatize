import { Landing } from "@/components/landing";
import { getDict } from "@/lib/dict";

export default function Home() {
  return <Landing locale="ko" dict={getDict("ko")} />;
}
