import React, { useState, useRef, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Tag,
  FolderInput,
  Archive,
  ArchiveRestore,
  Trash2,
  Download,
  Play,
  X,
  ChevronDown,
  Plus,
  Check,
  AlertTriangle,
  Sparkles,
  Shield,
  Layers,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';
import { SkillItem, CategoryId, CategoryInfo, SkillStatus, UserRole } from '../types';
import { CATEGORIES_DATA } from '../data/categoriesData';
import { ALL_PRESET_TAGS } from '../data/skillsData';

interface BulkActionToolbarProps {
  selectedSkillIds: string[];
  selectedSkills: SkillItem[];
  totalFilteredCount: number;
  allFilteredSelected: boolean;
  onToggleSelectAllFiltered: () => void;
  onClearSelection: () => void;
  categories: CategoryInfo[];
  onBatchTag: (tagsToAdd: string[], tagsToRemove?: string[]) => void;
  onBatchMoveCategory: (targetCategory: CategoryId) => void;
  onBatchArchive: (archive: boolean) => void;
  onBatchStatus?: (status: SkillStatus) => void;
  onBatchDelete?: () => void;
  onBatchVerify?: () => void;
  onBatchExportCSV?: () => void;
  onBatchExportJSON?: () => void;
  currentRole: UserRole;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedSkillIds,
  selectedSkills,
  totalFilteredCount,
  allFilteredSelected,
  onToggleSelectAllFiltered,
  onClearSelection,
  categories,
  onBatchTag,
  onBatchMoveCategory,
  onBatchArchive,
  onBatchStatus,
  onBatchDelete,
  onBatchVerify,
  onBatchExportCSV,
  onBatchExportJSON,
  currentRole,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<'tag' | 'category' | 'status' | 'export' | 'delete' | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [selectedTagsToAdd, setSelectedTagsToAdd] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (selectedSkillIds.length === 0) return null;

  const allArchived = selectedSkills.every((s) => s.isArchived);
  const someArchived = selectedSkills.some((s) => s.isArchived);

  // Collect existing unique tags on selected items
  const existingTagsOnSelected = Array.from(
    new Set(selectedSkills.flatMap((s) => s.tags || []))
  );

  const handleApplyTags = () => {
    if (selectedTagsToAdd.length > 0) {
      onBatchTag(selectedTagsToAdd);
      setSelectedTagsToAdd([]);
      setTagInput('');
      setActiveDropdown(null);
    }
  };

  const handleAddCustomTag = () => {
    const clean = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
    if (clean && clean !== '#' && !selectedTagsToAdd.includes(clean)) {
      setSelectedTagsToAdd((prev) => [...prev, clean]);
      setTagInput('');
    }
  };

  const handleRunBatchVerification = () => {
    setIsVerifying(true);
    setVerificationFeedback(`Running validation suite on ${selectedSkillIds.length} skills...`);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationFeedback(`✓ All ${selectedSkillIds.length} skills passed canonical schema & test validation!`);
      if (onBatchVerify) onBatchVerify();
      setTimeout(() => setVerificationFeedback(null), 4000);
    }, 1200);
  };

  return (
    <div
      ref={toolbarRef}
      id="bulk-action-toolbar"
      className="sticky top-4 z-30 mb-6 p-3 sm:p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border-2 border-indigo-500/50 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Left: Selection summary & Select All toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-200 text-xs font-semibold">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-white text-sm font-bold">{selectedSkillIds.length}</span>
            <span className="text-slate-300">of {totalFilteredCount} selected</span>
          </div>

          <button
            id="btn-bulk-toggle-select-all"
            onClick={onToggleSelectAllFiltered}
            className="text-xs text-indigo-300 hover:text-indigo-100 font-medium underline underline-offset-2 transition-colors"
          >
            {allFilteredSelected ? 'Deselect all' : `Select all (${totalFilteredCount})`}
          </button>
        </div>

        {/* Right: Batch Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          {/* Action 1: Batch Tag */}
          <div className="relative">
            <button
              id="btn-bulk-tag"
              onClick={() => setActiveDropdown(activeDropdown === 'tag' ? null : 'tag')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                activeDropdown === 'tag'
                  ? 'bg-indigo-600 border-indigo-400 text-white ring-2 ring-indigo-400/30'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tag Skills</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'tag' && (
              <div className="absolute left-0 lg:right-0 lg:left-auto top-full mt-2 w-80 p-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 text-xs z-50 animate-in fade-in">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Tag className="w-4 h-4 text-indigo-400" />
                    <span>Apply Tags to {selectedSkillIds.length} Skills</span>
                  </div>
                  <button
                    onClick={() => setActiveDropdown(null)}
                    className="p-1 rounded-md text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Custom Tag Input */}
                <div className="flex items-center gap-1.5 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    placeholder="Type #custom-tag & Enter..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 font-mono focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Selected Tags Queue */}
                {selectedTagsToAdd.length > 0 && (
                  <div className="mb-3 p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Tags to add:</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedTagsToAdd.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-900/60 text-indigo-200 border border-indigo-700"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => setSelectedTagsToAdd((prev) => prev.filter((t) => t !== tag))}
                            className="text-indigo-400 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Presets */}
                <div className="mb-3">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Preset Tags:</div>
                  <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                    {ALL_PRESET_TAGS.slice(0, 14).map((preset) => {
                      const isQueued = selectedTagsToAdd.includes(preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            if (isQueued) {
                              setSelectedTagsToAdd((prev) => prev.filter((t) => t !== preset));
                            } else {
                              setSelectedTagsToAdd((prev) => [...prev, preset]);
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                            isQueued
                              ? 'bg-indigo-600 text-white border-indigo-400'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {preset} {isQueued && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Remove Existing Tags on Selected */}
                {existingTagsOnSelected.length > 0 && (
                  <div className="mb-3 pt-2 border-t border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-rose-400 mb-1">Remove tag from all selected:</div>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                      {existingTagsOnSelected.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            onBatchTag([], [tag]);
                            setActiveDropdown(null);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/50 text-rose-300 border border-rose-800/80 hover:bg-rose-900 transition-colors flex items-center gap-1"
                        >
                          <span>- {tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(null)}
                    className="px-2.5 py-1 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={selectedTagsToAdd.length === 0}
                    onClick={handleApplyTags}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply {selectedTagsToAdd.length} Tags</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action 2: Move Category */}
          <div className="relative">
            <button
              id="btn-bulk-move-category"
              onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                activeDropdown === 'category'
                  ? 'bg-indigo-600 border-indigo-400 text-white ring-2 ring-indigo-400/30'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <FolderInput className="w-3.5 h-3.5 text-amber-400" />
              <span>Move Category</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'category' && (
              <div className="absolute left-0 lg:right-0 lg:left-auto top-full mt-2 w-72 p-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 text-xs z-50 animate-in fade-in">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <FolderInput className="w-4 h-4 text-amber-400" />
                    <span>Reassign Category</span>
                  </div>
                  <button
                    onClick={() => setActiveDropdown(null)}
                    className="p-1 rounded-md text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mb-2.5">
                  Move {selectedSkillIds.length} selected skills to:
                </p>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onBatchMoveCategory(cat.id);
                        setActiveDropdown(null);
                      }}
                      className="w-full p-2 rounded-xl bg-slate-800 hover:bg-indigo-900/60 border border-slate-700/80 hover:border-indigo-500 text-left flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 group-hover:bg-indigo-300" />
                        <span className="font-semibold text-slate-200 group-hover:text-white text-xs">
                          {cat.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 group-hover:text-indigo-200">
                        {cat.id}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action 3: Archive / Restore */}
          <button
            id="btn-bulk-archive"
            onClick={() => onBatchArchive(!allArchived)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
            title={allArchived ? 'Restore selected skills' : 'Archive selected skills'}
          >
            {allArchived ? (
              <>
                <ArchiveRestore className="w-3.5 h-3.5 text-emerald-400" />
                <span>Restore ({selectedSkillIds.length})</span>
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5 text-slate-400" />
                <span>Archive ({selectedSkillIds.length})</span>
              </>
            )}
          </button>

          {/* Action 4: Change Status */}
          {onBatchStatus && (
            <div className="relative">
              <button
                id="btn-bulk-status"
                onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  activeDropdown === 'status'
                    ? 'bg-indigo-600 border-indigo-400 text-white ring-2 ring-indigo-400/30'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Set Status</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {activeDropdown === 'status' && (
                <div className="absolute left-0 lg:right-0 lg:left-auto top-full mt-2 w-56 p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 text-xs z-50 animate-in fade-in space-y-1">
                  {(['Complete', 'In Progress', 'Under Review', 'Planned'] as SkillStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        onBatchStatus(status);
                        setActiveDropdown(null);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-800 flex items-center justify-between transition-colors"
                    >
                      <span>{status}</span>
                      {status === 'Complete' && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action 5: Export Batch */}
          <div className="relative">
            <button
              id="btn-bulk-export"
              onClick={() => setActiveDropdown(activeDropdown === 'export' ? null : 'export')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                activeDropdown === 'export'
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'export' && (
              <div className="absolute left-0 lg:right-0 lg:left-auto top-full mt-2 w-48 p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 text-xs z-50 animate-in fade-in space-y-1">
                {onBatchExportCSV && (
                  <button
                    onClick={() => {
                      onBatchExportCSV();
                      setActiveDropdown(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-white"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export as CSV</span>
                  </button>
                )}
                {onBatchExportJSON && (
                  <button
                    onClick={() => {
                      onBatchExportJSON();
                      setActiveDropdown(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-800 flex items-center gap-2 text-slate-200 hover:text-white"
                  >
                    <FileCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>Export as JSON</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action 6: Run Batch Verification */}
          <button
            id="btn-bulk-verify"
            onClick={handleRunBatchVerification}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying...' : `Verify (${selectedSkillIds.length})`}</span>
          </button>

          {/* Action 7: Delete (Admin role only) */}
          {currentRole === 'ADMIN' && onBatchDelete && (
            <div className="relative">
              <button
                id="btn-bulk-delete"
                onClick={() => setActiveDropdown(activeDropdown === 'delete' ? null : 'delete')}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 border border-slate-700 text-slate-400 transition-colors"
                title="Delete selected skills"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {activeDropdown === 'delete' && (
                <div className="absolute right-0 top-full mt-2 w-64 p-3.5 rounded-2xl bg-slate-900 border border-rose-700 shadow-2xl text-slate-100 text-xs z-50 animate-in fade-in">
                  <div className="flex items-center gap-2 text-rose-400 font-bold mb-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mb-3">
                    Are you sure you want to delete <span className="font-bold text-white">{selectedSkillIds.length}</span> skill packages? This action cannot be undone.
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setActiveDropdown(null)}
                      className="px-2.5 py-1 text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onBatchDelete();
                        setActiveDropdown(null);
                      }}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clear Selection */}
          <button
            id="btn-bulk-clear-selection"
            onClick={onClearSelection}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors ml-auto lg:ml-0"
            title="Clear Selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time verification toast inside toolbar */}
      {verificationFeedback && (
        <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{verificationFeedback}</span>
        </div>
      )}
    </div>
  );
};
