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

interface WorkShift {
  id: string;
  userId: string;
  date: string;
  type: 'day' | 'night' | 'off' | 'vacation' | 'sick' | 'custom';
  startTime?: string;
  endTime?: string;
  breakTime?: number;
  totalHours: number;
  isHoliday: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function Calendar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);
  const [isQuickInputMode, setIsQuickInputMode] = useState(false);
  const [selectedWorkType, setSelectedWorkType] = useState<WorkType | null>(null);
  const [showWorkTypeBar, setShowWorkTypeBar] = useState(false);
  const [waitingForWorkType, setWaitingForWorkType] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', firebaseUser.email)));
          if (!userDoc.empty) {
            setUser({ id: firebaseUser.uid, ...userDoc.docs[0].data() } as User);
            await loadWorkTypes(firebaseUser.uid);
            await loadWorkShifts(firebaseUser.uid);
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

  const loadWorkShifts = async (userId: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'workShifts'));
      const workShiftList: WorkShift[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === userId) {
          workShiftList.push({ id: doc.id, ...data } as WorkShift);
        }
      });
      
      setWorkShifts(workShiftList);
    } catch (error) {
      console.error('근무 일정 로드 실패:', error);
      setWorkShifts([]);
    }
  };

  const loadNotificationSettings = async (userId: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'notificationSettings'));
      const settingsList: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === userId && data.isEnabled) {
          settingsList.push({ id: doc.id, ...data });
        }
      });
      
      setNotificationSettings(settingsList);
    } catch (error) {
      console.error('알림 설정 로드 실패:', error);
      setNotificationSettings([]);
    }
  };

  const handleDateClick = (dateStr: string) => {
    // + 버튼이 활성화된 상태에서만 날짜 선택 가능
    if (!showWorkTypeBar && !isQuickInputMode) {
      return; // 일반 모드에서는 아무것도 안 함
    }

    if (isQuickInputMode && selectedWorkType) {
      // 연속 입력 모드에서는 바로 근무 등록
      handleQuickInput(dateStr);
    } else if (showWorkTypeBar) {
      // + 버튼이 활성화된 상태에서 날짜 선택
      setSelectedDate(dateStr);
      setWaitingForWorkType(true);
    }
  };

  const handleQuickInput = async (dateStr: string, workType?: WorkType) => {
    if (!user) return;
    
    const typeToUse = workType || selectedWorkType;
    if (!typeToUse) return;

    try {
      // 해당 날짜에 이미 근무가 있는지 확인
      const existingShift = workShifts.find(shift => shift.date === dateStr);
      
      if (existingShift) {
        // 기존 근무 수정
        await updateDoc(doc(db, 'workShifts', existingShift.id), {
          type: 'custom',
          startTime: typeToUse.isAllDay ? '' : typeToUse.startTime,
          endTime: typeToUse.isAllDay ? '' : typeToUse.endTime,
          totalHours: typeToUse.isAllDay ? 0 : calculateHours(typeToUse.startTime, typeToUse.endTime),
          notes: typeToUse.name,
          updatedAt: new Date(),
        });
      } else {
        // 새 근무 추가
        await addDoc(collection(db, 'workShifts'), {
          userId: user.id,
          date: dateStr,
          type: 'custom',
          startTime: typeToUse.isAllDay ? '' : typeToUse.startTime,
          endTime: typeToUse.isAllDay ? '' : typeToUse.endTime,
          totalHours: typeToUse.isAllDay ? 0 : calculateHours(typeToUse.startTime, typeToUse.endTime),
          isHoliday: false,
          notes: typeToUse.name,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      await loadWorkShifts(user.id);

      // 알림 스케줄링
      scheduleNotificationForWorkShift(dateStr, typeToUse);

      // 다음 날짜로 자동 이동 (연속 입력 모드가 아닌 경우)
      if (!isQuickInputMode && waitingForWorkType) {
        const nextDate = getNextDate(dateStr);
        if (nextDate) {
          setSelectedDate(nextDate);
        } else {
          // 더 이상 다음 날짜가 없으면 모드 종료
          setWaitingForWorkType(false);
          setSelectedDate(null);
        }
      }
    } catch (error) {
      console.error('근무 일정 저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const getNextDate = (currentDateStr: string): string | null => {
    const current = new Date(currentDateStr);
    const nextDay = new Date(current);
    nextDay.setDate(current.getDate() + 1);
    
    // 현재 월 범위 내에서만 이동
    if (nextDay.getMonth() !== currentDate.getMonth() || nextDay.getFullYear() !== currentDate.getFullYear()) {
      return null;
    }
    
    return nextDay.toISOString().split('T')[0];
  };

  const handleStartQuickInput = (workType: WorkType) => {
    setSelectedWorkType(workType);
    setIsQuickInputMode(true);
    setShowWorkTypeModal(false);
    setShowWorkTypeBar(false);
    setSelectedDate(null);
  };

  const handleStopQuickInput = () => {
    setIsQuickInputMode(false);
    setSelectedWorkType(null);
    setShowWorkTypeBar(false);
  };

  const toggleWorkTypeBar = () => {
    if (isQuickInputMode) {
      // 연속 입력 모드가 활성화된 상태에서는 모드를 종료
      handleStopQuickInput();
    } else {
      // 근무 타입 바 토글
      setShowWorkTypeBar(!showWorkTypeBar);
    }
  };

  const handleWorkTypeSelect = async (workType: WorkType) => {
    if (!user || !selectedDate) return;

    try {
      // 해당 날짜에 이미 근무가 있는지 확인
      const existingShift = workShifts.find(shift => shift.date === selectedDate);
      
      if (existingShift) {
        // 기존 근무 수정
        await updateDoc(doc(db, 'workShifts', existingShift.id), {
          type: 'custom',
          startTime: workType.isAllDay ? '' : workType.startTime,
          endTime: workType.isAllDay ? '' : workType.endTime,
          totalHours: workType.isAllDay ? 0 : calculateHours(workType.startTime, workType.endTime),
          notes: workType.name,
          updatedAt: new Date(),
        });
      } else {
        // 새 근무 추가
        await addDoc(collection(db, 'workShifts'), {
          userId: user.id,
          date: selectedDate,
          type: 'custom',
          startTime: workType.isAllDay ? '' : workType.startTime,
          endTime: workType.isAllDay ? '' : workType.endTime,
          totalHours: workType.isAllDay ? 0 : calculateHours(workType.startTime, workType.endTime),
          isHoliday: false,
          notes: workType.name,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      await loadWorkShifts(user.id);
      
      // 알림 스케줄링
      scheduleNotificationForWorkShift(selectedDate, workType);
      
      setShowWorkTypeModal(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('근무 일정 저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleRemoveShift = async (dateStr: string) => {
    if (!user) return;
    
    const shift = workShifts.find(s => s.date === dateStr);
    if (!shift) return;

    if (!confirm('이 날의 근무를 삭제하시겠습니까?')) return;

    try {
      await deleteDoc(doc(db, 'workShifts', shift.id));
      await loadWorkShifts(user.id);
    } catch (error) {
      console.error('근무 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const calculateHours = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();
    
    const days = [];
    
    // 이전 달의 날짜들
    for (let i = 0; i < startDate; i++) {
      days.push(null);
    }
    
    // 현재 달의 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getWorkShiftForDate = (day: number) => {
    if (!day) return null;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workShifts.find(shift => shift.date === dateStr);
  };

  const getWorkTypeColor = (shift: WorkShift) => {
    if (!shift.notes) return '#6B7280';
    const workType = workTypes.find(wt => wt.name === shift.notes);
    return workType ? workType.color : '#6B7280';
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getMonthlyWorkStats = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyShifts = workShifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate.getMonth() === currentMonth && shiftDate.getFullYear() === currentYear;
    });

    const stats: { [key: string]: number } = {};
    
    monthlyShifts.forEach(shift => {
      if (shift.notes) {
        stats[shift.notes] = (stats[shift.notes] || 0) + 1;
      }
    });

    return stats;
  };

  // 알림 스케줄링 함수
  const scheduleNotificationForWorkShift = (_dateStr: string, workType: WorkType) => {
    // 종일 근무는 알림 스케줄링하지 않음
    if (workType.isAllDay || !workType.startTime) {
      return;
    }

    // 해당 근무 타입의 알림 설정 찾기
    const notificationSetting = notificationSettings.find(
      setting => setting.workTypeName === workType.name
    );

    if (!notificationSetting) {
      return;
    }

    // 알림 스케줄링
    notificationService.scheduleWorkNotification(
      workType.name,
      workType.startTime,
      notificationSetting.notificationMinutes
    );

    console.log(`${workType.name} 근무 알림이 스케줄링되었습니다.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 space-y-4">
      {/* 헤더 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={goToPreviousMonth} className="p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
          </h1>
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <Button 
                variant={isQuickInputMode ? "primary" : showWorkTypeBar ? "secondary" : "ghost"} 
                onClick={toggleWorkTypeBar} 
                className={`p-2 transition-all duration-200 ${
                  !isQuickInputMode && !showWorkTypeBar 
                    ? 'hover:scale-110 hover:shadow-lg' 
                    : ''
                }`}
              >
                {isQuickInputMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </Button>
              
              {/* 툴팁 */}
              {!isQuickInputMode && !showWorkTypeBar && (
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  근무 추가하기
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-800"></div>
                </div>
              )}
            </div>
            <Button variant="ghost" onClick={goToNextMonth} className="p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>

        {/* 연속 입력 모드 상태 바 */}
        {isQuickInputMode && selectedWorkType && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedWorkType.color }}
                  />
                  <span className="font-medium text-gray-900">연속 입력 모드</span>
                </div>
                <div className="text-sm text-gray-600">
                  "{selectedWorkType.name}" 근무를 빠르게 등록하세요
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStopQuickInput}
                className="px-3 py-1"
              >
                종료
              </Button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              💡 날짜를 클릭하면 바로 "{selectedWorkType.name}" 근무가 등록됩니다
            </div>
          </div>
        )}

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((dayName, index) => (
            <div key={dayName} className={`text-center text-sm font-medium py-2 ${
              index === 0 ? 'text-red-600 dark:text-red-400' : index === 6 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
            }`}>
              {dayName}
            </div>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const shift = day ? getWorkShiftForDate(day) : null;
            const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
            const isToday = day && dateStr === new Date().toISOString().split('T')[0];
            const isSelected = day && dateStr === selectedDate;
            
            return (
              <div
                key={index}
                className={`aspect-square flex flex-col items-center justify-center text-sm border border-gray-200 dark:border-gray-600 rounded-lg relative ${
                  day && (showWorkTypeBar || isQuickInputMode) ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''
                } ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''} ${
                  isSelected ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600 border-2' : ''
                }`}
                onClick={() => day && handleDateClick(dateStr)}
              >
                {day && (
                  <>
                    <span className={`font-medium ${
                      index % 7 === 0 ? 'text-red-600 dark:text-red-400' : index % 7 === 6 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                    } ${isToday ? 'text-blue-700 dark:text-blue-300 font-bold' : ''}`}>
                      {day}
                    </span>
                    {shift && (
                      <div className="w-full mt-1 px-1">
                        <div
                          className="w-full py-1 px-2 rounded-md text-white text-xs font-medium text-center truncate"
                          style={{ backgroundColor: getWorkTypeColor(shift) }}
                        >
                          {shift.notes}
                        </div>
                      </div>
                    )}
                    {shift && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveShift(dateStr);
                        }}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-200 text-xs font-bold"
                      >
                        ×
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 근무 타입 선택 모달 */}
      {showWorkTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">근무 선택</h3>
            {workTypes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">등록된 근무 타입이 없습니다</p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowWorkTypeModal(false);
                    navigate('/settings/work-types');
                  }}
                >
                  근무 타입 추가하기
                </Button>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {workTypes.map((workType) => (
                  <div key={workType.id} className="space-y-2">
                    <button
                      onClick={() => handleWorkTypeSelect(workType)}
                      className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg flex items-center space-x-3"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: workType.color }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{workType.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {workType.isAllDay ? '종일' : `${workType.startTime} - ${workType.endTime}`}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleStartQuickInput(workType)}
                      className="w-full p-2 text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center space-x-2 text-sm"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-blue-700 font-medium">연속 입력 모드로 시작</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setShowWorkTypeModal(false);
                setSelectedDate(null);
              }}
              className="w-full"
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {/* 월별 근무 통계 */}
      {Object.keys(getMonthlyWorkStats()).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
          <div className="flex flex-wrap items-center gap-3">
            {Object.entries(getMonthlyWorkStats()).map(([workTypeName, count]) => {
              const workType = workTypes.find(wt => wt.name === workTypeName);
              return (
                <div
                  key={workTypeName}
                  className="flex items-center space-x-1"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: workType?.color || '#6B7280' }}
                  />
                  <span className="text-xs text-gray-700">
                    {workTypeName} {count}일
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 근무 타입 선택 바 (달력 바로 아래) */}
      {showWorkTypeBar && !isQuickInputMode && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
          {workTypes.length === 0 ? (
            <div className="text-center py-2">
              <p className="text-gray-500 text-sm mb-2">등록된 근무 타입이 없습니다</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowWorkTypeBar(false);
                  navigate('/settings/work-types');
                }}
              >
                근무 타입 추가하기
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {workTypes.map((workType) => (
                  <button
                    key={workType.id}
                    onClick={() => {
                      if (waitingForWorkType && selectedDate) {
                        // 날짜가 선택된 상태에서 근무 타입 선택
                        handleQuickInput(selectedDate, workType);
                      } else {
                        // 연속 입력 모드 시작
                        handleStartQuickInput(workType);
                      }
                    }}
                    className={`py-2 px-3 rounded-lg flex items-center space-x-2 transition-colors text-sm ${
                      waitingForWorkType && selectedDate 
                        ? 'bg-blue-50 hover:bg-blue-100 border border-blue-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: workType.color }}
                    />
                    <span className="font-medium text-gray-900 whitespace-nowrap">{workType.name}</span>
                  </button>
                ))}
                <button
                  onClick={() => setShowWorkTypeBar(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 ml-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-xs text-gray-500 text-center">
                {waitingForWorkType && selectedDate ? (
                  <span className="text-green-600 font-medium">
                    📅 {selectedDate} 날짜 선택됨 - 근무 타입을 선택하세요
                  </span>
                ) : (
                  <span>💡 근무 타입을 선택하면 연속 입력 모드가 시작됩니다</span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}