import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextValue {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // 즉시 DOM 업데이트
    const html = document.documentElement;
    if (newDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    // 로컬스토리지 저장
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    console.log('🔄 Toggle executed:', {
      newDarkMode,
      htmlHasDarkClass: html.classList.contains('dark'),
      allClasses: html.className
    });
  };

  // 초기 로드
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const shouldBeDark = saved === 'true';
    
    setIsDarkMode(shouldBeDark);
    
    const html = document.documentElement;
    if (shouldBeDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    console.log('🚀 Initial load:', {
      saved,
      shouldBeDark,
      htmlHasDarkClass: html.classList.contains('dark')
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}