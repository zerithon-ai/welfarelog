// WelfareLog PWA Service Worker
const CACHE_NAME = 'welfare-log-v1';
const STATIC_CACHE = 'welfare-log-static-v1';

// 캐시할 리소스들
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.ico'
];

// 런타임 캐시할 경로들
const RUNTIME_CACHE_URLS = [
  '/dashboard',
  '/calendar',
  '/timesheet',
  '/settings',
  '/account'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('Service Worker 설치 중...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('정적 리소스 캐싱...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker 설치 완료');
        return self.skipWaiting();
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('Service Worker 활성화 중...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
              console.log('오래된 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker 활성화 완료');
        return self.clients.claim();
      })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 같은 origin의 요청만 처리
  if (url.origin !== location.origin) {
    return;
  }
  
  // HTML 페이지 요청
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 네트워크 응답을 캐시에 저장
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 응답
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // 캐시에도 없으면 메인 페이지 반환 (SPA 라우팅)
              return caches.match('/index.html');
            });
        })
    );
    return;
  }
  
  // 정적 리소스 요청 (이미지, CSS, JS 등)
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font') {
    
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // 성공적인 응답만 캐시
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            });
        })
    );
    return;
  }
  
  // API 요청은 네트워크 우선
  if (url.pathname.startsWith('/api') || url.hostname.includes('firebaseio') || url.hostname.includes('googleapis')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // 네트워크 실패 시에만 캐시 확인
          return caches.match(request);
        })
    );
    return;
  }
});

// 백그라운드 동기화 (향후 확장 가능)
self.addEventListener('sync', (event) => {
  console.log('백그라운드 동기화:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 여기서 오프라인 중에 저장된 데이터를 서버와 동기화
      console.log('백그라운드 동기화 실행')
    );
  }
});

// 푸시 알림 처리 (Firebase와 별도)
self.addEventListener('push', (event) => {
  console.log('푸시 메시지 수신:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || '새로운 알림이 있습니다.',
      icon: '/icon-192x192.png',
      badge: '/favicon.ico',
      tag: 'welfare-log-push',
      data: data.data,
      actions: [
        {
          action: 'open',
          title: '열기'
        },
        {
          action: 'close',
          title: '닫기'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'WelfareLog', options)
    );
  }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('알림 클릭:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // 이미 열린 창이 있으면 포커스
          for (const client of clientList) {
            if (client.url.includes(location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          // 새 창 열기
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// 에러 처리
self.addEventListener('error', (event) => {
  console.error('Service Worker 에러:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker Promise 거부:', event.reason);
});

console.log('WelfareLog Service Worker 로드됨');