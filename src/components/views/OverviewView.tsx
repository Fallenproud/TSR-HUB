import React from 'react';
import { HeroBanner } from '../HeroBanner';
import { KpiCards } from '../KpiCards';
import { SkillsGrid } from '../SkillsGrid';
import { SkillDetailCard } from '../SkillDetailCard';
import { RightSidebar } from '../RightSidebar';
import { SkillItem, CategoryId, UserRole } from '../../types';

interface OverviewViewProps {
  skills: SkillItem[];
  selectedSkill: SkillItem | null;
  onSelectSkill: (skill: SkillItem | null) => void;
  activeCategoryFilter: CategoryId | 'ALL';
  onSelectCategoryFilter: (cat: CategoryId | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentRole: UserRole;
  onSelectView: (view: string) => void;
  onUpdateSkillTags?: (skillId: string, tags: string[]) => void;
  onEndorseSkill?: (skill: SkillItem) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  skills,
  selectedSkill,
  onSelectSkill,
  activeCategoryFilter,
  onSelectCategoryFilter,
  searchQuery,
  onSearchChange,
  currentRole,
  onSelectView,
  onUpdateSkillTags,
  onEndorseSkill,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Hero Banner (matching screenshot) */}
      <HeroBanner
        onOpenRegistry={() => onSelectView('skills')}
        onExploreSkills={() => onSelectView('skills')}
        onViewFileTree={() => onSelectView('files')}
      />

      {/* 2. Top 5 KPI Cards (matching screenshot) */}
      <KpiCards
        totalSkills={35}
        totalCategories={11}
        totalFiles={610}
        skillMdRatio="35 / 35"
        totalTests={70}
        onCardClick={(metric) => {
          if (metric === 'files') onSelectView('files');
          else if (metric === 'tests') onSelectView('tests');
          else if (metric === 'categories') onSelectView('categories');
          else onSelectView('skills');
        }}
      />

      {/* 3. Main Workspace: Skills Catalog + Selected Skill Detail + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8/9 Columns: Skills Grid and/or Expanded Inspector */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-6">
          {/* Active Skill Inspector Drawer (matching screenshot's 24 Security Engineering) */}
          {selectedSkill && (
            <div className="animate-in fade-in slide-in-from-top-3 duration-300">
              <SkillDetailCard
                skill={selectedSkill}
                onClose={() => onSelectSkill(null)}
                currentRole={currentRole}
                onSelectDependency={(depName) => {
                  const target = skills.find((s) => s.name.toLowerCase() === depName.toLowerCase());
                  if (target) onSelectSkill(target);
                }}
                onUpdateTags={onUpdateSkillTags}
                onEndorseSkill={onEndorseSkill}
              />
            </div>
          )}

          {/* Skills Grid */}
          <SkillsGrid
            skills={skills}
            selectedSkillId={selectedSkill?.id}
            onSelectSkill={(skill) => onSelectSkill(skill)}
            activeCategoryFilter={activeCategoryFilter}
            onSelectCategoryFilter={onSelectCategoryFilter}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />
        </div>

        {/* Right 4 Columns: Telemetry, Category Topology, Skill Coverage */}
        <div className="lg:col-span-4 xl:col-span-4">
          <RightSidebar
            onSelectCategoryFilter={onSelectCategoryFilter}
            activeCategoryFilter={activeCategoryFilter}
            onNavigateToInsights={() => onSelectView('insights')}
            totalSkillsCount={skills.length}
          />
        </div>
      </div>
    </div>
  );
};
