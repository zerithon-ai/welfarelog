import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
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

export default function WorkTypes() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [isAddingWorkType, setIsAddingWorkType] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    color: '#3B82F6',
    isAllDay: false
  });
  const navigate = useNavigate();

  const colorOptions = [
    { value: '#3B82F6', name: '파랑' },
    { value: '#EF4444', name: '빨강' },
    { value: '#10B981', name: '초록' },
    { value: '#F59E0B', name: '주황' },
    { value: '#8B5CF6', name: '보라' },
    { value: '#EC4899', name: '분홍' },
    { value: '#6B7280', name: '회색' },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', firebaseUser.email)));
          if (!userDoc.empty) {
            setUser({ id: firebaseUser.uid, ...userDoc.docs[0].data() } as User);
            await loadWorkTypes(firebaseUser.uid);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name || (!formData.isAllDay && (!formData.startTime || !formData.endTime))) return;

    try {
      if (editingId) {
        // 기존 근무 타입의 이름 가져오기
        const existingWorkType = workTypes.find(wt => wt.id === editingId);
        const oldName = existingWorkType?.name;

        await updateDoc(doc(db, 'workTypes', editingId), {
          name: formData.name,
          startTime: formData.isAllDay ? '' : formData.startTime,
          endTime: formData.isAllDay ? '' : formData.endTime,
          color: formData.color,
          isAllDay: formData.isAllDay,
          updatedAt: new Date(),
        });

        // 이름이 변경된 경우 기존 근무 일정들도 업데이트
        if (oldName && oldName !== formData.name) {
          await updateExistingWorkShifts(user.id, oldName, formData.name);
        }

        alert('근무 타입이 수정되었습니다!');
      } else {
        await addDoc(collection(db, 'workTypes'), {
          userId: user.id,
          name: formData.name,
          startTime: formData.startTime,
          endTime: formData.endTime,
          color: formData.color,
          isAllDay: formData.isAllDay,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        alert('근무 타입이 추가되었습니다!');
      }

      await loadWorkTypes(user.id);
      resetForm();
    } catch (error) {
      console.error('근무 타입 저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const updateExistingWorkShifts = async (userId: string, oldName: string, newName: string) => {
    try {
      // 해당 사용자의 모든 근무 일정 가져오기
      const querySnapshot = await getDocs(collection(db, 'workShifts'));
      const updatePromises: Promise<void>[] = [];

      querySnapshot.forEach((docRef) => {
        const data = docRef.data();
        if (data.userId === userId && data.notes === oldName) {
          updatePromises.push(
            updateDoc(doc(db, 'workShifts', docRef.id), {
              notes: newName,
              updatedAt: new Date(),
            })
          );
        }
      });

      await Promise.all(updatePromises);
      console.log(`${updatePromises.length}개의 근무 일정이 업데이트되었습니다.`);
    } catch (error) {
      console.error('기존 근무 일정 업데이트 실패:', error);
    }
  };

  const handleEdit = (workType: WorkType) => {
    setEditingId(workType.id);
    setFormData({
      name: workType.name,
      startTime: workType.startTime || '',
      endTime: workType.endTime || '',
      color: workType.color,
      isAllDay: workType.isAllDay || false,
    });
    setIsAddingWorkType(true);
  };

  const handleDelete = async (workTypeId: string) => {
    if (!confirm('정말로 이 근무 타입을 삭제하시겠습니까?')) return;

    try {
      await deleteDoc(doc(db, 'workTypes', workTypeId));
      await loadWorkTypes(user!.id);
      alert('근무 타입이 삭제되었습니다!');
    } catch (error) {
      console.error('근무 타입 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', startTime: '', endTime: '', color: '#3B82F6', isAllDay: false });
    setIsAddingWorkType(false);
    setEditingId(null);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">근무 설정</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">근무 타입 관리</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddingWorkType(true)}
            disabled={isAddingWorkType}
          >
            + 
          </Button>
        </div>

        {isAddingWorkType && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">근무 이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                placeholder="예: 주간, 야간, 오전"
                required
              />
            </div>

            <div>
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="isAllDay"
                  checked={formData.isAllDay}
                  onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800"
                />
                <label htmlFor="isAllDay" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  종일
                </label>
              </div>
            </div>

            {!formData.isAllDay && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">시작 시간</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                    required={!formData.isAllDay}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">종료 시간</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                    required={!formData.isAllDay}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">색상</label>
              <div className="flex space-x-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color.value ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" variant="primary" className="flex-1">
                {editingId ? '수정' : '추가'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                취소
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {workTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="font-medium">등록된 근무 타입이 없습니다</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">근무 타입을 추가해보세요!</p>
            </div>
          ) : (
            workTypes.map((workType) => (
              <div key={workType.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(workType)}
                    className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(workType.id)}
                    className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}