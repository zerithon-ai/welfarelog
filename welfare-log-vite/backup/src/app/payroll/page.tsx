'use client';

import MobileLayout from '@/components/ui/MobileLayout';

export default function PayrollPage() {
  return (
    <MobileLayout>
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">급여 계산</h1>
          <p className="text-gray-600">급여 계산 및 통계 페이지입니다.</p>
          <p className="text-sm text-gray-500 mt-2">곧 구현 예정입니다!</p>
        </div>
      </div>
    </MobileLayout>
  );
}