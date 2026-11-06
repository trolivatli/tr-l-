import React, { useState } from 'react';
import { Task, TaskCategory, PriorityLevel } from '../types/task';
import { TaskItem } from './TaskItem';
import { TaskFilterBar, StatusFilter } from './TaskFilterBar';
import { getTodayDateString, formatVietnameseDate } from '../utils/storage';
import { Plus, CheckCircle2, Calendar, Sparkles } from 'lucide-react';

interface TodayViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onStartPomodoro: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onToggleReminder: (taskId: string) => void;
  onQuickAddTask: (title: string) => void;
  onOpenNewTaskModal: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onStartPomodoro,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onToggleReminder,
  onQuickAddTask,
  onOpenNewTaskModal,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'all'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'title'>('time');

  const todayStr = getTodayDateString();

  // Filter tasks for today (or overdue tasks from previous days that are still incomplete)
  const todayTasks = tasks.filter((t) => {
    return t.dueDate === todayStr || (!t.completed && t.dueDate < todayStr);
  });

  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalCount = todayTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Apply search & filters
  const filteredTasks = todayTasks.filter((task) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // Status
    if (statusFilter === 'pending' && task.completed) return false;
    if (statusFilter === 'completed' && !task.completed) return false;
    if (statusFilter === 'reminder' && !task.reminder?.enabled) return false;

    // Category
    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;

    // Priority
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;

    return true;
  });

  // Sort
  filteredTasks.sort((a, b) => {
    if (sortBy === 'time') {
      const timeA = a.dueTime || '99:99';
      const timeB = b.dueTime || '99:99';
      return timeA.localeCompare(timeB);
    }
    if (sortBy === 'priority') {
      const weights = { high: 3, medium: 2, low: 1 };
      return weights[b.priority] - weights[a.priority];
    }
    return a.title.localeCompare(b.title);
  });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickAddTask(quickTitle.trim());
    setQuickTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Daily Progress Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatVietnameseDate(todayStr)}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Công việc hôm nay
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Tập trung hoàn thành các mục tiêu quan trọng và theo dõi tiến độ thời gian thực.
            </p>
          </div>

          {/* Progress metric */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 min-w-56 shrink-0">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Tiến độ ngày</span>
              <span className="font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400">
                {completedCount}/{totalCount} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {progressPercent === 100 && totalCount > 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Tuyệt vời! Bạn đã hoàn thành tất cả việc hôm nay!</span>
              </p>
            )}
          </div>
        </div>

        {/* Quick Add Bar */}
        <form onSubmit={handleQuickAdd} className="mt-5 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Thêm nhanh việc cần làm hôm nay... (Ví dụ: Đọc tài liệu, Gọi khách hàng)"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!quickTitle.trim()}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all whitespace-nowrap active:scale-95"
          >
            Thêm
          </button>
        </form>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <TaskFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      </div>

      {/* Task list container */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 stroke-1 mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {todayTasks.length === 0 ? 'Chưa có công việc nào hôm nay' : 'Không tìm thấy công việc phù hợp'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {todayTasks.length === 0
                ? 'Hãy thêm công việc đầu tiên để bắt đầu ngày làm việc năng suất và có thông báo nhắc nhở.'
                : 'Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh các bộ lọc phía trên.'}
            </p>
            {todayTasks.length === 0 && (
              <button
                type="button"
                onClick={onOpenNewTaskModal}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm công việc mới</span>
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
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
          ))
        )}
      </div>
    </div>
  );
};
