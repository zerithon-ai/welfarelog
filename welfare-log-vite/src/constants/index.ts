export const WORK_TYPES = {
  DAY: 'day',
  NIGHT: 'night',
  OFF: 'off',
  VACATION: 'vacation',
  SICK: 'sick',
} as const;

export const WORK_TYPE_LABELS = {
  [WORK_TYPES.DAY]: '주간근무',
  [WORK_TYPES.NIGHT]: '야간근무',
  [WORK_TYPES.OFF]: '휴무',
  [WORK_TYPES.VACATION]: '휴가',
  [WORK_TYPES.SICK]: '병가',
} as const;

export const WORK_TYPE_COLORS = {
  [WORK_TYPES.DAY]: 'bg-blue-100 text-blue-800',
  [WORK_TYPES.NIGHT]: 'bg-purple-100 text-purple-800',
  [WORK_TYPES.OFF]: 'bg-gray-100 text-gray-800',
  [WORK_TYPES.VACATION]: 'bg-green-100 text-green-800',
  [WORK_TYPES.SICK]: 'bg-red-100 text-red-800',
} as const;

export const DEFAULT_SETTINGS = {
  HOURLY_RATE: 15000,
  NIGHT_SHIFT_RATE: 1.5,
  OVERTIME_RATE: 1.5,
  HOLIDAY_RATE: 2.0,
  WORK_START_TIME: '09:00',
  WORK_END_TIME: '18:00',
  BREAK_TIME: 1,
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  CALENDAR: '/calendar',
  TIMESHEET: '/timesheet',
  PAYROLL: '/payroll',
  SETTINGS: '/settings',
} as const;