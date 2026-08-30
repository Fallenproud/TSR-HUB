import { useEffect } from 'react';
import { UserRole } from '../types';

export interface ShortcutHandlers {
  onToggleCommandPalette: () => void;
  onOpenNewSkill: () => void;
  onOpenNewCategory: () => void;
  onOpenShortcutsHelp: () => void;
  onToggleDarkMode: () => void;
  onTriggerSync: () => void;
  onExportCSV: () => void;
  onSelectView: (view: string) => void;
  onCloseModals: () => void;
  currentRole?: UserRole;
  isAnyModalOpen?: boolean;
}

/**
 * Global Keyboard Shortcut Listener for TSR Power Users
 * Supports macOS (Cmd) & Windows/Linux (Ctrl, Alt)
 */
export function useGlobalShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    let lastKey = '';
    let keyTimeout: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const target = e.target as HTMLElement;

      // Ignore standard character typing when inside an editable input / textarea
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // 1. ESCAPE: Close active modals / palette regardless of focus
      if (e.key === 'Escape') {
        handlers.onCloseModals();
        return;
      }

      // 2. Command Palette: Cmd+K / Ctrl+K
      if (cmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        handlers.onToggleCommandPalette();
        return;
      }

      // 3. New Skill: Cmd+N / Ctrl+N or Alt+N or Ctrl+Shift+N
      if (
        ((cmdOrCtrl || e.altKey) && e.key.toLowerCase() === 'n' && !e.shiftKey) ||
        (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'n')
      ) {
        // Prevent default browser new window
        e.preventDefault();
        e.stopPropagation();
        handlers.onOpenNewSkill();
        return;
      }

      // 4. New Category: Cmd+Shift+C / Ctrl+Shift+C or Alt+C
      if (
        (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'c') ||
        (e.altKey && e.key.toLowerCase() === 'c')
      ) {
        e.preventDefault();
        e.stopPropagation();
        handlers.onOpenNewCategory();
        return;
      }

      // 5. Help / Cheat Sheet: ? (Shift+/) or Cmd+/ or Ctrl+/
      if (
        (e.key === '?' && !isInput) ||
        (cmdOrCtrl && e.key === '/')
      ) {
        e.preventDefault();
        e.stopPropagation();
        handlers.onOpenShortcutsHelp();
        return;
      }

      // 6. Toggle Theme: Cmd+Shift+D / Ctrl+Shift+D or Alt+D
      if (
        (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'd') ||
        (e.altKey && e.key.toLowerCase() === 'd')
      ) {
        e.preventDefault();
        e.stopPropagation();
        handlers.onToggleDarkMode();
        return;
      }

      // 7. Manual Cloud Sync: Cmd+Shift+S / Ctrl+Shift+S or Alt+S
      if (
        (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 's') ||
        (e.altKey && e.key.toLowerCase() === 's')
      ) {
        e.preventDefault();
        e.stopPropagation();
        handlers.onTriggerSync();
        return;
      }

      // 8. Export CSV: Cmd+Shift+E / Ctrl+Shift+E or Alt+E
      if (
        (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'e') ||
        (e.altKey && e.key.toLowerCase() === 'e')
      ) {
        e.preventDefault();
        e.stopPropagation();
        handlers.onExportCSV();
        return;
      }

      // 9. Numeric Tab Jumps: Alt+1 ... Alt+7 (works across all browsers)
      if (e.altKey && !isInput) {
        if (e.key === '1') {
          e.preventDefault();
          handlers.onSelectView('overview');
          return;
        } else if (e.key === '2') {
          e.preventDefault();
          handlers.onSelectView('skills');
          return;
        } else if (e.key === '3') {
          e.preventDefault();
          handlers.onSelectView('categories');
          return;
        } else if (e.key === '4') {
          e.preventDefault();
          handlers.onSelectView('files');
          return;
        } else if (e.key === '5') {
          e.preventDefault();
          handlers.onSelectView('tests');
          return;
        } else if (e.key === '6') {
          e.preventDefault();
          handlers.onSelectView('insights');
          return;
        } else if (e.key === '7') {
          e.preventDefault();
          handlers.onSelectView('settings');
          return;
        }
      }

      // 10. Vim-style sequence jumps (e.g., 'g' then 's' for skills) when not typing in input
      if (!isInput && !cmdOrCtrl && !e.altKey) {
        const key = e.key.toLowerCase();
        if (lastKey === 'g') {
          if (key === 'o') {
            handlers.onSelectView('overview');
          } else if (key === 's') {
            handlers.onSelectView('skills');
          } else if (key === 'c') {
            handlers.onSelectView('categories');
          } else if (key === 'f') {
            handlers.onSelectView('files');
          } else if (key === 't') {
            handlers.onSelectView('tests');
          } else if (key === 'i') {
            handlers.onSelectView('insights');
          } else if (key === 'e') {
            handlers.onSelectView('settings');
          }
          lastKey = '';
          if (keyTimeout) clearTimeout(keyTimeout);
          return;
        }

        if (key === 'g') {
          lastKey = 'g';
          if (keyTimeout) clearTimeout(keyTimeout);
          keyTimeout = setTimeout(() => {
            lastKey = '';
          }, 1000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      if (keyTimeout) clearTimeout(keyTimeout);
    };
  }, [handlers]);
}
