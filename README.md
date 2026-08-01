# study-log

자기주도 학습을 위한 과목별 시간 트랙커

고등학생이 과목별로 하루 공부한 시간을 기록하고, 학생/학부모가 일·주·월 단위 통계와 목표 대비 실제 공부량을 확인할 수 있는 모바일 웹(PWA) 앱입니다.

## 기술 스택

- Vite + React + TypeScript
- React Router (라우팅)
- Firebase Auth + Firestore (인증/데이터, 오프라인 캐시 자동 지원)
- vite-plugin-pwa (PWA manifest + service worker)

## 시작하기

```bash
npm install
cp .env.example .env
# .env에 Firebase 프로젝트 설정값 입력
npm run dev
```

## 스크립트

- `npm run dev` — 개발 서버 실행 (기본적으로 Firebase 에뮬레이터에 연결)
- `npm run emulators` — Firebase Local Emulator Suite 실행 (Auth: 9099, Firestore: 8080, UI: 4000)
- `npm run build` — 타입 체크 후 프로덕션 빌드
- `npm run lint` — oxlint 실행
- `npm run preview` — 빌드 결과 미리보기

## 로컬 개발 (Firebase 에뮬레이터)

`npm run dev`는 **기본적으로 로컬 Firebase 에뮬레이터**(Auth + Firestore)에 연결되어, 로컬 개발 중 실제 프로덕션 데이터베이스를 건드리지 않습니다. 두 개의 터미널에서 실행하세요.

```bash
# 터미널 1
npm run emulators

# 터미널 2
npm run dev
```

- 에뮬레이터 UI: http://127.0.0.1:4000
- 에뮬레이터는 재시작 시 데이터가 초기화됩니다.
- 실제 프로덕션 Firebase 백엔드로 개발 서버를 띄우려면 `.env`에 `VITE_USE_FIREBASE_EMULATOR=false`를 설정하세요.
- 프로덕션 빌드(`npm run build` / `npm run preview`)는 항상 실제 Firebase 백엔드를 사용합니다.

## 프로젝트 구조

```
src/
  firebase/    Firebase 앱/Auth/Firestore 초기화
  types/       도메인 타입 (User, StudyRecord, Link, InviteCode ...)
  data/        과목 목록 데이터 (대표과목 → 상세과목)
  routes/      화면별 페이지 컴포넌트
  App.tsx      라우트 정의
firestore.rules   Firestore 보안 규칙 초안
```

## Firestore 보안 규칙 배포

```bash
firebase deploy --only firestore:rules
```

## 배포 (Cloudflare Pages)

호스팅은 Firebase Hosting이 아닌 **Cloudflare Pages**를 사용합니다.

- Build command: `npm run build`
- Build output directory: `dist`
- `public/_redirects`에 `/* /index.html 200`을 두어 SPA 클라이언트 라우팅(새로고침/직접 진입)이 동작하도록 함
- 환경변수(`VITE_FIREBASE_*`)는 Cloudflare Pages 프로젝트 설정의 Environment Variables에 등록
- 배포 후 발급되는 Pages 도메인을 Firebase 콘솔의 **Authentication → Settings → Authorized domains**에 추가해야 로그인이 동작함

자세한 기획 내용은 프로젝트 이슈/기획서를 참고하세요.
