import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    hourlyRate: 0,
    nightShiftRate: 1.5,
    overtimeRate: 1.5,
    holidayRate: 2.0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
            setUser(userData);
            setFormData({
              name: userData.name || '',
              hourlyRate: userData.hourlyRate || 0,
              nightShiftRate: userData.nightShiftRate || 1.5,
              overtimeRate: userData.overtimeRate || 1.5,
              holidayRate: userData.holidayRate || 2.0
            });
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

  const handleLogout = async () => {
    const confirmed = confirm('정말로 로그아웃하시겠습니까?');
    if (!confirmed) return;

    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃에 실패했습니다.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm('정말로 계정을 삭제하시겠습니까?\n\n모든 근무 기록과 설정이 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.');
    if (!confirmed) return;

    const doubleConfirmed = confirm('계정 삭제를 확인합니다. 계속하시겠습니까?');
    if (!doubleConfirmed) return;

    if (!auth.currentUser || !user) return;

    setSaving(true);
    try {
      // 1. Firestore에서 사용자 데이터 삭제
      await deleteDoc(doc(db, 'users', user.id));
      
      // 2. Firebase Auth 계정 삭제
      await deleteUser(auth.currentUser);
      
      alert('계정이 성공적으로 삭제되었습니다.');
      navigate('/login');
    } catch (error: any) {
      console.error('계정 삭제 실패:', error);
      if (error.code === 'auth/requires-recent-login') {
        alert('보안을 위해 최근 로그인이 필요합니다. 다시 로그인 후 시도해주세요.');
        await signOut(auth);
        navigate('/login');
      } else {
        alert('계정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        name: formData.name,
        hourlyRate: formData.hourlyRate,
        nightShiftRate: formData.nightShiftRate,
        overtimeRate: formData.overtimeRate,
        holidayRate: formData.holidayRate,
        updatedAt: new Date()
      });

      // 로컬 state 업데이트
      setUser(prev => prev ? { ...prev, ...formData } : null);
      alert('프로필이 성공적으로 업데이트되었습니다!');
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      alert('프로필 업데이트에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setSaving(true);
    try {
      // 현재 비밀번호로 재인증
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // 비밀번호 변경
      await updatePassword(auth.currentUser, passwordData.newPassword);
      
      alert('비밀번호가 성공적으로 변경되었습니다!');
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('비밀번호 변경 실패:', error);
      if (error.code === 'auth/wrong-password') {
        alert('현재 비밀번호가 올바르지 않습니다.');
      } else {
        alert('비밀번호 변경에 실패했습니다.');
      }
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

  if (!user) {
    return null;
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">계정 관리</h1>
      </div>

      {/* 계정 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name || '이름 없음'}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">사회복지사</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
          >
            로그아웃
          </Button>
        </div>
      </div>

      {/* 프로필 정보 수정 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">프로필 정보</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">이름</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">기본 시급 (원)</label>
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">야간수당 배율</label>
              <input
                type="number"
                step="0.1"
                value={formData.nightShiftRate}
                onChange={(e) => setFormData({ ...formData, nightShiftRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="1"
                max="3"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">연장수당 배율</label>
              <input
                type="number"
                step="0.1"
                value={formData.overtimeRate}
                onChange={(e) => setFormData({ ...formData, overtimeRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="1"
                max="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">휴일수당 배율</label>
              <input
                type="number"
                step="0.1"
                value={formData.holidayRate}
                onChange={(e) => setFormData({ ...formData, holidayRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="1"
                max="3"
              />
            </div>
          </div>


          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={saving}
          >
            {saving ? '저장 중...' : '프로필 업데이트'}
          </Button>
        </form>
      </div>

      {/* 비밀번호 변경 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">비밀번호 변경</h3>
          {!showPasswordChange && (
            <Button
              variant="outline"
              onClick={() => setShowPasswordChange(true)}
            >
              비밀번호 변경
            </Button>
          )}
        </div>

        {showPasswordChange && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">현재 비밀번호</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">새 비밀번호</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">새 비밀번호 확인</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                minLength={6}
                required
              />
            </div>
            <div className="flex space-x-3">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="flex-1"
              >
                {saving ? '변경 중...' : '비밀번호 변경'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* 위험 영역 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-red-200 dark:border-red-800 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">회원탈퇴</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">계정과 모든 데이터를 영구적으로 삭제합니다</p>
            </div>
            <Button
              variant="outline"
              onClick={handleDeleteAccount}
              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
            >
              계정 삭제
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}