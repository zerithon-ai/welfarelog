// Service Worker for Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

// Firebase 설정 (src/lib/firebase.ts와 동일한 설정 사용)
const firebaseConfig = {
  apiKey: "AIzaSyBXRZRKCkbXzJBJPuZnhWFEFQEAJfWgCCg",
  authDomain: "welfare-log-vite.firebaseapp.com",
  projectId: "welfare-log-vite",
  storageBucket: "welfare-log-vite.firebasestorage.app",
  messagingSenderId: "1076767398271",
  appId: "1:1076767398271:web:e6b0b1e7c8d9f0a8b2c3d4"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Messaging 서비스 가져오기
const messaging = firebase.messaging();

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 메시지 수신:', payload);

  const notificationTitle = payload.notification?.title || 'WelfareLog 알림';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'welfare-log-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: '앱 열기',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('알림 클릭:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    // 앱 열기
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('welfare-log-vite') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});