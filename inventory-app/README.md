# 재고 대사 현황 (Inventory Dashboard)

매월 실시하는 실물재고 조사 결과를 전산재고와 비교하는 대시보드. Next.js(App Router) + SQLite(better-sqlite3)로 구현했습니다.

## 시작하기

```bash
npm install
cp .env.local.example .env.local   # DASHBOARD_PIN 값을 원하는 4자리 핀으로 수정
npm run db:seed                    # 최초 1회, mock 데이터로 DB 초기화
npm run dev
```

http://localhost:3000 접속 후 `.env.local`에 설정한 핀번호로 로그인합니다.

## 인증

- 핀번호 로그인 게이트가 앞단에 있습니다 (`proxy.ts`).
- 5회 연속 오답 시 1분간 잠금됩니다.
- `DASHBOARD_PIN` 환경변수로 핀번호를 설정합니다 (`.env.local`, git에는 커밋되지 않음).

## 데이터

현재는 `db/seed.ts`의 mock 데이터(품목 19건, 6개월 추이)로 채워져 있습니다. 실제 전산재고 시스템 및 실사 엑셀 데이터 연동은 아직 이루어지지 않았습니다.

## 스크립트

- `npm run dev` — 로컬 개발 서버
- `npm run build` / `npm run start` — 프로덕션 빌드/실행
- `npm run db:seed` — SQLite에 mock 데이터 시딩
- `npm run lint` — ESLint
