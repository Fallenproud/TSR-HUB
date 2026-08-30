import React, { useState } from 'react';
import {
  Shield,
  Cloud,
  Lock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  History,
  Key,
  Globe,
  Sliders,
  Sparkles,
  Bell,
  Compass,
} from 'lucide-react';
import { UserRole, SyncState, AuditLogEntry, NotificationPreferences } from '../../types';

interface SettingsViewProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  syncState: SyncState;
  onTriggerSync: () => void;
  notificationPreferences?: NotificationPreferences;
  onUpdateNotificationPreferences?: (prefs: NotificationPreferences) => void;
  onOpenNotificationPreferences?: () => void;
  onOpenOnboarding?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentRole,
  onChangeRole,
  syncState,
  onTriggerSync,
  notificationPreferences,
  onUpdateNotificationPreferences,
  onOpenNotificationPreferences,
  onOpenOnboarding,
}) => {
  const [activeTab, setActiveTab] = useState<'rbac' | 'cloud' | 'notifications' | 'audit'>('rbac');

  const [auditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-1',
      timestamp: '2026-08-28 08:00:12 UTC',
      actor: 'kiran.patel@enterprise.com',
      role: 'SECURITY_LEAD',
      action: 'Security Audit Sign-off',
      targetSkill: '24 Security Engineering',
      details: 'Approved canonical schemas and enforced zero-trust mTLS verification.',
    },
    {
      id: 'log-2',
      timestamp: '2026-08-28 07:45:00 UTC',
      actor: 'marcus.vance@enterprise.com',
      role: 'ARCHITECT',
      action: 'Schema Migration (Draft 2020-12)',
      targetSkill: '08 Data / AI',
      details: 'Upgraded RAG vector pipeline schemas and test assertions.',
    },
    {
      id: 'log-3',
      timestamp: '2026-08-28 06:30:19 UTC',
      actor: 'elena.rostova@enterprise.com',
      role: 'ADMIN',
      action: 'Role Policy Update',
      targetSkill: 'Global Registry',
      details: 'Enforced mandatory SOC2 compliance checks on automated PR merges.',
    },
  ]);

  const permissionMatrix: { permission: string; desc: string; admin: boolean; architect: boolean; security: boolean; viewer: boolean }[] = [
    { permission: 'Browse Registry Catalog', desc: 'Inspect skill definitions and artifacts', admin: true, architect: true, security: true, viewer: true },
    { permission: 'Export Reports (CSV/JSON/PDF)', desc: 'Download compliance datasets and summaries', admin: true, architect: true, security: true, viewer: true },
    { permission: 'Execute Test Suites', desc: 'Run automated verification rigs in sandbox', admin: true, architect: true, security: true, viewer: false },
    { permission: 'Author / Edit Schemas & Prompts', desc: 'Modify JSON schemas and system prompt specs', admin: true, architect: true, security: false, viewer: false },
    { permission: 'Security Sign-off & Audit', desc: 'Approve threat models and cryptographic rules', admin: true, architect: false, security: true, viewer: false },
    { permission: 'Register / Delete Skill Packages', desc: 'Create or deprecate canonical packages', admin: true, architect: false, security: false, viewer: false },
    { permission: 'Configure Cloud Sync & RBAC', desc: 'Manage enterprise cluster sync & user roles', admin: true, architect: false, security: false, viewer: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Enterprise Settings & Governance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage Role-Based Access Control (RBAC), multi-platform Cloud Sync, and audit trails.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('rbac')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'rbac'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Role-Based Access Control (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveTab('cloud')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'cloud'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Cloud Sync & Remote Access</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'notifications'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notification Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Log</span>
        </button>
      </div>

      {/* RBAC Matrix Tab */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          {/* Active Role Selector */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Simulation Role
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Current Role: <span className="text-indigo-600 dark:text-indigo-400">{currentRole}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Switch role dynamically to simulate permission gating across all dashboard controls.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['ADMIN', 'ARCHITECT', 'SECURITY_LEAD', 'VIEWER'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onChangeRole(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    currentRole === r
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Matrix Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
              Enterprise Role Permissions Matrix
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="py-3 px-4">Permission Capability</th>
                  <th className="py-3 px-4 text-center">Admin</th>
                  <th className="py-3 px-4 text-center">Skill Architect</th>
                  <th className="py-3 px-4 text-center">Security Lead</th>
                  <th className="py-3 px-4 text-center">Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {permissionMatrix.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {p.permission}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{p.desc}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.admin ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.architect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.security ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.viewer ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cloud Sync Tab */}
      {activeTab === 'cloud' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Multi-Platform Cloud Synchronization
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Real-time replication enables teams to access and manage skills workflows from any browser, CLI, or remote agent runtime.
              </p>
            </div>
            <button
              onClick={onTriggerSync}
              disabled={syncState.isSyncing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
              <span>{syncState.isSyncing ? 'Syncing...' : 'Force Cloud Sync'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs text-slate-400">Target Cloud Region</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {syncState.cloudRegion} (Primary)
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs text-slate-400">Replication Latency</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {syncState.latencyMs} ms (Sub-50ms SLA)
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs text-slate-400">Connection Protocol</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono">
                WSS / TLS 1.3
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Preferences Tab */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Real-Time Notification & Subscription Engine
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure real-time event streaming for skill endorsements, expiring certifications, role revisions, and test failures.
              </p>
            </div>
            {onOpenNotificationPreferences && (
              <button
                onClick={onOpenNotificationPreferences}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                Open Config Modal
              </button>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Skill Endorsements & Peer Reviews
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Receive instant alerts when team members endorse competencies or approve pull requests.
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ACTIVE
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Certification Expiration Warnings
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Automated 30-day compliance notices prior to security benchmark and artifact expiration.
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ACTIVE
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Role & Governance Policy Changes
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Audit alerts whenever user access privileges, scopes, or security sign-offs change.
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Onboarding tour replay */}
          {onOpenOnboarding && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Product Onboarding Walkthrough
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Revisit the guided interactive tour of key registry features, RBAC, analytics, and tagging.
                </div>
              </div>
              <button
                onClick={onOpenOnboarding}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-semibold"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                <span>Launch Walkthrough</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
            Immutable Audit Trail & Activity Feed
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {log.action} • <span className="text-indigo-600 dark:text-indigo-400">{log.targetSkill}</span>
                  </div>
                  <div className="font-mono text-slate-400 text-[11px]">{log.timestamp}</div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{log.details}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>Actor: {log.actor}</span>
                  <span>•</span>
                  <span>Role: {log.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
