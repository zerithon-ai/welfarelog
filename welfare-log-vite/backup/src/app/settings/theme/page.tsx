'use client';

import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/ui/MobileLayout';
import Button from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeSettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">테마 설정</h1>
        </div>

        {/* 현재 테마 상태 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {theme === 'dark' ? (
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {theme === 'dark' ? '다크 모드' : '라이트 모드'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  현재 적용된 테마
                </p>
              </div>
            </div>
            
            {/* 토글 스위치 */}
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 테마 옵션 */}
        <div className="space-y-3">
          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`w-full p-4 rounded-lg border-2 transition-all flex items-center space-x-4 ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
            }`}
          >
            <div className={`p-3 rounded-lg ${
              theme === 'light'
                ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className={`font-semibold ${
                theme === 'light'
                  ? 'text-blue-900 dark:text-blue-100'
                  : 'text-gray-900 dark:text-white'
              }`}>
                라이트 모드
              </h3>
              <p className={`text-sm ${
                theme === 'light'
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                밝은 화면 테마
              </p>
            </div>
            {theme === 'light' && (
              <div className="text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>

          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`w-full p-4 rounded-lg border-2 transition-all flex items-center space-x-4 ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
            }`}
          >
            <div className={`p-3 rounded-lg ${
              theme === 'dark'
                ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className={`font-semibold ${
                theme === 'dark'
                  ? 'text-blue-900 dark:text-blue-100'
                  : 'text-gray-900 dark:text-white'
              }`}>
                다크 모드
              </h3>
              <p className={`text-sm ${
                theme === 'dark'
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                어두운 화면 테마
              </p>
            </div>
            {theme === 'dark' && (
              <div className="text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>

        {/* 미리보기 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">미리보기</h2>
          
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
              <h3 className="font-medium text-gray-900 dark:text-white">샘플 카드</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">현재 테마의 미리보기입니다.</p>
            </div>
            
            <div className="flex space-x-2">
              <div className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium">
                Primary Button
              </div>
              <div className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm">
                Secondary Button
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}