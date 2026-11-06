import React from 'react';
import { ReminderNotificationItem } from '../types/task';
import { 
  X, 
  Bell, 
  Volume2, 
  CheckCheck, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Sparkles
} from 'lucide-react';
import { playReminderChime, playUrgentAlert } from '../utils/audio';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ReminderNotificationItem[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  permissionStatus: NotificationPermission;
  onRequestPermission: () => void;
  onTriggerTestNotification: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  permissionStatus,
  onRequestPermission,
  onTriggerTestNotification,
}) => {
  if (!isOpen) return null;

  const formatTriggerTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Trung tâm thông báo
            </h3>
            {notifications.length > 0 && (
              <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Permission Banner */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${permissionStatus === 'granted' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                Thông báo trình duyệt: {permissionStatus === 'granted' ? 'Đã bật' : permissionStatus === 'denied' ? 'Bị chặn' : 'Chưa cấp quyền'}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {permissionStatus === 'granted'
                  ? 'Trình duyệt sẽ hiển thị thông báo popup khi đến giờ công việc.'
                  : 'Cấp quyền để nhận thông báo nhắc nhở ngay cả khi chuyển tab.'}
              </p>
            </div>

            {permissionStatus !== 'granted' && (
              <button
                type="button"
                onClick={onRequestPermission}
                className="px-2.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shrink-0 transition-colors"
              >
                Bật thông báo
              </button>
            )}
          </div>

          {/* Quick test buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={onTriggerTestNotification}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Thử thông báo mẫu</span>
            </button>
            <button
              type="button"
              onClick={() => playReminderChime()}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-md transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Thử chuông</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Clock className="w-10 h-10 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Chưa có thông báo nào</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Khi công việc đến hạn hoặc được nhắc nhở, lịch sử thông báo sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border transition-colors ${
                  n.read
                    ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    : 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-900/60 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${n.read ? 'bg-slate-300 dark:bg-slate-600' : 'bg-indigo-600'}`} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {n.type === 'due_now' ? 'Đến giờ' : n.type === 'upcoming' ? 'Sắp đến' : n.type === 'snoozed' ? 'Báo lại' : 'Quá hạn'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {formatTriggerTime(n.triggeredAt)}
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {n.taskTitle}
                </p>

                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 font-mono">
                  {n.dueTime && <span>Giờ hẹn: {n.dueTime}</span>}
                  <span>·</span>
                  <span>Ngày: {n.dueDate}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-800/30">
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Đánh dấu đã đọc</span>
            </button>
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa tất cả</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
