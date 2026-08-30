import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Copy,
  Check,
  Download,
  Search,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { generateVirtualFileTree } from '../../data/virtualFilesData';
import { VirtualFile } from '../../types';

export const FileTreeView: React.FC = () => {
  const [fileTree] = useState<VirtualFile[]>(generateVirtualFileTree());
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'root-skills': true,
    'folder-skill-24': true,
    'folder-skill-24-schemas': true,
    'folder-skill-24-prompts': true,
    'folder-skill-24-src': true,
  });
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>({
    id: 'file-skill-24-skillmd',
    name: 'SKILL.md',
    path: '/skills/24-security-engineering/SKILL.md',
    type: 'file',
    extension: 'md',
    sizeKb: 4.2,
    content: `# Skill: Security Engineering (24)

## Purpose & Scope
Establish engineering practices that embed security throughout the software development lifecycle (Secure SDLC). Ensure that every service, cloud infrastructure component, and API endpoint conforms to defense-in-depth principles.

## Core Capabilities
- Automated Static & Dynamic Code Analysis (SAST/DAST) in CI/CD.
- Cryptographic key rotation & Secret Zero management.
- Zero-trust network segmentation and mTLS service mesh verification.
- Software Bill of Materials (SBOM) provenance validation.

## Required Inputs
1. System & architecture context
2. Threat model / risk assessment
3. Security requirements
4. Compliance obligations

## Deliverable Outputs
- Secure design & implementation
- Security controls & automation
- Vulnerability management
- Security metrics & reporting`,
  });

  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleCopyContent = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderTree = (nodes: VirtualFile[], depth = 0) => {
    return nodes.map((node) => {
      const isFolder = node.type === 'folder';
      const isExpanded = !!expandedFolders[node.id];
      const isSelected = selectedFile?.id === node.id;

      if (
        search &&
        !node.name.toLowerCase().includes(search.toLowerCase()) &&
        !node.children?.some((c) => c.name.toLowerCase().includes(search.toLowerCase()))
      ) {
        // Simple search filter
        if (!isFolder) return null;
      }

      return (
        <div key={node.id}>
          <div
            onClick={() => {
              if (isFolder) toggleFolder(node.id);
              else setSelectedFile(node);
            }}
            style={{ paddingLeft: `${depth * 14 + 10}px` }}
            className={`py-1.5 pr-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
              isSelected
                ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-200 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {isFolder ? (
                <>
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                  )}
                  {isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-blue-500 shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-blue-500 shrink-0" />
                  )}
                </>
              ) : (
                <>
                  <span className="w-3" />
                  {node.extension === 'json' ? (
                    <FileCode className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : node.extension === 'ts' ? (
                    <FileCode className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                </>
              )}
              <span className="truncate font-mono">{node.name}</span>
            </div>

            {node.sizeKb && (
              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                {node.sizeKb}kb
              </span>
            )}
          </div>

          {isFolder && isExpanded && node.children && (
            <div>{renderTree(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Canonical File Tree Explorer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Browse 610+ specification artifacts, schemas, prompts, tests, and source codes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Tree Directory (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter file path..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
            />
          </div>

          <div className="max-h-[600px] overflow-y-auto pr-1 select-none">
            {renderTree(fileTree)}
          </div>
        </div>

        {/* Right: File Syntax Viewer (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {selectedFile ? (
            <div>
              {/* File Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white">
                    {selectedFile.path}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyContent}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Code / Markdown Preview Area */}
              <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto min-h-[480px] max-h-[600px] whitespace-pre-wrap leading-relaxed">
                {selectedFile.content || `// Empty file content`}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select a file from the tree to inspect its contents.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
