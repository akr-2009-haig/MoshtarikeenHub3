export interface Subscriber {
  id: string;
  name: string;
  phone: string;
  iban: string;
  subscriptionAmount: number;
  profits: number;
  systemFees: number;
  systemAccount: string;
  walletAddress: string;
  bankName: string;
  joinDate: string;
  subscriberStatus: string;
  notes: string;
  currency: string;
  platform: string;
  vipLevel?: 'none' | 'silver' | 'gold' | 'platinum';
  rating?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Operation {
  id: string;
  subscriberName: string;
  operation: string;
  amount: string;
  date: string;
  status: string;
  notes?: string;
  createdAt?: string;
}

export interface SystemConfig {
  sectionNames: {
    dashboard: string;
    admin: string;
    addOperations: string;
    addSubscriber: string;
    systemAdmin: string;
  };
  cardOverrides: {
    totalSubscribers: string;
    activeCount: string;
    totalProfits: string;
    completedOps: string;
    activeSubscriptions: string;
    totalSubsCount: string;
    pendingFees: string;
    activationOps: string;
  };
  institutionalText: string;
  systemDate: string;
}

export interface LiveStats {
  totalSubscribers: string;
  totalProfits: string;
  activeSubscriptions: string;
  pendingRequests: string;
  activeCount: string;
  completedOpsStr: string;
  totalSubsCount: string;
  activationOpsStr: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
  user: string;
  category: 'create' | 'update' | 'delete' | 'system' | 'login' | 'export';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  category?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  createdAt: string;
  assignee?: string;
  tags?: string[];
}

export interface BackupEntry {
  id: string;
  name: string;
  timestamp: string;
  size: number;
  subscribersCount: number;
  operationsCount: number;
  data: string;
}

export interface QueryFieldConfig {
  key: keyof Subscriber;
  label: string;
  visible: boolean;
  order: number;
  group?: string;
  required?: boolean;
}

export interface ProTheme {
  mode: 'dark' | 'light';
  accent: 'purple' | 'gold' | 'blue' | 'emerald';
  density: 'compact' | 'normal' | 'comfortable';
  sidebarCollapsed: boolean;
  fontSize: 'sm' | 'md' | 'lg';
}

export interface ProSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  sessionLock: boolean;
  sessionLockTimeout: number;
  sessionPin: string;
  notifications: boolean;
  soundAlerts: boolean;
  language: 'ar' | 'en';
  dateFormat: string;
  currency: string;
  showWelcome: boolean;
}

export interface StorageData {
  version: number;
  subscribers: Subscriber[];
  operations: Operation[];
  systemConfig: SystemConfig;
  auditLogs: AuditLog[];
  notifications: Notification[];
  tasks: Task[];
  backups: BackupEntry[];
  queryFields: QueryFieldConfig[];
  proTheme: ProTheme;
  proSettings: ProSettings;
  restorePoints: RestorePoint[];
}

export interface RestorePoint {
  id: string;
  name: string;
  timestamp: string;
  description: string;
  data: Partial<StorageData>;
}
