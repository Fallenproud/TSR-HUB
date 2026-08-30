import React, { useState } from 'react';
import {
  X,
  Bell,
  Mail,
  Shield,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Save,
  Check,
} from 'lucide-react';
import { NotificationPreferences } from '../../types';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: NotificationPreferences;
  onSavePreferences: (prefs: NotificationPreferences) => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}) => {
  const [form, setForm] = useState<NotificationPreferences>(preferences);
  const [savedMessage, setSavedMessage] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences(form);
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Notification Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure real-time event delivery channels and alert thresholds.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Section: Delivery Channels Grid Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Event Category</span>
            <div className="flex items-center gap-6 pr-2">
              <span className="flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" /> In-App
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Email
              </span>
            </div>
          </div>

          {/* Item 1: Skill Endorsements */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Skill Endorsements
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  When team leads or architects endorse capability specs.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8 pr-4">
              <input
                type="checkbox"
                checked={form.endorsementsInApp}
                onChange={(e) => setForm({ ...form, endorsementsInApp: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700"
              />
              <input
                type="checkbox"
                checked={form.endorsementsEmail}
                onChange={(e) => setForm({ ...form, endorsementsEmail: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Item 2: Expiring Certifications & Compliance */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Expiring Certifications & Compliance
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  SOC2, ISO 27001, and PCI-DSS certification renewal windows.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8 pr-4">
              <input
                type="checkbox"
                checked={form.certificationsInApp}
                onChange={(e) => setForm({ ...form, certificationsInApp: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700"
              />
              <input
                type="checkbox"
                checked={form.certificationsEmail}
                onChange={(e) => setForm({ ...form, certificationsEmail: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Item 3: Role-Based Access Control (RBAC) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                  RBAC & Access Control Changes
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Role elevations, permission updates, and policy revisions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8 pr-4">
              <input
                type="checkbox"
                checked={form.rbacInApp}
                onChange={(e) => setForm({ ...form, rbacInApp: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700"
              />
              <input
                type="checkbox"
                checked={form.rbacEmail}
                onChange={(e) => setForm({ ...form, rbacEmail: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Item 4: Test Suite & Build Verification */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Automated Test Suites & Telemetry
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Test suite execution results and regression warnings.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8 pr-4">
              <input
                type="checkbox"
                checked={form.testsInApp}
                onChange={(e) => setForm({ ...form, testsInApp: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700"
              />
              <input
                type="checkbox"
                checked={form.testsEmail}
                onChange={(e) => setForm({ ...form, testsEmail: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Thresholds and Frequency Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Certification Warning Window
              </label>
              <select
                value={form.alertDaysBeforeExpiry}
                onChange={(e) =>
                  setForm({ ...form, alertDaysBeforeExpiry: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
              >
                <option value={7}>7 Days Prior</option>
                <option value={14}>14 Days Prior (Recommended)</option>
                <option value={30}>30 Days Prior</option>
                <option value={60}>60 Days Prior</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Digest Frequency
              </label>
              <select
                value={form.frequency}
                onChange={(e) =>
                  setForm({ ...form, frequency: e.target.value as any })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="instant">Real-Time Instant Dispatch</option>
                <option value="daily_digest">Daily Summary Digest</option>
                <option value="weekly_summary">Weekly Executive Rollup</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-between">
            {savedMessage ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                <Check className="w-4 h-4" /> Preferences saved!
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">Settings auto-sync to local session</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
