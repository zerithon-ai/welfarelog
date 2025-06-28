import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Service Worker 등록
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker 등록 성공:', registration.scope);
        
        // 업데이트 확인
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // 새 버전이 사용 가능하다고 사용자에게 알림
                  console.log('새 버전이 사용 가능합니다. 페이지를 새로고침하세요.');
                } else {
                  // 처음 설치
                  console.log('앱이 오프라인에서도 사용 가능합니다.');
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Service Worker 등록 실패:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)