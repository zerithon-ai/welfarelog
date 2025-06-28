export default function Payroll() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 rounded-2xl p-6 text-white mb-6">
          <h1 className="text-2xl font-bold">급여 계산</h1>
          <p className="text-purple-100">월별 급여 및 수당을 계산하세요</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 p-6">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💰</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">급여 계산 개발 중</h2>
            <p className="text-gray-600 dark:text-gray-300">급여 계산 및 급여명세서 기능을 곧 추가할 예정입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}