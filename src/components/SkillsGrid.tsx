import React, { useState } from 'react';
import {
  LayoutGrid,
  List,
  Filter,
  Search,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  FileText,
  Code2,
  Settings2,
  Terminal,
  FlaskConical,
  BarChart2,
  RotateCcw,
} from 'lucide-react';
import { SkillItem, CategoryId } from '../types';
import { CATEGORIES_DATA } from '../data/categoriesData';

interface SkillsGridProps {
  skills: SkillItem[];
  selectedSkillId?: string;
  onSelectSkill: (skill: SkillItem) => void;
  activeCategoryFilter: CategoryId | 'ALL';
  onSelectCategoryFilter: (cat: CategoryId | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SkillsGrid: React.FC<SkillsGridProps> = ({
  skills,
  selectedSkillId,
  onSelectSkill,
  activeCategoryFilter,
  onSelectCategoryFilter,
  searchQuery,
  onSearchChange,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  return (
    <div className="space-y-4">
      {/* Grid Toolbar & Filters (matching screenshot) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            All Skills <span className="text-slate-400 font-normal">({skills.length})</span>
          </h2>
          {activeCategoryFilter !== 'ALL' && (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Filter: {activeCategoryFilter}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter skills..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid View of Skill Cards */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {skills.map((skill) => {
            const isSelected = selectedSkillId === skill.id;
            const cat = CATEGORIES_DATA[skill.category];

            return (
              <div
                key={skill.id}
                onClick={() => onSelectSkill(skill)}
                className={`p-4 rounded-xl bg-white dark:bg-slate-900 border transition-all cursor-pointer flex flex-col justify-between group select-none ${
                  isSelected
                    ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div>
                  {/* Top line: Number + Title + Category Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                        {skill.number}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {skill.name}
                      </h3>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight uppercase shrink-0 border ${
                        cat?.badgeColor || 'bg-slate-100'
                      }`}
                    >
                      {skill.category}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {skill.description}
                  </p>

                  {/* Tag Chips on Card */}
                  {skill.tags && skill.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {skill.tags.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {tag}
                        </span>
                      ))}
                      {skill.tags.length > 3 && (
                        <span className="text-[9px] text-slate-400 px-1 py-0.5 font-mono">
                          +{skill.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Artifact Counter Strip (matching screenshot icons) */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span title="SKILL.md specs" className="flex items-center gap-0.5">
                      📄 {skill.artifacts.skillMd}
                    </span>
                    <span title="JSON Schemas" className="flex items-center gap-0.5">
                      {'{ }'} {skill.artifacts.schemas}
                    </span>
                    <span title="Prompt definitions" className="flex items-center gap-0.5">
                      ⚙️ {skill.artifacts.prompts}
                    </span>
                    <span title="TypeScript source files" className="flex items-center gap-0.5">
                      {'</>'} {skill.artifacts.source}
                    </span>
                    <span title="Automated tests" className="flex items-center gap-0.5">
                      🧪 {skill.artifacts.tests}
                    </span>
                    <span title="Usage examples" className="flex items-center gap-0.5">
                      📊 {skill.artifacts.examples}
                    </span>
                    <span title="Changelog" className="flex items-center gap-0.5">
                      🔄 {skill.artifacts.changelog}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Skill Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Complexity</th>
                <th className="py-2.5 px-3">Pass Rate</th>
                <th className="py-2.5 px-3">Maintainer</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {skills.map((skill) => (
                <tr
                  key={skill.id}
                  onClick={() => onSelectSkill(skill)}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                    selectedSkillId === skill.id ? 'bg-indigo-50/70 dark:bg-indigo-950/40' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono text-slate-400">{skill.number}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    {skill.name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        CATEGORIES_DATA[skill.category]?.badgeColor
                      }`}
                    >
                      {skill.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{skill.complexity}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {skill.testPassRate}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{skill.maintainer}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-[11px]">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
