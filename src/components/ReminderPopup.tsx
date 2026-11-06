import React from 'react';
import { ReminderNotificationItem } from '../types/task';
import { Bell, CheckCircle2, Clock, X, AlertTriangle } from 'lucide-react';

interface ReminderPopupProps {
  activeNotification: ReminderNotificationItem | null;
  onDismiss: () => void;
  onCompleteTask: (taskId: string) => void;
  onSnoozeTask: (taskId: string, minutes: number) => void;
}

export const ReminderPopup: React.FC<ReminderPopupProps> = ({
  activeNotification,
  onDismiss,
  onCompleteTask,
  onSnoozeTask,
}) => {
  if (!activeNotification) return null;

  const isUrgent = activeNotification.priority === 'high' || activeNotification.type === 'overdue';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-5 duration-200">
      <div className={`p-4 rounded-xl shadow-xl border bg-white dark:bg-slate-900 ${
        isUrgent
          ? 'border-rose-400 dark:border-rose-800 ring-2 ring-rose-500/20'
          : 'border-indigo-400 dark:border-indigo-800 ring-2 ring-indigo-500/20'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${
              isUrgent
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
            }`}>
              {isUrgent ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5 animate-bounce" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span>
                  {activeNotification.type === 'overdue'
                    ? 'Công việc quá hạn'
                    : activeNotification.type === 'snoozed'
                    ? 'Nhắc lại'
                    : 'Đến giờ thực hiện'}
                </span>
                {activeNotification.dueTime && (
                  <>
                    <span>·</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{activeNotification.dueTime}</span>
                  </>
                )}
              </div>

              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5 break-words">
                {activeNotification.taskTitle}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {activeNotification.type === 'overdue'
                  ? 'Đừng quên hoàn thành công việc quan trọng này nhé!'
                  : 'Thời điểm đã được hẹn trước để bạn tập trung hoàn thành.'}
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSnoozeTask(activeNotification.taskId, 5)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              <span>Báo lại 5p</span>
            </button>
            <button
              onClick={() => onSnoozeTask(activeNotification.taskId, 15)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              15p
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onCompleteTask(activeNotification.taskId)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs flex items-center gap-1 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Xong ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
