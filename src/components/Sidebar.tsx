import React from 'react';
import {
  Home,
  LayoutGrid,
  Layers,
  FolderTree,
  Search,
  FlaskConical,
  LineChart,
  Settings,
  ShieldCheck,
  Zap,
  Compass,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  totalSkillsCount: number;
  onOpenOnboarding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  totalSkillsCount,
  onOpenOnboarding,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'skills', label: 'Skills', icon: LayoutGrid, count: totalSkillsCount },
    { id: 'categories', label: 'Categories', icon: Layers, count: 11 },
    { id: 'files', label: 'File Tree', icon: FolderTree, count: '610' },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'tests', label: 'Tests', icon: FlaskConical, count: 70 },
    { id: 'insights', label: 'Insights', icon: LineChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-20 md:w-56 shrink-0 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-3 transition-all select-none">
      {/* Navigation list */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-center md:justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-blue-50/90 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
              title={item.label}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                  }`}
                />
                <span className="hidden md:inline">{item.label}</span>
              </div>

              {item.count !== undefined && (
                <span
                  className={`hidden md:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    isActive
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Section with Walkthrough trigger and Status Card */}
      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        {onOpenOnboarding && (
          <button
            onClick={onOpenOnboarding}
            className="w-full hidden md:flex items-center justify-between p-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100/70 text-indigo-700 dark:text-indigo-300 transition-colors text-xs font-semibold"
            title="Interactive Onboarding Walkthrough"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Walkthrough</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-200/60 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-mono">
              Tour
            </span>
          </button>
        )}

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center md:text-left">
          <div className="hidden md:flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
              Registry
            </span>
            <span className="text-[10px] font-mono text-slate-500">v1.0.0</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
              Canonical
            </span>
          </div>
          <div className="hidden md:block mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[9px] text-slate-400">
            Enterprise Skills Standard
          </div>
        </div>
      </div>
    </aside>
  );
};
