import { ReactNode } from 'react';
import SimpleBottomNav from './SimpleBottomNav';

interface MobileLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export default function MobileLayout({ children, showNavigation = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header - 간단한 상단 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400 text-center">WelfareLog</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto min-h-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      {showNavigation && <SimpleBottomNav />}
      
      {/* Safe area for bottom navigation */}
      {showNavigation && <div className="h-20 flex-shrink-0"></div>}
    </div>
  );
}