import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { D3Sparkline } from './d3/D3Sparkline';
import { D3DonutGauge } from './d3/D3DonutGauge';
import { CATEGORY_LIST } from '../data/categoriesData';
import { CategoryId } from '../types';

interface RightSidebarProps {
  onSelectCategoryFilter?: (catId: CategoryId | 'ALL') => void;
  activeCategoryFilter?: CategoryId | 'ALL';
  onNavigateToInsights?: () => void;
  totalSkillsCount?: number;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  onSelectCategoryFilter,
  activeCategoryFilter = 'ALL',
  onNavigateToInsights,
  totalSkillsCount = 35,
}) => {
  return (
    <div className="space-y-6 select-none">
      {/* 1. Registry Insights Card (matching screenshot) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase">
            Registry Insights
          </h3>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        {/* D3 Reactive Telemetry Sparkline */}
        <div className="my-1">
          <D3Sparkline height={52} color="#10b981" isLive={true} />
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>All systems healthy</span>
          </div>
          <div className="text-slate-400 font-mono text-[10px]">
            ◆ Last updated 2m ago
          </div>
        </div>
      </div>

      {/* 2. Category Topology (11 categories • 35 skills) (matching screenshot) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Category Topology
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              11 categories • {totalSkillsCount} skills
            </p>
          </div>
          {activeCategoryFilter !== 'ALL' && (
            <button
              onClick={() => onSelectCategoryFilter && onSelectCategoryFilter('ALL')}
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Reset
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {CATEGORY_LIST.map((cat) => {
            const isSelected = activeCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() =>
                  onSelectCategoryFilter &&
                  onSelectCategoryFilter(isSelected ? 'ALL' : cat.id)
                }
                className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition-all group ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-300 dark:ring-slate-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                {/* Category Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight border uppercase shrink-0 ${cat.badgeColor}`}
                  >
                    {cat.label}
                  </span>
                </div>

                {/* Count & Proportional Bar */}
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 w-3 text-right">
                    {cat.count}
                  </span>

                  {/* Horizontal Bar */}
                  <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage * 4.5}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 w-6 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Skill Coverage Widget (matching screenshot) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <h3 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase mb-3">
          Skill Coverage
        </h3>

        <div className="flex items-center justify-between gap-4">
          <D3DonutGauge size={120} centerLabel="100%" centerSublabel="Complete" />

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-900 dark:text-white">35</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Complete</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="font-semibold text-slate-900 dark:text-white">0</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-300" />
              <span className="font-semibold text-slate-900 dark:text-white">0</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="font-semibold text-slate-900 dark:text-white">0</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Missing</span>
            </div>
          </div>
        </div>

        {/* View Full Insights Action Link */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onNavigateToInsights}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors group"
          >
            <span>View Full Insights</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
