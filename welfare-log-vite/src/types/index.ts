export interface User {
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

export interface WorkShift {
  id: string;
  userId: string;
  date: string;
  type: 'day' | 'night' | 'off' | 'vacation' | 'sick';
  startTime?: string;
  endTime?: string;
  breakTime?: number;
  totalHours: number;
  isHoliday: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
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

export interface WorkType {
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

export interface PayrollCalculation {
  id: string;
  userId: string;
  month: string;
  year: number;
  regularHours: number;
  overtimeHours: number;
  nightShiftHours: number;
  holidayHours: number;
  regularPay: number;
  overtimePay: number;
  nightShiftPay: number;
  holidayPay: number;
  totalPay: number;
  deductions: {
    tax: number;
    insurance: number;
    other: number;
  };
  netPay: number;
  createdAt: Date;
}

// 명시적으로 다시 export
export { User };