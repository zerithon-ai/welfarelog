import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <h1 className="text-xl font-bold text-blue-600">WelfareLog</h1>
              </Link>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  대시보드
                </Link>
                <Link href="/calendar" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  달력
                </Link>
                <Link href="/timesheet" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  출퇴근
                </Link>
                <Link href="/payroll" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  급여계산
                </Link>
                <Link href="/settings" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  설정
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                로그인
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}