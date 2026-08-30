import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpDown,
  Sparkles,
  Shield,
  Layers,
  Tag,
  CheckSquare,
  Square,
  Archive,
  FolderInput,
  Edit3,
  ExternalLink,
  Code2,
  Star,
} from 'lucide-react';
import { SkillItem, CategoryId, UserRole, CategoryInfo, SkillStatus } from '../../types';
import { CATEGORIES_DATA, CATEGORY_LIST } from '../../data/categoriesData';
import { exportSkillsToCSV, exportSkillsToJSON } from '../../utils/exportUtils';
import { SkillDetailCard } from '../SkillDetailCard';
import { BulkActionToolbar } from '../BulkActionToolbar';
import { QuickEditSlideOut } from '../QuickEditSlideOut';
import { VoiceInputButton } from '../common/VoiceInputButton';

interface SkillsViewProps {
  skills: SkillItem[];
  currentRole: UserRole;
  onOpenNewSkillModal: () => void;
  onSelectSkill: (skill: SkillItem | null) => void;
  selectedSkill: SkillItem | null;
  categories?: CategoryInfo[];
  onUpdateSkill?: (updatedSkill: SkillItem) => void;
  onUpdateSkillTags?: (skillId: string, tags: string[]) => void;
  onEndorseSkill?: (skill: SkillItem) => void;
  onBatchTagSkills?: (skillIds: string[], tagsToAdd: string[], tagsToRemove?: string[]) => void;
  onBatchMoveCategory?: (skillIds: string[], targetCategory: CategoryId) => void;
  onBatchArchiveSkills?: (skillIds: string[], archive: boolean) => void;
  onBatchDeleteSkills?: (skillIds: string[]) => void;
  onBatchStatusSkills?: (skillIds: string[], status: SkillStatus) => void;
  onBatchVerifySkills?: (skillIds: string[]) => void;
  onTogglePinSkill?: (skillId: string) => void;
  pinnedSkillIds?: string[];
}

export const SkillsView: React.FC<SkillsViewProps> = ({
  skills,
  currentRole,
  onOpenNewSkillModal,
  onSelectSkill,
  selectedSkill,
  categories = CATEGORY_LIST,
  onUpdateSkill,
  onUpdateSkillTags,
  onEndorseSkill,
  onBatchTagSkills,
  onBatchMoveCategory,
  onBatchArchiveSkills,
  onBatchDeleteSkills,
  onBatchStatusSkills,
  onBatchVerifySkills,
  onTogglePinSkill,
  pinnedSkillIds = [],
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | 'ALL'>('ALL');
  const [complexityFilter, setComplexityFilter] = useState<'ALL' | 'Low' | 'Medium' | 'High'>('ALL');
  const [archiveFilter, setArchiveFilter] = useState<'active' | 'all' | 'pinned' | 'archived'>('active');
  const [sortBy, setSortBy] = useState<'number' | 'name' | 'complexity' | 'testPassRate'>('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Multi-selection state
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  // Quick Edit Slide-Out panel state
  const [quickEditSkill, setQuickEditSkill] = useState<SkillItem | null>(null);
  // Full detailed inspector state
  const [fullInspectorSkill, setFullInspectorSkill] = useState<SkillItem | null>(selectedSkill);

  const pinnedCount = skills.filter((s) => s.isPinned || pinnedSkillIds.includes(s.id)).length;
  const archivedCount = skills.filter((s) => s.isArchived).length;

  const filteredSkills = skills
    .filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.number.includes(search) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
      const matchCat = categoryFilter === 'ALL' || s.category === categoryFilter;
      const matchComp = complexityFilter === 'ALL' || s.complexity === complexityFilter;
      
      // Archive & Pinned filter
      let matchArchive = true;
      if (archiveFilter === 'active') {
        matchArchive = !s.isArchived;
      } else if (archiveFilter === 'pinned') {
        matchArchive = !s.isArchived && (!!s.isPinned || pinnedSkillIds.includes(s.id));
      } else if (archiveFilter === 'archived') {
        matchArchive = !!s.isArchived;
      }

      return matchSearch && matchCat && matchComp && matchArchive;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'number') comparison = parseInt(a.number, 10) - parseInt(b.number, 10);
      else if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'testPassRate') comparison = a.testPassRate - b.testPassRate;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const selectedSkills = skills.filter((s) => selectedSkillIds.includes(s.id));
  const allFilteredSelected =
    filteredSkills.length > 0 &&
    filteredSkills.every((s) => selectedSkillIds.includes(s.id));

  // Selection handlers
  const handleToggleSelectSkill = (skillId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleToggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredIdSet = new Set(filteredSkills.map((s) => s.id));
      setSelectedSkillIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      const currentSet = new Set(selectedSkillIds);
      filteredSkills.forEach((s) => currentSet.add(s.id));
      setSelectedSkillIds(Array.from(currentSet));
    }
  };

  const handleClearSelection = () => {
    setSelectedSkillIds([]);
  };

  // Card click opens Quick Edit Slide-Out by default
  const handleCardClick = (skill: SkillItem) => {
    setQuickEditSkill(skill);
    onSelectSkill(skill);
  };

  const handleOpenFullInspector = (skill: SkillItem) => {
    setFullInspectorSkill(skill);
    onSelectSkill(skill);
  };

  // Immediate Single Skill Modification handler
  const handleUpdateSkillDirect = (updatedSkill: SkillItem) => {
    if (onUpdateSkill) {
      onUpdateSkill(updatedSkill);
    }
    // Update local states if currently open
    if (quickEditSkill && quickEditSkill.id === updatedSkill.id) {
      setQuickEditSkill(updatedSkill);
    }
    if (fullInspectorSkill && fullInspectorSkill.id === updatedSkill.id) {
      setFullInspectorSkill(updatedSkill);
    }
  };

  // Batch action wrappers
  const handleBatchTag = (tagsToAdd: string[], tagsToRemove?: string[]) => {
    if (onBatchTagSkills) {
      onBatchTagSkills(selectedSkillIds, tagsToAdd, tagsToRemove);
    }
  };

  const handleBatchMoveCategoryAction = (targetCategory: CategoryId) => {
    if (onBatchMoveCategory) {
      onBatchMoveCategory(selectedSkillIds, targetCategory);
    }
  };

  const handleBatchArchiveAction = (archive: boolean) => {
    if (onBatchArchiveSkills) {
      onBatchArchiveSkills(selectedSkillIds, archive);
    }
  };

  const handleBatchStatusAction = (status: SkillStatus) => {
    if (onBatchStatusSkills) {
      onBatchStatusSkills(selectedSkillIds, status);
    }
  };

  const handleBatchDeleteAction = () => {
    if (onBatchDeleteSkills) {
      onBatchDeleteSkills(selectedSkillIds);
      setSelectedSkillIds([]);
    }
  };

  const handleBatchVerifyAction = () => {
    if (onBatchVerifySkills) {
      onBatchVerifySkills(selectedSkillIds);
    }
  };

  const handleExportBatchCSV = () => {
    exportSkillsToCSV(selectedSkills);
  };

  const handleExportBatchJSON = () => {
    exportSkillsToJSON(selectedSkills);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Skills Registry Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, quick-edit, tag, and verify all 35 canonical enterprise skill packages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportSkillsToCSV(skills)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {currentRole === 'ADMIN' ? (
            <button
              onClick={onOpenNewSkillModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Skill</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 text-xs font-medium border border-slate-200/60 dark:border-slate-700">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Admin Role Required to Create</span>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Action Toolbar when skills are selected */}
      <BulkActionToolbar
        selectedSkillIds={selectedSkillIds}
        selectedSkills={selectedSkills}
        totalFilteredCount={filteredSkills.length}
        allFilteredSelected={allFilteredSelected}
        onToggleSelectAllFiltered={handleToggleSelectAllFiltered}
        onClearSelection={handleClearSelection}
        categories={categories}
        onBatchTag={handleBatchTag}
        onBatchMoveCategory={handleBatchMoveCategoryAction}
        onBatchArchive={handleBatchArchiveAction}
        onBatchStatus={handleBatchStatusAction}
        onBatchDelete={handleBatchDeleteAction}
        onBatchVerify={handleBatchVerifyAction}
        onBatchExportCSV={handleExportBatchCSV}
        onBatchExportJSON={handleExportBatchJSON}
        currentRole={currentRole}
      />

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search or dictate name, #tag, or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              <VoiceInputButton
                size="sm"
                mode="replace"
                title="Voice search skills"
                onTranscript={(spoken) => setSearch(spoken)}
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryId | 'ALL')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.count})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={complexityFilter}
              onChange={(e) => setComplexityFilter(e.target.value as 'ALL' | 'Low' | 'Medium' | 'High')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Complexities</option>
              <option value="Low">Low Complexity</option>
              <option value="Medium">Medium Complexity</option>
              <option value="High">High Complexity</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={archiveFilter}
              onChange={(e) => setArchiveFilter(e.target.value as 'active' | 'all' | 'pinned' | 'archived')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="active">Active Skills ({skills.length - archivedCount})</option>
              <option value="pinned">★ Pinned ({pinnedCount})</option>
              <option value="all">All (incl. Archived) ({skills.length})</option>
              <option value="archived">Archived Only ({archivedCount})</option>
            </select>
          </div>
        </div>

        {/* Category Pills Strip & Multi-Select Bar */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                categoryFilter === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              All ({skills.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all border ${
                  categoryFilter === cat.id
                    ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900 font-bold'
                    : 'opacity-85 hover:opacity-100'
                } ${cat.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Quick Select All Toggle in filter bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSelectAllFiltered}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {allFilteredSelected ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span>Select All ({filteredSkills.length})</span>
                </>
              )}
            </button>
            {selectedSkillIds.length > 0 && (
              <button
                onClick={handleClearSelection}
                className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium"
              >
                Clear ({selectedSkillIds.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Selected Skill Modal / Detail Inspector (when opened) */}
      {fullInspectorSkill && (
        <div className="animate-in fade-in slide-in-from-top-3">
          <SkillDetailCard
            skill={fullInspectorSkill}
            onClose={() => {
              setFullInspectorSkill(null);
              onSelectSkill(null);
            }}
            currentRole={currentRole}
            onUpdateTags={onUpdateSkillTags}
            onEndorseSkill={onEndorseSkill}
            onTogglePinSkill={onTogglePinSkill}
            isPinned={fullInspectorSkill.isPinned || pinnedSkillIds.includes(fullInspectorSkill.id)}
          />
        </div>
      )}

      {/* Quick Edit Slide-Out Panel */}
      <QuickEditSlideOut
        skill={quickEditSkill}
        isOpen={!!quickEditSkill}
        onClose={() => setQuickEditSkill(null)}
        onUpdateSkill={handleUpdateSkillDirect}
        onOpenFullInspector={(s) => {
          setFullInspectorSkill(s);
          setQuickEditSkill(null);
          onSelectSkill(s);
        }}
        onEndorseSkill={onEndorseSkill}
        categories={categories}
        currentRole={currentRole}
      />

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => {
          const cat = CATEGORIES_DATA[skill.category] || {
            label: skill.category,
            badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200',
          };
          const isInspected = (fullInspectorSkill?.id === skill.id) || (quickEditSkill?.id === skill.id);
          const isChecked = selectedSkillIds.includes(skill.id);
          const isPinned = skill.isPinned || pinnedSkillIds.includes(skill.id);

          return (
            <div
              key={skill.id}
              onClick={() => handleCardClick(skill)}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer flex flex-col justify-between group relative ${
                isChecked
                  ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-500/30 shadow-md'
                  : isInspected
                  ? 'border-indigo-400 ring-2 ring-indigo-400/30 shadow-md'
                  : skill.isArchived
                  ? 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100 bg-slate-50/50 dark:bg-slate-900/50'
                  : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-2xs hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Checkbox for batch multi-select */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSelectSkill(skill.id, e)}
                      className="p-1 -m-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                      title={isChecked ? 'Unselect skill' : 'Select skill for bulk actions'}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    <span className="font-mono text-sm font-bold text-slate-400 shrink-0">
                      {skill.number}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {skill.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onTogglePinSkill && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePinSkill(skill.id);
                        }}
                        className={`p-1 rounded-md transition-all ${
                          isPinned
                            ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/60'
                            : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-60 group-hover:opacity-100'
                        }`}
                        title={isPinned ? 'Unpin from sidebar' : 'Pin to sidebar'}
                        aria-label={isPinned ? `Unpin ${skill.name}` : `Pin ${skill.name}`}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            isPinned ? 'fill-amber-500 text-amber-500' : ''
                          }`}
                        />
                      </button>
                    )}

                    {skill.isArchived && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                        Archived
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        cat?.badgeColor || 'bg-slate-100'
                      }`}
                    >
                      {skill.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                  {skill.description}
                </p>

                {/* Skill Tags */}
                {skill.tags && skill.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {skill.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                    {skill.tags.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{skill.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">
                    v{skill.version}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {skill.complexity}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-medium">
                    {skill.status}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium">
                    {skill.testPassRate}% Pass
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                {/* Quick Edit button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuickEditSkill(skill);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 font-semibold transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Quick Edit</span>
                </button>

                {/* Inspect Spec button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenFullInspector(skill);
                  }}
                  className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium hover:underline flex items-center gap-1 transition-colors"
                >
                  <span>Inspect Spec</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
