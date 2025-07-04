import { useState } from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export const InstallPrompt = () => {
  const { canInstall, install } = useInstallPrompt();
  const [isVisible, setIsVisible] = useState(true);

  if (!canInstall || !isVisible) {
    return null;
  }

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // 24시간 후 다시 보여주기 위해 localStorage에 저장
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg z-50 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">앱으로 설치하기</h3>
          <p className="text-xs opacity-90">
            홈 화면에 추가하여 빠르게 접근하세요
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-3">
          <button
            onClick={handleInstall}
            className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            설치
          </button>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white text-lg p-1"
            aria-label="닫기"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};