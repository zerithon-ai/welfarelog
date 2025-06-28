import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: '시작하기',
    question: '회원가입은 어떻게 하나요?',
    answer: '메인 화면에서 "회원가입" 버튼을 클릭하고 이메일과 비밀번호를 입력하세요. 가입 후 계정 관리에서 이름과 시급 정보를 설정할 수 있습니다.'
  },
  {
    id: '2',
    category: '시작하기',
    question: '첫 사용 시 무엇을 해야 하나요?',
    answer: '1) 계정 관리에서 프로필 정보 입력 2) 설정 > 근무 설정에서 근무 타입 생성 3) 캘린더에서 근무 일정 등록 4) 출퇴근 기록 시작'
  },
  {
    id: '3',
    category: '근무 관리',
    question: '근무 타입은 어떻게 만드나요?',
    answer: '설정 > 근무 설정에서 "새 근무 타입 추가" 버튼을 클릭하세요. 이름, 색상, 시작/종료 시간을 설정할 수 있으며, 종일 근무 옵션도 제공됩니다.'
  },
  {
    id: '4',
    category: '근무 관리',
    question: '캘린더에 근무 일정을 어떻게 등록하나요?',
    answer: '캘린더 페이지에서 날짜를 클릭하고 원하는 근무 타입을 선택하세요. 빠른 입력 모드를 활용하면 연속된 근무 일정을 쉽게 등록할 수 있습니다.'
  },
  {
    id: '5',
    category: '출퇴근 기록',
    question: '출퇴근은 어떻게 기록하나요?',
    answer: '출퇴근 기록 페이지에서 출근 시간과 퇴근 시간을 입력하고 각각의 버튼을 클릭하세요. "현재" 버튼을 누르면 현재 시간이 자동으로 입력됩니다.'
  },
  {
    id: '6',
    category: '출퇴근 기록',
    question: '시간외 근무는 어떻게 계산되나요?',
    answer: '실제 출퇴근 시간에서 캘린더에 등록된 예정 근무시간을 빼서 자동으로 계산됩니다. 종일 근무로 설정된 경우 모든 시간이 시간외 근무로 계산됩니다.'
  },
  {
    id: '7',
    category: '급여 계산',
    question: '급여는 어떻게 계산되나요?',
    answer: '기본 시급 × 근무시간 + 야간수당 + 시간외수당 + 휴일수당으로 계산됩니다. 각 수당의 배율은 계정 관리에서 설정할 수 있습니다.'
  },
  {
    id: '8',
    category: '급여 계산',
    question: '수당 배율은 어떻게 설정하나요?',
    answer: '계정 관리 페이지에서 야간수당 배율, 연장수당 배율, 휴일수당 배율을 각각 설정할 수 있습니다. 일반적으로 1.5배(150%) 또는 2.0배(200%)를 사용합니다.'
  },
  {
    id: '9',
    category: '알림',
    question: '근무 알림은 어떻게 설정하나요?',
    answer: '설정 > 알림 설정에서 브라우저 알림을 허용하고, 각 근무 타입별로 알림 시간을 설정할 수 있습니다. 5분부터 2시간 전까지 설정 가능합니다.'
  },
  {
    id: '10',
    category: '기타',
    question: '다크모드는 어떻게 사용하나요?',
    answer: '설정 페이지에서 다크모드 토글을 클릭하면 야간 근무 시에 편안한 어두운 테마로 변경됩니다.'
  },
  {
    id: '11',
    category: '기타',
    question: '데이터는 안전하게 보관되나요?',
    answer: '모든 데이터는 Google Firebase의 보안 시스템을 통해 암호화되어 저장됩니다. 개인의 근무 기록은 본인만 접근할 수 있습니다.'
  },
  {
    id: '12',
    category: '기타',
    question: '앱으로 설치할 수 있나요?',
    answer: '네! 이 웹사이트는 PWA(Progressive Web App)로 제작되어 모바일과 데스크톱에서 앱처럼 설치하여 사용할 수 있습니다.'
  }
];

const categories = ['전체', '시작하기', '근무 관리', '출퇴근 기록', '급여 계산', '알림', '기타'];

export default function Help() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredFAQs = selectedCategory === '전체' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">도움말</h1>
      </div>

      {/* 소개 섹션 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">WelfareLog 사용 가이드</h2>
        <p className="text-blue-100">
          사회복지사를 위한 근무 관리 시스템 사용법을 안내해드립니다.
        </p>
      </div>

      {/* 빠른 도움말 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">빠른 시작</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
              <h4 className="font-medium text-gray-900 dark:text-white">프로필 설정</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">계정 관리에서 이름과 시급 정보를 입력하세요.</p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
              <h4 className="font-medium text-gray-900 dark:text-white">근무 타입 생성</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">설정에서 나만의 근무 타입을 만들어보세요.</p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
              <h4 className="font-medium text-gray-900 dark:text-white">일정 등록</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">캘린더에서 근무 일정을 등록하세요.</p>
          </div>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
              <h4 className="font-medium text-gray-900 dark:text-white">출퇴근 기록</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">매일 출퇴근 시간을 기록하고 급여를 확인하세요.</p>
          </div>
        </div>
      </div>

      {/* FAQ 섹션 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">자주 묻는 질문</h3>
        
        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ 목록 */}
        <div className="space-y-3">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full p-4 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded mr-2">
                      {faq.category}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                      openFAQ === faq.id ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {openFAQ === faq.id && (
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 연락처 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">추가 도움이 필요하신가요?</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">기술 지원</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">버그 리포트나 기능 요청은 GitHub Issues를 이용해 주세요.</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">사용자 가이드</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">README 문서에서 더 자세한 사용법을 확인할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}