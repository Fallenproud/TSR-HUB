import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Layers,
  FileCode,
  CheckCircle2,
  ArrowRight,
  Shield,
  LayoutDashboard,
  LineChart,
  Settings,
  FolderTree,
  ShieldCheck,
  PlusCircle,
  FolderPlus,
  Moon,
  RefreshCw,
  Download,
  Keyboard,
  Sparkles,
  Mic,
} from 'lucide-react';
import { SkillItem } from '../../types';
import { SKILLS_DATA } from '../../data/skillsData';
import { CATEGORY_LIST } from '../../data/categoriesData';
import { VoiceInputButton } from '../common/VoiceInputButton';
import { Star } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSkill: (skill: SkillItem) => void;
  onSelectView: (view: string) => void;
  onOpenNewSkill?: () => void;
  onOpenNewCategory?: () => void;
  onOpenShortcutsHelp?: () => void;
  skills?: SkillItem[];
  pinnedSkillIds?: string[];
  onTogglePinSkill?: (skillId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectSkill,
  onSelectView,
  onOpenNewSkill,
  onOpenNewCategory,
  onOpenShortcutsHelp,
  skills = SKILLS_DATA,
  pinnedSkillIds = [],
  onTogglePinSkill,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const activeSkills = skills.length > 0 ? skills : SKILLS_DATA;

  const matchedSkills = activeSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.number.includes(query) ||
      s.category.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase()) ||
      (s.tags && s.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())))
  ).slice(0, 8);

  const pinnedMatchedSkills = activeSkills.filter(
    (s) => (s.isPinned || pinnedSkillIds.includes(s.id)) &&
    (!query || s.name.toLowerCase().includes(query.toLowerCase()) || s.number.includes(query))
  );

  const matchedCategories = CATEGORY_LIST.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.id.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const quickViews = [
    { id: 'overview', name: 'Overview Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5 text-indigo-500" />, shortcut: 'Alt+1' },
    { id: 'skills', name: '35 Skills Catalog', icon: <Layers className="w-3.5 h-3.5 text-indigo-500" />, shortcut: 'Alt+2' },
    { id: 'categories', name: '11 Domain Categories', icon: <FolderTree className="w-3.5 h-3.5 text-amber-500" />, shortcut: 'Alt+3' },
    { id: 'files', name: 'Virtual File Tree (610+)', icon: <FileCode className="w-3.5 h-3.5 text-blue-500" />, shortcut: 'Alt+4' },
    { id: 'tests', name: 'Contract Test Suite (70/70)', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />, shortcut: 'Alt+5' },
    { id: 'insights', name: 'D3 Real-Time Analytics', icon: <LineChart className="w-3.5 h-3.5 text-cyan-500" />, shortcut: 'Alt+6' },
    { id: 'settings', name: 'Settings & Governance', icon: <Settings className="w-3.5 h-3.5 text-slate-400" />, shortcut: 'Alt+7' },
  ].filter((v) => !query || v.name.toLowerCase().includes(query.toLowerCase()));

  // Global Key listeners for inside palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] z-10"
          >
            {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type or dictate a skill (e.g. '24', 'Security'), category, or view..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice Search Button */}
          <VoiceInputButton
            size="sm"
            mode="replace"
            title="Dictate search query"
            onTranscript={(spokenText) => {
              setQuery(spokenText);
              inputRef.current?.focus();
            }}
          />

          <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 border border-slate-200 dark:border-slate-700 hidden sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Scrollable Results */}
        <div className="p-3 overflow-y-auto space-y-4 text-xs">
          {/* Quick Actions if query is empty or matches */}
          {(!query || query.toLowerCase().includes('new') || query.toLowerCase().includes('create') || query.toLowerCase().includes('help')) && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Quick Actions</span>
                <span className="text-[9px] text-slate-400 lowercase font-normal">press key combinations</span>
              </div>
              <div className="space-y-1">
                {onOpenNewSkill && (
                  <button
                    onClick={() => {
                      onOpenNewSkill();
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between text-slate-700 dark:text-slate-200 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <PlusCircle className="w-4 h-4 text-emerald-500" />
                      <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                        + Register New Skill Package
                      </span>
                    </div>
                    <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 border border-slate-200 dark:border-slate-700">
                      {modKey}+N
                    </kbd>
                  </button>
                )}

                {onOpenNewCategory && (
                  <button
                    onClick={() => {
                      onOpenNewCategory();
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-cyan-50 dark:hover:bg-cyan-950/40 flex items-center justify-between text-slate-700 dark:text-slate-200 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderPlus className="w-4 h-4 text-cyan-500" />
                      <span className="font-semibold text-cyan-900 dark:text-cyan-300">
                        + Create Skill Category
                      </span>
                    </div>
                    <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 border border-slate-200 dark:border-slate-700">
                      {modKey}+⇧+C
                    </kbd>
                  </button>
                )}

                {onOpenShortcutsHelp && (
                  <button
                    onClick={() => {
                      onOpenShortcutsHelp();
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center justify-between text-slate-700 dark:text-slate-200 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Keyboard className="w-4 h-4 text-indigo-500" />
                      <span className="font-semibold text-indigo-900 dark:text-indigo-300">
                        View Keyboard Shortcuts Cheat Sheet
                      </span>
                    </div>
                    <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 border border-slate-200 dark:border-slate-700">
                      ?
                    </kbd>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Pinned Skills Quick Access */}
          {pinnedMatchedSkills.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>Pinned Skills ({pinnedMatchedSkills.length})</span>
              </div>
              <div className="space-y-1">
                {pinnedMatchedSkills.map((skill) => (
                  <div
                    key={`pinned-${skill.id}`}
                    onClick={() => {
                      onSelectSkill(skill);
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left bg-amber-50/40 dark:bg-amber-950/30 hover:bg-amber-50 dark:hover:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-slate-900 dark:text-white group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold text-xs shrink-0">
                        {skill.number}
                      </span>
                      <span className="font-semibold truncate">{skill.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100/70 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 uppercase font-mono shrink-0">
                        {skill.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onTogglePinSkill && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePinSkill(skill.id);
                          }}
                          className="p-1 text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 rounded transition-colors"
                          title="Unpin skill"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                        </button>
                      )}
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 font-medium flex items-center gap-1">
                        Open <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Canonical Skills */}
          {matchedSkills.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Canonical Skills ({matchedSkills.length})
              </div>
              <div className="space-y-1">
                {matchedSkills.map((skill) => {
                  const isPinned = skill.isPinned || pinnedSkillIds.includes(skill.id);
                  return (
                    <div
                      key={skill.id}
                      onClick={() => {
                        onSelectSkill(skill);
                        onClose();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center justify-between text-slate-900 dark:text-white group transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-slate-400 font-bold text-xs shrink-0">
                          {skill.number}
                        </span>
                        <span className="font-semibold truncate">{skill.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono shrink-0">
                          {skill.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {onTogglePinSkill && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePinSkill(skill.id);
                            }}
                            className={`p-1 rounded transition-colors ${
                              isPinned
                                ? 'text-amber-500'
                                : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 opacity-0 group-hover:opacity-100'
                            }`}
                            title={isPinned ? 'Unpin skill' : 'Pin skill'}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                isPinned ? 'fill-amber-500 text-amber-500' : ''
                              }`}
                            />
                          </button>
                        )}
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 font-medium flex items-center gap-1">
                          Inspect <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Categories */}
          {matchedCategories.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Categories ({matchedCategories.length})
              </div>
              <div className="space-y-1">
                {matchedCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectView('categories');
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center justify-between text-slate-900 dark:text-white group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold">{cat.label}</span>
                      <span className="text-[10px] text-slate-400">
                        {cat.count} Skills • Lead: {cat.domainLead}
                      </span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {cat.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Views */}
          {quickViews.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Navigation Views
              </div>
              <div className="space-y-1">
                {quickViews.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => {
                      onSelectView(view.id);
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200 group"
                  >
                    <div className="flex items-center gap-2.5">
                      {view.icon}
                      <span>{view.name}</span>
                    </div>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700">
                      {view.shortcut}
                    </kbd>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span>Navigation: <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">Alt+1..7</kbd></span>
              <span>New: <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">{modKey}+N</kbd></span>
            </div>
            <div className="text-slate-400">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">ESC</kbd> to exit
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
  );
};
