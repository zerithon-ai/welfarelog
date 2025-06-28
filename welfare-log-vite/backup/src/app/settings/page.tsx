'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types';
import MobileLayout from '@/components/ui/MobileLayout';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({ id: firebaseUser.uid } as User);
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <MobileLayout showNavigation={false}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  const settingsItems = [
    {
      title: '근무',
      description: '근무 타입 및 시간 설정',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/settings/work-types',
      color: 'text-blue-600'
    },
    {
      title: '알림',
      description: '푸시 알림 및 알림 설정',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM5 12V7a5 5 0 1110 0v5l-1.5 1.5" />
        </svg>
      ),
      href: '/settings/notifications',
      color: 'text-yellow-600'
    },
    {
      title: '테마',
      description: '다크모드/라이트모드 설정',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      href: '/settings/theme',
      color: 'text-indigo-600'
    },
    {
      title: '계정',
      description: '프로필 및 계정 관리',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: '/settings/account',
      color: 'text-green-600'
    },
    {
      title: '급여 설정',
      description: '시급 및 수당율 설정',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      href: '/settings/payroll',
      color: 'text-purple-600'
    }
  ];

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">설정</h1>
          <p className="text-gray-600 dark:text-gray-400">앱 설정을 관리하세요</p>
        </div>

        <div className="space-y-3">
          {settingsItems.map((item, index) => (
            <button
              key={index}
              onClick={() => router.push(item.href)}
              className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">WelfareLog v0.1.0</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">사회복지사 전용 근무 관리 앱</p>
        </div>
      </div>
    </MobileLayout>
  );
}