import { CategoryId, CategoryInfo } from '../types';

export const CATEGORIES_DATA: Record<CategoryId, CategoryInfo> = {
  GOVERN: {
    id: 'GOVERN',
    label: 'GOVERN',
    count: 4,
    percentage: 11.4,
    color: '#3b82f6', // blue
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    description: 'Corporate leadership, executive strategy, capital allocation, and program governance.',
    domainLead: 'Elena Rostova, Chief Strategy Officer',
  },
  CREATE: {
    id: 'CREATE',
    label: 'CREATE',
    count: 5,
    percentage: 14.3,
    color: '#10b981', // emerald
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    description: 'Product management, engineering leadership, design systems, data/AI architecture, and platform foundations.',
    domainLead: 'Marcus Vance, VP of Product & Design',
  },
  FUND: {
    id: 'FUND',
    label: 'FUND',
    count: 3,
    percentage: 8.6,
    color: '#f59e0b', // amber
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    description: 'Strategic FP&A forecasting, accounting/tax compliance, and corporate treasury liquidity.',
    domainLead: 'Sarah Chen, VP Finance',
  },
  GROW: {
    id: 'GROW',
    label: 'GROW',
    count: 4,
    percentage: 11.4,
    color: '#ec4899', // pink
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800',
    description: 'Revenue sales execution, marketing positioning, strategic partnerships, and customer success.',
    domainLead: 'David O\'Connor, Head of Growth',
  },
  STAFF: {
    id: 'STAFF',
    label: 'STAFF',
    count: 3,
    percentage: 8.6,
    color: '#8b5cf6', // purple
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    description: 'Talent acquisition, employee lifecycle operations, and executive leadership development.',
    domainLead: 'Amina Diallo, Chief People Officer',
  },
  GOVERN_RISK: {
    id: 'GOVERN_RISK',
    label: 'GOVERN RISK',
    count: 4,
    percentage: 11.4,
    color: '#6366f1', // indigo
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    description: 'Corporate legal governance, personal data privacy programs, compliance operations, and enterprise risk.',
    domainLead: 'Thomas Wright, General Counsel',
  },
  DEFEND: {
    id: 'DEFEND',
    label: 'DEFEND',
    count: 6,
    percentage: 17.1,
    color: '#8b5cf6', // violet
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700',
    description: 'Security engineering, application security, cloud/infra defense, IAM, detection/response, and GRC oversight.',
    domainLead: 'Kiran Patel, Chief Information Security Officer',
  },
  CHALLENGE: {
    id: 'CHALLENGE',
    label: 'CHALLENGE',
    count: 2,
    percentage: 5.7,
    color: '#f43f5e', // rose
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    description: 'Adversary red teaming, penetration testing, and defensive assumption challenge.',
    domainLead: 'Alex Thorne, Lead Offensive Engineer',
  },
  RECOVER: {
    id: 'RECOVER',
    label: 'RECOVER',
    count: 1,
    percentage: 2.9,
    color: '#d97706', // amber/orange
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
    description: 'Organizational and operational incident response coordination through recovery.',
    domainLead: 'Rachel Gomez, Incident Commander',
  },
  OPERATE: {
    id: 'OPERATE',
    label: 'OPERATE',
    count: 2,
    percentage: 5.7,
    color: '#0ea5e9', // sky
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    description: 'Infrastructure/SRE production reliability, and developer experience throughput.',
    domainLead: 'Liam Davies, VP Engineering Operations',
  },
  VERIFY: {
    id: 'VERIFY',
    label: 'VERIFY',
    count: 1,
    percentage: 2.9,
    color: '#14b8a6', // teal
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
    description: 'QA strategy, systematic reliability engineering, and formal release qualification.',
    domainLead: 'Sophia Martinez, Director of QA & Verification',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES_DATA);
