import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './components/views/OverviewView';
import { SkillsView } from './components/views/SkillsView';
import { CategoriesView } from './components/views/CategoriesView';
import { FileTreeView } from './components/views/FileTreeView';
import { TestsView } from './components/views/TestsView';
import { InsightsView } from './components/views/InsightsView';
import { SettingsView } from './components/views/SettingsView';
import { NewSkillModal } from './components/modals/NewSkillModal';
import { CommandPalette } from './components/modals/CommandPalette';
import { NewCategoryModal } from './components/modals/NewCategoryModal';
import { KeyboardShortcutsModal } from './components/modals/KeyboardShortcutsModal';
import { OnboardingWalkthrough } from './components/onboarding/OnboardingWalkthrough';
import { NotificationPreferencesModal } from './components/notifications/NotificationPreferencesModal';
import { NotificationToast } from './components/notifications/NotificationToast';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { SKILLS_DATA } from './data/skillsData';
import { CATEGORY_LIST } from './data/categoriesData';
import { DEFAULT_NOTIFICATIONS, DEFAULT_NOTIFICATION_PREFERENCES } from './data/notificationsData';
import {
  SkillItem,
  SkillStatus,
  UserRole,
  SyncState,
  CategoryId,
  CategoryInfo,
  NotificationItem,
  NotificationPreferences,
} from './types';
import {
  exportSkillsToCSV,
  exportSkillsToJSON,
  exportSkillToMarkdown,
  printReport,
} from './utils/exportUtils';

export default function App() {
  // Global States
  const [skills, setSkills] = useState<SkillItem[]>(SKILLS_DATA);
  const [categories, setCategories] = useState<CategoryInfo[]>(CATEGORY_LIST);
  const [activeView, setActiveView] = useState<string>('overview');
  // Default selected skill is 24 Security Engineering (as in the target screenshot)
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(
    SKILLS_DATA.find((s) => s.number === '24') || SKILLS_DATA[0]
  );
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<CategoryId | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');

  // Pinned Skills State with Local Storage persistence
  const [pinnedSkillIds, setPinnedSkillIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tsr_pinned_skill_ids');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse pinned skill IDs from localStorage', e);
    }
    // Default initial pinned skills (24 Security Engineering, 01 Operating Rhythm, 08 AI Model Integration)
    const defaults = SKILLS_DATA.filter((s) => ['24', '01', '08'].includes(s.number)).map((s) => s.id);
    return defaults.length > 0 ? defaults : [SKILLS_DATA[0].id];
  });

  // Sync pinnedSkillIds to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tsr_pinned_skill_ids', JSON.stringify(pinnedSkillIds));
    } catch (e) {
      console.warn('Failed to save pinned skills to localStorage', e);
    }
  }, [pinnedSkillIds]);

  // Modals & Flows
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isNewSkillModalOpen, setIsNewSkillModalOpen] = useState<boolean>(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState<boolean>(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState<boolean>(false);
  const [isNotificationPreferencesModalOpen, setIsNotificationPreferencesModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    // Check if user has already seen the walkthrough
    return localStorage.getItem('tsr_onboarding_completed') !== 'true';
  });

  // Global Keyboard Shortcut Listener for Power Users (Ctrl+K, Ctrl+N, etc.)
  useGlobalShortcuts({
    onToggleCommandPalette: () => setIsCommandPaletteOpen((prev) => !prev),
    onOpenNewSkill: () => setIsNewSkillModalOpen(true),
    onOpenNewCategory: () => setIsNewCategoryModalOpen(true),
    onOpenShortcutsHelp: () => setIsShortcutsHelpOpen((prev) => !prev),
    onToggleDarkMode: () => setIsDarkMode((prev) => !prev),
    onTriggerSync: () => handleManualSync(),
    onExportCSV: () => exportSkillsToCSV(skills),
    onSelectView: (view: string) => {
      setActiveView(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onCloseModals: () => {
      setIsCommandPaletteOpen(false);
      setIsNewSkillModalOpen(false);
      setIsNewCategoryModalOpen(false);
      setIsShortcutsHelpOpen(false);
      setIsNotificationPreferencesModalOpen(false);
      setIsOnboardingOpen(false);
      setIsMobileSidebarOpen(false);
    },
    currentRole,
  });

  // Notifications State & Preferences
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [activeToasts, setActiveToasts] = useState<NotificationItem[]>([]);

  // Cloud Sync state
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSynced: 'Just now',
    cloudRegion: 'us-central1',
    status: 'connected',
    latencyMs: 38,
  });

  // Dark Mode side effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Periodic simulated background sync & real-time notification simulation
  useEffect(() => {
    const syncInterval = setInterval(() => {
      setSyncState((prev) => ({
        ...prev,
        lastSynced: 'Just now',
        latencyMs: Math.floor(25 + Math.random() * 20),
      }));
    }, 45000);

    return () => clearInterval(syncInterval);
  }, []);

  const handleManualSync = () => {
    setSyncState((prev) => ({ ...prev, isSyncing: true }));
    setTimeout(() => {
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSynced: 'Just now',
        latencyMs: Math.floor(22 + Math.random() * 15),
      }));
    }, 1200);
  };

  const handleExport = (format: 'csv' | 'json' | 'markdown' | 'pdf') => {
    if (format === 'csv') {
      exportSkillsToCSV(skills);
    } else if (format === 'json') {
      exportSkillsToJSON(skills);
    } else if (format === 'markdown') {
      if (selectedSkill) {
        exportSkillToMarkdown(selectedSkill);
      } else {
        exportSkillToMarkdown(skills[0]);
      }
    } else if (format === 'pdf') {
      printReport();
    }
  };

  // Helper to trigger a live toast and add to notification feed
  const triggerNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: 'Just now',
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Check if toast is enabled in preferences for this channel/type
    if (notificationPreferences.browserPush || notificationPreferences.inAppToasts) {
      setActiveToasts((prev) => [...prev, newNotif]);
    }
  };

  const handleDismissToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleSimulateNotification = () => {
    const randomSkill = skills[Math.floor(Math.random() * skills.length)];
    const events = [
      {
        type: 'test' as const,
        title: 'Continuous Verification Passed',
        message: `Automated test suite completed for Skill #${randomSkill.number} "${randomSkill.name}" with 100% pass rate.`,
        skillNumber: randomSkill.number,
        skillName: randomSkill.name,
      },
      {
        type: 'certification' as const,
        title: 'SOC2 Compliance Certification Verified',
        message: `Security baseline for Skill #${randomSkill.number} verified against SOC2 Type II standard.`,
        skillNumber: randomSkill.number,
        skillName: randomSkill.name,
      },
      {
        type: 'endorsement' as const,
        title: 'Peer Architecture Endorsement',
        message: `Principal Architect verified skill package contracts for "${randomSkill.name}".`,
        skillNumber: randomSkill.number,
        skillName: randomSkill.name,
      },
    ];
    const picked = events[Math.floor(Math.random() * events.length)];
    triggerNotification(picked);
  };

  // Category Management: create custom category
  const handleSaveCategory = (newCat: CategoryInfo) => {
    setCategories((prev) => [...prev, newCat]);
    triggerNotification({
      type: 'role_change',
      title: 'New Skill Category Created',
      message: `Category "${newCat.label}" (${newCat.id}) was successfully registered in the taxonomy.`,
      skillName: newCat.label,
    });
  };

  // Skill Management: add new skill package
  const handleAddNewSkill = (newSkill: SkillItem) => {
    setSkills((prev) => [newSkill, ...prev]);
    setSelectedSkill(newSkill);
    setActiveView('overview');

    // Update count in category
    setCategories((prev) =>
      prev.map((c) => (c.id === newSkill.category ? { ...c, count: c.count + 1 } : c))
    );

    triggerNotification({
      type: 'endorsement',
      title: 'Skill Package Registered',
      message: `Skill #${newSkill.number} "${newSkill.name}" has been authored and published.`,
      skillNumber: newSkill.number,
      skillName: newSkill.name,
    });
  };

  // Skill Tag Updates
  const handleUpdateSkillTags = (skillId: string, tags: string[]) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, tags } : s))
    );
    if (selectedSkill && selectedSkill.id === skillId) {
      setSelectedSkill((prev) => (prev ? { ...prev, tags } : null));
    }
  };

  // Immediate Single Skill Direct Update (from Quick Edit Slide-Out)
  const handleUpdateSkill = (updatedSkill: SkillItem) => {
    setSkills((prev) => {
      const updated = prev.map((s) => (s.id === updatedSkill.id ? updatedSkill : s));
      updateCategoriesCount(updated);
      return updated;
    });

    if (selectedSkill && selectedSkill.id === updatedSkill.id) {
      setSelectedSkill(updatedSkill);
    }
  };

  // Endorse Skill handler
  const handleEndorseSkill = (skill: SkillItem) => {
    triggerNotification({
      type: 'endorsement',
      title: `Skill Endorsement Recorded`,
      message: `You endorsed Skill #${skill.number} "${skill.name}". Verification rating updated.`,
      skillNumber: skill.number,
      skillName: skill.name,
    });
  };

  // Helper to recalculate category counts
  const updateCategoriesCount = (updatedSkills: SkillItem[]) => {
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        count: updatedSkills.filter((s) => s.category === c.id && !s.isArchived).length,
      }))
    );
  };

  // Batch Tagging Handler
  const handleBatchTagSkills = (skillIds: string[], tagsToAdd: string[], tagsToRemove?: string[]) => {
    setSkills((prev) => {
      const updated = prev.map((s) => {
        if (!skillIds.includes(s.id)) return s;
        let newTags = [...(s.tags || [])];
        if (tagsToAdd && tagsToAdd.length > 0) {
          tagsToAdd.forEach((t) => {
            if (!newTags.includes(t)) newTags.push(t);
          });
        }
        if (tagsToRemove && tagsToRemove.length > 0) {
          newTags = newTags.filter((t) => !tagsToRemove.includes(t));
        }
        return { ...s, tags: newTags };
      });
      return updated;
    });

    if (selectedSkill && skillIds.includes(selectedSkill.id)) {
      setSelectedSkill((prev) => {
        if (!prev) return null;
        let newTags = [...(prev.tags || [])];
        tagsToAdd?.forEach((t) => {
          if (!newTags.includes(t)) newTags.push(t);
        });
        if (tagsToRemove) {
          newTags = newTags.filter((t) => !tagsToRemove.includes(t));
        }
        return { ...prev, tags: newTags };
      });
    }

    triggerNotification({
      type: 'system',
      title: 'Batch Tags Updated',
      message: `Updated tags for ${skillIds.length} skills successfully.`,
    });
  };

  // Batch Move Category Handler
  const handleBatchMoveCategory = (skillIds: string[], targetCategory: CategoryId) => {
    setSkills((prev) => {
      const updated = prev.map((s) =>
        skillIds.includes(s.id) ? { ...s, category: targetCategory } : s
      );
      updateCategoriesCount(updated);
      return updated;
    });

    if (selectedSkill && skillIds.includes(selectedSkill.id)) {
      setSelectedSkill((prev) => (prev ? { ...prev, category: targetCategory } : null));
    }

    triggerNotification({
      type: 'role_change',
      title: 'Batch Category Reassigned',
      message: `Moved ${skillIds.length} skills to category "${targetCategory}".`,
    });
  };

  // Batch Archive / Restore Handler
  const handleBatchArchiveSkills = (skillIds: string[], archive: boolean) => {
    setSkills((prev) => {
      const updated = prev.map((s) =>
        skillIds.includes(s.id) ? { ...s, isArchived: archive } : s
      );
      updateCategoriesCount(updated);
      return updated;
    });

    if (selectedSkill && skillIds.includes(selectedSkill.id)) {
      setSelectedSkill((prev) => (prev ? { ...prev, isArchived: archive } : null));
    }

    triggerNotification({
      type: 'system',
      title: archive ? 'Skills Archived' : 'Skills Restored',
      message: `${archive ? 'Archived' : 'Restored'} ${skillIds.length} skill packages.`,
    });
  };

  // Batch Delete Handler
  const handleBatchDeleteSkills = (skillIds: string[]) => {
    setSkills((prev) => {
      const updated = prev.filter((s) => !skillIds.includes(s.id));
      updateCategoriesCount(updated);
      return updated;
    });

    if (selectedSkill && skillIds.includes(selectedSkill.id)) {
      setSelectedSkill(null);
    }

    triggerNotification({
      type: 'system',
      title: 'Skills Deleted',
      message: `Removed ${skillIds.length} skills from the catalog.`,
    });
  };

  // Batch Status Handler
  const handleBatchStatusSkills = (skillIds: string[], status: SkillStatus) => {
    setSkills((prev) =>
      prev.map((s) => (skillIds.includes(s.id) ? { ...s, status } : s))
    );

    if (selectedSkill && skillIds.includes(selectedSkill.id)) {
      setSelectedSkill((prev) => (prev ? { ...prev, status } : null));
    }

    triggerNotification({
      type: 'system',
      title: 'Skill Status Updated',
      message: `Updated status to "${status}" for ${skillIds.length} skills.`,
    });
  };

  // Batch Verification Handler
  const handleBatchVerifySkills = (skillIds: string[]) => {
    setSkills((prev) =>
      prev.map((s) =>
        skillIds.includes(s.id)
          ? { ...s, testPassRate: 100, status: 'Complete' as SkillStatus }
          : s
      )
    );

    triggerNotification({
      type: 'test',
      title: 'Batch Verification Completed',
      message: `Validation suite verified ${skillIds.length} skills with 100% pass rate.`,
    });
  };

  // Pinned Skills Handler
  const handleTogglePinSkill = (skillId: string) => {
    const targetSkill = skills.find((s) => s.id === skillId);
    const isCurrentlyPinned = pinnedSkillIds.includes(skillId);
    const nextPinnedIds = isCurrentlyPinned
      ? pinnedSkillIds.filter((id) => id !== skillId)
      : [...pinnedSkillIds, skillId];

    setPinnedSkillIds(nextPinnedIds);

    // Update isPinned flag on skill items
    setSkills((prev) =>
      prev.map((s) =>
        s.id === skillId ? { ...s, isPinned: !isCurrentlyPinned } : s
      )
    );

    if (selectedSkill && selectedSkill.id === skillId) {
      setSelectedSkill((prev) => (prev ? { ...prev, isPinned: !isCurrentlyPinned } : null));
    }

    if (targetSkill) {
      if (!isCurrentlyPinned) {
        triggerNotification({
          type: 'endorsement',
          title: 'Skill Pinned to Sidebar',
          message: `Pinned #${targetSkill.number} "${targetSkill.name}" for instant quick access.`,
          skillNumber: targetSkill.number,
          skillName: targetSkill.name,
        });
      } else {
        triggerNotification({
          type: 'system',
          title: 'Skill Unpinned',
          message: `Removed #${targetSkill.number} "${targetSkill.name}" from your pinned shortcuts.`,
          skillNumber: targetSkill.number,
          skillName: targetSkill.name,
        });
      }
    }
  };

  const pinnedSkills = skills.filter((s) => pinnedSkillIds.includes(s.id));

  // Filter skills according to search and category
  const filteredSkills = skills.filter((s) => {
    const matchesCat =
      activeCategoryFilter === 'ALL' || s.category === activeCategoryFilter;
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.includes(searchQuery) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.tags && s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 antialiased flex flex-col">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onChangeRole={setCurrentRole}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        syncState={syncState}
        onTriggerSync={handleManualSync}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNewSkillModal={() => setIsNewSkillModalOpen(true)}
        onOpenNewCategoryModal={() => setIsNewCategoryModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenShortcutsHelp={() => setIsShortcutsHelpOpen(true)}
        activeView={activeView}
        onSelectView={setActiveView}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onClearAllNotifications={handleClearAllNotifications}
        onOpenNotificationPreferences={() => setIsNotificationPreferencesModalOpen(true)}
        onSimulateNotificationEvent={handleSimulateNotification}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Body Layout: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Desktop Static + Mobile Collapsible Off-Canvas Drawer) */}
        <Sidebar
          activeView={activeView}
          onSelectView={(view) => {
            setActiveView(view);
            setIsMobileSidebarOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          skillsCount={skills.length}
          categoriesCount={categories.length}
          filesCount={610}
          testsCount={70}
          currentRole={currentRole}
          pinnedSkills={pinnedSkills}
          onSelectPinnedSkill={(skill) => {
            setSelectedSkill(skill);
            setActiveView('overview');
            setIsMobileSidebarOpen(false);
          }}
          onTogglePinSkill={handleTogglePinSkill}
          selectedSkillId={selectedSkill?.id}
          onOpenOnboarding={() => {
            setIsOnboardingOpen(true);
            setIsMobileSidebarOpen(false);
          }}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Center Main Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full"
            >
              {activeView === 'overview' && (
                <OverviewView
                  skills={filteredSkills}
                  selectedSkill={selectedSkill}
                  onSelectSkill={(skill) => setSelectedSkill(skill)}
                  activeCategoryFilter={activeCategoryFilter}
                  onSelectCategoryFilter={setActiveCategoryFilter}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  currentRole={currentRole}
                  onSelectView={setActiveView}
                  onUpdateSkillTags={handleUpdateSkillTags}
                  onEndorseSkill={handleEndorseSkill}
                  onTogglePinSkill={handleTogglePinSkill}
                  pinnedSkillIds={pinnedSkillIds}
                />
              )}

              {activeView === 'skills' && (
                <SkillsView
                  skills={skills}
                  currentRole={currentRole}
                  onOpenNewSkillModal={() => setIsNewSkillModalOpen(true)}
                  onSelectSkill={(skill) => setSelectedSkill(skill)}
                  selectedSkill={selectedSkill}
                  categories={categories}
                  onUpdateSkill={handleUpdateSkill}
                  onUpdateSkillTags={handleUpdateSkillTags}
                  onEndorseSkill={handleEndorseSkill}
                  onBatchTagSkills={handleBatchTagSkills}
                  onBatchMoveCategory={handleBatchMoveCategory}
                  onBatchArchiveSkills={handleBatchArchiveSkills}
                  onBatchDeleteSkills={handleBatchDeleteSkills}
                  onBatchStatusSkills={handleBatchStatusSkills}
                  onBatchVerifySkills={handleBatchVerifySkills}
                  onTogglePinSkill={handleTogglePinSkill}
                  pinnedSkillIds={pinnedSkillIds}
                />
              )}

              {activeView === 'categories' && (
                <CategoriesView
                  categories={categories}
                  skills={skills}
                  onSelectSkill={(skill) => {
                    setSelectedSkill(skill);
                    setActiveView('overview');
                  }}
                  onOpenNewCategoryModal={() => setIsNewCategoryModalOpen(true)}
                />
              )}

              {activeView === 'files' && <FileTreeView />}

              {activeView === 'tests' && <TestsView currentRole={currentRole} />}

              {activeView === 'insights' && (
                <InsightsView
                  skills={skills}
                  categories={categories}
                  selectedSkillId={selectedSkill?.id}
                  onSelectSkill={(skill) => {
                    setSelectedSkill(skill);
                    setActiveView('overview');
                  }}
                />
              )}

              {activeView === 'settings' && (
                <SettingsView
                  currentRole={currentRole}
                  onChangeRole={setCurrentRole}
                  syncState={syncState}
                  onTriggerSync={handleManualSync}
                  notificationPreferences={notificationPreferences}
                  onUpdateNotificationPreferences={setNotificationPreferences}
                  onOpenNotificationPreferences={() => setIsNotificationPreferencesModalOpen(true)}
                  onOpenOnboarding={() => setIsOnboardingOpen(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Modals & Overlay Workflows */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectSkill={(skill) => {
          setSelectedSkill(skill);
          setActiveView('overview');
        }}
        onSelectView={(view) => setActiveView(view)}
        onOpenNewSkill={() => setIsNewSkillModalOpen(true)}
        onOpenNewCategory={() => setIsNewCategoryModalOpen(true)}
        onOpenShortcutsHelp={() => setIsShortcutsHelpOpen(true)}
        skills={skills}
        pinnedSkillIds={pinnedSkillIds}
        onTogglePinSkill={handleTogglePinSkill}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
        onSelectAction={(actionId) => {
          if (actionId === 'cmd-palette') setIsCommandPaletteOpen(true);
          else if (actionId === 'new-skill') setIsNewSkillModalOpen(true);
          else if (actionId === 'new-category') setIsNewCategoryModalOpen(true);
          else if (actionId === 'nav-overview') setActiveView('overview');
          else if (actionId === 'nav-skills') setActiveView('skills');
          else if (actionId === 'nav-categories') setActiveView('categories');
          else if (actionId === 'nav-files') setActiveView('files');
          else if (actionId === 'nav-tests') setActiveView('tests');
          else if (actionId === 'nav-insights') setActiveView('insights');
          else if (actionId === 'nav-settings') setActiveView('settings');
          else if (actionId === 'action-theme') setIsDarkMode((prev) => !prev);
          else if (actionId === 'action-sync') handleManualSync();
          else if (actionId === 'action-export') exportSkillsToCSV(skills);
        }}
      />

      <NewSkillModal
        isOpen={isNewSkillModalOpen}
        onClose={() => setIsNewSkillModalOpen(false)}
        onSave={handleAddNewSkill}
        nextNumber={String(skills.length + 1).padStart(2, '0')}
        categories={categories}
      />

      <NewCategoryModal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />

      <NotificationPreferencesModal
        isOpen={isNotificationPreferencesModalOpen}
        onClose={() => setIsNotificationPreferencesModalOpen(false)}
        preferences={notificationPreferences}
        onSave={(newPrefs) => {
          setNotificationPreferences(newPrefs);
          triggerNotification({
            type: 'role_change',
            title: 'Notification Preferences Updated',
            message: 'Your alerting channels and subscription filters have been saved.',
          });
        }}
      />

      <OnboardingWalkthrough
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={() => setIsOnboardingOpen(false)}
        onNavigateTab={(tab) => {
          setActiveView(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Real-Time Notification Toasts Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {activeToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9, transition: { duration: 0.15 } }}
              layout
              className="pointer-events-auto"
            >
              <NotificationToast
                notification={toast}
                onDismiss={handleDismissToast}
                onAction={(notif) => {
                  if (notif.skillNumber) {
                    const target = skills.find((s) => s.number === notif.skillNumber);
                    if (target) {
                      setSelectedSkill(target);
                      setActiveView('overview');
                    }
                  }
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
