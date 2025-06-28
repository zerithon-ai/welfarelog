'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, orderBy, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, Attendance } from '@/types';
import MobileLayout from '@/components/ui/MobileLayout';
import Button from '@/components/ui/Button';
import { formatDate, formatTime } from '@/lib/utils';

export default function TimesheetPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editDate, setEditDate] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
            await loadAttendances(firebaseUser.uid);
          }
        } catch (error) {
          console.error('사용자 정보를 가져오는데 실패했습니다:', error);
        }
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

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
    } catch (error) {
      console.error('출퇴근 기록을 불러오는데 실패했습니다:', error);
      // 에러 발생 시 빈 배열로 설정
      setAttendances([]);
    }
  };

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
      <MobileLayout showNavigation={false}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
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
        <div className="bg-white rounded-lg shadow-sm border p-2">
				 <h1 className="text-sx font-semibold text-gray-900 mb-2">근무일</h1>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50"
          />
        </div>

        {/* 출근 기록 */}
        <div className="bg-white rounded-lg shadow-sm border p-2">
		 <h1 className="text-sx font-semibold text-gray-900 mb-2">출근시간</h1>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 text-lg"
                placeholder="출근 시간"
              />
              <Button
                variant="outline"
                onClick={() => setCurrentTime('in')}
                className="px-4 py-3"
              >
                현재
              </Button>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleCheckIn}
              disabled={!checkInTime || saving}
              loading={saving}
            >
              출근 기록
            </Button>
          </div>
        </div>

        {/* 퇴근 기록 */}
        <div className="bg-white rounded-lg shadow-sm border p-2">
		<h1 className="text-sx font-semibold text-gray-900 mb-2">퇴근시간</h1>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 text-lg"
                placeholder="퇴근 시간"
              />
              <Button
                variant="outline"
                onClick={() => setCurrentTime('out')}
                className="px-4 py-3"
              >
                현재
              </Button>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleCheckOut}
              disabled={!checkOutTime || saving}
              loading={saving}
            >
              퇴근 기록
            </Button>
          </div>
        </div>

        {/* 최근 출퇴근 기록 */}
        <div className="bg-white rounded-lg shadow-sm border p-2">
          <h1 className="text-sx font-semibold text-gray-900 mb-2">출퇴근 기록</h1>
          {attendances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">아직 출퇴근 기록이 없습니다</p>
              <p className="text-sm text-gray-400 mt-1">첫 출근을 기록해보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendances.slice(0, 5).map((attendance) => (
                <div key={attendance.id} className="bg-gray-50 rounded-lg p-3">
                  {editingId === attendance.id ? (
                    // 수정 모드
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full px-3 py-3 text-base text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">출근시간</label>
                          <input
                            type="time"
                            value={editCheckIn}
                            onChange={(e) => setEditCheckIn(e.target.value)}
                            className="w-full px-3 py-3 text-base text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">퇴근시간</label>
                          <input
                            type="time"
                            value={editCheckOut}
                            onChange={(e) => setEditCheckOut(e.target.value)}
                            className="w-full px-3 py-3 text-base text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                    // 일반 모드
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {formatDate(attendance.date)}
                        </p>
                        <div className="text-sm text-gray-600">
                          <span>출근: {formatTime(attendance.checkInTime)}</span>
                          {attendance.checkOutTime && (
                            <span> | 퇴근: {formatTime(attendance.checkOutTime)} 
							<span className="text-sm text-blue-600 mt-1"> | 근무시간:  
							{calculateWorkHours(attendance.checkInTime, attendance.checkOutTime)}</span></span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(attendance)}
                          className="p-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(attendance.id)}
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </MobileLayout>
  );
}