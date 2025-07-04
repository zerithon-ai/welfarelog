import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const useInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWA가 이미 설치되었는지 확인
    const checkInstallation = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      } else if (window.navigator && 'standalone' in window.navigator) {
        setIsInstalled((window.navigator as any).standalone === true);
      }
    };

    checkInstallation();

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    // 앱이 설치되었을 때
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('앱 설치 중 오류:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    install,
    canInstall: !isInstalled && isInstallable && installPrompt !== null
  };
};