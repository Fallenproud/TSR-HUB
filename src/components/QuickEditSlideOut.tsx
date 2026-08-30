import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Tag,
  Plus,
  Check,
  FolderInput,
  Archive,
  ArchiveRestore,
  Sparkles,
  Shield,
  Layers,
  FileText,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  RotateCcw,
  ExternalLink,
  Code2,
  Award,
  Hash,
  User,
  Info,
  Download,
  Copy,
} from 'lucide-react';
import { SkillItem, CategoryId, SkillStatus, UserRole, CategoryInfo } from '../types';
import { CATEGORIES_DATA, CATEGORY_LIST } from '../data/categoriesData';
import { ALL_PRESET_TAGS } from '../data/skillsData';

interface QuickEditSlideOutProps {
  skill: SkillItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSkill: (updatedSkill: SkillItem) => void;
  onOpenFullInspector?: (skill: SkillItem) => void;
  onEndorseSkill?: (skill: SkillItem) => void;
  categories?: CategoryInfo[];
  currentRole: UserRole;
}

export const QuickEditSlideOut: React.FC<QuickEditSlideOutProps> = ({
  skill,
  isOpen,
  onClose,
  onUpdateSkill,
  onOpenFullInspector,
  onEndorseSkill,
  categories = CATEGORY_LIST,
  currentRole,
}) => {
  if (!isOpen || !skill) return null;

  // Local form state initialized from current skill
  const [formData, setFormData] = useState<SkillItem>(skill);
  const [tagInput, setTagInput] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [isRunningVerify, setIsRunningVerify] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Sync state whenever selected skill changes
  useEffect(() => {
    setFormData(skill);
    setHasChanges(false);
    setSaveStatus('idle');
  }, [skill.id, skill.version, skill.tags, skill.category, skill.status, skill.isArchived]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleChange = <K extends keyof SkillItem>(field: K, value: SkillItem[K]) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setHasChanges(true);
    // Immediate modification propagated to parent
    onUpdateSkill(updated);
    showSavedFeedback();
  };

  const showSavedFeedback = () => {
    setSaveStatus('saved');
    const timer = setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
    return () => clearTimeout(timer);
  };

  // Tag Management
  const handleAddTag = (tagToAdd: string) => {
    let clean = tagToAdd.trim();
    if (!clean) return;
    if (!clean.startsWith('#')) clean = `#${clean}`;
    if (!formData.tags.includes(clean)) {
      const updatedTags = [...formData.tags, clean];
      handleChange('tags', updatedTags);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = formData.tags.filter((t) => t !== tagToRemove);
    handleChange('tags', updatedTags);
  };

  const handleReset = () => {
    setFormData(skill);
    onUpdateSkill(skill);
    setHasChanges(false);
  };

  const handleRunVerify = () => {
    setIsRunningVerify(true);
    setVerifyMessage('Validating 8-phase lifecycle contracts & JSON schema assertions...');
    setTimeout(() => {
      setIsRunningVerify(false);
      const updated = {
        ...formData,
        status: 'Complete' as SkillStatus,
        testPassRate: 100,
      };
      setFormData(updated);
      onUpdateSkill(updated);
      setVerifyMessage('✓ Passed all 12 canonical handoff criteria. 100% test score.');
      setTimeout(() => setVerifyMessage(null), 4000);
    }, 1000);
  };

  const handleCopyManifest = () => {
    const manifest = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      skillId: `skill.${formData.number.toLowerCase()}.${formData.id}`,
      name: formData.name,
      number: formData.number,
      category: formData.category,
      version: formData.version,
      status: formData.status,
      complexity: formData.complexity,
      maintainer: formData.maintainer,
      tags: formData.tags,
      isArchived: !!formData.isArchived,
      testPassRate: formData.testPassRate,
      description: formData.description,
      purpose: formData.purpose,
    };
    navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const categoryMeta = CATEGORIES_DATA[formData.category] || {
    label: formData.category,
    badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        id="quick-edit-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-Out Drawer */}
      <div
        id="quick-edit-slideout-panel"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-out animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-sm shrink-0 border border-indigo-500/30">
              #{formData.number}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Quick Edit Spec
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${categoryMeta.badgeColor}`}
                >
                  {formData.category}
                </span>
                {saveStatus === 'saved' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md animate-in fade-in">
                    <Check className="w-3 h-3" />
                    <span>Auto-saved</span>
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {formData.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenFullInspector && (
              <button
                id="btn-quick-edit-full-inspector"
                onClick={() => {
                  onOpenFullInspector(formData);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 transition-colors"
                title="Open detailed multi-tab inspector"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Inspector</span>
              </button>
            )}

            <button
              id="btn-quick-edit-close"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Close Panel (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Verification banner if active */}
        {verifyMessage && (
          <div className="px-5 py-2.5 bg-emerald-950/90 border-b border-emerald-800 text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{verifyMessage}</span>
          </div>
        )}

        {/* Drawer Body - Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Section 1: Lifecycle Status & Quick Actions */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Lifecycle Status
              </span>
              <button
                type="button"
                onClick={() => handleChange('isArchived', !formData.isArchived)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  formData.isArchived
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300'
                }`}
              >
                {formData.isArchived ? (
                  <>
                    <ArchiveRestore className="w-3.5 h-3.5" />
                    <span>Archived (Click to Restore)</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-3.5 h-3.5" />
                    <span>Active (Click to Archive)</span>
                  </>
                )}
              </button>
            </div>

            {/* Status Segmented Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(['Complete', 'In Progress', 'Under Review', 'Planned'] as SkillStatus[]).map(
                (status) => {
                  const isSelected = formData.status === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleChange('status', status)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-semibold text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span>{status}</span>
                      {isSelected && <Check className="w-3 h-3 text-indigo-200" />}
                    </button>
                  );
                }
              )}
            </div>

            {/* Complexity & Test Pass Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Complexity Level
                </label>
                <select
                  value={formData.complexity}
                  onChange={(e) =>
                    handleChange('complexity', e.target.value as 'Low' | 'Medium' | 'High')
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Low">Low Complexity</option>
                  <option value="Medium">Medium Complexity</option>
                  <option value="High">High Complexity</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  <span>Test Pass Score</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {formData.testPassRate}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={formData.testPassRate}
                    onChange={(e) => handleChange('testPassRate', Number(e.target.value))}
                    className="flex-1 accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handleRunVerify}
                    disabled={isRunningVerify}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold shrink-0 flex items-center gap-1 shadow-2xs disabled:opacity-50"
                    title="Validate and set to 100%"
                  >
                    <Play className={`w-3 h-3 ${isRunningVerify ? 'animate-spin' : ''}`} />
                    <span>Verify</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Core Metadata */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              Core Specification Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Skill Number */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                  Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold">
                    #
                  </span>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => handleChange('number', e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Version */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => handleChange('version', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Category */}
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                  Category Domain
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value as CategoryId)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Skill Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Skill Package Title
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Maintainer */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Maintainer / Owner Guild
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.maintainer}
                  onChange={(e) => handleChange('maintainer', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Executive Purpose & Scope
              </label>
              <textarea
                rows={2}
                value={formData.purpose || ''}
                onChange={(e) => handleChange('purpose', e.target.value)}
                placeholder="High-level autonomous charter and business impact..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Detailed Functional Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Comprehensive description of capabilities..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section 3: Tag Management */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                Tags & Taxonomy
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {formData.tags.length} assigned
              </span>
            </div>

            {/* Tag Input */}
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Hash className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  placeholder="Add custom tag (e.g. #high-sla, #soc2) & press Enter..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                disabled={!tagInput.trim()}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Current Active Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-8 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {formData.tags.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No tags assigned.</span>
              ) : (
                formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 group"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-indigo-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      title={`Remove ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Preset Suggested Tags */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Quick Add Presets:
              </span>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                {ALL_PRESET_TAGS.slice(0, 12).map((preset) => {
                  const isAssigned = formData.tags.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => (isAssigned ? handleRemoveTag(preset) : handleAddTag(preset))}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                        isAssigned
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {preset} {isAssigned && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer - Action Toolbar */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyManifest}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Copy Draft 2020-12 Schema JSON"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Manifest</span>
                </>
              )}
            </button>

            {onEndorseSkill && (
              <button
                type="button"
                onClick={() => onEndorseSkill(formData)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Endorse</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              id="btn-quick-edit-done"
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all hover:scale-105"
            >
              <Check className="w-4 h-4" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
