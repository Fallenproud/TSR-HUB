import React, { useState, useMemo } from 'react';
import {
  Network,
  Radar,
  Activity,
  Download,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  Share2,
  Layers,
  Compass,
  GitCommit,
  CheckCircle2,
} from 'lucide-react';
import { D3TopologyGraph } from '../d3/D3TopologyGraph';
import { D3RadarChart } from '../d3/D3RadarChart';
import { D3ActivityChart } from '../d3/D3ActivityChart';
import { CATEGORY_LIST } from '../../data/categoriesData';
import { CategoryId, SkillItem, CategoryInfo } from '../../types';
import { exportSkillsToCSV } from '../../utils/exportUtils';
import { SKILLS_DATA } from '../../data/skillsData';

interface InsightsViewProps {
  onSelectSkill: (skill: SkillItem) => void;
  skills?: SkillItem[];
  categories?: CategoryInfo[];
  selectedSkillId?: string;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  onSelectSkill,
  skills = SKILLS_DATA,
  categories = CATEGORY_LIST,
  selectedSkillId,
}) => {
  const [networkCatFilter, setNetworkCatFilter] = useState<CategoryId | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'network' | 'radar' | 'activity'>('network');

  // Compute Live Topology Graph Statistics
  const { totalLinks, crossGuildLinks, avgDegree, densityScore } = useMemo(() => {
    let linksCount = 0;
    let crossCount = 0;
    const nameToSkill = new Map<string, SkillItem>();
    skills.forEach((s) => {
      nameToSkill.set(s.name.toLowerCase().trim(), s);
      nameToSkill.set(s.id.toLowerCase().trim(), s);
    });

    skills.forEach((s) => {
      (s.dependencies || []).forEach((dep) => {
        const target = nameToSkill.get(dep.toLowerCase().trim());
        if (target) {
          linksCount++;
          if (target.category !== s.category) {
            crossCount++;
          }
        }
      });
    });

    const v = skills.length;
    const avg = v > 0 ? (linksCount / v).toFixed(2) : '0.00';
    const density = v > 1 ? (((2 * linksCount) / (v * (v - 1))) * 100).toFixed(1) : '0.0';

    return {
      totalLinks: linksCount,
      crossGuildLinks: crossCount,
      avgDegree: avg,
      densityScore: density,
    };
  }, [skills]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Enterprise Topology & Graph Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore interactive force-directed dependencies, category cluster densities, and real-time telemetry.
          </p>
        </div>

        <button
          onClick={() => exportSkillsToCSV(skills)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics Dataset</span>
        </button>
      </div>

      {/* Top Topology KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Avg Node Degree</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {avgDegree} <span className="text-xs font-normal text-slate-400 font-mono">links/node</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <span>{totalLinks} total dependency edges</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Share2 className="w-4 h-4 text-indigo-500" />
            <span>Cross-Guild Bridges</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {crossGuildLinks} <span className="text-xs font-normal text-slate-400 font-mono">bridges</span>
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">
            High inter-domain interoperability
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Layers className="w-4 h-4 text-purple-500" />
            <span>Cluster Density Index</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {densityScore}% <span className="text-xs font-normal text-slate-400 font-mono">density</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            11 modular domain clusters
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Governance Maturity</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            99.8 / 100
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            100% verified test contracts
          </div>
        </div>
      </div>

      {/* Main Interactive Analytics Section */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('network')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'network'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Interactive D3 Topology Graph</span>
            </button>

            <button
              onClick={() => setActiveTab('radar')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'radar'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Radar className="w-4 h-4" />
              <span>D3 Category Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'activity'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>D3 Velocity Stream</span>
            </button>
          </div>

          {activeTab === 'network' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Scope Filter:</span>
              <select
                value={networkCatFilter}
                onChange={(e) => setNetworkCatFilter(e.target.value as CategoryId | 'ALL')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="ALL">All Categories ({skills.length} skills)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} ({c.count})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: D3 Topology Graph */}
        {activeTab === 'network' && (
          <div className="animate-in fade-in duration-200">
            <D3TopologyGraph
              skills={skills}
              categories={categories}
              initialCategoryFilter={networkCatFilter}
              selectedSkillId={selectedSkillId}
              onSelectSkill={onSelectSkill}
            />
          </div>
        )}

        {/* Tab 2: D3 Category Radar */}
        {activeTab === 'radar' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex justify-center">
                <D3RadarChart size={360} />
              </div>
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Category Maturity & Governance Balance
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The D3 radar polygon quantifies governance completeness, schema contract coverage, and zero-defect test pass rates across all 11 enterprise taxonomy pillars.
                </p>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Defensive Security (DEFEND)
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      100% Maturity
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Creation & Platform Architecture (CREATE)
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      98% Maturity
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Operations & Resilience (OPERATE)
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      100% Maturity
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Corporate Governance & Capital (GOVERN / FUND)
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      99% Maturity
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: D3 Activity Stream */}
        {activeTab === 'activity' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  24-Hour Skill Validations & Execution Velocity
                </h3>
                <p className="text-xs text-slate-400">
                  Hover over data points to inspect hourly throughput and validation rates.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Validations/hr</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Executions/hr</span>
                </div>
              </div>
            </div>
            <D3ActivityChart />
          </div>
        )}
      </div>
    </div>
  );
};
