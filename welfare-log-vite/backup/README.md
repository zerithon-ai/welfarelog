# WelfareLog - 사회복지사 전용 근무관리 웹앱

## 📋 프로젝트 개요
사회복지사를 위한 교대근무, 출퇴근, 수당 계산을 자동화하는 웹 애플리케이션입니다.
웹 우선 개발 후 모바일 앱으로 확장 예정입니다.

## 🛠 기술 스택

### 프론트엔드
- **React 18** + **Next.js 14** - 서버사이드 렌더링 및 성능 최적화
- **TypeScript** - 타입 안정성 확보
- **Tailwind CSS** - 빠른 스타일링

### 백엔드 & 데이터베이스
- **Firebase** - 인증, 데이터베이스, 호스팅 통합 솔루션
  - Firebase Auth - 사용자 인증
  - Firestore - NoSQL 데이터베이스
  - Firebase Hosting - 정적 사이트 호스팅

### 배포 & 인프라
- **Vercel** - 웹 애플리케이션 배포
- **Capacitor** - 향후 모바일 앱 전환용

## 🎯 핵심 기능 (MVP)

### 1. 사용자 관리
- [x] 이메일/Google 소셜 로그인
- [x] 사용자 프로필 관리
- [x] 근무 설정 (시급, 야간수당율, 근무시간 등)

### 2. 달력 기반 근무 관리 ✅ 완료
- [x] 월별 달력 뷰
- [x] 사용자 정의 근무 타입 시스템
- [x] 근무 타입별 색상 구분
- [x] 근무 일정 시각적 표시
- [x] 빠른 입력 모드 (연속 근무 등록)
- [x] 순차적 입력 플로우
- [x] 월별 근무 통계 표시
- [x] 종일 근무 옵션 지원

### 3. 출퇴근 기록 ✅ 완료
- [x] 실시간 출퇴근 체크인/아웃
- [x] 수동 시간 입력 기능
- [x] 근무 시간 자동 계산
- [x] 출퇴근 기록 수정/삭제 기능
- [x] 최근 기록 목록 표시
- [x] 날짜별 기록 관리

### 4. 근무 타입 관리 시스템 ✅ 완료
- [x] 근무 타입 CRUD (생성, 읽기, 수정, 삭제)
- [x] 색상 팔레트 선택 (7가지 사전 정의 색상)
- [x] 시작/종료 시간 설정
- [x] 종일 근무 옵션 (체크박스로 시간 입력 필드 토글)
- [x] 기존 근무 일정 이름 자동 업데이트
- [x] 설정 페이지 구조화

### 5. 테마 시스템 🚧 진행중
- [x] Firebase Firestore 사용자별 테마 저장
- [x] localStorage 백업 시스템
- [x] 라이트/다크 모드 지원
- [x] Tailwind CSS dark: prefix 사용
- [ ] UI 테마 적용 (디버깅 중)

### 6. 수당 계산 시스템 📋 계획됨
- [ ] 기본급 자동 계산
- [ ] 야간 근무 수당 (오후 10시 ~ 오전 6시)
- [ ] 초과 근무 수당 (주 40시간 초과)
- [ ] 휴일 근무 수당
- [ ] 월별 총 급여 계산

### 7. 통계 및 리포트 📋 계획됨
- [ ] 주간/월간 근무 시간 통계
- [ ] 수당별 수입 분석
- [ ] 근무 패턴 시각화 (차트)
- [ ] PDF 급여명세서 출력

## 📅 개발 로드맵

### Phase 1: 기본 인프라 구축 (1주차)
- [x] Next.js 프로젝트 셋업
- [x] Firebase 연동 및 인증 시스템
- [x] 기본 레이아웃 및 네비게이션
- [x] 사용자 회원가입/로그인 페이지

### Phase 2: 달력 및 근무 입력 (2주차) ✅ 완료
- [x] 달력 컴포넌트 구현
- [x] 근무 타입 선택 UI
- [x] Firestore 데이터 모델 설계
- [x] 근무 일정 CRUD 기능
- [x] 사용자 정의 근무 타입 시스템
- [x] 빠른 입력 모드 및 순차적 입력

### Phase 3: 출퇴근 기록 시스템 (3주차) ✅ 완료
- [x] 출퇴근 체크인/아웃 기능
- [x] 근무 시간 계산 로직
- [x] 실시간 현재 근무 상태 표시
- [x] 근무 기록 수정/삭제 기능
- [x] 수동 시간 입력 기능
- [x] Firebase Firestore 연동
- [x] 모바일 최적화 UI
- [x] 입력 필드 가독성 개선

### Phase 4: 근무 타입 관리 시스템 (4주차) ✅ 완료
- [x] 근무 타입 CRUD 시스템
- [x] 색상 팔레트 및 시간 설정
- [x] 종일 근무 옵션
- [x] 설정 페이지 구조화

### Phase 5: 테마 시스템 (5주차) 🚧 진행중
- [x] Firebase 기반 사용자별 테마 저장
- [x] 라이트/다크 모드 구현
- [x] Tailwind CSS 연동
- [ ] UI 테마 적용 완료 (디버깅 중)

### Phase 6: 수당 계산 엔진 (6주차) 📋 예정
- [ ] 급여 계산 알고리즘 구현
- [ ] 야간/초과/휴일 수당 로직
- [ ] 세금 및 공제 계산
- [ ] 월별 급여 요약 페이지

### Phase 7: 통계 및 리포트 (7주차) 📋 예정
- [ ] Chart.js 기반 데이터 시각화
- [ ] 근무 패턴 분석
- [ ] PDF 급여명세서 생성
- [ ] 데이터 내보내기 기능

### Phase 8: 테스트 & 배포 (8주차) 📋 예정
- [ ] 단위 테스트 작성
- [ ] E2E 테스트 구현
- [ ] 성능 최적화
- [ ] Vercel 배포 및 도메인 설정

### Phase 9: 모바일 앱 전환 (향후)
- [ ] Capacitor 설정
- [ ] PWA 기능 추가
- [ ] 모바일 UX 최적화
- [ ] 앱스토어 배포

## 🗂 폴더 구조
```
welfare-log/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── auth/           # 인증 관련 페이지
│   │   ├── dashboard/      # 대시보드
│   │   ├── calendar/       # 달력 페이지
│   │   ├── timesheet/      # 출퇴근 기록
│   │   ├── payroll/        # 급여 계산
│   │   └── settings/       # 설정 페이지
│   ├── components/         # 재사용 컴포넌트
│   │   ├── ui/            # 공통 UI 컴포넌트
│   │   ├── calendar/      # 달력 관련 컴포넌트
│   │   └── forms/         # 폼 컴포넌트
│   ├── lib/               # 유틸리티 함수
│   │   ├── firebase.ts    # Firebase 설정
│   │   ├── utils.ts       # 공통 유틸
│   │   └── calculations.ts # 급여 계산 로직
│   ├── hooks/             # Custom React Hooks
│   │   └── useAuth.ts     # 사용자 인증 상태 관리
│   ├── contexts/          # React Context
│   │   └── ThemeContext.tsx # 테마 상태 관리
│   ├── types/             # TypeScript 타입 정의
│   └── constants/         # 상수 정의
├── public/                # 정적 파일
├── docs/                  # 문서
└── tests/                 # 테스트 파일
```

## 🚀 시작하기

### 필수 조건
- Node.js 18.0.0 이상
- npm 또는 yarn
- Firebase 계정

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

### 환경 변수 설정
`.env.local` 파일을 생성하고 Firebase 설정을 추가:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📱 모바일 앱 전환 계획

### Capacitor 통합
```bash
# Capacitor 설치
npm install @capacitor/core @capacitor/cli

# 플랫폼 추가
npx cap add android
npx cap add ios

# 빌드 및 동기화
npm run build
npx cap sync
```

### PWA 기능
- 오프라인 지원
- 푸시 알림
- 백그라운드 동기화
- 네이티브 앱 느낌의 UX

## 🔧 개발 도구
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **Husky** - Git hooks
- **Jest** - 단위 테스트
- **Cypress** - E2E 테스트

## 📈 성능 목표
- First Contentful Paint < 1.5초
- Largest Contentful Paint < 2.5초
- Time to Interactive < 3.5초
- Cumulative Layout Shift < 0.1

## 🤝 기여 방법
1. 이슈 등록
2. 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 커밋 (`git commit -m 'Add amazing feature'`)
4. 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📄 라이센스
MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일 참조

## 📞 문의
- 이메일: developer@welfarelog.com
- 이슈: [GitHub Issues](https://github.com/username/welfare-log/issues)

## 📊 현재 개발 현황 (2024-06-29)

### ✅ 완성된 기능
- **사용자 인증**: Firebase Auth 기반 로그인/회원가입
- **달력 기반 근무 관리**: 월별 캘린더, 사용자 정의 근무 타입
- **출퇴근 기록**: 실시간 체크인/아웃, 수동 입력, 기록 관리
- **근무 타입 관리**: CRUD, 색상 선택, 종일 근무 옵션
- **테마 시스템**: Firebase 연동, 사용자별 설정 (UI 적용 디버깅 중)

### 🚧 진행 중
- **테마 UI 적용**: 라이트/다크 모드 전환 (90% 완성)

### 📋 다음 단계
1. 테마 시스템 UI 적용 완료
2. 급여 계산 엔진 구현
3. 통계 및 리포트 기능

### 🏗 기술적 성과
- **Firebase Firestore**: 실시간 데이터 동기화
- **React Context**: 전역 상태 관리 (테마, 인증)
- **TypeScript**: 타입 안전성 확보
- **Tailwind CSS**: 반응형 모바일 우선 디자인
- **Next.js 14**: App Router 기반 구조

---
**WelfareLog** - 사회복지사의 근무 관리를 혁신합니다 🌟