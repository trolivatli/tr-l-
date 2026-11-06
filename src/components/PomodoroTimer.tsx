import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types/task';
import { playTimerDone, playClick } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Play, Pause, RotateCcw, CheckCircle2, Flame, BellRing } from 'lucide-react';

interface PomodoroTimerProps {
  tasks: Task[];
  activeTask: Task | null;
  onSelectTask: (task: Task | null) => void;
  onCompleteTask: (taskId: string) => void;
}

type Mode = 'work' | 'short_break' | 'long_break';

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  tasks,
  activeTask,
  onSelectTask,
  onCompleteTask,
}) => {
  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const modeDurations: Record<Mode, number> = {
    work: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
  };

  const modeLabels: Record<Mode, string> = {
    work: 'Tập trung sâu (25 phút)',
    short_break: 'Nghỉ ngắn (5 phút)',
    long_break: 'Nghỉ dài (15 phút)',
  };

  const switchMode = (newMode: Mode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(modeDurations[newMode]);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playTimerDone();
            try {
              confetti({ particleCount: 50, spread: 70 });
            } catch {
              // ignore
            }
            if (mode === 'work') {
              setCompletedSessions((s) => s + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modeDurations[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = ((modeDurations[mode] - timeLeft) / modeDurations[mode]) * 100;

  const incompleteTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Timer Container Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs text-center flex flex-col items-center">
        
        {/* Mode Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8">
          {(['work', 'short_break', 'long_break'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mode === m
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>

        {/* Selected Task Target */}
        <div className="w-full max-w-md mb-6 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider block">
              Mục tiêu phiên tập trung:
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {activeTask ? activeTask.title : 'Chưa gắn công việc cụ thể'}
            </div>
          </div>

          {activeTask ? (
            <button
              onClick={() => {
                onCompleteTask(activeTask.id);
                onSelectTask(null);
              }}
              className="px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 rounded-md shrink-0 flex items-center gap-1 hover:bg-emerald-100"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Xong việc</span>
            </button>
          ) : (
            <select
              onChange={(e) => {
                const found = tasks.find((t) => t.id === e.target.value);
                onSelectTask(found || null);
              }}
              className="text-xs font-medium py-1 px-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              defaultValue=""
            >
              <option value="" disabled>Chọn việc cần làm...</option>
              {incompleteTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Big Circular Display with Countdown */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-4 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="5"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-indigo-600 dark:text-indigo-500 transition-all duration-500"
              strokeWidth="5"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="font-mono tabular-nums text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
              {timeFormatted}
            </span>
            <span className="text-xs uppercase tracking-wider text-slate-400 mt-2 font-medium">
              {isRunning ? 'Đang chạy' : timeLeft === 0 ? 'Hoàn thành!' : 'Đã tạm dừng'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            type="button"
            onClick={resetTimer}
            className="p-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Đặt lại đồng hồ"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Bắt đầu</span>
              </>
            )}
          </button>

          <div className="p-3 text-slate-400 flex items-center gap-1 font-mono text-xs" title="Số phiên hoàn thành hôm nay">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">{completedSessions}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
