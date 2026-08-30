import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  Layers,
  Tag,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  FileCode2,
} from 'lucide-react';

interface OnboardingWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView?: (view: string) => void;
}

interface StepData {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  badge: string;
  highlights: { title: string; desc: string }[];
  targetView?: string;
  actionHint: string;
}

const ONBOARDING_STEPS: StepData[] = [
  {
    title: 'Welcome to Technical Skills Registry',
    subtitle: 'Enterprise Capability & Schema Governance Platform',
    description:
      'The Technical Skills Registry (TSR) is your single source of truth for 35 production capabilities, canonical SKILL.md specs, automated test suites, and cross-discipline team topologies.',
    icon: Compass,
    iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    badge: 'Step 1 of 6 • Overview',
    highlights: [
      { title: '35 Production Skills', desc: 'Covering 11 canonical domains from Governance to Security.' },
      { title: '610 Canonical Artifacts', desc: 'Schemas, prompt templates, test suites, and implementation code.' },
      { title: 'D3 Data Visualizations', desc: 'Real-time capability matrices, dependency graphs, and health telemetry.' },
    ],
    targetView: 'overview',
    actionHint: 'Explore the central overview hub with key performance indicators and skill detail inspector.',
  },
  {
    title: 'Role-Based Access Control (RBAC)',
    subtitle: 'Fine-Grained Permissions & Domain Governance',
    description:
      'TSR provides tailored views and permission tiers for Enterprise Admins, Skill Architects, Security Leads, and Read-Only Viewers to enforce enterprise compliance and SOC2 auditing standards.',
    icon: Shield,
    iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    badge: 'Step 2 of 6 • RBAC Engine',
    highlights: [
      { title: 'Enterprise Admin', desc: 'Create/archive skills, manage custom categories, and configure cloud sync.' },
      { title: 'Skill Architect', desc: 'Author JSON schemas, write prompt templates, and execute verification suites.' },
      { title: 'Security & Compliance', desc: 'Audit code against zero-trust frameworks and track certification expiries.' },
    ],
    actionHint: 'Switch roles anytime using the RBAC dropdown in the top navigation bar.',
  },
  {
    title: 'Real-Time Notification System',
    subtitle: 'Live Event Streaming & Certification Tracking',
    description:
      'Stay continuously informed with real-time push alerts for skill endorsements, expiring compliance certifications (SOC2, ISO 27001), RBAC policy modifications, and test suite results.',
    icon: Bell,
    iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    badge: 'Step 3 of 6 • Notifications',
    highlights: [
      { title: 'Instant Endorsement Alerts', desc: 'Receive real-time notifications when team leads endorse skill capabilities.' },
      { title: 'Expiring Certifications', desc: 'Automated 14/30-day proactive warnings before compliance audit windows expire.' },
      { title: 'Preference Manager', desc: 'Granular controls for in-app vs email alerts, digests, and priority thresholds.' },
    ],
    actionHint: 'Access the notification bell in the top header to manage unread alerts or simulate live events.',
  },
  {
    title: 'Skill Categorization & Smart Tagging',
    subtitle: 'Multi-Dimensional Taxonomy & Tag Filtering',
    description:
      'Organize your technical competencies effortlessly. Create custom categories with assigned domain leads and tag skills with rich markers like #zero-trust, #ai-ready, #cloud-native, and #pci-dss.',
    icon: Tag,
    iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    badge: 'Step 4 of 6 • Tagging & Taxonomy',
    highlights: [
      { title: 'Custom Categories', desc: 'Add new organizational domains with tailored descriptions and color tokens.' },
      { title: 'Multi-Tag Assignment', desc: 'Add or remove custom tags on any skill directly from the detail inspector.' },
      { title: 'Instant Tag Filtering', desc: 'Filter skills across the catalogue using interactive tag chips and search.' },
    ],
    targetView: 'skills',
    actionHint: 'Click on tag chips in the skills view to filter competencies by technical specialty.',
  },
  {
    title: 'Real-Time D3 Analytics & Insights',
    subtitle: 'Interactive Telemetry & Dependency Topology',
    description:
      'Harness responsive D3.js data visualizations to track skill activity over time, inspect cross-skill dependency topologies, and audit test coverage pass rates in real time.',
    icon: BarChart3,
    iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    badge: 'Step 5 of 6 • Analytics',
    highlights: [
      { title: 'D3 Activity Chart', desc: 'Visual velocity tracking updates and test runs across all categories.' },
      { title: 'Interactive Topology Graph', desc: 'Inspect upstream and downstream dependencies between skills.' },
      { title: 'Test Coverage Matrix', desc: 'Real-time telemetry on assertion pass rates and execution durations.' },
    ],
    targetView: 'insights',
    actionHint: 'Visit the Insights tab in the sidebar to interact with real-time D3 visualization canvases.',
  },
  {
    title: 'Registering Skills & Report Exports',
    subtitle: 'Canonical Spec Authoring & Executive Reports',
    description:
      'Easily register new enterprise skills with full input/output contracts, and export reports in CSV matrix, JSON schemas, Markdown specifications, or printable executive compliance PDFs.',
    icon: FileCode2,
    iconColor: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800',
    badge: 'Step 6 of 6 • Actions & Exports',
    highlights: [
      { title: 'Register Skill Modal', desc: 'Form wizard with automatic number assignment, category selection, and tags.' },
      { title: 'Multi-Format Export', desc: 'One-click exports for CSV matrices, JSON schemas, and SKILL.md bundles.' },
      { title: 'Executive Print Dossier', desc: 'Printable executive PDF report for board and compliance audits.' },
    ],
    targetView: 'overview',
    actionHint: 'Click the "Export" or "+ Register New Skill" button in the header to get started.',
  },
];

export const OnboardingWalkthrough: React.FC<OnboardingWalkthroughProps> = ({
  isOpen,
  onClose,
  onNavigateToView,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const StepIcon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      if (step.targetView && onNavigateToView) {
        onNavigateToView(step.targetView);
      }
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      const prevIndex = currentStep - 1;
      setCurrentStep(prevIndex);
      if (ONBOARDING_STEPS[prevIndex].targetView && onNavigateToView) {
        onNavigateToView(ONBOARDING_STEPS[prevIndex].targetView!);
      }
    }
  };

  const handleJumpToStep = (idx: number) => {
    setCurrentStep(idx);
    if (ONBOARDING_STEPS[idx].targetView && onNavigateToView) {
      onNavigateToView(ONBOARDING_STEPS[idx].targetView!);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all flex flex-col">
        {/* Top Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden">
          <div
            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${step.iconColor}`}>
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {step.badge}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
                {step.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Dismiss walkthrough"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            {step.subtitle}
          </p>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {step.description}
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {step.highlights.map((h, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{h.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Action Hint Box */}
          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="font-medium">
              <strong className="font-semibold">Pro-tip:</strong> {step.actionHint}
            </span>
          </div>
        </div>

        {/* Step Indicator Navigation Dots */}
        <div className="px-6 py-2 flex items-center justify-center gap-2">
          {ONBOARDING_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleJumpToStep(idx)}
              className={`h-2 rounded-full transition-all ${
                currentStep === idx
                  ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                  : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
              }`}
              title={`Jump to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Skip Walkthrough
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 transition-colors ${
                isFirst
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white transition-all shadow-sm"
            >
              <span>{isLast ? 'Get Started' : 'Next Step'}</span>
              {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
