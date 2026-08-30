import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2, CheckCircle2, Tag } from 'lucide-react';
import { SkillItem, CategoryId, CategoryInfo } from '../../types';
import { CATEGORY_LIST } from '../../data/categoriesData';
import { ALL_PRESET_TAGS } from '../../data/skillsData';

interface NewSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSkill: SkillItem) => void;
  nextNumber: string;
  categories?: CategoryInfo[];
}

export const NewSkillModal: React.FC<NewSkillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  nextNumber,
  categories = CATEGORY_LIST,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(categories[0]?.id || 'CREATE');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [complexity, setComplexity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [maintainer, setMaintainer] = useState('');
  const [inputTag, setInputTag] = useState('');
  const [inputs, setInputs] = useState<string[]>(['Business requirements']);
  const [outputTag, setOutputTag] = useState('');
  const [outputs, setOutputs] = useState<string[]>(['Canonical specification']);
  const [tags, setTags] = useState<string[]>(['#enterprise', '#production']);
  const [customTagInput, setCustomTagInput] = useState('');

  if (!isOpen) return null;

  const handleAddInput = () => {
    if (inputTag.trim()) {
      setInputs([...inputs, inputTag.trim()]);
      setInputTag('');
    }
  };

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().startsWith('#') ? tagToAdd.trim() : `#${tagToAdd.trim()}`;
    if (clean && clean !== '#' && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setCustomTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const skill: SkillItem = {
      id: `skill-${nextNumber}`,
      number: nextNumber,
      name: name.trim(),
      category: category as CategoryId,
      description: description.trim() || 'Canonical skill package.',
      purpose: purpose.trim() || 'Standard enterprise execution workflow.',
      requiredInputs: inputs,
      outputs,
      dependencies: ['Strategy'],
      tags: tags.length > 0 ? tags : ['#enterprise', '#production'],
      artifacts: {
        skillMd: 1,
        schemas: 2,
        prompts: 3,
        source: 12,
        tests: 8,
        examples: 4,
        changelog: 1,
      },
      status: 'Complete',
      version: '1.0.0',
      lastUpdated: new Date().toISOString().slice(0, 10),
      maintainer: maintainer.trim() || 'Enterprise Skill Architect',
      complexity,
      testPassRate: 100,
      skillMdContent: `# Skill: ${name} (${nextNumber})\n\n## Purpose\n${purpose}\n\n## Category: ${category}`,
    };

    onSave(skill);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Register New Enterprise Skill (#{nextNumber})
              </h2>
              <p className="text-xs text-slate-400">
                Author a canonical skill package with verified schemas and test suites.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Skill Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Prompt Engineering Architecture"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} ({c.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Short Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief 1-sentence summary of the skill's capability"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Purpose Statement
            </label>
            <textarea
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Explain the architectural outcomes and standard requirements..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Maintainer
              </label>
              <input
                type="text"
                value={maintainer}
                onChange={(e) => setMaintainer(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Complexity
              </label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value as 'Low' | 'Medium' | 'High')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Tag Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span>Skill Domain Tags</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(customTagInput);
                  }
                }}
                placeholder="Type custom tag (e.g. #cloud-native) and press enter..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono"
              />
              <button
                type="button"
                onClick={() => handleAddTag(customTagInput)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Add Tag
              </button>
            </div>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-mono flex items-center gap-1.5"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-indigo-400 hover:text-rose-500 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Quick Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[10px] text-slate-400">Suggestions:</span>
              {ALL_PRESET_TAGS.filter((pt) => !tags.includes(pt))
                .slice(0, 6)
                .map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => handleAddTag(pt)}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600"
                  >
                    + {pt}
                  </button>
                ))}
            </div>
          </div>

          {/* Required Inputs Tag Manager */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Required Inputs
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputTag}
                onChange={(e) => setInputTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInput();
                  }
                }}
                placeholder="Add input requirement (press enter)..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddInput}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {inputs.map((inp, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
                >
                  <span>{inp}</span>
                  <button
                    type="button"
                    onClick={() => setInputs(inputs.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              Register Skill Package
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
