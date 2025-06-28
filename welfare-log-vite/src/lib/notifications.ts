import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';

// FCM 설정 및 유틸리티 함수들
export class NotificationService {
  private messaging;
  private vapidKey = 'BJ9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X'; // 실제 VAPID 키로 교체 필요

  constructor() {
    this.messaging = messaging;
  }

  // 알림 권한 요청
  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      return false;
    }
  }

  // FCM 토큰 가져오기
  async getToken(): Promise<string | null> {
    if (!this.messaging) {
      console.log('FCM이 지원되지 않는 브라우저입니다.');
      return null;
    }

    try {
      const currentToken = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
      });
      
      if (currentToken) {
        console.log('FCM 토큰:', currentToken);
        return currentToken;
      } else {
        console.log('FCM 토큰을 가져올 수 없습니다.');
        return null;
      }
    } catch (error) {
      console.error('FCM 토큰 가져오기 실패:', error);
      return null;
    }
  }

  // 포그라운드 메시지 리스너
  setupMessageListener() {
    if (!this.messaging) {
      return;
    }

    onMessage(this.messaging, (payload) => {
      console.log('포그라운드 메시지 수신:', payload);
      
      // 커스텀 알림 표시
      if (payload.notification) {
        this.showNotification(
          payload.notification.title || '알림',
          payload.notification.body || '',
          payload.notification.icon
        );
      }
    });
  }

  // 브라우저 알림 표시
  private showNotification(title: string, body: string, icon?: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'welfare-log-notification',
        requireInteraction: true,
      });
    }
  }

  // 근무 시작 알림 스케줄링
  scheduleWorkNotification(workName: string, startTime: string, notificationMinutes: number) {
    const now = new Date();
    const workStart = new Date();
    const [hours, minutes] = startTime.split(':').map(Number);
    
    workStart.setHours(hours, minutes, 0, 0);
    
    // 다음 날 근무인 경우
    if (workStart <= now) {
      workStart.setDate(workStart.getDate() + 1);
    }
    
    // 알림 시간 계산
    const notificationTime = new Date(workStart.getTime() - (notificationMinutes * 60 * 1000));
    
    // 알림이 과거 시간인 경우 스케줄링하지 않음
    if (notificationTime <= now) {
      return;
    }
    
    const delay = notificationTime.getTime() - now.getTime();
    
    setTimeout(() => {
      this.showNotification(
        '근무 시작 알림',
        `${workName} 근무가 ${notificationMinutes}분 후 시작됩니다.`,
        '/favicon.ico'
      );
    }, delay);
    
    console.log(`${workName} 근무 알림이 ${notificationTime.toLocaleString()}에 스케줄링되었습니다.`);
  }
}

// 싱글톤 인스턴스
export const notificationService = new NotificationService();