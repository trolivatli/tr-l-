import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { TaskCategory, PriorityLevel } from '../types/task';

export type StatusFilter = 'all' | 'pending' | 'completed' | 'reminder';

interface TaskFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  selectedCategory: TaskCategory | 'all';
  onCategoryChange: (category: TaskCategory | 'all') => void;
  selectedPriority: PriorityLevel | 'all';
  onPriorityChange: (priority: PriorityLevel | 'all') => void;
  sortBy: 'time' | 'priority' | 'title';
  onSortByChange: (sort: 'time' | 'priority' | 'title') => void;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  sortBy,
  onSortByChange,
}) => {
  const statusOptions: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chưa xong' },
    { id: 'completed', label: 'Đã xong' },
    { id: 'reminder', label: 'Có hẹn giờ' },
  ];

  const categories: { id: TaskCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Tất cả danh mục' },
    { id: 'work', label: 'Công việc' },
    { id: 'personal', label: 'Cá nhân' },
    { id: 'study', label: 'Học tập' },
    { id: 'health', label: 'Sức khỏe' },
    { id: 'finance', label: 'Tài chính' },
    { id: 'other', label: 'Khác' },
  ];

  return (
    <div className="space-y-3">
      {/* Top row: Search input & Interactive Segmented Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm công việc theo tiêu đề hoặc nội dung..."
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Segmented Status Tabs (Allowed interactive filter controls per design constitution) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg shrink-0 overflow-x-auto">
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onStatusFilterChange(opt.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === opt.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Second row: Dropdowns for Category, Priority, and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value as TaskCategory | 'all')}
              className="py-1 px-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500 text-xs font-medium cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="font-medium">Mức độ:</span>
            <select
              value={selectedPriority}
              onChange={(e) => onPriorityChange(e.target.value as PriorityLevel | 'all')}
              className="py-1 px-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500 text-xs font-medium cursor-pointer"
            >
              <option value="all">Tất cả mức độ</option>
              <option value="high">Ưu tiên cao</option>
              <option value="medium">Ưu tiên vừa</option>
              <option value="low">Ưu tiên thấp</option>
            </select>
          </div>
        </div>

        {/* Sort by */}
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 ml-auto">
          <span>Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as 'time' | 'priority' | 'title')}
            className="py-1 px-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500 text-xs font-medium cursor-pointer"
          >
            <option value="time">Thời gian đến hạn</option>
            <option value="priority">Mức ưu tiên</option>
            <option value="title">Tên việc (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
