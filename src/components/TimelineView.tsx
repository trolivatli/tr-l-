import React from 'react';
import { Task } from '../types/task';
import { getTodayDateString } from '../utils/storage';
import { Clock, Plus, Bell, CheckCircle2 } from 'lucide-react';

interface TimelineViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onNewTaskAtTime: (timeString: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  onToggleComplete,
  onEdit,
  onNewTaskAtTime,
}) => {
  const todayStr = getTodayDateString();
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);

  const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00 to 22:00
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  // Tasks with specific times vs anytime
  const timedTasks = todayTasks.filter((t) => !!t.dueTime);
  const untimedTasks = todayTasks.filter((t) => !t.dueTime);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Thời gian biểu hôm nay</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Lịch trình theo giờ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Xem phân bổ thời gian trong ngày và thêm công việc vào khung giờ mong muốn.
          </p>
        </div>

        <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-100 dark:border-slate-700/60 self-start sm:self-auto">
          Hiện tại: <span className="font-bold text-slate-900 dark:text-white">{String(currentHour).padStart(2, '0')}:{String(currentMinutes).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Untimed tasks section if any */}
      {untimedTasks.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Công việc linh hoạt (Chưa đặt giờ cụ thể)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {untimedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onEdit(task)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  task.completed
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70 line-through'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white truncate">
                    {task.title}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete(task.id);
                    }}
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      task.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Hour Strip */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
        {hours.map((hour) => {
          const hourStr = String(hour).padStart(2, '0');
          const isCurrentHour = currentHour === hour;

          // Find tasks in this hour window (e.g. 09:00 to 09:59)
          const hourTasks = timedTasks.filter((t) => {
            if (!t.dueTime) return false;
            const [h] = t.dueTime.split(':').map(Number);
            return h === hour;
          });

          return (
            <div key={hour} className="relative flex items-start gap-4 group">
              {/* Hour Label */}
              <div className="w-14 sm:w-16 shrink-0 pt-1 text-right">
                <span className={`text-xs font-mono tabular-nums font-semibold ${
                  isCurrentHour ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {hourStr}:00
                </span>
              </div>

              {/* Timeline Line & Node */}
              <div className="relative flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 ${
                  isCurrentHour
                    ? 'bg-indigo-600 border-white dark:border-slate-900 ring-2 ring-indigo-500'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                }`} />
                <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 absolute top-3 bottom-0 -z-0" />
              </div>

              {/* Tasks or Empty Slot */}
              <div className="flex-1 min-w-0 pb-4">
                {hourTasks.length > 0 ? (
                  <div className="space-y-2">
                    {hourTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`p-3 rounded-xl border transition-all ${
                          t.completed
                            ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                            : 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                {t.dueTime}
                              </span>
                              {t.reminder?.enabled && (
                                <Bell className="w-3 h-3 text-slate-400" />
                              )}
                            </div>
                            <h4
                              onClick={() => onEdit(t)}
                              className={`text-sm font-semibold cursor-pointer truncate mt-0.5 ${
                                t.completed
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-white hover:text-indigo-600'
                              }`}
                            >
                              {t.title}
                            </h4>
                          </div>

                          <button
                            type="button"
                            onClick={() => onToggleComplete(t.id)}
                            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                              t.completed
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {t.completed ? 'Đã xong' : 'Hoàn thành'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-1 px-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800/80 text-xs text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                    <span>Trống</span>
                    <button
                      type="button"
                      onClick={() => onNewTaskAtTime(`${hourStr}:00`)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm việc lúc {hourStr}:00</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
