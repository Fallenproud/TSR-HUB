import React, { useState } from 'react';
import { Layers, Users, CheckCircle2, ChevronRight, ArrowUpRight, FolderPlus, Tag } from 'lucide-react';
import { CATEGORY_LIST, CATEGORIES_DATA } from '../../data/categoriesData';
import { CategoryId, CategoryInfo, SkillItem } from '../../types';

interface CategoriesViewProps {
  categories?: CategoryInfo[];
  skills?: SkillItem[];
  onSelectSkill: (skill: SkillItem) => void;
  onOpenNewCategoryModal?: () => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories = CATEGORY_LIST,
  skills = [],
  onSelectSkill,
  onOpenNewCategoryModal,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || 'DEFEND');

  const selectedCategory = categories.find((c) => c.id === selectedCatId) || categories[0] || CATEGORIES_DATA['DEFEND'];
  const skillsInCat = skills.filter((s) => s.category === selectedCatId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Category Topology Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore the {categories.length} enterprise domain categories orchestrating production skills.
          </p>
        </div>

        {onOpenNewCategoryModal && (
          <button
            onClick={onOpenNewCategoryModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Create Custom Category</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Cards Grid (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isSelected = selectedCatId === cat.id;
            const currentCatSkillsCount = skills.filter((s) => s.category === cat.id).length;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${cat.badgeColor}`}
                  >
                    {cat.label}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {currentCatSkillsCount} Production Skills
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      {cat.domainLead.split(',')[0]}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {cat.percentage}%
                  </span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? 'translate-x-1 text-indigo-600' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Category Details & Skills in this Category (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {/* Header info */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${selectedCategory.badgeColor}`}
                  >
                    {selectedCategory.label}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {skillsInCat.length} Skills • {selectedCategory.percentage}% Topology
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2.5 leading-relaxed">
                  {selectedCategory.description}
                </p>
              </div>
            </div>

            {/* Domain Lead */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-slate-500">Domain Lead:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedCategory.domainLead}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                SLA: 99.99%
              </span>
            </div>

            {/* Skills in Category */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Assigned Canonical Skills ({skillsInCat.length})
              </h3>
              {skillsInCat.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                  No skills have been assigned to this custom category yet. Use "+ Register New Skill" to link competencies to this domain.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {skillsInCat.map((skill) => (
                    <div
                      key={skill.id}
                      onClick={() => onSelectSkill(skill)}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-900 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center">
                          {skill.number}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {skill.name}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {skill.purpose}
                          </p>
                          {skill.tags && skill.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-1.5">
                              {skill.tags.map((t, idx) => (
                                <span key={idx} className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          {skill.artifacts.tests} tests
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
