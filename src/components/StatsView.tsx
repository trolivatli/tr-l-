import React, { useRef } from 'react';
import { Task } from '../types/task';
import { getTodayDateString } from '../utils/storage';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Download, 
  Upload, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface StatsViewProps {
  tasks: Task[];
  onImportTasks: (tasks: Task[]) => void;
  onResetSampleData: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  tasks,
  onImportTasks,
  onResetSampleData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const todayStr = getTodayDateString();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todayCompleted = tasks.filter((t) => t.completed && t.dueDate === todayStr).length;

  // Category counts
  const categories: Record<string, number> = {
    work: 0,
    personal: 0,
    study: 0,
    health: 0,
    finance: 0,
    other: 0,
  };

  tasks.forEach((t) => {
    if (categories[t.category] !== undefined) {
      categories[t.category]++;
    } else {
      categories.other++;
    }
  });

  const categoryNames: Record<string, string> = {
    work: 'Công việc',
    personal: 'Cá nhân',
    study: 'Học tập',
    health: 'Sức khỏe',
    finance: 'Tài chính',
    other: 'Khác',
  };

  // Export JSON
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `daypulse-backup-${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onImportTasks(imported);
        }
      } catch (err) {
        alert('File không hợp lệ');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Báo cáo hiệu suất</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
          Thống kê công việc
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Tổng quan năng suất, tỷ lệ hoàn thành và sao lưu dữ liệu cá nhân.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng công việc</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono tabular-nums text-3xl font-bold text-slate-900 dark:text-white">
            {totalTasks}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {pendingTasks} việc đang chờ hoàn thành
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đã hoàn thành</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono tabular-nums text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {completedTasks}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Đạt tỉ lệ {completionRate}%
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hôm nay hoàn thành</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono tabular-nums text-3xl font-bold text-amber-600 dark:text-amber-400">
            {todayCompleted}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Đã chốt trong ngày hôm nay
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hiệu suất chung</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono tabular-nums text-3xl font-bold text-purple-600 dark:text-purple-400">
            {completionRate}%
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Phân bổ theo danh mục
        </h3>

        <div className="space-y-3">
          {Object.entries(categories).map(([key, count]) => {
            const percent = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {categoryNames[key] || key}
                  </span>
                  <span className="font-mono tabular-nums text-slate-500">
                    {count} việc ({percent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management & Backup */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Quản lý & Sao lưu dữ liệu
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Dữ liệu của bạn được lưu an toàn trên trình duyệt này. Bạn có thể xuất file JSON để lưu trữ hoặc nhập sang máy khác.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất dữ liệu (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập dữ liệu từ file</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={onResetSampleData}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục dữ liệu mẫu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
