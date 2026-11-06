import { Task, ReminderNotificationItem } from '../types/task';
import { playReminderChime, playUrgentAlert } from './audio';

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

export function getBrowserNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export function triggerTaskNotification(
  task: Task,
  type: 'due_now' | 'upcoming' | 'overdue' | 'snoozed',
  soundEnabled: boolean = true
): ReminderNotificationItem {
  const priorityLabels: Record<string, string> = {
    high: 'Ưu tiên cao 🔴',
    medium: 'Ưu tiên trung bình 🟡',
    low: 'Ưu tiên thấp 🟢',
  };

  let title = `Nhắc nhở: ${task.title}`;
  let body = '';

  if (type === 'due_now') {
    title = `⏰ Đến giờ: ${task.title}`;
    body = `Đã đến giờ thực hiện công việc (${task.dueTime || 'Hôm nay'}). [${priorityLabels[task.priority]}]`;
  } else if (type === 'upcoming') {
    const lead = task.reminder.leadMinutes;
    title = `⏳ Sắp đến giờ: ${task.title}`;
    body = `Còn ${lead} phút nữa đến hạn (${task.dueTime}). [${priorityLabels[task.priority]}]`;
  } else if (type === 'snoozed') {
    title = `🔔 Báo lại: ${task.title}`;
    body = `Công việc nhắc nhở sau khi tạm hoãn. [${priorityLabels[task.priority]}]`;
  } else {
    title = `⚠️ Quá hạn: ${task.title}`;
    body = `Công việc chưa hoàn thành đã quá hạn (${task.dueDate} ${task.dueTime || ''}).`;
  }

  // Play audio chime
  if (soundEnabled) {
    if (task.priority === 'high' || type === 'overdue') {
      playUrgentAlert();
    } else {
      playReminderChime();
    }
  }

  // Native desktop notification if permitted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `task-${task.id}-${type}`,
      });
    } catch (e) {
      console.warn('Native notification failed (might be inside restricted sandbox):', e);
    }
  }

  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    taskId: task.id,
    taskTitle: task.title,
    dueDate: task.dueDate,
    dueTime: task.dueTime,
    priority: task.priority,
    triggeredAt: new Date().toISOString(),
    read: false,
    type,
  };
}

/**
 * Checks a task to determine if it should trigger a reminder at current time
 */
export function checkTaskReminderDue(task: Task, now: Date): { due: boolean; type: 'due_now' | 'upcoming' | 'snoozed' } | null {
  if (task.completed || !task.reminder || !task.reminder.enabled) {
    return null;
  }

  // If snoozed
  if (task.reminder.snoozedUntil) {
    const snoozeTime = new Date(task.reminder.snoozedUntil).getTime();
    if (now.getTime() >= snoozeTime) {
      return { due: true, type: 'snoozed' };
    }
    return null;
  }

  // If already notified for this cycle and not snoozed
  if (task.reminder.notified) {
    return null;
  }

  const [year, month, day] = task.dueDate.split('-').map(Number);
  let hours = 9;
  let minutes = 0;

  if (task.dueTime) {
    const [h, m] = task.dueTime.split(':').map(Number);
    hours = h;
    minutes = m;
  }

  const taskTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
  const leadMinutes = task.reminder.leadMinutes || 0;
  const targetReminderTime = new Date(taskTime.getTime() - leadMinutes * 60 * 1000);

  // If current time is past or within 1 minute of target reminder time
  const timeDiff = now.getTime() - targetReminderTime.getTime();

  // We trigger if now is past target time and not older than 12 hours (so we don't spam ancient un-notified tasks)
  if (timeDiff >= 0 && timeDiff <= 12 * 60 * 60 * 1000) {
    const type = leadMinutes > 0 && timeDiff < leadMinutes * 60 * 1000 ? 'upcoming' : 'due_now';
    return { due: true, type };
  }

  return null;
}
