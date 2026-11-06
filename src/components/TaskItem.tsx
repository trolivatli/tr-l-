import React, { useState } from 'react';
import { Task, Subtask } from '../types/task';
import { 
  Check, 
  Clock, 
  Bell, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Play, 
  Repeat, 
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessChime } from '../utils/audio';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onStartPomodoro?: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onToggleReminder: (taskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  onStartPomodoro,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onToggleReminder,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const categoryLabels: Record<string, string> = {
    work: 'Công việc',
    personal: 'Cá nhân',
    study: 'Học tập',
    health: 'Sức khỏe',
    finance: 'Tài chính',
    other: 'Khác',
  };

  const priorityMeta = {
    high: { label: 'Ưu tiên cao', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60' },
    medium: { label: 'Ưu tiên vừa', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60' },
    low: { label: 'Ưu tiên thấp', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60' },
  }[task.priority];

  const handleCheckboxClick = () => {
    if (!task.completed) {
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'],
        });
      } catch (e) {
        console.warn(e);
      }
      playSuccessChime();
    }
    onToggleComplete(task.id);
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  // Check if overdue
  const isOverdue = (() => {
    if (task.completed) return false;
    const today = new Date().toISOString().split('T')[0];
    if (task.dueDate < today) return true;
    if (task.dueDate === today && task.dueTime) {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const [dueH, dueM] = task.dueTime.split(':').map(Number);
      if (currentH > dueH || (currentH === dueH && currentM > dueM)) {
        return true;
      }
    }
    return false;
  })();

  return (
    <div
      className={`group relative bg-white dark:bg-slate-900 rounded-xl border transition-all ${
        task.completed
          ? 'border-slate-200/70 dark:border-slate-800/60 opacity-75'
          : isOverdue
          ? 'border-rose-300 dark:border-rose-900/70 shadow-xs'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
      }`}
    >
      <div className="p-4 sm:p-4.5 flex items-start gap-3.5">
        {/* Checkbox */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          aria-label={task.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
            task.completed
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800'
          }`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3
              onClick={() => onEdit(task)}
              className={`text-sm sm:text-base font-semibold cursor-pointer truncate transition-colors ${
                task.completed
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              {task.title}
            </h3>

            {/* Quick Actions (Always accessible, highlighted on hover) */}
            <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              {onStartPomodoro && !task.completed && (
                <button
                  type="button"
                  onClick={() => onStartPomodoro(task)}
                  title="Bắt đầu tập trung (Pomodoro)"
                  className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onEdit(task)}
                title="Chỉnh sửa công việc"
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                title="Xóa công việc"
                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Description if present */}
          {task.description && (
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Unboxed Zero-Pill Metadata Bar */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {/* Category */}
            <span className="font-sans font-medium text-slate-700 dark:text-slate-300">
              {categoryLabels[task.category] || task.category}
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>

            {/* Time / Due Date */}
            <span className={`inline-flex items-center gap-1 font-sans ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-medium' : ''}`}>
              <Clock className="w-3 h-3 text-slate-400 inline" />
              {task.dueTime ? `${task.dueTime} - ` : ''}{task.dueDate}
              {isOverdue && ' (Quá hạn)'}
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>

            {/* Priority */}
            <span className={`font-sans font-medium ${
              task.priority === 'high' ? 'text-rose-600 dark:text-rose-400' :
              task.priority === 'medium' ? 'text-amber-600 dark:text-amber-400' :
              'text-emerald-600 dark:text-emerald-400'
            }`}>
              {priorityMeta.label}
            </span>

            {/* Reminder status */}
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <button
              type="button"
              onClick={() => onToggleReminder(task.id)}
              className={`inline-flex items-center gap-1 font-sans hover:underline ${
                task.reminder?.enabled ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
              }`}
              title={task.reminder?.enabled ? 'Nhấp để tắt nhắc nhở' : 'Nhấp để bật nhắc nhở'}
            >
              <Bell className="w-3 h-3" />
              {task.reminder?.enabled
                ? task.reminder.leadMinutes === 0
                  ? 'Đúng giờ'
                  : `Trước ${task.reminder.leadMinutes}p`
                : 'Tắt chuông'}
            </button>

            {/* Recurrence if any */}
            {task.recurrence && task.recurrence !== 'none' && (
              <>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="inline-flex items-center gap-1 font-sans text-slate-500">
                  <Repeat className="w-3 h-3 text-slate-400" />
                  {task.recurrence === 'daily' && 'Hàng ngày'}
                  {task.recurrence === 'weekdays' && 'T2-T6'}
                  {task.recurrence === 'weekly' && 'Hàng tuần'}
                  {task.recurrence === 'monthly' && 'Hàng tháng'}
                </span>
              </>
            )}

            {/* Subtask progress count if subtasks exist */}
            {totalSubtasks > 0 && (
              <>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="font-sans text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium inline-flex items-center gap-1"
                >
                  <span>{completedSubtasksCount}/{totalSubtasks} mục con</span>
                  {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </>
            )}
          </div>

          {/* Subtask Section */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <div className="space-y-1.5">
                {task.subtasks.map((sub: Subtask) => (
                  <div key={sub.id} className="flex items-center justify-between group/sub py-0.5">
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={() => onToggleSubtask(task.id, sub.id)}
                        className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-0 cursor-pointer border-slate-300 dark:border-slate-600"
                      />
                      <span className={`text-xs ${sub.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                        {sub.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => onDeleteSubtask(task.id, sub.id)}
                      className="opacity-0 group-hover/sub:opacity-100 text-slate-400 hover:text-rose-500 p-0.5"
                      title="Xóa mục con"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add subtask input */}
              {isAddingSubtask ? (
                <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Tên mục con..."
                    autoFocus
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingSubtask(false);
                      setNewSubtaskTitle('');
                    }}
                    className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Hủy
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingSubtask(true)}
                  className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm mục con</span>
                </button>
              )}
            </div>
          )}

          {/* If there are no subtasks, provide button to add one */}
          {!expanded && totalSubtasks === 0 && (
            <button
              type="button"
              onClick={() => {
                setExpanded(true);
                setIsAddingSubtask(true);
              }}
              className="mt-2 text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Thêm checklist con</span>
            </button>
          )}

        </div>
      </div>
    </div>
  );
};
