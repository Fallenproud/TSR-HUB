import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sun,
  Moon,
  Shield,
  Download,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  Lock,
  Layers,
  FileSpreadsheet,
  FileCode,
  FileText,
  Printer,
  Sparkles,
  Compass,
  FolderPlus,
} from 'lucide-react';
import { UserRole, SyncState, NotificationItem, SkillItem } from '../types';
import { exportSkillsToCSV, exportSkillsToJSON, exportSkillsToMarkdown, printExecutiveReport } from '../utils/exportUtils';
import { SKILLS_DATA } from '../data/skillsData';
import { NotificationBell } from './notifications/NotificationBell';

interface HeaderProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  syncState: SyncState;
  onTriggerSync: () => void;
  onOpenCommandPalette: () => void;
  onOpenNewSkillModal: () => void;
  onOpenNewCategoryModal?: () => void;
  onOpenOnboarding?: () => void;
  activeView: string;
  onSelectView: (view: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onClearAllNotifications: () => void;
  onSelectSkillById?: (skillId: string) => void;
  onOpenNotificationPreferences: () => void;
  onSimulateNotificationEvent: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onChangeRole,
  isDarkMode,
  onToggleDarkMode,
  syncState,
  onTriggerSync,
  onOpenCommandPalette,
  onOpenNewSkillModal,
  onOpenNewCategoryModal,
  onOpenOnboarding,
  onSelectView,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onClearAllNotifications,
  onSelectSkillById,
  onOpenNotificationPreferences,
  onSimulateNotificationEvent,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [registryMenuOpen, setRegistryMenuOpen] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const registryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
      if (registryMenuRef.current && !registryMenuRef.current.contains(event.target as Node)) {
        setRegistryMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: { role: UserRole; title: string; badge: string; desc: string }[] = [
    { role: 'ADMIN', title: 'Enterprise Admin', badge: 'Full Access', desc: 'Manage skills, RBAC roles, integrations & cloud sync' },
    { role: 'ARCHITECT', title: 'Skill Architect', badge: 'Creator', desc: 'Author and modify schemas, prompts, and run test suites' },
    { role: 'SECURITY_LEAD', title: 'Security & Compliance', badge: 'Auditor', desc: 'Audit code, approve vulnerability patches, verify compliance' },
    { role: 'VIEWER', title: 'Read-Only Viewer', badge: 'Viewer', desc: 'Browse catalogue, export reports, and inspect code' },
  ];

  const currentRoleInfo = roles.find((r) => r.role === currentRole) || roles[0];

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs tracking-wider shadow-sm dark:bg-slate-100 dark:text-slate-900">
          TSR
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
            Technical Skills Registry
          </span>
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
            v1.0.0
          </span>
        </div>
      </div>

      {/* Center: Universal Command Search Bar (matches screenshot) */}
      <div className="hidden lg:flex items-center max-w-md w-full mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Search skills, categories, files...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Controls & RBAC & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time Cloud Sync Meter */}
        <button
          onClick={onTriggerSync}
          disabled={syncState.isSyncing}
          title={`Cloud Region: ${syncState.cloudRegion} • Latency: ${syncState.latencyMs}ms • Click to sync`}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${syncState.isSyncing ? 'animate-spin text-blue-500' : ''}`}
          />
          <span className="text-[11px] font-mono hidden md:inline">
            {syncState.isSyncing ? 'Syncing...' : `${syncState.latencyMs}ms`}
          </span>
          <span className={`w-2 h-2 rounded-full ${syncState.isOnline ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
        </button>

        {/* Role-Based Access Control Switcher */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">{currentRoleInfo.title}</span>
            <span className="md:hidden">{currentRole}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Role-Based Access Control
                </span>
              </div>
              <div className="p-1 space-y-1">
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      onChangeRole(r.role);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start justify-between ${
                      currentRole === r.role
                        ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/70 dark:text-indigo-200 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>{r.title}</span>
                        {currentRole === r.role && <CheckCircle2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                        {r.desc}
                      </p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                      {r.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Export Reports Dropdown */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
            title="Export Registry Reports"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {exportMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Download Reports
              </div>
              <button
                onClick={() => {
                  exportSkillsToCSV(SKILLS_DATA);
                  setExportMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-medium">Export CSV Matrix</div>
                  <div className="text-[10px] text-slate-400">Skills, categories, pass rates</div>
                </div>
              </button>
              <button
                onClick={() => {
                  exportSkillsToJSON(SKILLS_DATA);
                  setExportMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <FileCode className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-medium">Export JSON Schema</div>
                  <div className="text-[10px] text-slate-400">Canonical artifact models</div>
                </div>
              </button>
              <button
                onClick={() => {
                  exportSkillsToMarkdown(SKILLS_DATA);
                  setExportMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <FileText className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="font-medium">Export Markdown Specs</div>
                  <div className="text-[10px] text-slate-400">Combined SKILL.md bundle</div>
                </div>
              </button>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
              <button
                onClick={() => {
                  printExecutiveReport();
                  setExportMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <div>
                  <div className="font-medium">Print Executive PDF</div>
                  <div className="text-[10px] text-slate-400">SOC2 & compliance summary</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Real-time Notification System */}
        <NotificationBell
          notifications={notifications}
          onMarkAsRead={onMarkNotificationAsRead}
          onMarkAllAsRead={onMarkAllNotificationsAsRead}
          onClearAll={onClearAllNotifications}
          onSelectSkillById={onSelectSkillById}
          onOpenPreferences={onOpenNotificationPreferences}
          onSimulateEvent={onSimulateNotificationEvent}
        />

        {/* Walkthrough / Onboarding Tour Trigger */}
        {onOpenOnboarding && (
          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors"
            title="Interactive Onboarding Walkthrough"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Tour</span>
          </button>
        )}

        {/* Theme Toggle (matches top right sun icon in screenshot) */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Open Registry Action Button (matching screenshot) */}
        <div className="relative" ref={registryMenuRef}>
          <button
            onClick={() => setRegistryMenuOpen(!registryMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white transition-all shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Open Registry</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {registryMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
              <button
                onClick={() => {
                  onSelectView('overview');
                  setRegistryMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
              >
                <span>🚀 Canonical Registry Hub</span>
              </button>
              <button
                onClick={() => {
                  onSelectView('skills');
                  setRegistryMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <span>📦 35 Production Skills</span>
              </button>
              <button
                onClick={() => {
                  onSelectView('files');
                  setRegistryMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <span>🌲 610 Artifacts Explorer</span>
              </button>
              {currentRole === 'ADMIN' && (
                <>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={() => {
                      onOpenNewSkillModal();
                      setRegistryMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+ Register New Skill</span>
                  </button>
                  {onOpenNewCategoryModal && (
                    <button
                      onClick={() => {
                        onOpenNewCategoryModal();
                        setRegistryMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>+ Create Category</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
