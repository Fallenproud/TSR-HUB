import React, { useState } from 'react';
import { X, Layers, Plus, Sparkles, Check } from 'lucide-react';
import { CategoryInfo } from '../../types';

interface NewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCategory: (category: CategoryInfo) => void;
}

const COLOR_OPTIONS = [
  { name: 'Indigo', hex: '#6366f1', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800' },
  { name: 'Emerald', hex: '#10b981', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' },
  { name: 'Blue', hex: '#3b82f6', badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' },
  { name: 'Purple', hex: '#8b5cf6', badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' },
  { name: 'Amber', hex: '#f59e0b', badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' },
  { name: 'Rose', hex: '#f43f5e', badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' },
  { name: 'Teal', hex: '#14b8a6', badge: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800' },
  { name: 'Pink', hex: '#ec4899', badge: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800' },
  { name: 'Sky', hex: '#0ea5e9', badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800' },
];

export const NewCategoryModal: React.FC<NewCategoryModalProps> = ({
  isOpen,
  onClose,
  onSaveCategory,
}) => {
  const [label, setLabel] = useState('');
  const [domainLead, setDomainLead] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const formattedId = label.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const selectedColor = COLOR_OPTIONS[selectedColorIndex];

    const newCategory: CategoryInfo = {
      id: formattedId,
      label: label.trim().toUpperCase(),
      count: 0,
      percentage: 0,
      color: selectedColor.hex,
      badgeColor: selectedColor.badge,
      description: description.trim() || 'Custom organizational category for enterprise skill management.',
      domainLead: domainLead.trim() || 'Unassigned Lead Architect',
    };

    onSaveCategory(newCategory);
    setLabel('');
    setDomainLead('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all flex flex-col">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Create Custom Category
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define a new organizational domain and capability cluster.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category Name / Identifier <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., AI RESEARCH or CLOUD SECURITY"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Domain Lead & Title
            </label>
            <input
              type="text"
              value={domainLead}
              onChange={(e) => setDomainLead(e.target.value)}
              placeholder="e.g., Dr. Maya Lin, VP of AI Systems"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description & Scope
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of skills belonging to this category..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Badge Color Accent
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setSelectedColorIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    selectedColorIndex === idx
                      ? 'ring-2 ring-indigo-500 font-semibold'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: `${opt.hex}15`, borderColor: opt.hex, color: opt.hex }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opt.hex }} />
                  <span>{opt.name}</span>
                  {selectedColorIndex === idx && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
