import type {
  StorageData, Subscriber, Operation, SystemConfig,
  AuditLog, Notification, Task, BackupEntry, QueryFieldConfig,
  ProTheme, ProSettings, RestorePoint
} from '../../types';

const STORAGE_KEY = 'moshtarikeen_pro_v3';
const CURRENT_VERSION = 3;

const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  sectionNames: {
    dashboard: 'النظام الإداري',
    admin: 'نظام الاستعلام عن الأرباح',
    addOperations: 'سجل العمليات',
    addSubscriber: 'إضافة مشترك',
    systemAdmin: 'لوحة إدارة النظام',
  },
  cardOverrides: {
    totalSubscribers: '',
    activeCount: '',
    totalProfits: '',
    completedOps: '',
    activeSubscriptions: '',
    totalSubsCount: '',
    pendingFees: '',
    activationOps: '',
  },
  institutionalText: '',
  systemDate: '',
};

const DEFAULT_QUERY_FIELDS: QueryFieldConfig[] = [
  { key: 'name', label: 'الاسم', visible: true, order: 0, group: 'أساسي', required: true },
  { key: 'phone', label: 'رقم الجوال', visible: true, order: 1, group: 'أساسي' },
  { key: 'iban', label: 'رقم الآيبان', visible: true, order: 2, group: 'مصرفي' },
  { key: 'bankName', label: 'اسم البنك', visible: true, order: 3, group: 'مصرفي' },
  { key: 'systemAccount', label: 'حساب النظام', visible: true, order: 4, group: 'النظام' },
  { key: 'walletAddress', label: 'المحفظة الرقمية', visible: true, order: 5, group: 'النظام' },
  { key: 'subscriptionAmount', label: 'مبلغ الاشتراك', visible: true, order: 6, group: 'مالي' },
  { key: 'profits', label: 'الأرباح', visible: true, order: 7, group: 'مالي' },
  { key: 'systemFees', label: 'رسوم النظام', visible: true, order: 8, group: 'مالي' },
  { key: 'currency', label: 'العملة', visible: true, order: 9, group: 'مالي' },
  { key: 'platform', label: 'المنصة', visible: true, order: 10, group: 'منصة' },
  { key: 'subscriberStatus', label: 'حالة المشترك', visible: true, order: 11, group: 'أساسي' },
  { key: 'joinDate', label: 'تاريخ الانضمام', visible: true, order: 12, group: 'أساسي' },
  { key: 'notes', label: 'الملاحظات', visible: false, order: 13, group: 'أخرى' },
];

const DEFAULT_PRO_THEME: ProTheme = {
  mode: 'dark',
  accent: 'purple',
  density: 'normal',
  sidebarCollapsed: false,
  fontSize: 'md',
};

const DEFAULT_PRO_SETTINGS: ProSettings = {
  autoSave: true,
  autoSaveInterval: 30,
  sessionLock: false,
  sessionLockTimeout: 15,
  sessionPin: '',
  notifications: true,
  soundAlerts: false,
  language: 'ar',
  dateFormat: 'ar-SA',
  currency: 'SAR',
  showWelcome: true,
};

const DEFAULT_DATA: StorageData = {
  version: CURRENT_VERSION,
  subscribers: [],
  operations: [],
  systemConfig: DEFAULT_SYSTEM_CONFIG,
  auditLogs: [],
  notifications: [],
  tasks: [],
  backups: [],
  queryFields: DEFAULT_QUERY_FIELDS,
  proTheme: DEFAULT_PRO_THEME,
  proSettings: DEFAULT_PRO_SETTINGS,
  restorePoints: [],
};

function migrate(data: Partial<StorageData>): StorageData {
  const v = data.version ?? 1;
  let migrated = { ...DEFAULT_DATA, ...data };
  if (v < 2) {
    migrated.auditLogs = migrated.auditLogs ?? [];
    migrated.notifications = migrated.notifications ?? [];
    migrated.tasks = migrated.tasks ?? [];
  }
  if (v < 3) {
    migrated.queryFields = migrated.queryFields?.length ? migrated.queryFields : DEFAULT_QUERY_FIELDS;
    migrated.proTheme = migrated.proTheme ?? DEFAULT_PRO_THEME;
    migrated.proSettings = migrated.proSettings ?? DEFAULT_PRO_SETTINGS;
    migrated.restorePoints = migrated.restorePoints ?? [];
  }
  migrated.version = CURRENT_VERSION;
  return migrated;
}

export function loadStorage(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };
    const parsed = JSON.parse(raw);
    return migrate(parsed);
  } catch {
    return { ...DEFAULT_DATA };
  }
}

export function saveStorage(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Storage save failed:', e);
  }
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportStorageJSON(data: StorageData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `moshtarikeen_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSubscribersCSV(subscribers: Subscriber[]): void {
  const headers = ['الاسم', 'الجوال', 'الآيبان', 'البنك', 'الاشتراك', 'الأرباح', 'الرسوم', 'العملة', 'المنصة', 'الحالة', 'تاريخ الانضمام'];
  const rows = subscribers.map(s => [
    s.name, s.phone, s.iban, s.bankName,
    s.subscriptionAmount, s.profits, s.systemFees,
    s.currency, s.platform, s.subscriberStatus, s.joinDate
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportOperationsCSV(operations: Operation[]): void {
  const headers = ['المشترك', 'العملية', 'المبلغ', 'التاريخ', 'الحالة'];
  const rows = operations.map(o => [o.subscriberName, o.operation, o.amount, o.date, o.status]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `operations_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function createBackup(data: StorageData, name: string): BackupEntry {
  const entry: BackupEntry = {
    id: crypto.randomUUID(),
    name,
    timestamp: new Date().toISOString(),
    size: JSON.stringify(data).length,
    subscribersCount: data.subscribers.length,
    operationsCount: data.operations.length,
    data: JSON.stringify(data),
  };
  return entry;
}

export function restoreBackup(entry: BackupEntry): StorageData {
  return JSON.parse(entry.data);
}

export function createRestorePoint(data: StorageData, name: string, description: string): RestorePoint {
  return {
    id: crypto.randomUUID(),
    name,
    timestamp: new Date().toISOString(),
    description,
    data: {
      subscribers: data.subscribers,
      operations: data.operations,
      systemConfig: data.systemConfig,
    },
  };
}

export function getDataSize(data: StorageData): string {
  const bytes = new Blob([JSON.stringify(data)]).size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getDataIntegrity(data: StorageData): { score: number; issues: string[] } {
  const issues: string[] = [];
  let deductions = 0;
  data.subscribers.forEach(s => {
    if (!s.name) { issues.push('مشترك بدون اسم'); deductions += 2; }
    if (!s.phone && !s.iban) { issues.push(`${s.name}: بدون رقم جوال أو آيبان`); deductions += 1; }
  });
  data.operations.forEach(o => {
    if (!o.subscriberName) { issues.push('عملية بدون اسم مشترك'); deductions += 1; }
    if (!o.amount) { issues.push('عملية بدون مبلغ'); deductions += 1; }
  });
  const score = Math.max(0, 100 - deductions);
  return { score, issues };
}

export { DEFAULT_QUERY_FIELDS, DEFAULT_PRO_THEME, DEFAULT_PRO_SETTINGS };
