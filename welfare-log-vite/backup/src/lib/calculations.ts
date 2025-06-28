import { WorkShift, User } from '@/types';

export const NIGHT_SHIFT_START = 22; // 10 PM
export const NIGHT_SHIFT_END = 6; // 6 AM
export const STANDARD_WORK_HOURS_PER_WEEK = 40;

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
  
  const nightStart = new Date('2000-01-01 22:00');
  const nightEnd = new Date('2000-01-02 06:00');
  
  const overlapStart = new Date(Math.max(start.getTime(), nightStart.getTime()));
  const overlapEnd = new Date(Math.min(end.getTime(), nightEnd.getTime()));
  
  if (overlapStart >= overlapEnd) return 0;
  
  return (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60);
}

export function calculateWeeklyHours(shifts: WorkShift[]): number {
  return shifts.reduce((total, shift) => total + shift.totalHours, 0);
}

export function calculateOvertimeHours(weeklyHours: number): number {
  return Math.max(0, weeklyHours - STANDARD_WORK_HOURS_PER_WEEK);
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
  let nightShiftHours = 0;
  let holidayHours = 0;
  
  shifts.forEach(shift => {
    if (shift.type === 'off' || shift.type === 'vacation' || shift.type === 'sick') {
      return;
    }
    
    if (shift.isHoliday || isHolidayPeriod) {
      holidayHours += shift.totalHours;
    } else {
      regularHours += shift.totalHours;
      
      if (shift.startTime && shift.endTime) {
        nightShiftHours += calculateNightShiftHours(shift.startTime, shift.endTime);
      }
    }
  });
  
  const weeklyHours = regularHours + holidayHours;
  const overtimeHours = calculateOvertimeHours(weeklyHours);
  const regularWorkHours = Math.max(0, regularHours - overtimeHours);
  
  const regularPay = regularWorkHours * user.hourlyRate;
  const overtimePay = overtimeHours * user.hourlyRate * user.overtimeRate;
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