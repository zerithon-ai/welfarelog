'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';
import Button from '@/components/ui/Button';
import MobileLayout from '@/components/ui/MobileLayout';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
          }
        } catch (error) {
          console.error('사용자 정보를 가져오는데 실패했습니다:', error);
        }
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  if (loading) {
    return (
      <MobileLayout showNavigation={false}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!user) {
    return null;
  }

  const today = new Date();
  const currentMonth = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* User Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold">안녕하세요!</h2>
              <p className="text-blue-100">{user.name || user.email}님</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              로그아웃
            </Button>
          </div>
          <p className="text-blue-100">오늘도 수고 많으셨습니다 🎉</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">이번 달 근무일</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">0일</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">총 근무시간</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">0시간</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">야간근무</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">0시간</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">예상 급여</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">빠른 작업</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="primary" 
              className="h-12"
              onClick={() => router.push('/timesheet')}
            >
              출근 체크인
            </Button>
            <Button 
              variant="secondary" 
              className="h-12"
              onClick={() => router.push('/calendar')}
            >
              근무 일정
            </Button>
            <Button 
              variant="outline" 
              className="h-12"
              onClick={() => router.push('/payroll')}
            >
              급여 계산
            </Button>
            <Button 
              variant="ghost" 
              className="h-12"
              onClick={() => router.push('/settings')}
            >
              설정
            </Button>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{currentMonth} 요약</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">총근무일</span>
              <span className="font-semibold dark:text-white">0일</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">총근무시간</span>
              <span className="font-semibold dark:text-white">0시간</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">야간근무</span>
              <span className="font-semibold dark:text-white">0시간</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white">예상급여</span>
                <span className="font-bold text-blue-600 text-lg">{formatCurrency(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Settings Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">내 설정</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">시급</span>
              <span className="font-medium dark:text-white">{formatCurrency(user.hourlyRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">야간수당</span>
              <span className="font-medium dark:text-white">{((user.nightShiftRate - 1) * 100).toFixed(0)}% 추가</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">초과수당</span>
              <span className="font-medium dark:text-white">{((user.overtimeRate - 1) * 100).toFixed(0)}% 추가</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">휴일수당</span>
              <span className="font-medium dark:text-white">{((user.holidayRate - 1) * 100).toFixed(0)}% 추가</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">최근 활동</h3>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="font-medium dark:text-white">아직 근무 기록이 없습니다</p>
            <p className="text-sm text-gray-400 mt-1">첫 근무를 기록해보세요!</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}