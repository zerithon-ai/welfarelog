import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function License() {
  const navigate = useNavigate();

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">오픈소스 라이센스</h1>
      </div>

      {/* 라이센스 내용 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-6 space-y-6">
        
        {/* 소개 */}
        <div className="pb-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">오픈소스 라이센스</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            WelfareLog-Vite는 다음과 같은 오픈소스 라이브러리들을 사용하여 개발되었습니다. 각 라이브러리의 라이센스 정보를 확인하실 수 있습니다.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            최종 업데이트: 2025년 7월 4일
          </p>
        </div>

        {/* React & Related */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">React & 관련 라이브러리</h3>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">React</h4>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-mono">v19.1.0</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                A JavaScript library for building user interfaces
              </p>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs rounded">MIT License</span>
                <a href="https://github.com/facebook/react" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">GitHub</a>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">React Router DOM</h4>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-mono">v7.6.3</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Declarative routing for React
              </p>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs rounded">MIT License</span>
                <a href="https://github.com/remix-run/react-router" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">GitHub</a>
              </div>
            </div>
          </div>
        </div>

        {/* Build Tools */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">빌드 도구</h3>
          <div className="space-y-3">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Vite</h4>
                <span className="text-sm text-green-600 dark:text-green-400 font-mono">v6.3.5</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Next Generation Frontend Tooling
              </p>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs rounded">MIT License</span>
                <a href="https://github.com/vitejs/vite" className="text-green-600 dark:text-green-400 text-sm hover:underline">GitHub</a>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">TypeScript</h4>
                <span className="text-sm text-green-600 dark:text-green-400 font-mono">v5.8.3</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                TypeScript is a language for application-scale JavaScript
              </p>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs rounded">Apache 2.0</span>
                <a href="https://github.com/microsoft/TypeScript" className="text-green-600 dark:text-green-400 text-sm hover:underline">GitHub</a>
              </div>
            </div>
          </div>
        </div>

        {/* Styling */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">스타일링</h3>
          <div className="space-y-3">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Tailwind CSS</h4>
                <span className="text-sm text-purple-600 dark:text-purple-400 font-mono">v4.1.11</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                A utility-first CSS framework
              </p>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 text-xs rounded">MIT License</span>
                <a href="https://github.com/tailwindlabs/tailwindcss" className="text-purple-600 dark:text-purple-400 text-sm hover:underline">GitHub</a>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">clsx</h4>
                <span className="text-sm text-purple-600 dark:text-purple-400 font-mono">v2.1.1</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                A tiny utility for constructing className strings conditionally
              </p>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 text-xs rounded">MIT License</span>
                <a href="https://github.com/lukeed/clsx" className="text-purple-600 dark:text-purple-400 text-sm hover:underline">GitHub</a>
              </div>
            </div>
          </div>
        </div>

        {/* Firebase */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">백엔드 서비스</h3>
          <div className="space-y-3">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Firebase</h4>
                <span className="text-sm text-orange-600 dark:text-orange-400 font-mono">v11.10.0</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Firebase JavaScript SDK
              </p>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-100 text-xs rounded">Apache 2.0</span>
                <a href="https://github.com/firebase/firebase-js-sdk" className="text-orange-600 dark:text-orange-400 text-sm hover:underline">GitHub</a>
              </div>
            </div>
          </div>
        </div>

        {/* 전체 라이센스 정보 */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">프로젝트 라이센스</h3>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>WelfareLog-Vite</strong>는 MIT 라이센스 하에 배포됩니다.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              이 소프트웨어는 개인 및 상업적 용도로 자유롭게 사용, 복사, 수정, 배포할 수 있습니다.
            </p>
            <div className="p-3 bg-gray-100 dark:bg-gray-600 rounded font-mono text-xs text-gray-700 dark:text-gray-300">
              <p>MIT License</p>
              <p className="mt-2">
                Copyright (c) 2025 WelfareLog-Vite
              </p>
              <p className="mt-2">
                Permission is hereby granted, free of charge, to any person obtaining a copy
                of this software and associated documentation files (the "Software"), to deal
                in the Software without restriction, including without limitation the rights
                to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                copies of the Software, and to permit persons to whom the Software is
                furnished to do so, subject to the following conditions:
              </p>
              <p className="mt-2">
                The above copyright notice and this permission notice shall be included in all
                copies or substantial portions of the Software.
              </p>
            </div>
          </div>
        </div>

        {/* 연락처 */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              라이센스 관련 문의사항이 있으시면<br />
              GitHub Issues를 통해 언제든지 문의해 주시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}