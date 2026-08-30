import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
  CheckCheck,
  ShieldCheck,
} from 'lucide-react';
import { generateAllTestSuites } from '../../data/testsData';
import { TestSuiteResult, UserRole } from '../../types';

interface TestsViewProps {
  currentRole: UserRole;
}

export const TestsView: React.FC<TestsViewProps> = ({ currentRole }) => {
  const [tests, setTests] = useState<TestSuiteResult[]>(generateAllTestSuites());
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'passed' | 'failed'>('ALL');

  const filteredTests = tests.filter((t) => {
    const matchSearch =
      t.skillName.toLowerCase().includes(search.toLowerCase()) ||
      t.testName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const passedCount = tests.filter((t) => t.status === 'passed').length;
  const passRate = Math.round((passedCount / tests.length) * 100);

  const handleRunAll = () => {
    setIsRunningAll(true);
    setTimeout(() => {
      setTests((prev) =>
        prev.map((t) => ({
          ...t,
          status: 'passed',
          durationMs: Math.floor(10 + Math.random() * 30),
          timestamp: 'Just now',
        }))
      );
      setIsRunningAll(false);
    }, 1500);
  };

  const handleRunSingle = (id: string) => {
    setTests((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'running' }
          : t
      )
    );
    setTimeout(() => {
      setTests((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status: 'passed', timestamp: 'Just now', durationMs: Math.floor(15 + Math.random() * 20) }
            : t
        )
      );
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Automated Tests & Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            70 automated continuous validation suites guaranteeing schema integrity & zero-trust compliance.
          </p>
        </div>

        <button
          onClick={handleRunAll}
          disabled={isRunningAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 ${isRunningAll ? 'animate-spin' : ''}`} />
          <span>{isRunningAll ? 'Executing 70 Suites...' : 'Run All 70 Tests'}</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500">Total Test Suites</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">70</div>
          <div className="text-[11px] text-slate-400 mt-1">2 per canonical skill</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500">Pass Rate</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{passRate}%</div>
          <div className="text-[11px] text-emerald-600/80 mt-1">100% target achieved</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500">Total Assertions</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">1,248</div>
          <div className="text-[11px] text-indigo-500/80 mt-1">Schema & I/O assertions</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500">Avg Execution Time</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">24ms</div>
          <div className="text-[11px] text-slate-400 mt-1">Ultra-low latency runner</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search test name or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All (70)
          </button>
          <button
            onClick={() => setStatusFilter('passed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              statusFilter === 'passed'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            Passed ({passedCount})
          </button>
        </div>
      </div>

      {/* Test Suites List */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {test.status === 'running' ? (
                  <RefreshCw className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                      {test.testName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                      {test.skillName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                    <span>{test.assertions} assertions</span>
                    <span>•</span>
                    <span>{test.durationMs}ms</span>
                    <span>•</span>
                    <span>{test.coverage}% coverage</span>
                    <span>•</span>
                    <span>{test.timestamp}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRunSingle(test.id)}
                disabled={test.status === 'running'}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition-colors shrink-0"
              >
                Re-run
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
