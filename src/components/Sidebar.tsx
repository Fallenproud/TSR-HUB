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
  Compass,
  X,
  Shield,
  Star,
  StarOff,
  Pin,
} from 'lucide-react';
import { UserRole, SkillItem } from '../types';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  skillsCount?: number;
  totalSkillsCount?: number;
  categoriesCount?: number;
  filesCount?: number;
  testsCount?: number;
  currentRole?: UserRole;
  onOpenOnboarding?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  pinnedSkills?: SkillItem[];
  onSelectPinnedSkill?: (skill: SkillItem) => void;
  onTogglePinSkill?: (skillId: string) => void;
  selectedSkillId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  skillsCount,
  totalSkillsCount = 35,
  categoriesCount = 11,
  filesCount = 610,
  testsCount = 70,
  currentRole = 'ADMIN',
  onOpenOnboarding,
  isMobileOpen = false,
  onCloseMobile,
  pinnedSkills = [],
  onSelectPinnedSkill,
  onTogglePinSkill,
  selectedSkillId,
}) => {
  const displaySkillsCount = skillsCount ?? totalSkillsCount;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'skills', label: 'Skills', icon: LayoutGrid, count: displaySkillsCount },
    { id: 'categories', label: 'Categories', icon: Layers, count: categoriesCount },
    { id: 'files', label: 'File Tree', icon: FolderTree, count: filesCount },
    { id: 'tests', label: 'Tests', icon: FlaskConical, count: testsCount },
    { id: 'insights', label: 'Insights', icon: LineChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (viewId: string) => {
    onSelectView(viewId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden transition-opacity animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Component (Responsive: Collapsible Off-Canvas Drawer on Mobile, Fixed Bar on Desktop) */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 md:z-auto
          w-64 md:w-56 shrink-0 flex flex-col justify-between
          border-r border-slate-200 dark:border-slate-800
          bg-white dark:bg-slate-900 shadow-2xl md:shadow-none
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          min-h-full md:min-h-[calc(100vh-4rem)] p-3 select-none
        `}
      >
        {/* Mobile Drawer Header with Close Button */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800 md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[11px] font-bold flex items-center justify-center">
              TSR
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Navigation
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close Navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list & Pinned Skills Container */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-0.5">
          {/* Main Nav Items */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
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
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && (
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono ${
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

          {/* Pinned Skills Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="px-3 pb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Pinned Skills</span>
              </div>
              {pinnedSkills.length > 0 && (
                <span
                  className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  title={`${pinnedSkills.length} pinned skills`}
                >
                  {pinnedSkills.length}
                </span>
              )}
            </div>

            {pinnedSkills.length > 0 ? (
              <div className="space-y-0.5 max-h-48 overflow-y-auto px-1 pr-1">
                {pinnedSkills.map((skill) => {
                  const isSelected = selectedSkillId === skill.id && activeView === 'overview';
                  return (
                    <div
                      key={skill.id}
                      className={`group w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                        isSelected
                          ? 'bg-amber-50/90 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold border border-amber-200/80 dark:border-amber-800/60 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <button
                        onClick={() => {
                          if (onSelectPinnedSkill) {
                            onSelectPinnedSkill(skill);
                          } else {
                            onSelectView('overview');
                          }
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className="flex items-center gap-2 min-w-0 flex-1 text-left"
                        title={`${skill.number} - ${skill.name} (${skill.category})`}
                      >
                        <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                          {skill.number}
                        </span>
                        <span className="truncate text-[11px]">{skill.name}</span>
                      </button>

                      {onTogglePinSkill && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePinSkill(skill.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 p-0.5 rounded transition-all shrink-0 ml-1"
                          title={`Unpin ${skill.name}`}
                          aria-label={`Unpin ${skill.name}`}
                        >
                          <StarOff className="w-3 h-3 hover:scale-110 transition-transform" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-2.5 py-2 text-center rounded-xl bg-slate-50/60 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800/80 mx-1">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                  Star <Star className="w-2.5 h-2.5 inline text-amber-500 fill-amber-500" /> any skill in catalog for rapid 1-click sidebar access
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section with Walkthrough trigger and Status Card */}
        <div className="space-y-2 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80">
          {onOpenOnboarding && (
            <button
              onClick={() => {
                onOpenOnboarding();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100/70 text-indigo-700 dark:text-indigo-300 transition-colors text-xs font-semibold"
              title="Interactive Onboarding Walkthrough"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Walkthrough</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-200/60 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-mono">
                Tour
              </span>
            </button>
          )}

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                Registry
              </span>
              <span className="text-[10px] font-mono text-slate-500">v1.0.0</span>
            </div>
            <div className="flex items-center justify-start gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                Canonical Standard
              </span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-[9px] text-slate-400 flex items-center justify-between">
              <span>Role:</span>
              <span className="font-semibold text-slate-600 dark:text-slate-300">{currentRole}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
