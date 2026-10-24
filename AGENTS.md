# Tragatize 작업 규칙

한국어로 응답한다. 해커톤(Ambition for Korea, 2026-10-24) 하루짜리 레포다.
속도가 우선이지만, 공개 레포라 커밋 기록과 비밀값은 꼼꼼히 다룬다.

## 브랜치·커밋

- **`main` 에 직접 커밋·푸시한다.** 브랜치·PR 을 만들지 않는다. 별도 worktree 를 만들지 않는다.
- 푸시하면 Vercel(Agentgram 팀, 프로젝트 `tragatize`)이 자동 배포한다 → https://tragatize.log8.kr
- 작업 전 `git pull --rebase` 로 팀원 변경을 먼저 받는다. 강제 푸시하지 않는다.
- 내 작업 경로만 스테이징한다(`git add -A` 대신 경로 지정). 커밋 전 `git diff --cached` 를 읽는다.
- 커밋 메시지는 한국어 `type: 결과` 한 줄(예: `feat: 상품 카드 표시`). AI 서명(Co-Authored-By 등)은 넣지 않는다.
- 푸시 전 `pnpm check`(타입 검사 + lint + build)가 통과해야 한다. 깨진 `main` 은 곧 깨진 데모다.
- 푸시 후 배포가 끝나면 `pnpm smoke` 로 배포 주소를 확인한다(페이지·채팅·전화 비밀번호 검사). 테스트 코드는 두지 않는다.

## 화면

- 모바일 먼저. 좌우 여백 `px-4 sm:px-6`, 가로 스크롤 금지, 입력칸 글자 16px 이상(iOS 확대 방지).
- 한글은 어절 단위 줄바꿈(`globals.css` 의 `word-break: keep-all`). 버튼·링크 터치 영역은 44px 이상.
- 로그인·회원가입은 만들지 않는다. 링크만 열면 바로 쓴다.

## 비밀값

- **API 키는 절대 커밋하지 않는다.** 공개 레포라 몇 분 안에 털린다.
- 로컬은 `.env.local`(gitignore 됨), 배포는 Vercel 환경변수에만 둔다. 새 키는 `.env.example` 에 이름만 적는다.
- 키·전화번호·개인정보를 코드·로그·README 에 쓰지 않는다.

## 구조

- Next.js App Router(`src/app`), Tailwind v4, TypeScript. 패키지 매니저는 `pnpm`.
- AI 호출은 서버에서만 한다. `src/lib/ai.ts` 의 `ask()` 를 쓰고, 브라우저에 키를 넘기지 않는다.
- 모델은 `ANTHROPIC_MODEL` 환경변수(기본 `claude-opus-5-5`).
- 전화는 ClawOps(`src/lib/clawops.ts`): 번호 070-5276-7530 ↔ 에이전트 `tragatize`(gpt-live-1). 발신은 `dial()`, 통화별 지시문은 4000자 이하.
- ClawOps API 는 국외 IP 를 막는다 → 함수 지역은 서울 고정(`vercel.json` 의 `icn1`). 바꾸지 않는다.
- 가입·로그인을 만들지 않는다. 심사위원은 링크를 열고 바로 써 봐야 한다.

## 구현

- 데모 한 장면이 끝까지 도는 것이 먼저다. 추측성 추상화·의존성을 추가하지 않는다.
- TypeScript 타입을 명시한다. 실패하면 사용자에게 보이는 안내를 띄운다(빈 화면 금지).
- 확인한 범위만 완료라고 말한다. «에러 없음» 이 아니라 배포 주소에서 실제로 동작한 것을 본다.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
