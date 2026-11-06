import React from 'react';
import { Task } from '../types/task';
import { TaskItem } from './TaskItem';
import { getTodayDateString, getTomorrowDateString, formatVietnameseDate } from '../utils/storage';
import { CalendarDays, Plus } from 'lucide-react';

interface UpcomingViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onStartPomodoro: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onToggleReminder: (taskId: string) => void;
  onOpenNewTaskModalWithDate: (date: string) => void;
}

export const UpcomingView: React.FC<UpcomingViewProps> = ({
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onStartPomodoro,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onToggleReminder,
  onOpenNewTaskModalWithDate,
}) => {
  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();

  // Tasks in future (after today)
  const futureTasks = tasks.filter((t) => t.dueDate > todayStr);

  // Group by date
  const groupedByDate: Record<string, Task[]> = {};
  futureTasks.forEach((t) => {
    if (!groupedByDate[t.dueDate]) {
      groupedByDate[t.dueDate] = [];
    }
    groupedByDate[t.dueDate].push(t);
  });

  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Kế hoạch tương lai</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Công việc sắp tới
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Xem trước các việc cần làm ngày mai và các ngày tiếp theo.
          </p>
        </div>

        <button
          onClick={() => onOpenNewTaskModalWithDate(tomorrowStr)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm việc ngày mai</span>
        </button>
      </div>

      {sortedDates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <CalendarDays className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 stroke-1 mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Chưa có công việc nào sắp tới
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Bạn có thể lên lịch trước cho ngày mai hoặc các tuần tới để sắp xếp thời gian chủ động hơn.
          </p>
          <button
            onClick={() => onOpenNewTaskModalWithDate(tomorrowStr)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Lên kế hoạch ngày mai</span>
          </button>
        </div>
      ) : (
        sortedDates.map((dateStr) => {
          const dateTasks = groupedByDate[dateStr];
          return (
            <div key={dateStr} className="space-y-3">
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatVietnameseDate(dateStr)}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    ({dateTasks.length} việc)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenNewTaskModalWithDate(dateStr)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm việc</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {dateTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onStartPomodoro={onStartPomodoro}
                    onToggleSubtask={onToggleSubtask}
                    onAddSubtask={onAddSubtask}
                    onDeleteSubtask={onDeleteSubtask}
                    onToggleReminder={onToggleReminder}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
