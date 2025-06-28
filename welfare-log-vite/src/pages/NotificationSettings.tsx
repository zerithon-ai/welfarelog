import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { notificationService } from '../lib/notifications';
import Button from '../components/ui/Button';

// 인라인 타입 정의
interface User {
  id: string;
  email: string;
  name: string;
  hourlyRate: number;
  nightShiftRate: number;
  overtimeRate: number;
  holidayRate: number;
  workStartTime: string;
  workEndTime: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkType {
  id: string;
  userId: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
  isAllDay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationSetting {
  id: string;
  userId: string;
  workTypeId: string;
  workTypeName: string;
  notificationMinutes: number;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function NotificationSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', firebaseUser.email)));
          if (!userDoc.empty) {
            setUser({ id: firebaseUser.uid, ...userDoc.docs[0].data() } as User);
            await loadWorkTypes(firebaseUser.uid);
            await loadNotificationSettings(firebaseUser.uid);
          }
        } catch (error) {
          console.error('사용자 정보 로드 실패:', error);
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // FCM 설정 및 권한 확인
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    // 알림 권한 확인
    const hasPermission = await notificationService.requestPermission();
    setPermissionGranted(hasPermission);

    if (hasPermission) {
      // FCM 토큰 가져오기
      const token = await notificationService.getToken();
      setFcmToken(token);

      // 메시지 리스너 설정
      notificationService.setupMessageListener();
    }
  };

  const loadWorkTypes = async (userId: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'workTypes'));
      const workTypeList: WorkType[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === userId) {
          workTypeList.push({ 
            id: doc.id, 
            ...data,
            isAllDay: data.isAllDay || false,
            startTime: data.startTime || '',
            endTime: data.endTime || ''
          } as WorkType);
        }
      });
      
      setWorkTypes(workTypeList);
    } catch (error) {
      console.error('근무 타입 로드 실패:', error);
      setWorkTypes([]);
    }
  };

  const loadNotificationSettings = async (userId: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'notificationSettings'));
      const settingsList: NotificationSetting[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === userId) {
          settingsList.push({ id: doc.id, ...data } as NotificationSetting);
        }
      });
      
      setNotificationSettings(settingsList);
    } catch (error) {
      console.error('알림 설정 로드 실패:', error);
      setNotificationSettings([]);
    }
  };

  const handleNotificationToggle = async (workType: WorkType) => {
    if (!user) return;

    const existingSetting = notificationSettings.find(s => s.workTypeId === workType.id);

    try {
      if (existingSetting) {
        // 기존 설정 업데이트
        await updateDoc(doc(db, 'notificationSettings', existingSetting.id), {
          isEnabled: !existingSetting.isEnabled,
          updatedAt: new Date(),
        });
      } else {
        // 새 설정 생성
        await addDoc(collection(db, 'notificationSettings'), {
          userId: user.id,
          workTypeId: workType.id,
          workTypeName: workType.name,
          notificationMinutes: 30, // 기본값: 30분 전
          isEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      await loadNotificationSettings(user.id);
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error);
      alert('설정 저장에 실패했습니다.');
    }
  };

  const handleMinutesChange = async (workTypeId: string, minutes: number) => {
    if (!user) return;

    const setting = notificationSettings.find(s => s.workTypeId === workTypeId);
    if (!setting) return;

    try {
      await updateDoc(doc(db, 'notificationSettings', setting.id), {
        notificationMinutes: minutes,
        updatedAt: new Date(),
      });

      await loadNotificationSettings(user.id);
    } catch (error) {
      console.error('알림 시간 업데이트 실패:', error);
      alert('설정 저장에 실패했습니다.');
    }
  };

  const isNotificationEnabled = (workTypeId: string) => {
    const setting = notificationSettings.find(s => s.workTypeId === workTypeId);
    return setting ? setting.isEnabled : false;
  };

  const getNotificationMinutes = (workTypeId: string) => {
    const setting = notificationSettings.find(s => s.workTypeId === workTypeId);
    return setting ? setting.notificationMinutes : 30;
  };

  const testNotification = () => {
    if (permissionGranted) {
      new Notification('테스트 알림', {
        body: '알림이 정상적으로 작동합니다! 🎉',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">알림 설정</h1>
      </div>

      {/* 알림 권한 상태 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">알림 권한</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            permissionGranted 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          }`}>
            {permissionGranted ? '허용됨' : '거부됨'}
          </div>
        </div>

        {!permissionGranted && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                알림을 받으려면 브라우저에서 알림 권한을 허용해주세요.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={initializeNotifications}
            className="w-full"
          >
            알림 권한 요청
          </Button>
          
          {permissionGranted && (
            <Button
              variant="secondary"
              onClick={testNotification}
              className="w-full"
            >
              테스트 알림 보내기
            </Button>
          )}
        </div>
      </div>

      {/* 근무 타입별 알림 설정 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">근무 타입별 알림</h2>
        
        {workTypes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="font-medium">등록된 근무 타입이 없습니다</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">근무 타입을 먼저 추가해주세요</p>
            <Button
              variant="primary"
              onClick={() => navigate('/settings/work-types')}
              className="mt-4"
            >
              근무 타입 추가하기
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {workTypes.map((workType) => (
              <div key={workType.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: workType.color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{workType.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {workType.isAllDay ? '종일' : `${workType.startTime} - ${workType.endTime}`}
                      </p>
                    </div>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNotificationEnabled(workType.id)}
                      onChange={() => handleNotificationToggle(workType)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {isNotificationEnabled(workType.id) && !workType.isAllDay && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      알림 시간 (근무 시작 전)
                    </label>
                    <select
                      value={getNotificationMinutes(workType.id)}
                      onChange={(e) => handleMinutesChange(workType.id, parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                    >
                      <option value={5}>5분 전</option>
                      <option value={10}>10분 전</option>
                      <option value={15}>15분 전</option>
                      <option value={30}>30분 전</option>
                      <option value={60}>1시간 전</option>
                      <option value={120}>2시간 전</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FCM 토큰 정보 (개발용) */}
      {fcmToken && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">FCM 토큰 (개발용)</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 break-all font-mono">
            {fcmToken}
          </p>
        </div>
      )}
    </div>
  );
}