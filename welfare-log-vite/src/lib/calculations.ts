import type { WorkShift } from '../types';
import type { User } from '../types/user';

export const NIGHT_SHIFT_START = 22; // 10 PM
export const NIGHT_SHIFT_END = 6; // 6 AM
export const STANDARD_WORK_HOURS_PER_WEEK = 40;
export const STANDARD_WORK_HOURS_PER_DAY = 8;

export function calculateHours(startTime: string, endTime: string, breakTime: number = 0): number {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }
  
  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return Math.max(0, diffHours - breakTime);
}

export function isNightShift(startTime: string, endTime: string): boolean {
  const start = parseInt(startTime.split(':')[0]);
  const end = parseInt(endTime.split(':')[0]);
  
  return start >= NIGHT_SHIFT_START || end <= NIGHT_SHIFT_END;
}

export function calculateNightShiftHours(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }
  
  // 야간시간대: 22:00 ~ 06:00 (다음날)
  const nightStart = new Date('2000-01-01 22:00');
  const nightEnd = new Date('2000-01-02 06:00');
  
  let totalNightHours = 0;
  
  // 첫 번째 야간시간대 (22:00 ~ 24:00)
  const firstNightEnd = new Date('2000-01-02 00:00');
  const firstOverlapStart = new Date(Math.max(start.getTime(), nightStart.getTime()));
  const firstOverlapEnd = new Date(Math.min(end.getTime(), firstNightEnd.getTime()));
  
  if (firstOverlapStart < firstOverlapEnd) {
    totalNightHours += (firstOverlapEnd.getTime() - firstOverlapStart.getTime()) / (1000 * 60 * 60);
  }
  
  // 두 번째 야간시간대 (00:00 ~ 06:00 다음날)
  const secondNightStart = new Date('2000-01-02 00:00');
  const secondOverlapStart = new Date(Math.max(start.getTime(), secondNightStart.getTime()));
  const secondOverlapEnd = new Date(Math.min(end.getTime(), nightEnd.getTime()));
  
  if (secondOverlapStart < secondOverlapEnd) {
    totalNightHours += (secondOverlapEnd.getTime() - secondOverlapStart.getTime()) / (1000 * 60 * 60);
  }
  
  return totalNightHours;
}

export function calculateWeeklyHours(shifts: WorkShift[]): number {
  return shifts.reduce((total, shift) => total + shift.totalHours, 0);
}

export function calculateOvertimeHours(weeklyHours: number): number {
  return Math.max(0, weeklyHours - STANDARD_WORK_HOURS_PER_WEEK);
}

export function calculateDailyOvertimeHours(dailyHours: number): number {
  return Math.max(0, dailyHours - STANDARD_WORK_HOURS_PER_DAY);
}

export function calculatePay(
  shifts: WorkShift[],
  user: User,
  isHolidayPeriod: boolean = false
): {
  regularPay: number;
  overtimePay: number;
  nightShiftPay: number;
  holidayPay: number;
  totalPay: number;
} {
  let regularHours = 0;
  let totalOvertimeHours = 0;
  let nightShiftHours = 0;
  let holidayHours = 0;
  
  shifts.forEach(shift => {
    if (shift.type === 'off' || shift.type === 'vacation' || shift.type === 'sick') {
      return;
    }
    
    if (shift.isHoliday || isHolidayPeriod) {
      holidayHours += shift.totalHours;
      // 휴일 근무도 8시간 초과 시 초과근무 적용
      const dailyOvertime = calculateDailyOvertimeHours(shift.totalHours);
      if (dailyOvertime > 0) {
        totalOvertimeHours += dailyOvertime;
        holidayHours -= dailyOvertime; // 휴일 시간에서 초과근무 시간 제외
      }
    } else {
      // 일일 초과근무 계산 (8시간 초과)
      const dailyOvertime = calculateDailyOvertimeHours(shift.totalHours);
      const regularDaily = shift.totalHours - dailyOvertime;
      
      regularHours += regularDaily;
      totalOvertimeHours += dailyOvertime;
      
      if (shift.startTime && shift.endTime) {
        nightShiftHours += calculateNightShiftHours(shift.startTime, shift.endTime);
      }
    }
  });
  
  // 주간 초과근무도 추가 계산 (일일 초과근무와 별도)
  const weeklyHours = regularHours + totalOvertimeHours + holidayHours;
  const weeklyOvertime = calculateOvertimeHours(weeklyHours);
  
  // 총 초과근무 시간 = 일일 초과근무 + 주간 초과근무 (중복 제거)
  const finalOvertimeHours = Math.max(totalOvertimeHours, weeklyOvertime);
  const finalRegularHours = Math.max(0, regularHours - (finalOvertimeHours - totalOvertimeHours));
  
  const regularPay = finalRegularHours * user.hourlyRate;
  const overtimePay = finalOvertimeHours * user.hourlyRate * user.overtimeRate;
  const nightShiftPay = nightShiftHours * user.hourlyRate * (user.nightShiftRate - 1);
  const holidayPay = holidayHours * user.hourlyRate * user.holidayRate;
  
  const totalPay = regularPay + overtimePay + nightShiftPay + holidayPay;
  
  return {
    regularPay,
    overtimePay,
    nightShiftPay,
    holidayPay,
    totalPay
  };
}