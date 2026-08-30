import React from 'react';
import {
  Boxes,
  LayoutGrid,
  FileCode2,
  FileCheck2,
  FlaskConical,
} from 'lucide-react';

interface KpiCardsProps {
  totalSkills: number;
  totalCategories: number;
  totalFiles: number;
  skillMdRatio: string;
  totalTests: number;
  onCardClick?: (metric: string) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  totalSkills = 35,
  totalCategories = 11,
  totalFiles = 610,
  skillMdRatio = '35 / 35',
  totalTests = 70,
  onCardClick,
}) => {
  const cards = [
    {
      id: 'skills',
      value: `${totalSkills}`,
      label: 'Skills',
      icon: Boxes,
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800',
    },
    {
      id: 'categories',
      value: `${totalCategories}`,
      label: 'Categories',
      icon: LayoutGrid,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800',
    },
    {
      id: 'files',
      value: `${totalFiles}`,
      label: 'Files',
      icon: FileCode2,
      iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800',
    },
    {
      id: 'skillmd',
      value: skillMdRatio,
      label: 'SKILL.md',
      icon: FileCheck2,
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800',
    },
    {
      id: 'tests',
      value: `${totalTests}`,
      label: 'Tests',
      icon: FlaskConical,
      iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onCardClick && onCardClick(card.id)}
            className="flex items-center gap-3.5 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${card.iconBg}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                {card.value}
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                {card.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
