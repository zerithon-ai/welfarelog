# WelfareLog-Vite 🩺

**사회복지사를 위한 스마트 근무 관리 시스템**

WelfareLog-Vite는 사회복지사들이 근무 시간을 효율적으로 관리하고 급여를 정확히 계산할 수 있도록 도와주는 현대적인 웹 애플리케이션입니다.

[![PWA](https://img.shields.io/badge/PWA-Ready-brightgreen.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-purple.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.10.0-orange.svg)](https://firebase.google.com/)

## ✨ 주요 기능

### 📱 모바일 우선 설계
- **반응형 디자인**: 모든 기기에서 최적화된 사용자 경험
- **PWA 지원**: 앱처럼 설치하여 사용 가능
- **다크모드**: 야간 근무 시에도 편안한 사용

### 📅 근무 일정 관리
- **캘린더 기반 일정 관리**: 직관적인 월별 캘린더 뷰
- **사용자 정의 근무 타입**: 7가지 색상으로 구분되는 근무 형태
- **빠른 입력 모드**: 연속 근무 등록을 위한 순차적 입력
- **종일 근무 지원**: 시간 설정이 필요 없는 종일 근무 타입

### ⏰ 출퇴근 기록
- **실시간 시계**: 정확한 한국 표준시 표시
- **원터치 기록**: 현재 시간 자동 입력 버튼
- **기록 편집**: 출퇴근 시간 수정 및 삭제 기능
- **시간외 근무 자동 계산**: 예정 근무시간 대비 초과 시간 자동 산출

### 💰 급여 관리
- **실시간 급여 계산**: 시급, 야간수당, 시간외수당 자동 계산
- **월별 통계**: 근무일, 총 근무시간, 시간외 근무 현황
- **수당 설정**: 야간수당, 시간외수당, 휴일수당 배율 개별 설정

### 🔔 스마트 알림
- **근무 타입별 알림**: 개별 근무 일정마다 사전 알림 설정
- **브라우저 푸시 알림**: FCM을 통한 실시간 알림
- **알림 시간 커스터마이징**: 5분부터 2시간 전까지 설정 가능

### 🔐 보안 및 개인정보
- **Firebase 인증**: 안전한 이메일/비밀번호 인증
- **개인 데이터 암호화**: 모든 근무 기록 안전하게 보호
- **계정 관리**: 프로필 수정, 비밀번호 변경 기능

## 🚀 기술 스택

### Frontend
- **React 19.1.0**: 최신 React 기능 활용
- **TypeScript 5.8.3**: 타입 안전성으로 버그 최소화
- **Vite 6.3.5**: 빠른 개발 서버와 최적화된 빌드
- **Tailwind CSS 4.1.11**: 모던하고 일관된 디자인 시스템

### Backend & Infrastructure
- **Firebase 11.10.0**: 서버리스 백엔드 솔루션
  - **Authentication**: 사용자 인증 관리
  - **Firestore**: NoSQL 실시간 데이터베이스
  - **Cloud Messaging**: 푸시 알림 서비스
- **Vercel**: 글로벌 CDN을 통한 빠른 배포

### Development Tools
- **React Router DOM 7.6.3**: SPA 라우팅
- **ESLint & Prettier**: 코드 품질 관리
- **PWA Workbox**: 서비스 워커 및 캐싱

## 📦 설치 및 실행

### 필수 요구사항
- Node.js 18+ 
- npm 또는 yarn 패키지 매니저

### 로컬 개발 환경 설정

1. **저장소 클론**
```bash
git clone https://github.com/yourusername/welfare-log-vite.git
cd welfare-log-vite
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
# .env 파일 생성 후 Firebase 설정 추가
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

4. **개발 서버 실행**
```bash
npm run dev
```

5. **브라우저에서 접속**
```
http://localhost:8080
```

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📱 PWA 설치

### 모바일 (Android/iOS)
1. 브라우저에서 사이트 접속
2. "홈 화면에 추가" 또는 "앱 설치" 선택
3. 앱 아이콘이 홈 화면에 추가됨

### 데스크톱 (Chrome/Edge)
1. 주소창 우측의 설치 버튼 클릭
2. "설치" 확인
3. 독립적인 앱 창으로 실행

## 🗂️ 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   └── ui/             # 기본 UI 컴포넌트
├── contexts/           # React Context (테마 등)
├── hooks/              # 커스텀 훅
├── lib/                # 유틸리티 및 설정
│   ├── firebase.ts     # Firebase 설정
│   ├── notifications.ts # FCM 알림 서비스
│   └── calculations.ts # 급여 계산 로직
├── pages/              # 페이지 컴포넌트
│   ├── Dashboard.tsx   # 메인 대시보드
│   ├── Calendar.tsx    # 근무 일정 관리
│   ├── Timesheet.tsx   # 출퇴근 기록
│   ├── Settings.tsx    # 설정
│   └── Account.tsx     # 계정 관리
└── types/              # TypeScript 타입 정의
```

## 🎯 사용 방법

### 1. 회원가입 및 프로필 설정
- 이메일과 비밀번호로 계정 생성
- 이름, 시급, 각종 수당 배율 설정

### 2. 근무 타입 생성
- 설정 > 근무 설정에서 근무 타입 생성
- 색상, 시작/종료 시간 설정
- 종일 근무 옵션 활용

### 3. 근무 일정 등록
- 캘린더에서 날짜 선택
- 근무 타입 선택하여 일정 등록
- 빠른 입력 모드로 연속 등록

### 4. 출퇴근 기록
- 출근 시: 출근 버튼으로 기록
- 퇴근 시: 퇴근 버튼으로 기록
- 시간외 근무 자동 계산 확인

### 5. 급여 확인
- 대시보드에서 월별 예상 급여 확인
- 근무 통계 및 시간외 근무 현황 파악

## 🔧 개발자 가이드

### 커스텀 빌드 스크립트
```bash
# 개발 서버 (포트 8080)
npm run dev

# TypeScript 타입 체크
npm run build

# 린트 검사
npm run lint

# 코드 포매팅
npm run format
```

### Firebase 설정
1. Firebase 콘솔에서 새 프로젝트 생성
2. Authentication, Firestore, Cloud Messaging 활성화
3. 웹 앱 등록 후 config 정보 복사
4. `.env` 파일에 환경 변수 설정

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- **React 팀**: 훌륭한 프레임워크 제공
- **Firebase**: 강력한 백엔드 서비스
- **Tailwind CSS**: 아름다운 디자인 시스템
- **모든 사회복지사분들**: 소중한 업무에 대한 존경과 감사

## 📞 연락처

프로젝트 관련 문의사항이나 버그 리포트는 GitHub Issues를 이용해 주세요.

---

**Made with ❤️ for Social Workers**

*사회복지사들의 더 나은 근무 환경을 위하여*