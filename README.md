# Tragatize

> 팀 **트라가티제** — Ambition for Korea 2026 · Wildcard(해외 시장)

**데모:** https://tragatize.log8.kr

## 팀

| 이름 | 역할 | 소속 | 링크 |
|---|---|---|---|
| 김해청 | 팀장 · 발표 | | |
| 윤정민 | 이커머스 세일즈 | 유한킴벌리 | [LinkedIn](https://www.linkedin.com/in/jeongmin-yoon-09953541) |
| 김성재 | 백엔드 개발 | Girinlabs | [GitHub](https://github.com/AgwaB) |
| 김덕환 | AI Native Engineer · AI/ML 엔지니어링 | 퍼플페퍼 | [GitHub](https://github.com/IISweetHeartII) |

## 개발

```bash
pnpm install
cp .env.example .env.local   # ANTHROPIC_API_KEY 채우기
pnpm dev                     # http://localhost:3000
```

- `main` 에 푸시하면 Vercel 이 자동 배포합니다.
- 작업 규칙은 [AGENTS.md](AGENTS.md)에 있습니다.
- 비밀값은 `.env.local` 과 Vercel 환경변수에만 둡니다(커밋 금지).

## 스택

Next.js (App Router) · TypeScript · Tailwind CSS · Claude API (Anthropic) · Vercel
