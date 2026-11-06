import { Task, ReminderNotificationItem } from '../types/task';

const TASKS_STORAGE_KEY = 'daypulse_tasks_v1';
const NOTIFICATIONS_STORAGE_KEY = 'daypulse_notifications_v1';
const SETTINGS_STORAGE_KEY = 'daypulse_settings_v1';

export interface AppSettings {
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  autoSnoozeMinutes: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  theme: 'light',
  autoSnoozeMinutes: 5,
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatVietnameseDate(dateStr: string): string {
  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();

  if (dateStr === todayStr) return 'Hôm nay';
  if (dateStr === tomorrowStr) return 'Ngày mai';

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[date.getDay()];

  return `${dayName}, ${day}/${month}`;
}

export function getInitialTasks(): Task[] {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  // Pick realistic hours relative to now
  const now = new Date();
  const currentHour = now.getHours();
  const h1 = String(Math.min(23, currentHour + 1)).padStart(2, '0') + ':00';
  const h2 = String(Math.min(23, Math.max(0, currentHour + 3))).padStart(2, '0') + ':30';
  const hPast = String(Math.max(8, currentHour - 2)).padStart(2, '0') + ':00';

  return [
    {
      id: 'task-1',
      title: 'Họp giao ban & rà soát tiến độ dự án',
      description: 'Trao đổi các đầu việc trọng tâm trong tuần và tháo gỡ vướng mắc cho team.',
      completed: true,
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      dueDate: today,
      dueTime: hPast,
      priority: 'high',
      category: 'work',
      subtasks: [
        { id: 'sub-1', title: 'Chuẩn bị slide tổng kết sprint', completed: true },
        { id: 'sub-2', title: 'Ghi chép biên bản cuộc họp', completed: true },
      ],
      reminder: {
        enabled: true,
        leadMinutes: 10,
        notified: true,
      },
      recurrence: 'daily',
      estimatedMinutes: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Hoàn thiện tài liệu đề xuất tính năng mới',
      description: 'Viết tài liệu đặc tả chức năng và lưu đồ luồng nghiệp vụ chi tiết.',
      completed: false,
      dueDate: today,
      dueTime: h1,
      priority: 'high',
      category: 'work',
      subtasks: [
        { id: 'sub-3', title: 'Phác thảo wireframe các màn hình chính', completed: true },
        { id: 'sub-4', title: 'Đánh giá rủi ro kỹ thuật', completed: false },
        { id: 'sub-5', title: 'Gửi bản nháp cho ban quản lý', completed: false },
      ],
      reminder: {
        enabled: true,
        leadMinutes: 15,
        notified: false,
      },
      recurrence: 'none',
      estimatedMinutes: 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Tập thể dục 30 phút & chạy bộ nhẹ',
      description: 'Duy trì thể lực và phục hồi năng lượng buổi chiều.',
      completed: false,
      dueDate: today,
      dueTime: h2,
      priority: 'medium',
      category: 'health',
      subtasks: [
        { id: 'sub-6', title: 'Khởi động khớp 5 phút', completed: false },
        { id: 'sub-7', title: 'Chạy bộ 3km công viên', completed: false },
      ],
      reminder: {
        enabled: true,
        leadMinutes: 10,
        notified: false,
      },
      recurrence: 'daily',
      estimatedMinutes: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Đọc 20 trang sách "Atomic Habits"',
      description: 'Ghi chú 3 ý tưởng áp dụng được vào công việc hàng ngày.',
      completed: false,
      dueDate: today,
      dueTime: '21:30',
      priority: 'low',
      category: 'study',
      subtasks: [],
      reminder: {
        enabled: true,
        leadMinutes: 5,
        notified: false,
      },
      recurrence: 'daily',
      estimatedMinutes: 25,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Tổng hợp chi tiêu tháng & thanh toán hóa đơn',
      description: 'Kiểm tra sao kê ngân hàng và thanh toán điện nước Internet.',
      completed: false,
      dueDate: tomorrow,
      dueTime: '10:00',
      priority: 'medium',
      category: 'finance',
      subtasks: [
        { id: 'sub-8', title: 'Hóa đơn tiền điện & nước', completed: false },
        { id: 'sub-9', title: 'Gói cước Internet', completed: false },
      ],
      reminder: {
        enabled: true,
        leadMinutes: 30,
        notified: false,
      },
      recurrence: 'monthly',
      estimatedMinutes: 20,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function loadTasksFromStorage(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialTasks();
      saveTasksToStorage(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tasks from localStorage', e);
    return getInitialTasks();
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
}

export function loadNotificationsFromStorage(): ReminderNotificationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load notifications', e);
    return [];
  }
}

export function saveNotificationsToStorage(notifications: ReminderNotificationItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

export function loadSettingsFromStorage(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsToStorage(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
