import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type {
  StorageData, Subscriber, Operation, SystemConfig,
  AuditLog, Notification, Task, QueryFieldConfig,
  ProTheme, ProSettings, BackupEntry, RestorePoint
} from '../../types';
import {
  loadStorage, saveStorage, createBackup, createRestorePoint,
  DEFAULT_PRO_THEME, DEFAULT_PRO_SETTINGS
} from './storage';

type ProAction =
  | { type: 'SET_SUBSCRIBERS'; payload: Subscriber[] }
  | { type: 'ADD_SUBSCRIBER'; payload: Subscriber }
  | { type: 'UPDATE_SUBSCRIBER'; payload: Subscriber }
  | { type: 'DELETE_SUBSCRIBER'; payload: string }
  | { type: 'SET_OPERATIONS'; payload: Operation[] }
  | { type: 'ADD_OPERATION'; payload: Operation }
  | { type: 'UPDATE_OPERATION'; payload: Operation }
  | { type: 'DELETE_OPERATION'; payload: string }
  | { type: 'SET_SYSTEM_CONFIG'; payload: Partial<SystemConfig> }
  | { type: 'ADD_AUDIT_LOG'; payload: AuditLog }
  | { type: 'CLEAR_AUDIT_LOGS' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_QUERY_FIELDS'; payload: QueryFieldConfig[] }
  | { type: 'SET_PRO_THEME'; payload: Partial<ProTheme> }
  | { type: 'SET_PRO_SETTINGS'; payload: Partial<ProSettings> }
  | { type: 'ADD_BACKUP'; payload: BackupEntry }
  | { type: 'DELETE_BACKUP'; payload: string }
  | { type: 'RESTORE_DATA'; payload: Partial<StorageData> }
  | { type: 'ADD_RESTORE_POINT'; payload: RestorePoint }
  | { type: 'LOAD_ALL'; payload: StorageData };

function proReducer(state: StorageData, action: ProAction): StorageData {
  switch (action.type) {
    case 'LOAD_ALL': return action.payload;
    case 'SET_SUBSCRIBERS': return { ...state, subscribers: action.payload };
    case 'ADD_SUBSCRIBER': return { ...state, subscribers: [action.payload, ...state.subscribers] };
    case 'UPDATE_SUBSCRIBER': return { ...state, subscribers: state.subscribers.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SUBSCRIBER': return { ...state, subscribers: state.subscribers.filter(s => s.id !== action.payload) };
    case 'SET_OPERATIONS': return { ...state, operations: action.payload };
    case 'ADD_OPERATION': return { ...state, operations: [action.payload, ...state.operations] };
    case 'UPDATE_OPERATION': return { ...state, operations: state.operations.map(o => o.id === action.payload.id ? action.payload : o) };
    case 'DELETE_OPERATION': return { ...state, operations: state.operations.filter(o => o.id !== action.payload) };
    case 'SET_SYSTEM_CONFIG': return { ...state, systemConfig: { ...state.systemConfig, ...action.payload } };
    case 'ADD_AUDIT_LOG': return { ...state, auditLogs: [action.payload, ...state.auditLogs].slice(0, 1000) };
    case 'CLEAR_AUDIT_LOGS': return { ...state, auditLogs: [] };
    case 'ADD_NOTIFICATION': return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 100) };
    case 'MARK_NOTIFICATION_READ': return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case 'MARK_ALL_NOTIFICATIONS_READ': return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    case 'CLEAR_NOTIFICATIONS': return { ...state, notifications: [] };
    case 'ADD_TASK': return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK': return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'SET_QUERY_FIELDS': return { ...state, queryFields: action.payload };
    case 'SET_PRO_THEME': return { ...state, proTheme: { ...state.proTheme, ...action.payload } };
    case 'SET_PRO_SETTINGS': return { ...state, proSettings: { ...state.proSettings, ...action.payload } };
    case 'ADD_BACKUP': return { ...state, backups: [action.payload, ...state.backups].slice(0, 20) };
    case 'DELETE_BACKUP': return { ...state, backups: state.backups.filter(b => b.id !== action.payload) };
    case 'RESTORE_DATA': return { ...state, ...action.payload };
    case 'ADD_RESTORE_POINT': return { ...state, restorePoints: [action.payload, ...state.restorePoints].slice(0, 10) };
    default: return state;
  }
}

interface ProContextValue {
  state: StorageData;
  dispatch: React.Dispatch<ProAction>;
  addAuditLog: (action: string, entity: string, entityId: string, details: string, category?: AuditLog['category']) => void;
  addNotification: (title: string, message: string, type: Notification['type'], category?: string) => void;
  saveBackup: (name: string) => void;
  saveRestorePoint: (name: string, description: string) => void;
  isSessionLocked: boolean;
  setSessionLocked: (v: boolean) => void;
}

const ProContext = createContext<ProContextValue | null>(null);

export function ProProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(proReducer, null, () => loadStorage());
  const [isSessionLocked, setIsSessionLocked] = React.useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef(Date.now());

  // Auto-save
  useEffect(() => {
    if (!state.proSettings.autoSave) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveStorage(state);
    }, 1000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [state]);

  // Session lock timer
  useEffect(() => {
    if (!state.proSettings.sessionLock || !state.proSettings.sessionPin) return;
    const timeout = state.proSettings.sessionLockTimeout * 60 * 1000;
    const checkActivity = () => {
      if (Date.now() - lastActivityRef.current > timeout) {
        setIsSessionLocked(true);
      }
    };
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const resetTimer = () => { lastActivityRef.current = Date.now(); };
    activityEvents.forEach(e => window.addEventListener(e, resetTimer));
    const interval = setInterval(checkActivity, 30000);
    return () => {
      activityEvents.forEach(e => window.removeEventListener(e, resetTimer));
      clearInterval(interval);
    };
  }, [state.proSettings.sessionLock, state.proSettings.sessionLockTimeout, state.proSettings.sessionPin]);

  const addAuditLog = useCallback((action: string, entity: string, entityId: string, details: string, category: AuditLog['category'] = 'system') => {
    dispatch({
      type: 'ADD_AUDIT_LOG',
      payload: {
        id: crypto.randomUUID(),
        action, entity, entityId, details, category,
        timestamp: new Date().toISOString(),
        user: 'المدير',
      }
    });
  }, []);

  const addNotification = useCallback((title: string, message: string, type: Notification['type'], category?: string) => {
    if (!state.proSettings.notifications) return;
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: crypto.randomUUID(),
        title, message, type, category,
        read: false,
        timestamp: new Date().toISOString(),
      }
    });
  }, [state.proSettings.notifications]);

  const saveBackup = useCallback((name: string) => {
    const backup = createBackup(state, name);
    dispatch({ type: 'ADD_BACKUP', payload: backup });
    addAuditLog('إنشاء نسخة احتياطية', 'backup', backup.id, name, 'system');
  }, [state, addAuditLog]);

  const saveRestorePoint = useCallback((name: string, description: string) => {
    const rp = createRestorePoint(state, name, description);
    dispatch({ type: 'ADD_RESTORE_POINT', payload: rp });
    addAuditLog('إنشاء نقطة استرداد', 'restore-point', rp.id, name, 'system');
  }, [state, addAuditLog]);

  return (
    <ProContext.Provider value={{
      state, dispatch,
      addAuditLog, addNotification,
      saveBackup, saveRestorePoint,
      isSessionLocked, setSessionLocked: setIsSessionLocked,
    }}>
      {children}
    </ProContext.Provider>
  );
}

export function usePro() {
  const ctx = useContext(ProContext);
  if (!ctx) throw new Error('usePro must be used inside ProProvider');
  return ctx;
}
