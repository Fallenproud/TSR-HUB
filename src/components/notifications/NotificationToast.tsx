import React, { useEffect } from 'react';
import { Sparkles, AlertTriangle, Shield, CheckCircle2, RefreshCw, X, ArrowRight } from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationToastProps {
  notification: NotificationItem | null;
  onDismiss: () => void;
  onInspectSkill?: (skillId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onInspectSkill,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'endorsement':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'certification':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'rbac':
        return <Shield className="w-4 h-4 text-indigo-500" />;
      case 'test':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white dark:bg-slate-900 border-2 border-indigo-500/30 dark:border-indigo-500/40 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 mt-0.5">
          {getTypeIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Live Alert
            </span>
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
            {notification.title}
          </h4>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
            {notification.message}
          </p>

          {notification.linkSkillId && onInspectSkill && (
            <button
              onClick={() => {
                onInspectSkill(notification.linkSkillId!);
                onDismiss();
              }}
              className="mt-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Skill Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
