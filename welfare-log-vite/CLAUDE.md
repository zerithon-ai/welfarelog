# WelfareLog-Vite - 사회복지사 근무 관리 시스템 개발 일지

## 프로젝트 개요
- **프로젝트명**: WelfareLog-Vite
- **설명**: 사회복지사를 위한 근무 시간 관리 및 급여 계산 웹 애플리케이션 (Vite 버전)
- **기술 스택**: Vite 6.3.5, React 19.1.0, TypeScript 5.8.3, Firebase 11.10.0, Tailwind CSS 4.1.11
- **개발 환경**: WSL + Windows
- **마이그레이션**: Next.js → Vite 전환 완료

## 현재까지 완성된 기능들 (2025-07-03)

### ✅ 기본 시스템 구조
- **Vite 6.3.5 + React 19.1.0** 환경 설정 완료
- **Firebase Authentication 및 Firestore** 연동
- **TypeScript 인터페이스** 인라인 정의 (User, WorkType, WorkShift, Attendance)
- **Tailwind CSS 4.1.11** 모바일 우선 반응형 디자인
- **MobileLayout 컴포넌트** 및 네비게이션 시스템

### ✅ 사용자 인증 시스템
- 로그인/회원가입 페이지 (Firebase Auth 연동)
- 사용자 세션 관리 및 보호된 라우팅
- useAuth 훅을 통한 인증 상태 관리

### ✅ 캘린더 기반 근무 관리 시스템 (완전 복구)
- **월별 캘린더 뷰** - 2025년 1월 기준 정상 작동
- **사용자 정의 근무 타입 시스템** - 생성/수정/삭제 완전 지원
- **근무 타입별 색상 구분** - 7가지 색상 팔레트
- **근무 일정 시각적 표시** - 색상별 배지 형태
- **+ 버튼 시각적 효과** 및 툴팁 ("근무 추가하기")
- **빠른 입력 모드** (연속 근무 등록)
- **순차적 입력 플로우** (날짜 선택 → 근무 타입 선택 → 자동 다음 날짜)
- **컴팩트한 근무 타입 선택 바** (가로 한 줄)
- **월별 근무 통계** (각 근무 타입별 일수, 컴팩트 표시)
- **근무 삭제 기능** (× 버튼으로 개별 삭제)

### ✅ 근무 타입 관리 시스템 (완전 복구)
- **근무 타입 CRUD** (생성, 읽기, 수정, 삭제)
- **색상 팔레트 선택** (7가지 사전 정의 색상: 파랑, 빨강, 초록, 주황, 보라, 분홍, 회색)
- **시작/종료 시간 설정** 
- **종일 근무 옵션** - 체크박스로 시간 입력 필드 토글
- **기존 근무 일정 이름 자동 업데이트** (근무 타입 이름 변경 시)
- **설정 페이지 구조화** (메인 설정 → 근무 설정 서브메뉴)

### ✅ 출퇴근 기록 시스템 (완전 복구)
- **실시간 시계 표시** - 한국 시간 기준
- **출근/퇴근 체크인/체크아웃 기능**
- **현재 시간 자동 입력** 버튼
- **출퇴근 기록 편집 기능** (인라인 편집)
- **월별 출퇴근 기록 조회** (최근 5개 기록 표시)
- **근무 시간 자동 계산** 및 표시
- **기록 삭제 기능**

### ✅ 설정 시스템 (완전 복구)
- **메인 설정 페이지** - 카테고리별 설정 접근
- **근무 설정** - 근무 타입 관리 연결
- **알림 설정** - Firebase Cloud Messaging 연동 완료
- **다크모드 설정** - 완전 구현, 모든 페이지 통일된 색상 시스템
- **계정 설정** - 완전 구현 (프로필 관리, 비밀번호 변경, 로그아웃)
- **급여 설정** (개발 중)

### ✅ 대시보드
- **사용자 환영 섹션** (그라데이션 배경, 로그아웃 버튼 제거)
- **월별 통계 카드** (근무일, 근무시간, 야간근무, 예상급여)
- **빠른 작업 버튼** (출근체크인, 근무일정, 급여계산, 설정)
- **월별 요약** 섹션
- **사용자 설정 미리보기** (시급, 야간수당, 초과수당, 휴일수당)
- **최근 활동** 섹션

### ✅ Firebase Cloud Messaging (FCM) 알림 시스템 (신규 완성)
- **FCM 설정 및 연동** - Firebase Messaging SDK, Service Worker 구성
- **알림 권한 관리** - 브라우저 알림 권한 요청 및 상태 확인
- **근무 타입별 알림 설정** - 개별 근무 타입마다 알림 시간 설정 (5분~2시간 전)
- **캘린더 연동 알림 스케줄링** - 근무 일정 등록 시 자동 알림 스케줄링
- **PWA 지원** - 웹앱 설치 가능, 앱 아이콘 및 매니페스트 구성

### ✅ 사용자 인터페이스 개선 (신규 완성)
- **하단 네비게이션 개선** - 텍스트 제거, 그라데이션 활성 효과, 부드러운 애니메이션
- **다크모드 색상 통일** - 모든 페이지 일관된 색상 시스템 적용
- **계정 관리 페이지** - 완전한 프로필 관리, 비밀번호 변경, 급여 설정, 안전한 로그아웃

## 주요 기술적 해결사항

### 1. Next.js → Vite 마이그레이션
- **문제**: Next.js 프로젝트를 Vite로 전환 필요
- **해결**: 
  - React Router DOM으로 라우팅 변경
  - 절대 경로 임포트 (@/) 설정
  - Firebase 설정 유지
  - 모든 페이지 컴포넌트 Vite 호환 형태로 변환

### 2. Firebase User 타입 임포트 문제
- **문제**: Firebase v11에서 User 타입 임포트 에러
- **해결**: 
  - User 타입을 각 파일에 인라인으로 정의
  - Firebase Auth의 currentUser 타입 활용
  - 타입 안전성 유지하면서 임포트 에러 해결

### 3. Tailwind CSS 설정 문제
- **문제**: CSS가 적용되지 않는 문제
- **해결**:
  - PostCSS 설정 파일 생성 (`postcss.config.js`)
  - `@tailwindcss/postcss` 패키지 설치
  - `@import "tailwindcss"` 방식으로 CSS 임포트
  - Next.js 백업의 CSS 설정을 Vite에 맞게 변환

### 4. 페이지 복구 작업
- **문제**: 대부분의 페이지가 "개발 중" 상태로 되어 있음
- **해결**:
  - Next.js 백업 폴더에서 완성된 페이지들 확인
  - 각 페이지를 Vite + React Router 형태로 변환
  - 모든 타입 정의를 인라인으로 변경
  - 상대 경로 임포트로 통일

## 현재 파일 구조

```
src/
├── components/
│   └── ui/
│       ├── Button.tsx          # 공통 버튼 컴포넌트
│       ├── MobileLayout.tsx    # 모바일 레이아웃
│       └── SimpleBottomNav.tsx # 하단 네비게이션 (그라데이션 활성 효과)
├── contexts/
│   └── ThemeContext.tsx       # 다크모드 테마 관리
├── hooks/
│   └── useAuth.ts             # 인증 상태 관리 훅
├── lib/
│   ├── firebase.ts            # Firebase 설정 (FCM 포함)
│   ├── notifications.ts       # FCM 알림 서비스
│   ├── calculations.ts        # 급여 계산 로직
│   └── utils.ts               # 유틸리티 함수
├── pages/
│   ├── Calendar.tsx           # 📅 캘린더 근무 관리 (알림 연동)
│   ├── Dashboard.tsx          # 🏠 메인 대시보드 (로그아웃 버튼 제거)
│   ├── Login.tsx              # 🔐 로그인
│   ├── Register.tsx           # 📝 회원가입
│   ├── Settings.tsx           # ⚙️ 설정 메인 (다크모드 토글)
│   ├── Timesheet.tsx          # ⏰ 출퇴근 기록
│   ├── WorkTypes.tsx          # 🏷️ 근무 타입 관리
│   ├── NotificationSettings.tsx # 🔔 알림 설정 (FCM)
│   ├── Account.tsx            # 👤 계정 관리 (신규)
│   └── Payroll.tsx            # 💰 급여 계산 (개발 중)
├── types/
│   ├── index.ts               # 공통 타입 정의
│   └── user.ts                # User 타입 (별도 파일)
├── App.tsx                    # 메인 앱 컴포넌트
├── main.tsx                   # 앱 엔트리포인트
└── index.css                  # Tailwind CSS 설정 (다크모드 CSS 오버라이드)
```

## 데이터베이스 스키마 (Firebase Firestore)

### WorkType 컬렉션
```typescript
interface WorkType {
  id: string;
  userId: string;
  name: string;           // 근무 타입 이름
  startTime: string;      // 시작 시간 (종일일 때 빈 문자열)
  endTime: string;        // 종료 시간 (종일일 때 빈 문자열)
  color: string;          // 색상 코드 (#3B82F6, #EF4444, etc.)
  isAllDay: boolean;      // 종일 근무 여부
  createdAt: Date;
  updatedAt: Date;
}
```

### WorkShift 컬렉션
```typescript
interface WorkShift {
  id: string;
  userId: string;
  date: string;           // YYYY-MM-DD 형식
  type: 'day' | 'night' | 'off' | 'vacation' | 'sick' | 'custom';
  startTime?: string;     // 근무 시작 시간
  endTime?: string;       // 근무 종료 시간
  breakTime?: number;     // 휴게 시간 (분)
  totalHours: number;     // 총 근무 시간
  isHoliday: boolean;     // 공휴일 여부
  notes?: string;         // 근무 타입 이름 저장
  createdAt: Date;
  updatedAt: Date;
}
```

### Attendance 컬렉션
```typescript
interface Attendance {
  id: string;
  userId: string;
  date: string;           // YYYY-MM-DD 형식
  checkInTime: string;    // HH:MM 형식
  checkOutTime?: string;  // HH:MM 형식 (선택적)
  workShiftId?: string;   // 연관된 근무 일정 ID
  location?: {            // GPS 위치 (선택적)
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## 설정 파일

### package.json 주요 의존성
```json
{
  "dependencies": {
    "@tailwindcss/postcss": "^4.1.11",
    "clsx": "^2.1.1",
    "firebase": "^11.10.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.3",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.5.2",
    "tailwindcss": "^4.1.11",
    "typescript": "~5.8.3",
    "vite": "^6.3.5"
  }
}
```

### vite.config.ts
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: true,
  },
})
```

### postcss.config.js
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### tsconfig.app.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 향후 개발 계획

### 🎯 우선순위 높음 (다음 단계)

#### 1. 급여 계산 시스템 완성
- [ ] 월별 근무 시간 자동 집계
- [ ] 기본급, 야간수당, 휴일수당, 연장수당 계산
- [ ] 세금 및 보험료 공제 계산
- [ ] 급여명세서 생성 및 출력 기능

#### 2. 데이터 백업 및 내보내기
- [ ] Excel/CSV 형태로 근무 기록 내보내기
- [ ] 급여 데이터 PDF 출력
- [ ] 데이터 백업/복원 기능

#### 3. 알림 및 리마인더 시스템
- [ ] 출근/퇴근 시간 알림
- [ ] 근무 일정 리마인더
- [ ] 브라우저 푸시 알림

### 🎯 우선순위 중간

#### 4. 고급 통계 및 분석
- [ ] 월별/연별 근무 패턴 분석
- [ ] 근무 시간 트렌드 차트
- [ ] 휴가 사용 현황 분석

#### 5. 사용자 설정 확장
- [ ] 개인 프로필 관리
- [ ] 기본 급여 정보 설정
- [ ] 근무지 위치 관리

## 현재 개발 상태 요약

### ✅ 완료된 기능 (100% 작동)
1. **사용자 인증** - Firebase Auth 완전 연동
2. **캘린더 근무 관리** - 모든 기능 정상 작동, 알림 연동
3. **근무 타입 관리** - CRUD 완전 지원
4. **출퇴근 기록** - 체크인/아웃, 편집, 삭제 완전 지원
5. **설정 시스템** - 메뉴 구조 완성, 다크모드 토글
6. **대시보드** - UI 완성, 로그아웃 버튼 계정으로 이동
7. **FCM 알림 시스템** - 완전 구현, 근무 타입별 알림 설정
8. **다크모드** - 모든 페이지 통일된 색상 시스템
9. **계정 관리** - 프로필 관리, 비밀번호 변경, 로그아웃
10. **PWA 지원** - 웹앱 설치 가능, 매니페스트 구성

### 🚧 부분 완성
1. **급여 계산** - 로직은 구현됨, UI 개발 필요
2. **통계 시스템** - 기본 구조만 완성

### 📝 개발 중
1. **데이터 내보내기** - Excel/PDF 출력
2. **고급 통계** - 차트 및 분석 기능

## 기술 스택 상세

### Frontend
- **React 19.1.0** - 최신 React 기능 활용
- **TypeScript 5.8.3** - 타입 안전성 확보
- **Vite 6.3.5** - 빠른 개발 서버 및 빌드
- **React Router DOM 7.6.3** - SPA 라우팅
- **Tailwind CSS 4.1.11** - 유틸리티 우선 CSS

### Backend & Database
- **Firebase 11.10.0** - 인증, 데이터베이스, 호스팅
- **Firestore** - NoSQL 문서 데이터베이스
- **Firebase Auth** - 사용자 인증 관리

### Development Tools
- **ESLint** - 코드 품질 관리
- **PostCSS + Autoprefixer** - CSS 후처리
- **TypeScript** - 개발 시 타입 체크

## 마지막 업데이트
- **날짜**: 2025-01-02
- **상태**: Vite 마이그레이션 완료, 모든 주요 기능 복구 완료
- **다음 목표**: 급여 계산 시스템 완성