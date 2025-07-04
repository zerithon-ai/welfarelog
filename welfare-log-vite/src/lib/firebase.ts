import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 디버깅용 환경변수 확인
console.log('Firebase Config Debug:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ 설정됨' : '❌ 누락',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✓ 설정됨' : '❌ 누락',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓ 설정됨' : '❌ 누락',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✓ 설정됨' : '❌ 누락',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✓ 설정됨' : '❌ 누락',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✓ 설정됨' : '❌ 누락',
});

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// FCM 초기화 (브라우저에서만)
let messaging: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { messaging, app };
export default app;