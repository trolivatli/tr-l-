import React, { useState, useEffect, useRef } from 'react';
import { 
  Task, 
  ViewTab, 
  ReminderNotificationItem 
} from './types/task';
import { 
  loadTasksFromStorage, 
  saveTasksToStorage, 
  loadNotificationsFromStorage, 
  saveNotificationsToStorage, 
  loadSettingsFromStorage, 
  saveSettingsToStorage, 
  getTodayDateString,
  getInitialTasks 
} from './utils/storage';
import { 
  requestBrowserNotificationPermission, 
  getBrowserNotificationPermission, 
  checkTaskReminderDue, 
  triggerTaskNotification 
} from './utils/notification';
import { Navbar } from './components/Navbar';
import { TodayView } from './components/TodayView';
import { UpcomingView } from './components/UpcomingView';
import { TimelineView } from './components/TimelineView';
import { PomodoroTimer } from './components/PomodoroTimer';
import { StatsView } from './components/StatsView';
import { TaskModal } from './components/TaskModal';
import { NotificationCenter } from './components/NotificationCenter';
import { ReminderPopup } from './components/ReminderPopup';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [notifications, setNotifications] = useState<ReminderNotificationItem[]>(() => loadNotificationsFromStorage());
  const [currentTab, setCurrentTab] = useState<ViewTab>('today');
  
  // Settings
  const [settings, setSettings] = useState(() => loadSettingsFromStorage());
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('daypulse_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(() => 
    getBrowserNotificationPermission()
  );

  // Modals & Panels
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string>(getTodayDateString());
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  
  // Active reminder popup modal
  const [activePopup, setActivePopup] = useState<ReminderNotificationItem | null>(null);

  // Active pomodoro task
  const [pomodoroTask, setPomodoroTask] = useState<Task | null>(null);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('daypulse_dark_mode', String(darkMode));
  }, [darkMode]);

  // Persist tasks
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Persist notifications
  useEffect(() => {
    saveNotificationsToStorage(notifications);
  }, [notifications]);

  // Persist settings
  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  // Keep browser notification permission up to date
  useEffect(() => {
    setPermissionStatus(getBrowserNotificationPermission());
  }, []);

  // Background reminder checker loop (Runs every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let hasUpdates = false;

      const updatedTasks = tasks.map((task) => {
        const checkResult = checkTaskReminderDue(task, now);
        if (checkResult && checkResult.due) {
          // Trigger alert
          const notif = triggerTaskNotification(task, checkResult.type, settings.soundEnabled);
          
          // Add to notifications log
          setNotifications((prev) => [notif, ...prev]);

          // Show floating popup
          setActivePopup(notif);

          hasUpdates = true;

          return {
            ...task,
            reminder: {
              ...task.reminder,
              notified: true,
              snoozedUntil: undefined,
              lastNotifiedTime: now.toISOString(),
            },
            updatedAt: now.toISOString(),
          };
        }
        return task;
      });

      if (hasUpdates) {
        setTasks(updatedTasks);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [tasks, settings.soundEnabled]);

  // Handlers
  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (pomodoroTask?.id === taskId) {
      setPomodoroTask(null);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewTask = (defaultDate?: string) => {
    setEditingTask(null);
    setModalDefaultDate(defaultDate || getTodayDateString());
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    taskId?: string
  ) => {
    const now = new Date().toISOString();
    if (taskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, ...taskData, updatedAt: now }
            : t
        )
      );
    } else {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleQuickAddTask = (title: string) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      completed: false,
      dueDate: getTodayDateString(),
      priority: 'medium',
      category: 'work',
      subtasks: [],
      reminder: {
        enabled: true,
        leadMinutes: 10,
        notified: false,
      },
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          return {
            ...t,
            subtasks: updatedSubtasks,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const handleAddSubtask = (taskId: string, title: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: [
              ...t.subtasks,
              {
                id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                title,
                completed: false,
              },
            ],
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const handleToggleReminder = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            reminder: {
              ...t.reminder,
              enabled: !t.reminder?.enabled,
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const handleStartPomodoro = (task: Task) => {
    setPomodoroTask(task);
    setCurrentTab('pomodoro');
  };

  const handleSnoozeTask = (taskId: string, minutes: number) => {
    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              reminder: {
                ...t.reminder,
                snoozedUntil: snoozeUntil,
                notified: false,
              },
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    setActivePopup(null);
  };

  const handleCompletePopupTask = (taskId: string) => {
    handleToggleComplete(taskId);
    setActivePopup(null);
  };

  const handleRequestPermission = async () => {
    const perm = await requestBrowserNotificationPermission();
    setPermissionStatus(perm);
  };

  const handleTriggerTestNotification = () => {
    const dummyTask: Task = {
      id: 'test-notification',
      title: 'Kiểm tra thông báo nhắc nhở DayPulse',
      completed: false,
      dueDate: getTodayDateString(),
      dueTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      priority: 'high',
      category: 'work',
      subtasks: [],
      reminder: {
        enabled: true,
        leadMinutes: 0,
        notified: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const notif = triggerTaskNotification(dummyTask, 'due_now', settings.soundEnabled);
    setNotifications((prev) => [notif, ...prev]);
    setActivePopup(notif);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenNewTask={() => handleOpenNewTask()}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        unreadNotificationsCount={unreadCount}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() =>
          setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {currentTab === 'today' && (
          <TodayView
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
            onStartPomodoro={handleStartPomodoro}
            onToggleSubtask={handleToggleSubtask}
            onAddSubtask={handleAddSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onToggleReminder={handleToggleReminder}
            onQuickAddTask={handleQuickAddTask}
            onOpenNewTaskModal={() => handleOpenNewTask()}
          />
        )}

        {currentTab === 'upcoming' && (
          <UpcomingView
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
            onStartPomodoro={handleStartPomodoro}
            onToggleSubtask={handleToggleSubtask}
            onAddSubtask={handleAddSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onToggleReminder={handleToggleReminder}
            onOpenNewTaskModalWithDate={handleOpenNewTask}
          />
        )}

        {currentTab === 'timeline' && (
          <TimelineView
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTask}
            onNewTaskAtTime={(timeStr) => {
              setEditingTask(null);
              setModalDefaultDate(getTodayDateString());
              setIsTaskModalOpen(true);
            }}
          />
        )}

        {currentTab === 'pomodoro' && (
          <PomodoroTimer
            tasks={tasks}
            activeTask={pomodoroTask}
            onSelectTask={setPomodoroTask}
            onCompleteTask={handleToggleComplete}
          />
        )}

        {currentTab === 'stats' && (
          <StatsView
            tasks={tasks}
            onImportTasks={(imported) => setTasks(imported)}
            onResetSampleData={() => setTasks(getInitialTasks())}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DayPulse &middot; Quản lý công việc hàng ngày & Nhắc nhở thông minh</span>
          <span className="font-mono tabular-nums">
            {tasks.filter((t) => t.completed).length}/{tasks.length} đã hoàn thành
          </span>
        </div>
      </footer>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultDate={modalDefaultDate}
      />

      {/* Notification Center Drawer */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        onClearAll={() => setNotifications([])}
        permissionStatus={permissionStatus}
        onRequestPermission={handleRequestPermission}
        onTriggerTestNotification={handleTriggerTestNotification}
      />

      {/* Floating Active Reminder Popup Alert */}
      <ReminderPopup
        activeNotification={activePopup}
        onDismiss={() => setActivePopup(null)}
        onCompleteTask={handleCompletePopupTask}
        onSnoozeTask={handleSnoozeTask}
      />
    </div>
  );
}
