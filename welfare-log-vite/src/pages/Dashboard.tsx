import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/utils';

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

interface Attendance {
  id: string;
  userId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  workShiftId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setWorkShifts] = useState<WorkShift[]>([]);
  const [, setAttendances] = useState<Attendance[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({
    workDays: 0,
    totalHours: 0,
    nightHours: 0,
    overtimeHours: 0,
    estimatedPay: 0
  });
  const navigate = useNavigate();

  // 데이터 로드 함수들
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
      return workShiftList;
    } catch (error) {
      console.error('근무 일정을 불러오는데 실패했습니다:', error);
      return [];
    }
  };

  const loadAttendances = async (userId: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'attendances'));
      const attendanceList: Attendance[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === userId) {
          attendanceList.push({ id: doc.id, ...data } as Attendance);
        }
      });
      
      setAttendances(attendanceList);
      return attendanceList;
    } catch (error) {
      console.error('출퇴근 기록을 불러오는데 실패했습니다:', error);
      return [];
    }
  };

  // 월별 통계 계산
  const calculateMonthlyStats = (shifts: WorkShift[], attendances: Attendance[], user: User) => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // 이번 달 근무 일정
    const monthlyShifts = shifts.filter(shift => shift.date.startsWith(currentMonth));
    
    // 이번 달 출퇴근 기록
    const monthlyAttendances = attendances.filter(attendance => attendance.date.startsWith(currentMonth));
    
    let totalHours = 0;
    let nightHours = 0;
    let overtimeHours = 0;
    
    monthlyAttendances.forEach(attendance => {
      if (attendance.checkOutTime) {
        // 실제 근무시간 계산
        const startTime = new Date(`2000-01-01 ${attendance.checkInTime}`);
        let endTime = new Date(`2000-01-01 ${attendance.checkOutTime}`);
        
        if (endTime < startTime) {
          endTime.setDate(endTime.getDate() + 1);
        }
        
        const actualHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        totalHours += actualHours;
        
        // 해당 날짜의 근무 일정 찾기
        const workShift = monthlyShifts.find(shift => shift.date === attendance.date);
        
        if (workShift) {
          // 야간근무 시간 계산 (예: 22시-06시)
          if (workShift.notes?.includes('야간') || 
              (workShift.startTime && parseInt(workShift.startTime.split(':')[0]) >= 22) ||
              (workShift.endTime && parseInt(workShift.endTime.split(':')[0]) <= 6)) {
            nightHours += actualHours;
          }
          
          // 시간외 근무 계산
          if (workShift.startTime && workShift.endTime) {
            const scheduledStart = new Date(`2000-01-01 ${workShift.startTime}`);
            let scheduledEnd = new Date(`2000-01-01 ${workShift.endTime}`);
            
            if (scheduledEnd < scheduledStart) {
              scheduledEnd.setDate(scheduledEnd.getDate() + 1);
            }
            
            const scheduledHours = (scheduledEnd.getTime() - scheduledStart.getTime()) / (1000 * 60 * 60);
            const overtime = actualHours - scheduledHours;
            
            if (overtime > 0) {
              overtimeHours += overtime;
            }
          } else {
            // 종일 근무의 경우 모든 시간을 시간외로 계산
            overtimeHours += actualHours;
          }
        }
      }
    });
    
    // 예상 급여 계산
    const baseHours = totalHours - nightHours - overtimeHours;
    const estimatedPay = 
      (baseHours * (user.hourlyRate || 0)) +
      (nightHours * (user.hourlyRate || 0) * (user.nightShiftRate || 1.5)) +
      (overtimeHours * (user.hourlyRate || 0) * (user.overtimeRate || 1.5));
    
    setMonthlyStats({
      workDays: monthlyAttendances.length,
      totalHours: Math.round(totalHours * 10) / 10,
      nightHours: Math.round(nightHours * 10) / 10,
      overtimeHours: Math.round(overtimeHours * 10) / 10,
      estimatedPay: Math.round(estimatedPay)
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
            setUser(userData);
            
            // 데이터 로드
            const [shifts, attendances] = await Promise.all([
              loadWorkShifts(firebaseUser.uid),
              loadAttendances(firebaseUser.uid)
            ]);
            
            // 통계 계산
            calculateMonthlyStats(shifts, attendances, userData);
          }
        } catch (error) {
          console.error('사용자 정보를 가져오는데 실패했습니다:', error);
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">WelfareLog</h3>
            <p className="text-gray-500">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const today = new Date();
  // const currentMonth = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6 space-y-6">
        {/* User Welcome Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">안녕하세요!</h2>
              <p className="text-blue-100 text-lg">{user.name || user.email} 사회복지사님!</p>
            </div>
            <p className="text-blue-50 text-sm">오늘도 수고 많으셨습니다 🎉</p>
          </div>
          
          {/* Date Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{today.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long' 
              })}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
		
        <div className="grid grid-cols-2 gap-4">
		
          {/* 이번 달 근무일 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">근무일</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{monthlyStats.workDays}<span className="text-sm text-gray-500 dark:text-gray-400 ml-1">일</span></p>
              </div>
            </div>
          </div>

          {/* 총 근무시간 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">근무시간</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{monthlyStats.totalHours}<span className="text-sm text-gray-500 dark:text-gray-400 ml-1"></span></p>
              </div>
            </div>
          </div>

          {/* 야간근무 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">시간외근무</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{monthlyStats.overtimeHours}<span className="text-sm text-gray-500 dark:text-gray-400 ml-1"></span></p>
              </div>
            </div>
          </div>

          {/* 예상 급여 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">예상 급여</p>
                <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">구현중.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <div className="p-6 bg-white border-b border-gray-200 dark:bg-gray-700 border-b border-gray-100/30 dark:border-gray-600">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              빠른 작업
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {/* 출근 체크인 */}
              <button 
                onClick={() => navigate('/timesheet')}
                className="group relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-sm">출근 체크인</span>
                </div>
              </button>

              {/* 근무 일정 */}
              <button 
                onClick={() => navigate('/calendar')}
                className="group relative bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-sm">근무 일정</span>
                </div>
              </button>

              {/* 급여 계산 */}
              <button 
                onClick={() => navigate('/payroll')}
                className="group relative bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <span className="font-semibold text-sm">급여 계산</span>
                </div>
              </button>

              {/* 설정 */}
              <button 
                onClick={() => navigate('/settings')}
                className="group relative bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-sm">설정</span>
                </div>
              </button>
            </div>
          </div>
        </div>

       
        {/* User Settings Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-white dark:bg-gray-700 border-b border-gray-50 dark:border-gray-600">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              내 설정
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="text-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg w-fit mx-auto mb-2">
                    <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">시급</p>
                  <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(user.hourlyRate || 0)}</p>
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                <div className="text-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg w-fit mx-auto mb-2">
                    <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">야간수당</p>
                  <p className="font-bold text-gray-900 dark:text-white">+{((user.nightShiftRate || 1.5) - 1) * 100}%</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                <div className="text-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg w-fit mx-auto mb-2">
                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">초과수당</p>
                  <p className="font-bold text-gray-900 dark:text-white">+{((user.overtimeRate || 1.5) - 1) * 100}%</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800">
                <div className="text-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg w-fit mx-auto mb-2">
                    <svg className="h-4 w-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">휴일수당</p>
                  <p className="font-bold text-gray-900 dark:text-white">+{((user.holidayRate || 2.0) - 1) * 100}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-white dark:bg-gray-700 border-b border-gray-50 dark:border-gray-600">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              최근 활동
            </h3>
          </div>
          
          <div className="p-8">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-fit mx-auto mb-4">
                <svg className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-lg mb-2">아직 근무 기록이 없습니다</p>
              <p className="text-gray-500 dark:text-gray-400 mb-4">첫 근무를 기록해보세요!</p>
              <button 
                onClick={() => navigate('/timesheet')}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
              >
                첫 근무 기록하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}