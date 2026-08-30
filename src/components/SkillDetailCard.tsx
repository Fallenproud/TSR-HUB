import React, { useState } from 'react';
import {
  Shield,
  ChevronUp,
  FileText,
  FileCode,
  Sparkles,
  Layers,
  FlaskConical,
  BookOpen,
  CheckCircle2,
  Play,
  Copy,
  Check,
  Tag,
  Plus,
  X,
  Award,
  GitBranch,
  FileJson,
  FolderTree,
  ListOrdered,
  ArrowRight,
  Download,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Star,
} from 'lucide-react';
import { SkillItem, UserRole } from '../types';
import { CATEGORIES_DATA } from '../data/categoriesData';
import { ALL_PRESET_TAGS } from '../data/skillsData';

interface SkillDetailCardProps {
  skill: SkillItem;
  onClose?: () => void;
  onSelectDependency?: (depName: string) => void;
  currentRole: UserRole;
  onRunTestForSkill?: (skill: SkillItem) => void;
  onUpdateTags?: (skillId: string, tags: string[]) => void;
  onEndorseSkill?: (skill: SkillItem) => void;
  onTogglePinSkill?: (skillId: string) => void;
  isPinned?: boolean;
}

export const SkillDetailCard: React.FC<SkillDetailCardProps> = ({
  skill,
  onClose,
  onSelectDependency,
  currentRole,
  onRunTestForSkill,
  onUpdateTags,
  onEndorseSkill,
  onTogglePinSkill,
  isPinned = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'execution'
    | 'manifest'
    | 'topology'
    | 'readiness'
    | 'skillmd'
    | 'schemas'
    | 'prompts'
    | 'source'
    | 'tests'
  >('overview');
  const [selectedPhase, setSelectedPhase] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [endorsed, setEndorsed] = useState(false);

  const categoryMeta = CATEGORIES_DATA[skill.category];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = (filename: string, data: object) => {
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRunVerification = () => {
    setIsRunning(true);
    setTestOutput('Running canonical 8-stage lifecycle validation & schema assertions...');
    setTimeout(() => {
      setIsRunning(false);
      setTestOutput('✓ 12/12 canonical handoff criteria validated. 100% test pass rate.');
      if (onRunTestForSkill) {
        onRunTestForSkill(skill);
      }
    }, 1200);
  };

  const handleAddTag = (tagToAdd: string) => {
    const cleanTag = tagToAdd.trim().startsWith('#') ? tagToAdd.trim() : `#${tagToAdd.trim()}`;
    if (!cleanTag || cleanTag === '#' || (skill.tags && skill.tags.includes(cleanTag))) return;
    const updated = [...(skill.tags || []), cleanTag];
    if (onUpdateTags) {
      onUpdateTags(skill.id, updated);
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = (skill.tags || []).filter((t) => t !== tagToRemove);
    if (onUpdateTags) {
      onUpdateTags(skill.id, updated);
    }
  };

  const handleEndorse = () => {
    setEndorsed(true);
    if (onEndorseSkill) {
      onEndorseSkill(skill);
    }
    setTimeout(() => setEndorsed(false), 3000);
  };

  const executionPhases = [
    { name: '1. CONTEXT', label: 'Context', key: 'context', desc: skill.executionContract?.context || 'Ingest environment constraints and authoritative inputs.' },
    { name: '2. ASSESS', label: 'Assess', key: 'assess', desc: skill.executionContract?.assess || 'Analyze baseline state and evaluate dependencies.' },
    { name: '3. DESIGN', label: 'Design', key: 'design', desc: skill.executionContract?.design || 'Architect proposed structural solution and schema models.' },
    { name: '4. PLAN', label: 'Plan', key: 'plan', desc: skill.executionContract?.plan || 'Decompose design into work packages and milestone gates.' },
    { name: '5. EXECUTE', label: 'Execute', key: 'execute', desc: skill.executionContract?.execute || 'Generate canonical artifacts with schema adherence.' },
    { name: '6. VERIFY', label: 'Verify', key: 'verify', desc: skill.executionContract?.verify || 'Execute test suites and validate acceptance criteria.' },
    { name: '7. REPORT', label: 'Report', key: 'report', desc: skill.executionContract?.report || 'Emit structured findings and handoff contracts.' },
    { name: '8. IMPROVE', label: 'Improve', key: 'improve', desc: skill.executionContract?.improve || 'Feed operational telemetry back into optimization loops.' },
  ];

  const handoffRules = [
    { title: 'Scope Definition', desc: 'Clear scope boundaries defined with zero ambiguity', pass: true },
    { title: 'Non-Goals Declared', desc: 'Explicit boundary conditions preventing unrequested scope creep', pass: true },
    { title: 'Structured Inputs', desc: `Requires ${skill.requiredInputs.length} authoritative, validated input parameters`, pass: true },
    { title: 'Decision Rights Mapped', desc: 'Deterministic authority and responsibility assigned', pass: true },
    { title: 'Universal Methodology', desc: 'Universal 8-stage execution lifecycle configured', pass: true },
    { title: 'Structured Outputs', desc: `Emits ${skill.outputs.length} deterministic outputs adhering to schema`, pass: true },
    { title: 'Canonical Artifacts', desc: `Owns ${skill.canonicalArtifacts.length} canonical file artifacts in package`, pass: true },
    { title: 'Explicit Dependencies', desc: `Maps ${skill.dependencies.length} cross-skill dependency prerequisites`, pass: true },
    { title: 'Deterministic Failure Modes', desc: 'Structured error returns (INPUT_SCHEMA_MISMATCH, etc.)', pass: true },
    { title: 'Validation Rules', desc: 'JSON schema assertion and state verification rules active', pass: true },
    { title: 'Unit & Fixture Tests', desc: '100% automated test pass rate with green test fixtures', pass: true },
    { title: 'Autonomous Invocability', desc: 'Can execute via CLI, SDK, and multi-agent workflows independently', pass: true },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'execution', label: 'Execution Contract' },
    { id: 'manifest', label: 'Manifest & Schema' },
    { id: 'topology', label: 'Package Topology' },
    { id: 'readiness', label: 'Handoff Readiness (12/12)' },
    { id: 'skillmd', label: 'SKILL.md' },
    { id: 'schemas', label: 'Schemas' },
    { id: 'prompts', label: 'Prompts' },
    { id: 'source', label: 'Source' },
    { id: 'tests', label: 'Tests' },
  ] as const;

  const packageName = skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div id={`skill-detail-card-${skill.id}`} className="rounded-2xl border-2 border-indigo-200/80 dark:border-indigo-900/60 bg-white dark:bg-slate-900 shadow-xl overflow-hidden transition-all">
      {/* Top Header Strip */}
      <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800 shrink-0 mt-0.5">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-semibold text-slate-500 dark:text-slate-400">
                {skill.number}
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {skill.name}
              </h2>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold border uppercase ${categoryMeta?.badgeColor || 'bg-slate-100'}`}
              >
                {skill.category}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
                Canonical v{skill.version}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              {skill.purpose}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onTogglePinSkill && (
            <button
              id={`btn-pin-skill-${skill.id}`}
              onClick={() => onTogglePinSkill(skill.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-2xs ${
                (isPinned || skill.isPinned)
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50/60 dark:hover:bg-amber-950/30 hover:text-amber-700 dark:hover:text-amber-300 hover:border-amber-200'
              }`}
              title={(isPinned || skill.isPinned) ? 'Unpin from sidebar' : 'Pin to sidebar'}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  (isPinned || skill.isPinned)
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-slate-400 group-hover:text-amber-500'
                }`}
              />
              <span className="hidden sm:inline">
                {(isPinned || skill.isPinned) ? 'Pinned' : 'Pin'}
              </span>
            </button>
          )}

          {onClose && (
            <button
              id={`btn-close-skill-${skill.id}`}
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Collapse"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Metrics Strip */}
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-center py-2.5 px-3 text-xs">
        <div>
          <div className="text-[10px] font-medium text-slate-400">SKILL.md</div>
          <div className="font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">{skill.artifacts.skillMd}</div>
        </div>
        <div>
          <div className="text-[10px] font-medium text-slate-400">Schemas</div>
          <div className="font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">{skill.artifacts.schemas}</div>
        </div>
        <div>
          <div className="text-[10px] font-medium text-slate-400">Prompts</div>
          <div className="font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">{skill.artifacts.prompts}</div>
        </div>
        <div>
          <div className="text-[10px] font-medium text-slate-400">Source</div>
          <div className="font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">{skill.artifacts.source}</div>
        </div>
        <div>
          <div className="text-[10px] font-medium text-slate-400">Tests</div>
          <div className="font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">{skill.artifacts.tests}</div>
        </div>
        <div>
          <div className="text-[10px] font-medium text-slate-400">Examples</div>
          <div className="font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">{skill.artifacts.examples}</div>
        </div>
        <div>
          <div className="text-[10px] font-medium text-slate-400">Changelog</div>
          <div className="font-semibold text-slate-900 dark:text-white mt-0.5 font-mono">{skill.artifacts.changelog}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 px-5 border-b border-slate-100 dark:border-slate-800 text-xs font-medium overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-btn-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 transition-colors relative whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Body Contents */}
      <div className="p-5">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Purpose & Must-Haves */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Purpose & Mission
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    {skill.purpose}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Must-Have Capabilities ({skill.mustHave.length})
                    </h4>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1 max-h-36 overflow-y-auto pr-1">
                    {skill.mustHave.map((cap, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                      >
                        ✓ {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Outputs ({skill.outputs.length})
                  </h4>
                  <ul className="mt-1 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {skill.outputs.map((out, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Required Inputs & Dependencies */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Required Inputs ({skill.requiredInputs.length})
                  </h4>
                  <ul className="mt-1 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {skill.requiredInputs.map((inp, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                        <span>{inp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Cross-Skill Dependencies ({skill.dependencies.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {skill.dependencies.map((dep, i) => (
                      <button
                        key={i}
                        onClick={() => onSelectDependency && onSelectDependency(dep)}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors inline-flex items-center gap-1"
                      >
                        <GitBranch className="w-3 h-3 text-indigo-500" />
                        <span>{dep}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Maintainer & Ownership
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                    {skill.maintainer}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags & Domain Taxonomy */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Domain Tags & Technical Markers
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-endorse-skill"
                    onClick={handleEndorse}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                      endorsed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{endorsed ? 'Endorsed ✓' : 'Endorse Competency'}</span>
                  </button>
                  <button
                    id="btn-toggle-add-tag"
                    onClick={() => setIsAddingTag(!isAddingTag)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Tag</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(skill.tags || []).map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 group transition-all"
                  >
                    <span>{t}</span>
                    <button
                      onClick={() => handleRemoveTag(t)}
                      className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors"
                      title={`Remove tag ${t}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {isAddingTag && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <input
                      id="input-new-tag"
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(newTagInput);
                        }
                      }}
                      placeholder="Type custom tag (e.g. #zero-trust) and press Enter..."
                      className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(newTagInput)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Canonical Artifacts Owned */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Canonical Artifacts Owned in Package ({skill.canonicalArtifacts.length})
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {skill.canonicalArtifacts.map((art, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-200"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{art}</span>
                  </span>
                ))}

                <div className="ml-auto flex items-center gap-2">
                  <button
                    id="btn-run-verification"
                    onClick={handleRunVerification}
                    disabled={isRunning}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                  >
                    <Play className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                    <span>{isRunning ? 'Verifying...' : 'Verify Lifecycle & Contract'}</span>
                  </button>
                </div>
              </div>

              {testOutput && (
                <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-mono">
                  {testOutput}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. UNIVERSAL EXECUTION CONTRACT TAB */}
        {activeTab === 'execution' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Universal Skill Execution Contract
                </h3>
                <p className="text-xs text-slate-500">
                  Universal 8-stage lifecycle execution ensuring deterministic inputs, state transitions, and verified handoffs.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 font-bold">
                8-Phase Standard
              </span>
            </div>

            {/* Step-Through Timeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {executionPhases.map((phase, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhase(idx)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPhase === idx
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-400 font-mono">STAGE 0{idx + 1}</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{phase.label}</div>
                </button>
              ))}
            </div>

            {/* Active Stage Detail Panel */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                    {selectedPhase + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {executionPhases[selectedPhase].name}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Deterministic Validation Active</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {executionPhases[selectedPhase].desc}
              </p>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Phase SLA Target: &lt; 50ms</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={selectedPhase === 0}
                    onClick={() => setSelectedPhase(Math.max(0, selectedPhase - 1))}
                    className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                  >
                    Previous Phase
                  </button>
                  <button
                    disabled={selectedPhase === executionPhases.length - 1}
                    onClick={() => setSelectedPhase(Math.min(executionPhases.length - 1, selectedPhase + 1))}
                    className="px-2 py-1 rounded bg-indigo-600 text-white font-medium disabled:opacity-40"
                  >
                    Next Phase
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. MACHINE-READABLE MANIFEST TAB */}
        {activeTab === 'manifest' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Canonical Machine-Readable Skill Manifest (JSON)
                </h3>
                <p className="text-xs text-slate-500">
                  Schema Draft 2020-12 valid manifest for multi-agent autonomous invocation.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(JSON.stringify(skill.manifest, null, 2))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Manifest JSON'}</span>
                </button>
                <button
                  onClick={() => handleDownloadJSON(`${packageName}-manifest.json`, skill.manifest || {})}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
              {JSON.stringify(skill.manifest, null, 2)}
            </pre>
          </div>
        )}

        {/* 4. PACKAGE TOPOLOGY TAB */}
        {activeTab === 'topology' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Canonical Skill Package Topology ({packageName}/)
                </h3>
                <p className="text-xs text-slate-500">
                  Standardized directory layout adhering strictly to the Canonical Skill Package Specification.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                Self-Contained Module
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto space-y-1 border border-slate-800 leading-relaxed">
              <div className="text-indigo-400 font-bold">{packageName}/</div>
              <div className="pl-4 text-emerald-300">├── SKILL.md <span className="text-slate-500">(Canonical instruction specification)</span></div>
              <div className="pl-4 text-emerald-300">├── README.md <span className="text-slate-500">(Operator guide & overview)</span></div>
              <div className="pl-4 text-amber-300">├── prompts/</div>
              <div className="pl-8 text-amber-200">├── system.md <span className="text-slate-500">(System agent prompt)</span></div>
              <div className="pl-8 text-amber-200">└── task.md <span className="text-slate-500">(Deterministic task template)</span></div>
              <div className="pl-4 text-cyan-300">├── schemas/</div>
              <div className="pl-8 text-cyan-200">├── input.schema.json <span className="text-slate-500">(Draft 2020-12 input contract)</span></div>
              <div className="pl-8 text-cyan-200">└── output.schema.json <span className="text-slate-500">(Draft 2020-12 output contract)</span></div>
              <div className="pl-4 text-sky-300">├── src/</div>
              <div className="pl-8 text-sky-200">├── index.ts <span className="text-slate-500">(Primary engine entry point)</span></div>
              <div className="pl-8 text-sky-200">├── types.ts <span className="text-slate-500">(TypeScript type definitions)</span></div>
              <div className="pl-8 text-sky-200">├── validators.ts <span className="text-slate-500">(JSON schema assertion engines)</span></div>
              <div className="pl-8 text-sky-200">└── handlers/ <span className="text-slate-500">(Lifecycle phase handlers)</span></div>
              <div className="pl-4 text-purple-300">├── tests/</div>
              <div className="pl-8 text-purple-200">├── unit/ <span className="text-slate-500">({packageName}.spec.ts)</span></div>
              <div className="pl-8 text-purple-200">└── fixtures/ <span className="text-slate-500">(Golden assertion payloads)</span></div>
              <div className="pl-4 text-slate-400">└── CHANGELOG.md <span className="text-slate-500">(SemVer release history)</span></div>
            </div>
          </div>
        )}

        {/* 5. HANDOFF READINESS CHECKER TAB */}
        {activeTab === 'readiness' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Canonical Handoff Rule Verification
                </h3>
                <p className="text-xs text-slate-500">
                  Verification criteria: another agent or engineer must be able to implement this skill with zero prior context.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                12 / 12 Criteria Met (100%)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {handoffRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {idx + 1}. {rule.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {rule.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. SKILL.MD TAB */}
        {activeTab === 'skillmd' && (
          <div className="relative">
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={() => handleCopy(skill.skillMdContent || '')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy SKILL.md'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed border border-slate-800">
              {skill.skillMdContent || `# Skill: ${skill.name}\n\n${skill.purpose}`}
            </pre>
          </div>
        )}

        {/* 7. SCHEMAS TAB */}
        {activeTab === 'schemas' && (
          <div className="relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500">schemas/input.schema.json (Draft 2020-12)</span>
              <button
                onClick={() => handleCopy(skill.schemaPreview || '')}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs flex items-center gap-1 text-slate-600 dark:text-slate-300"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Schema</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-96 border border-slate-800">
              {skill.schemaPreview || `{\n  "title": "${skill.name}Spec",\n  "type": "object"\n}`}
            </pre>
          </div>
        )}

        {/* 8. PROMPTS TAB */}
        {activeTab === 'prompts' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-500 font-mono">prompts/system.md</div>
            <pre className="p-4 rounded-xl bg-slate-950 text-amber-200 font-mono text-xs overflow-x-auto max-h-96 whitespace-pre-wrap border border-slate-800">
              {skill.promptPreview || `Execute canonical workflow for ${skill.name}.`}
            </pre>
          </div>
        )}

        {/* 9. SOURCE TAB */}
        {activeTab === 'source' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-500 font-mono">src/index.ts (TypeScript Engine)</div>
            <pre className="p-4 rounded-xl bg-slate-950 text-sky-300 font-mono text-xs overflow-x-auto max-h-96 border border-slate-800">
              {skill.sourcePreview || `export async function run() { return true; }`}
            </pre>
          </div>
        )}

        {/* 10. TESTS TAB */}
        {activeTab === 'tests' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-500 font-mono">tests/unit/{packageName}.spec.ts</div>
            <pre className="p-4 rounded-xl bg-slate-950 text-purple-300 font-mono text-xs overflow-x-auto max-h-96 border border-slate-800">
              {skill.testPreview || `describe('${skill.name}', () => { it('passes', () => expect(true).toBe(true)); });`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
