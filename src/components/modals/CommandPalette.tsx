import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Layers, FileCode, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { SkillItem } from '../../types';
import { SKILLS_DATA } from '../../data/skillsData';
import { CATEGORY_LIST } from '../../data/categoriesData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSkill: (skill: SkillItem) => void;
  onSelectView: (view: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectSkill,
  onSelectView,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchedSkills = SKILLS_DATA.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.number.includes(query) ||
      s.category.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  const matchedCategories = CATEGORY_LIST.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search skills (e.g. 'Security Engineering' or '24'), categories, or commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
          <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500">
            ESC
          </kbd>
        </div>

        <div className="p-3 max-h-80 overflow-y-auto space-y-4 text-xs">
          {/* Quick Views */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quick Views
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onSelectView('overview');
                  onClose();
                }}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
              >
                <span>🏠 Overview Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  onSelectView('insights');
                  onClose();
                }}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
              >
                <span>📈 D3 Real-Time Analytics & Force Graph</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  onSelectView('files');
                  onClose();
                }}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200"
              >
                <span>🌲 Virtual File Tree (610+ Files)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Matched Skills */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Canonical Skills ({matchedSkills.length})
            </div>
            <div className="space-y-1">
              {matchedSkills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => {
                    onSelectSkill(skill);
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center justify-between text-slate-900 dark:text-white group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-slate-400 font-bold text-xs">
                      {skill.number}
                    </span>
                    <span className="font-semibold">{skill.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                      {skill.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 font-medium">
                    Inspect →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
