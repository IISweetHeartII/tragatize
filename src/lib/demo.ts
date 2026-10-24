// 데모 모드용 «실제 AI 실행 결과» 를 붙여 넣는 곳. 샘플 라이브 영상을 스튜디오에 한 번 올려
// 나온 /api/script·/api/highlights 응답을 그대로 넣는다(화면에 «샘플 결과» 라고 표시).
// DEMO_VIDEO_URL 이 비어 있으면 데모 버튼을 숨긴다.
import type { Highlight, LiveScript } from "@/lib/types";

export const DEMO_PRODUCT = "";
export const DEMO_VIDEO_URL = "";
export const DEMO_SCRIPT: LiveScript | null = null;
export const DEMO_HIGHLIGHTS: Highlight[] = [];
