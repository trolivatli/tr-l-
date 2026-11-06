export type PriorityLevel = 'high' | 'medium' | 'low';

export type TaskCategory = 'work' | 'personal' | 'study' | 'health' | 'finance' | 'other';

export type RecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskReminder {
  enabled: boolean;
  leadMinutes: number; // 0 = at due time, 5 = 5m before, 10, 15, 30, 60
  notified?: boolean;
  snoozedUntil?: string; // ISO timestamp
  lastNotifiedTime?: string; // ISO timestamp
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string; // ISO
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: PriorityLevel;
  category: TaskCategory;
  subtasks: Subtask[];
  reminder: TaskReminder;
  recurrence?: RecurrenceType;
  estimatedMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderNotificationItem {
  id: string;
  taskId: string;
  taskTitle: string;
  dueTime?: string;
  dueDate: string;
  priority: PriorityLevel;
  triggeredAt: string; // ISO
  read: boolean;
  type: 'due_now' | 'upcoming' | 'overdue' | 'snoozed';
}

export type ViewTab = 'today' | 'upcoming' | 'timeline' | 'pomodoro' | 'completed' | 'stats';
