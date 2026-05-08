import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Database, HardDrive, Clock, CheckCircle2,
  AlertTriangle, Zap, RefreshCw, Shield, Save, Trash2, RotateCcw
} from 'lucide-react';
import { usePro } from '../store/ProContext';
import { getDataSize, getDataIntegrity } from '../store/storage';

function CircleGauge({ value, color, size = 80 }: { value: number; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={8} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={8} fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  );
}

export function ProSystemHealth() {
  const { state, saveBackup, saveRestorePoint, dispatch } = usePro();
  const [refreshing, setRefreshing] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [showBackupForm, setShowBackupForm] = useState(false);

  const dataSize = getDataSize(state);
  const integrity = getDataIntegrity(state);
  const storageUsed = Math.min(100, (new Blob([JSON.stringify(state)]).size / (5 * 1024 * 1024)) * 100);

  const metrics = [
    { label: 'سلامة البيانات', value: integrity.score, color: integrity.score > 90 ? '#10b981' : integrity.score > 70 ? '#f59e0b' : '#ef4444', unit: '%' },
    { label: 'استخدام التخزين', value: Math.round(storageUsed), color: storageUsed > 80 ? '#ef4444' : storageUsed > 60 ? '#f59e0b' : '#10b981', unit: '%' },
    { label: 'كفاءة العمليات', value: state.operations.length ? Math.round(state.operations.filter(o => o.status === 'مكتمل').length / state.operations.length * 100) : 100, color: '#a855f7', unit: '%' },
    { label: 'نشاط المشتركين', value: state.subscribers.length ? Math.round(state.subscribers.filter(s => s.subscriberStatus === 'نشط').length / state.subscribers.length * 100) : 0, color: '#3b82f6', unit: '%' },
  ];

  const systemStats = [
    { label: 'إجمالي المشتركين', value: state.subscribers.length, icon: <Database size={16} />, color: '#a855f7' },
    { label: 'إجمالي العمليات', value: state.operations.length, icon: <Activity size={16} />, color: '#3b82f6' },
    { label: 'سجلات المراجعة', value: state.auditLogs.length, icon: <Shield size={16} />, color: '#10b981' },
    { label: 'الإشعارات', value: state.notifications.length, icon: <Zap size={16} />, color: '#f59e0b' },
    { label: 'النسخ الاحتياطية', value: state.backups.length, icon: <Save size={16} />, color: '#06b6d4' },
    { label: 'حجم البيانات', value: dataSize, icon: <HardDrive size={16} />, color: '#ef4444' },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleBackup = () => {
    if (!backupName.trim()) return;
    saveBackup(backupName.trim());
    setBackupName('');
    setShowBackupForm(false);
  };

  const handleRestoreBackup = (backup: any) => {
    const data = JSON.parse(backup.data);
    dispatch({ type: 'RESTORE_DATA', payload: data });
  };

  const handleDeleteBackup = (id: string) => {
    dispatch({ type: 'DELETE_BACKUP', payload: id });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Activity size={24} className="text-emerald-400" /> صحة النظام
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">مراقبة الأداء والبيانات</p>
        </div>
        <button onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-emerald-400 hover:bg-emerald-400/10 transition-colors"
          style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> تحديث
        </button>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="rounded-2xl p-5 flex flex-col items-center"
            style={{ background: `${m.color}08`, border: `1px solid ${m.color}25` }}>
            <div className="relative">
              <CircleGauge value={m.value} color={m.color} size={80} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black" style={{ color: m.color }}>{m.value}{m.unit}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">{m.label}</p>
            <div className={`mt-1 flex items-center gap-1 text-xs font-bold ${m.value > 70 ? 'text-emerald-400' : m.value > 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {m.value > 70 ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
              {m.value > 70 ? 'ممتاز' : m.value > 50 ? 'جيد' : 'يحتاج مراجعة'}
            </div>
          </div>
        ))}
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {systemStats.map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
            <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
            <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Issues */}
      {integrity.issues.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <h3 className="text-amber-400 font-black mb-3 flex items-center gap-2"><AlertTriangle size={16} /> مشاكل مكتشفة ({integrity.issues.length})</h3>
          <div className="space-y-1">
            {integrity.issues.slice(0, 10).map((issue, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {issue}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backup Manager */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-white font-black flex items-center gap-2"><Save size={16} className="text-purple-400" />إدارة النسخ الاحتياطية</h3>
          <button onClick={() => setShowBackupForm(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-400 hover:bg-purple-400/10 transition-colors"
            style={{ border: '1px solid rgba(168,85,247,0.3)' }}>
            <Save size={12} /> نسخة جديدة
          </button>
        </div>

        <AnimatePresence>
          {showBackupForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-white/10">
              <div className="p-4 flex gap-3" dir="rtl">
                <input value={backupName} onChange={e => setBackupName(e.target.value)} placeholder="اسم النسخة الاحتياطية..."
                  onKeyDown={e => e.key === 'Enter' && handleBackup()}
                  className="flex-1 h-9 px-3 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
                <button onClick={handleBackup}
                  className="px-4 h-9 rounded-xl text-sm font-bold text-white hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>حفظ</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {state.backups.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            <Save size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">لا توجد نسخ احتياطية</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {state.backups.map(backup => (
              <div key={backup.id} className="flex items-center gap-3 px-5 py-3.5" dir="rtl">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(168,85,247,0.15)' }}>
                  <Save size={16} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{backup.name}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(backup.timestamp).toLocaleString('ar-SA')} · {backup.subscribersCount} مشترك · {backup.operationsCount} عملية
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{(backup.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => handleRestoreBackup(backup)}
                    className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition-colors" title="استرداد">
                    <RotateCcw size={13} />
                  </button>
                  <button onClick={() => handleDeleteBackup(backup.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors" title="حذف">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
