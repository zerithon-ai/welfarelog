# 🧭 작심오분 (MiniLoop)

> 하루 5분 이하의 작고 지속 가능한 습관을 기록하고 공유하는 초간단 습관 트래커 앱

## 📋 프로젝트 개요

**작심오분**은 습관 형성에 실패 경험이 있거나, 간단한 루틴부터 시작하고 싶은 사용자를 위한 웹 애플리케이션입니다. 하루 5분 이하로 할 수 있는 작은 습관들을 기록하고, 달력으로 시각화하며, 다른 사용자들과 공유할 수 있는 플랫폼을 제공합니다.

### 🎯 타겟 유저
- 습관 형성에 실패 경험이 있는 사용자
- 간단한 루틴부터 시작하고 싶은 사용자
- 작은 성취감을 통해 동기부여를 받고 싶은 사용자

### 🚀 핵심 가치
- **간단함**: 5분 이하의 습관만 허용하여 진입 장벽 최소화
- **지속가능성**: 작은 습관으로 큰 변화 만들기
- **공유**: 다른 사용자들과의 소셜 요소로 동기부여 증대

## 🧱 핵심 기능

| 기능 | 설명 |
|------|------|
| **습관 등록** | 하루 5분 이하만 허용 (UX 상에서 제한 또는 유도) |
| **오늘의 체크** | 오늘 했는지 체크 (원클릭) |
| **달력 뷰** | 어떤 날에 했는지 시각화 (성취감) |
| **공유 링크** | 내가 어떤 습관을 하고 있는지 공개 (선택형) |
| **피드백 메시지** | 친구가 내 습관에 응원 남기기 (소셜 감성) |
| **습관 아이디어 피드** | 익명으로 공유된 습관 리스트 훑어보기 |

## 📱 화면 구성

### 홈 화면
- 오늘의 습관 리스트
- [✔] 버튼으로 체크
- 진행률 퍼센트 표시

### 습관 추가 화면
- 제목, 간단 설명
- "5분 이하인가요?" 확인 체크
- 태그 입력 (ex. 운동, 공부, 건강)

### 달력/기록 화면
- 달력 기반 체크 현황
- 연속 기록, 총 완료 횟수

### 공유 피드
- 유저 습관 보기 (닉네임 비공개 가능)
- 좋아요/응원 버튼

### 설정/프로필
- 닉네임/공개 여부 설정
- 내 공유 링크 복사

## ⚙️ 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | Next.js + React, Tailwind CSS |
| **Backend** | Firebase (Auth + Firestore), Supabase도 가능 |
| **Auth** | 구글 로그인 (또는 이메일/비밀번호 간단 인증) |
| **배포** | Vercel |
| **데이터 저장** | 습관, 기록, 피드백 메시지 (NoSQL 적합) |

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone [repository-url]
cd miniloop

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📁 프로젝트 구조

```
miniloop/
├── src/
│   ├── app/                 # Next.js 13+ App Router
│   ├── components/          # 재사용 가능한 컴포넌트
│   ├── lib/                 # 유틸리티 함수들
│   ├── hooks/               # 커스텀 훅
│   └── types/               # TypeScript 타입 정의
├── public/                  # 정적 파일들
├── tailwind.config.js       # Tailwind CSS 설정
└── package.json
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해 주세요.

---

**작심오분**과 함께 작은 습관으로 큰 변화를 만들어보세요! 🌱 