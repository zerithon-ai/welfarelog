import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Button from '../components/ui/Button';
import { formatTime } from '../lib/utils';

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

export default function Timesheet() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM 형식
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editDate, setEditDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
            await loadAttendances(firebaseUser.uid);
            await loadWorkShifts(firebaseUser.uid);
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

  const filterAttendancesByMonth = (attendanceList: Attendance[], month: string) => {
    const filtered = attendanceList.filter(attendance => 
      attendance.date.startsWith(month)
    );
    setFilteredAttendances(filtered);
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
      console.error('근무 일정을 불러오는데 실패했습니다:', error);
      setWorkShifts([]);
    }
  };

  const loadAttendances = async (userId: string) => {
    try {
      // 가장 단순한 방법: 컬렉션 전체를 가져온 후 클라이언트에서 필터링
      const querySnapshot = await getDocs(collection(db, 'attendances'));
      const attendanceList: Attendance[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // 클라이언트에서 userId 필터링
        if (data.userId === userId) {
          attendanceList.push({ id: doc.id, ...data } as Attendance);
        }
      });
      
      // 클라이언트에서 정렬
      attendanceList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAttendances(attendanceList);
      
      // 초기 필터링 (현재 월로 설정)
      filterAttendancesByMonth(attendanceList, selectedMonth);
    } catch (error) {
      console.error('출퇴근 기록을 불러오는데 실패했습니다:', error);
      // 에러 발생 시 빈 배열로 설정
      setAttendances([]);
      setFilteredAttendances([]);
    }
  };

  // 월별 필터링을 위한 useEffect
  useEffect(() => {
    if (attendances.length > 0) {
      filterAttendancesByMonth(attendances, selectedMonth);
    }
  }, [selectedMonth, attendances]);

  const handleCheckIn = async () => {
    if (!user || !checkInTime) return;

    setSaving(true);
    try {
      await addDoc(collection(db, 'attendances'), {
        userId: user.id,
        date: selectedDate,
        checkInTime: checkInTime,
        checkOutTime: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await loadAttendances(user.id);
      setCheckInTime('');
      alert('출근이 기록되었습니다!');
    } catch (error) {
      console.error('출근 기록 실패:', error);
      alert('출근 기록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || !checkOutTime) return;

    setSaving(true);
    try {
      // 모든 출근 기록 가져오기
      const querySnapshot = await getDocs(collection(db, 'attendances'));
      
      // 클라이언트에서 해당 사용자의 해당 날짜 미완료 기록 찾기
      const incompleteAttendances = querySnapshot.docs
        .filter(doc => {
          const data = doc.data();
          return data.userId === user.id && data.date === selectedDate && !data.checkOutTime;
        })
        .sort((a, b) => b.data().createdAt.toDate().getTime() - a.data().createdAt.toDate().getTime());
      
      if (incompleteAttendances.length > 0) {
        const latestAttendance = incompleteAttendances[0];
        const attendanceRef = doc(db, 'attendances', latestAttendance.id);
        
        // checkOutTime 업데이트
        await updateDoc(attendanceRef, {
          checkOutTime: checkOutTime,
          updatedAt: new Date(),
        });

        await loadAttendances(user.id);
        setCheckOutTime('');
        alert('퇴근이 기록되었습니다!');
      } else {
        alert('해당 날짜에 출근 기록이 없습니다.');
      }
    } catch (error) {
      console.error('퇴근 기록 실패:', error);
      alert('퇴근 기록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const calculateWorkHours = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return '진행중';
    
    const startTime = new Date(`2000-01-01 ${checkIn}`);
    const endTime = new Date(`2000-01-01 ${checkOut}`);
    
    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }
    
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return `${diffHours.toFixed(1)}시간`;
  };

  const calculateOvertimeHours = (attendance: Attendance) => {
    if (!attendance.checkOutTime) return null;
    
    // 해당 날짜의 근무 일정 찾기
    const workShift = workShifts.find(shift => shift.date === attendance.date);
    if (!workShift) return null;
    
    // 실제 근무시간 계산 (24시간 포맷으로 정확히 계산)
    const actualStart = new Date(`2000-01-01 ${attendance.checkInTime}`);
    let actualEnd = new Date(`2000-01-01 ${attendance.checkOutTime}`);
    
    // 야간근무 등 다음날로 넘어가는 경우 처리
    if (actualEnd < actualStart) {
      actualEnd.setDate(actualEnd.getDate() + 1);
    }
    const actualHours = (actualEnd.getTime() - actualStart.getTime()) / (1000 * 60 * 60);
    
    // 종일 근무의 경우 (startTime과 endTime이 빈 문자열) 모든 시간을 시간외 근무로 계산
    if (!workShift.startTime || !workShift.endTime) {
      return actualHours;
    }
    
    // 예정 근무시간 계산 (근무관리에서 등록한 시간)
    const scheduledStart = new Date(`2000-01-01 ${workShift.startTime}`);
    let scheduledEnd = new Date(`2000-01-01 ${workShift.endTime}`);
    
    // 야간근무 등 다음날로 넘어가는 경우 처리
    if (scheduledEnd < scheduledStart) {
      scheduledEnd.setDate(scheduledEnd.getDate() + 1);
    }
    const scheduledHours = (scheduledEnd.getTime() - scheduledStart.getTime()) / (1000 * 60 * 60);
    
    // 시간외근무 = 실제 출퇴근 기록 시간 - 근무 형태에 입력된 시간
    const overtimeHours = actualHours - scheduledHours;
    
    // 음수는 0으로 처리 (조기퇴근의 경우)
    return overtimeHours > 0 ? overtimeHours : 0;
  };

  const setCurrentTime = (type: 'in' | 'out') => {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    if (type === 'in') {
      setCheckInTime(timeString);
    } else {
      setCheckOutTime(timeString);
    }
  };

  const handleEdit = (attendance: Attendance) => {
    setEditingId(attendance.id);
    setEditCheckIn(attendance.checkInTime);
    setEditCheckOut(attendance.checkOutTime || '');
    setEditDate(attendance.date);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !user) return;

    setSaving(true);
    try {
      const attendanceRef = doc(db, 'attendances', editingId);
      await updateDoc(attendanceRef, {
        date: editDate,
        checkInTime: editCheckIn,
        checkOutTime: editCheckOut || null,
        updatedAt: new Date(),
      });

      await loadAttendances(user.id);
      setEditingId(null);
      alert('출퇴근 기록이 수정되었습니다!');
    } catch (error) {
      console.error('기록 수정 실패:', error);
      alert('기록 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditCheckIn('');
    setEditCheckOut('');
    setEditDate('');
  };

  const handleDelete = async (attendanceId: string) => {
    if (!user) return;
    
    const confirmed = confirm('정말로 이 출퇴근 기록을 삭제하시겠습니까?');
    if (!confirmed) return;

    setSaving(true);
    try {
      await deleteDoc(doc(db, 'attendances', attendanceId));
      await loadAttendances(user.id);
      alert('출퇴근 기록이 삭제되었습니다!');
    } catch (error) {
      console.error('기록 삭제 실패:', error);
      alert('기록 삭제에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 space-y-6">
      {/* 현재 시간 표시 */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-2 text-white text-center">
        <p className="text-3xl font-bold">
          {new Date().toLocaleTimeString('ko-KR', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        <p className="text-green-100 mt-1">
          {new Date().toLocaleDateString('ko-KR', { 
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
          })}
        </p>
      </div>

      {/* 날짜 선택 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-4">
        <h1 className="text-sx font-semibold text-gray-900 dark:text-white mb-2">근무일</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700"
        />
      </div>

      {/* 출퇴근 기록 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-4">
        <div className="space-y-4">
          {/* 출근시간과 퇴근시간 나란히 배치 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">출근시간</label>
              <div className="space-y-2">
                <div className="flex space-x-1">
                  <input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTime('in')}
                    className="px-2 py-2 text-xs"
                  >
                    현재
                  </Button>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={handleCheckIn}
                  disabled={!checkInTime || saving}
                >
                  출근
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">퇴근시간</label>
              <div className="space-y-2">
                <div className="flex space-x-1">
                  <input
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTime('out')}
                    className="px-2 py-2 text-xs"
                  >
                    현재
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={handleCheckOut}
                  disabled={!checkOutTime || saving}
                >
                  퇴근
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 월별 검색 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-4">
        <h1 className="text-sx font-semibold text-gray-900 dark:text-white mb-2">월별 검색</h1>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700"
        />
      </div>

      {/* 출퇴근 기록 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-4">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-sx font-semibold text-gray-900 dark:text-white">출퇴근 기록</h1>
          {(() => {
            const totalOvertime = filteredAttendances.reduce((total, attendance) => {
              const overtime = calculateOvertimeHours(attendance);
              return total + (overtime || 0);
            }, 0);
            return totalOvertime > 0 ? (
              <div className="text-orange-600 dark:text-orange-400 font-medium text-sm">
                시간외근무 총 {totalOvertime.toFixed(1)}시간
              </div>
            ) : null;
          })()}
        </div>
        {filteredAttendances.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium text-gray-900 dark:text-white">해당 월의 출퇴근 기록이 없습니다</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">다른 월을 선택하거나 출근을 기록해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAttendances.map((attendance) => (
              <div key={attendance.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                {editingId === attendance.id ? (
                  // 수정 모드
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">날짜</label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full px-3 py-3 text-base text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">출근시간</label>
                        <input
                          type="time"
                          value={editCheckIn}
                          onChange={(e) => setEditCheckIn(e.target.value)}
                          className="w-full px-3 py-3 text-base text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">퇴근시간</label>
                        <input
                          type="time"
                          value={editCheckOut}
                          onChange={(e) => setEditCheckOut(e.target.value)}
                          className="w-full px-3 py-3 text-base text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="flex-1"
                      >
                        저장
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="flex-1"
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  // 일반 모드 - 심플한 가로 한 줄
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="font-medium text-gray-900 dark:text-white min-w-0 flex-shrink-0">
                        {new Date(attendance.date).getDate()}일
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatTime(attendance.checkInTime)}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500">/</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {attendance.checkOutTime ? formatTime(attendance.checkOutTime) : '진행중'}
                      </span>
                      {attendance.checkOutTime && (
                        <>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {calculateWorkHours(attendance.checkInTime, attendance.checkOutTime)}
                          </span>
                          {(() => {
                            const overtime = calculateOvertimeHours(attendance);
                            return overtime && overtime > 0 ? (
                              <span className="text-orange-600 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded text-xs">
                                +{overtime.toFixed(1)}h
                              </span>
                            ) : null;
                          })()}
                        </>
                      )}
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(attendance)}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(attendance.id)}
                        className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}