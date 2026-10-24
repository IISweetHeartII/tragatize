#!/usr/bin/env bash
# 배포된 주소가 실제로 살아 있는지 확인한다(테스트 코드 아님 — 푸시 후 1회 실행).
# 사용: pnpm smoke [기본 https://tragatize.log8.kr]
set -u
BASE="${1:-https://tragatize.log8.kr}"
fail=0
check() { # 경로 기대코드
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$1")
  if [ "$code" = "$2" ]; then echo "ok   $1 $code"; else echo "FAIL $1 $code (기대 $2)"; fail=1; fi
}
check / 200
check /chat 200
check /call 200
check /opengraph-image 200
check /없는-페이지 404
reply=$(curl -s -X POST "$BASE/api/chat" -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"한 단어로 답해: 연결됐어?"}]}')
case "$reply" in *'"reply"'*) echo "ok   /api/chat $reply";; *) echo "FAIL /api/chat $reply"; fail=1;; esac
guard=$(curl -s -X POST "$BASE/api/call" -H 'Content-Type: application/json' -d '{"to":"0","passcode":"wrong"}')
case "$guard" in *비밀번호*) echo "ok   /api/call 비밀번호 검사";; *) echo "FAIL /api/call $guard"; fail=1;; esac
exit $fail
