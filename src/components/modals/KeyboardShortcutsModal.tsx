import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Keyboard,
  X,
  Search,
  PlusCircle,
  FolderPlus,
  Moon,
  RefreshCw,
  Download,
  LayoutDashboard,
  Layers,
  FolderTree,
  FileCode,
  ShieldCheck,
  LineChart,
  Settings,
  Command,
  Mic,
} from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (actionId: string) => void;
}

interface ShortcutItem {
  id: string;
  name: string;
  description: string;
  keys: string[];
  category: 'Creation & Search' | 'View Navigation' | 'Actions & Tools';
  icon: React.ReactNode;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const shortcuts: ShortcutItem[] = [
    {
      id: 'cmd-palette',
      name: 'Command Palette / Search',
      description: 'Quickly find skills, jump to views, or run commands',
      keys: [modKey, 'K'],
      category: 'Creation & Search',
      icon: <Search className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: 'voice-dictation',
      name: 'Microphone Voice-to-Text Dictation',
      description: 'Dictate skill names, descriptions, or search queries hands-free',
      keys: ['Mic icon', 'or', 'Speech API'],
      category: 'Creation & Search',
      icon: <Mic className="w-4 h-4 text-rose-500" />,
    },
    {
      id: 'new-skill',
      name: 'Register New Skill Package',
      description: 'Open the canonical skill registration dialog',
      keys: [modKey, 'N'],
      category: 'Creation & Search',
      icon: <PlusCircle className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 'new-category',
      name: 'Create Skill Category',
      description: 'Define a new domain governance category',
      keys: [modKey, '⇧', 'C'],
      category: 'Creation & Search',
      icon: <FolderPlus className="w-4 h-4 text-cyan-500" />,
    },
    {
      id: 'nav-overview',
      name: 'Jump to Overview Dashboard',
      description: 'Active skill inspector & quick telemetry',
      keys: ['Alt', '1', 'or', 'g o'],
      category: 'View Navigation',
      icon: <LayoutDashboard className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: 'nav-skills',
      name: 'Jump to 35 Skills Catalog',
      description: 'Searchable skills matrix with batch operations',
      keys: ['Alt', '2', 'or', 'g s'],
      category: 'View Navigation',
      icon: <Layers className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: 'nav-categories',
      name: 'Jump to Domain Categories',
      description: '11 domain taxonomy governance pillars',
      keys: ['Alt', '3', 'or', 'g c'],
      category: 'View Navigation',
      icon: <FolderTree className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'nav-files',
      name: 'Jump to Virtual File Tree',
      description: 'Explore 610+ verified source artifacts',
      keys: ['Alt', '4', 'or', 'g f'],
      category: 'View Navigation',
      icon: <FileCode className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 'nav-tests',
      name: 'Jump to Contract Test Suite',
      description: 'Run and audit 70/70 contract tests',
      keys: ['Alt', '5', 'or', 'g t'],
      category: 'View Navigation',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 'nav-insights',
      name: 'Jump to D3 Analytics Hub',
      description: 'Matrix graphs & capability telemetry',
      keys: ['Alt', '6', 'or', 'g i'],
      category: 'View Navigation',
      icon: <LineChart className="w-4 h-4 text-cyan-500" />,
    },
    {
      id: 'nav-settings',
      name: 'Jump to Governance & Settings',
      description: 'RBAC, sync, and system notifications',
      keys: ['Alt', '7', 'or', 'g ,'],
      category: 'View Navigation',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
    },
    {
      id: 'action-theme',
      name: 'Toggle Dark / Light Theme',
      description: 'Switch between solarized dark and high-contrast light',
      keys: [modKey, 'D'],
      category: 'Actions & Tools',
      icon: <Moon className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'action-sync',
      name: 'Trigger Cloud Registry Sync',
      description: 'Force sync canonical skills state with remote backend',
      keys: [modKey, 'S'],
      category: 'Actions & Tools',
      icon: <RefreshCw className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 'action-export',
      name: 'Export CSV Matrix',
      description: 'Download the full skills catalog snapshot',
      keys: [modKey, '⇧', 'E'],
      category: 'Actions & Tools',
      icon: <Download className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 'action-help',
      name: 'Show Keyboard Shortcuts',
      description: 'Open this interactive cheat sheet anytime',
      keys: ['?'],
      category: 'Actions & Tools',
      icon: <Keyboard className="w-4 h-4 text-indigo-500" />,
    },
  ];

  const categories: Array<'Creation & Search' | 'View Navigation' | 'Actions & Tools'> = [
    'Creation & Search',
    'View Navigation',
    'Actions & Tools',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Power User Keyboard Shortcuts
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Navigate and execute registry workflows without lifting your hands from the keyboard.
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

            {/* Content list */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {categories.map((cat) => (
                <div key={cat} className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {cat}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {shortcuts.filter((s) => s.category === cat).length} shortcuts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {shortcuts
                      .filter((s) => s.category === cat)
                      .map((shortcut) => (
                        <button
                          key={shortcut.id}
                          onClick={() => {
                            if (onSelectAction) {
                              onSelectAction(shortcut.id);
                            }
                            onClose();
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                              {shortcut.icon}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {shortcut.name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {shortcut.description}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 pl-2">
                            {shortcut.keys.map((k, idx) => (
                              <React.Fragment key={idx}>
                                {k === 'or' ? (
                                  <span className="text-[10px] text-slate-400 font-mono">or</span>
                                ) : (
                                  <kbd className="px-2 py-1 rounded-md text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs group-hover:border-indigo-300 dark:group-hover:border-indigo-700">
                                    {k}
                                  </kbd>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer info banner */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Command className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">?</kbd> anywhere to open this dialog</span>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
