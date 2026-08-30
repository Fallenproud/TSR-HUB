export type CategoryId =
  | 'GOVERN'
  | 'CREATE'
  | 'FUND'
  | 'GROW'
  | 'STAFF'
  | 'GOVERN_RISK'
  | 'DEFEND'
  | 'CHALLENGE'
  | 'RECOVER'
  | 'OPERATE'
  | 'VERIFY'
  | (string & {});

export type SkillStatus = 'Complete' | 'In Progress' | 'Planned' | 'Under Review';

export type UserRole = 'ADMIN' | 'ARCHITECT' | 'SECURITY_LEAD' | 'VIEWER';

export type NotificationType = 'endorsement' | 'certification' | 'rbac' | 'test' | 'system' | 'role_change';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkSkillId?: string;
  skillNumber?: string;
  skillName?: string;
  badge?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface NotificationPreferences {
  endorsementsInApp: boolean;
  endorsementsEmail: boolean;
  certificationsInApp: boolean;
  certificationsEmail: boolean;
  rbacInApp: boolean;
  rbacEmail: boolean;
  testsInApp: boolean;
  testsEmail: boolean;
  systemInApp: boolean;
  systemEmail: boolean;
  frequency: 'instant' | 'daily_digest' | 'weekly_summary';
  alertDaysBeforeExpiry: number;
  browserPush?: boolean;
  inAppToasts?: boolean;
}

export interface ArtifactCounts {
  skillMd: number;
  schemas: number;
  prompts: number;
  source: number;
  tests: number;
  examples: number;
  changelog: number;
}

export interface UniversalExecutionContract {
  context: string;
  assess: string;
  design: string;
  plan: string;
  execute: string;
  verify: string;
  report: string;
  improve: string;
}

export interface MachineReadableSkillManifest {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  purpose: string;
  inputs: string[];
  optionalInputs: string[];
  outputs: string[];
  dependencies: string[];
  capabilities: string[];
  constraints: string[];
  methodology: string;
  validation: string[];
  failureModes: string[];
  artifacts: string[];
  examples: string[];
  tests: string[];
  acceptanceCriteria: string[];
}

export interface SkillItem {
  id: string;
  number: string;
  name: string;
  category: CategoryId;
  description: string;
  purpose: string;
  mustHave?: string[];
  requiredInputs: string[];
  optionalInputs?: string[];
  outputs: string[];
  canonicalArtifacts?: string[];
  dependencies: string[];
  artifacts: ArtifactCounts;
  status: SkillStatus;
  version: string;
  lastUpdated: string;
  maintainer: string;
  complexity: 'Low' | 'Medium' | 'High';
  testPassRate: number;
  tags: string[];
  isArchived?: boolean;
  skillMdContent?: string;
  schemaPreview?: string;
  promptPreview?: string;
  sourcePreview?: string;
  testPreview?: string;
  executionContract?: UniversalExecutionContract;
  manifest?: MachineReadableSkillManifest;
  packageName?: string;
}

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  count: number;
  percentage: number;
  color: string; // Tailwind color token or hex
  badgeColor: string;
  description: string;
  domainLead: string;
}

export interface MetricSummary {
  totalSkills: number;
  totalCategories: number;
  totalFiles: number;
  skillMdRatio: string;
  totalTests: number;
  testPassRate: number;
  systemHealth: string;
  lastSyncTime: string;
}

export interface RoleConfig {
  role: UserRole;
  label: string;
  badge: string;
  description: string;
  permissions: {
    canCreateSkill: boolean;
    canEditSkill: boolean;
    canDeleteSkill: boolean;
    canRunTests: boolean;
    canExportReports: boolean;
    canModifyRBAC: boolean;
    canSyncCloud: boolean;
  };
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSynced: Date;
  latencyMs: number;
  pendingChanges: number;
  cloudRegion: string;
}

export interface TestSuiteResult {
  id: string;
  skillId: string;
  skillName: string;
  testName: string;
  status: 'passed' | 'failed' | 'running';
  durationMs: number;
  coverage: number;
  assertions: number;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  targetSkill: string;
  details: string;
}

export interface VirtualFile {
  id: string;
  path: string;
  name: string;
  type: 'file' | 'folder';
  extension?: string;
  sizeKb?: number;
  category?: CategoryId;
  content?: string;
  children?: VirtualFile[];
}
