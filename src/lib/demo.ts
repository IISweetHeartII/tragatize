// 데모 모드용 «실제 AI 실행 결과». 2026-10-24 팀원이 찍은 샘플 라이브(크라이 치즈버거, 약 1분 40초)를
// 배포된 /api/script·/api/highlights 에 그대로 돌린 응답이다(화면에 «샘플 결과» 라고 표시).
import type { Highlight, LiveScript } from "@/lib/types";

export const DEMO_PRODUCT = "크라이 치즈버거, 5천 원";
export const DEMO_VIDEO_URL =
  "https://sogcl1qpjpnao31d.public.blob.vercel-storage.com/live/KakaoTalk_Video_2026-10-24-11-56-19-yZcpUBw8kujMIQWASGjVKl9Dza5Tmg.mp4";
export const DEMO_SCRIPT: LiveScript | null = {
  "title": "Cry Cheeseburger LIVE | 강남 수제버거 5,000원 한 입 먹방 (Seoul Burger / ソウルバーガー)",
  "target": "한국 여행 중이거나 여행을 계획하는 미국·일본 20~30대",
  "sections": [
    {
      "name": "오프닝 후킹",
      "minutes": 3,
      "say": "[후킹] Hi from Gangnam, Seoul! 오늘은 5,000원짜리 버거 하나로 승부합니다. This is the Cry Cheeseburger, only 5,000 won. ソウル・カンナムからこんにちは、今日はこのバーガーを一緒に食べましょう!",
      "show": "버거를 카메라 렌즈 바로 앞까지 천천히 들이밀었다가 빼는 줌인 컷. 화면 상단 자막: '5,000 KRW Burger in Gangnam'. 가게 간판을 3초 정도 비춰 위치를 보여줌."
    },
    {
      "name": "상품 소개",
      "minutes": 5,
      "say": "[후킹] 이름이 왜 '크라이'냐고요? Why 'Cry'? It's the name we gave it, and you can decide your own reaction after the first bite. 패티는 매장에서 직접 굽고, 치즈는 [치즈 종류]를 씁니다. パティはお店で毎日焼いています。",
      "show": "재료를 하나씩 도마에 펼쳐 놓고 위에서 내려다보는 탑뷰 촬영. 재료 이름을 영어와 일본어 자막으로 표시(Bun/バンズ, Patty/パティ, Cheese/チーズ). 알레르기 재료(밀·우유·[기타])도 자막으로 안내."
    },
    {
      "name": "직접 시연·시식",
      "minutes": 7,
      "say": "[후킹] 치즈가 녹는 이 소리, 볼륨 올려 주세요. Turn your sound up, listen to this. 이제 한 입 먹어 보겠습니다. いただきます!",
      "show": "그릴에 패티를 올리고 치즈를 얹는 장면을 측면 클로즈업으로 촬영(지글거리는 소리 강조). 완성 후 반으로 잘라 단면을 카메라에 5초 정도 고정. 사장님이 한 입 먹는 장면은 얼굴과 버거가 함께 나오도록 한 컷으로 촬영."
    },
    {
      "name": "가격·혜택",
      "minutes": 5,
      "say": "[후킹] 강남에서 수제버거 한 개 5,000원입니다. Just 5,000 won for a handmade burger in Gangnam. 라이브를 보고 오신 분은 직원에게 이 화면을 보여 주시면 [혜택 내용]을 드려요. この画面を見せてくれたら[特典]をプレゼントします!",
      "show": "가격판을 들고 정면 고정 촬영. 자막에 대략적인 달러·엔 환산을 표시하고 '환율에 따라 다름'을 함께 명시. 혜택 조건과 기간은 큰 글씨로 3개 언어 자막 처리."
    },
    {
      "name": "질문 답변",
      "minutes": 7,
      "say": "[후킹] 댓글로 많이 묻는 거, 바로 답해 드릴게요. Ask me anything, English or Japanese is OK! 강남역에서 [도보 시간] 거리이고, 카드 결제와 [결제 수단]이 가능합니다. 英語と日本語のメニューもありますよ。",
      "show": "채팅창을 화면 한쪽에 띄우고 질문을 소리 내 읽은 뒤 답변. 지도 캡처나 매장 입구 영상을 준비해 위치 질문에 바로 보여줌. 영어·일본어 메뉴판 실물을 카메라에 비춤."
    },
    {
      "name": "마무리 콜투액션",
      "minutes": 3,
      "say": "[후킹] 서울 여행 리스트에 버거 하나 추가해 주세요. Save this live and come visit us in Gangnam! 영업시간은 [영업시간]입니다. 待ってますね、また会いましょう!",
      "show": "버거를 들고 손 흔드는 엔딩 컷. 화면 하단에 주소(영문·일문), 영업시간, SNS 계정을 5초 이상 고정 노출. 마지막 컷은 매장 외관."
    }
  ],
  "tips": [
    "각 구간 첫 문장 [후킹]은 숏폼으로 자르기 쉽게 끊어 말하고, 앞뒤로 1초씩 쉬어 주세요.",
    "영어·일본어는 짧게 읽어도 괜찮아요. 발음보다 표정과 제스처가 더 중요합니다.",
    "치즈 녹는 장면과 단면 컷은 소리까지 살려 따로 녹화해 두면 숏폼 재료로 쓸 수 있습니다.",
    "'세계 최고', '울 만큼 맛있다' 같은 단정 표현 대신 '직접 드셔 보고 판단해 주세요'로 말해 주세요.",
    "환율과 혜택 내용은 방송 당일 기준으로 다시 확인하고 자막을 수정하세요.",
    "미국·일본 시청자가 많이 보는 시간대를 고려해 방송 시간을 정하고, 제목에 영어와 일본어 키워드를 꼭 넣으세요."
  ]
};
export const DEMO_HIGHLIGHTS: Highlight[] = [
  {
    "start": 0.2,
    "end": 21.4,
    "hook": "매니저가 직접 만든 버거",
    "hookEn": "Handmade by our manager",
    "caption": "오늘의 주인공은 매니저님이 직접 만들어 주신 크라이 치즈버거! 먹는 척밖에 못 하는 아쉬움까지 솔직하게 담았어요 😂 편집은 믿고 맡깁니다.",
    "hashtags": [
      "#크라이치즈버거",
      "#수제버거",
      "#먹방",
      "#직접만든버거",
      "#handmadeburger",
      "#burger",
      "#mukbang"
    ],
    "why": "매니저가 직접 만든 버거라는 정성 포인트와 '먹는 척' 하는 솔직한 웃음이 함께 있어 시청자의 호기심과 친근감을 끌어올립니다."
  },
  {
    "start": 56.6,
    "end": 74.8,
    "hook": "1분 찍었는데 더 해요?",
    "hookEn": "One minute in… do I keep going?",
    "caption": "갑자기 감동 스피치를 하다가 \"이제 일 분 찍었는데 더 해야 되나요?\" 🤣 결국 마무리는 \"맛있게 드시고!\" 크라이 치즈버거와 함께하는 오늘을 응원합니다.",
    "hashtags": [
      "#크라이치즈버거",
      "#버거스타그램",
      "#웃긴영상",
      "#촬영비하인드",
      "#behindthescenes",
      "#burgertime",
      "#funnyvideo"
    ],
    "why": "진지한 스피치와 솔직한 촬영 멘트가 대비되는 웃음 포인트에 '맛있게 드시고'가 이어져, 끝까지 보게 만들면서 브랜드에 호감을 남깁니다."
  },
  {
    "start": 75.3,
    "end": 100.4,
    "hook": "치즈 폭탄 버거가 오천 원?",
    "hookEn": "A cheese bomb burger for ₩5,000?",
    "caption": "치즈가 장난 아니고 토마토도 장난 아닌 크라이 치즈버거 🍔 단면 보시면 바로 이해되실 거예요. 예상 가격은 단돈 오천 원 선이라고 하니 맛있게 드셔보세요!",
    "hashtags": [
      "#크라이치즈버거",
      "#치즈버거",
      "#치즈폭탄",
      "#가성비맛집",
      "#cheeseburger",
      "#burgerlover",
      "#foodie"
    ],
    "why": "치즈와 토마토를 직접 보여주고 오천 원이라는 가격까지 나와 구매 욕구가 가장 크게 생기는 장면입니다."
  }
];
