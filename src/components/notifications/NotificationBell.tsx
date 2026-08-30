import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Check,
  Trash2,
  Settings,
  Sparkles,
  Shield,
  Calendar,
  AlertTriangle,
  FileCode2,
  RefreshCw,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { NotificationItem, NotificationType } from '../../types';

interface NotificationBellProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectSkillById?: (skillId: string) => void;
  onOpenPreferences: () => void;
  onSimulateEvent: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectSkillById,
  onOpenPreferences,
  onSimulateEvent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | NotificationType>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    return n.type === activeFilter;
  });

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'endorsement':
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'certification':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
      case 'rbac':
        return <Shield className="w-3.5 h-3.5 text-indigo-500" />;
      case 'test':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'system':
        return <RefreshCw className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300';
      case 'high':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300';
      case 'medium':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        title="Real-time Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Tray */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onMarkAllAsRead}
                disabled={unreadCount === 0}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  unreadCount === 0
                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Mark all as read"
              >
                <Check className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Mark all</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenPreferences();
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notification Preferences"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                activeFilter === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('endorsement')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                activeFilter === 'endorsement'
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Endorsements
            </button>
            <button
              onClick={() => setActiveFilter('certification')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                activeFilter === 'certification'
                  ? 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Certifications
            </button>
            <button
              onClick={() => setActiveFilter('rbac')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                activeFilter === 'rbac'
                  ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              RBAC
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[380px]">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 text-center px-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No notifications in this category.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => onMarkAsRead(notif.id)}
                  className={`p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                    notif.read
                      ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-75'
                      : 'bg-indigo-50/40 dark:bg-indigo-950/30 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/50'
                  }`}
                >
                  <div className="mt-0.5 w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700">
                    {getTypeIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {notif.title}
                        </span>
                        {notif.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${getPriorityBadge(
                              notif.priority
                            )}`}
                          >
                            {notif.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                      {notif.message}
                    </p>

                    {notif.linkSkillId && onSelectSkillById && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSkillById(notif.linkSkillId!);
                          setIsOpen(false);
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>Inspect in Registry</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer with Simulate Event Trigger */}
          <div className="p-2.5 px-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
            <button
              onClick={onSimulateEvent}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulate Live Event</span>
            </button>

            <button
              onClick={onClearAll}
              disabled={notifications.length === 0}
              className="text-[11px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
