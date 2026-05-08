import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Search, Trash2, ChevronLeft, ChevronRight,
  Plus, Edit2, X, Eye, LogIn, Download, Filter
} from 'lucide-react';
import { usePro } from '../store/ProContext';
import type { AuditLog } from '../../types';

const CATEGORIES: AuditLog['category'][] = ['create', 'update', 'delete', 'system', 'login', 'export'];
const CAT_LABELS: Record<string, string> = {
  create: 'إنشاء', update: 'تحديث', delete: 'حذف', system: 'نظام', login: 'دخول', export: 'تصدير'
};
const CAT_STYLES: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  create: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: <Plus size={12} /> },
  update: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', icon: <Edit2 size={12} /> },
  delete: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', icon: <Trash2 size={12} /> },
  system: { color: '#a855f7', bg: 'rgba(168,85,247,0.15)', icon: <Shield size={12} /> },
  login: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: <LogIn size={12} /> },
  export: { color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', icon: <Download size={12} /> },
};

export function ProAuditLogs() {
  const { state, dispatch } = usePro();
  const { auditLogs } = state;
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('الكل');
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const filtered = useMemo(() => {
    let logs = [...auditLogs];
    if (catFilter !== 'الكل') logs = logs.filter(l => l.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      logs = logs.filter(l => l.action.includes(q) || l.entity.includes(q) || l.details.toLowerCase().includes(q) || l.user.includes(q));
    }
    return logs;
  }, [auditLogs, catFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    auditLogs.forEach(l => { counts[l.category] = (counts[l.category] || 0) + 1; });
    return counts;
  }, [auditLogs]);

  const exportLogs = () => {
    const csv = [
      ['الإجراء', 'الكيان', 'التفاصيل', 'المستخدم', 'الوقت', 'الفئة'],
      ...auditLogs.map(l => [l.action, l.entity, l.details, l.user, new Date(l.timestamp).toLocaleString('ar-SA'), CAT_LABELS[l.category] || l.category])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Shield size={24} className="text-purple-400" /> سجل المراجعة
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">{auditLogs.length} سجل نشاط</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportLogs}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-cyan-400 hover:bg-cyan-400/10 transition-colors"
            style={{ border: '1px solid rgba(6,182,212,0.3)' }}>
            <Download size={14} /> تصدير
          </button>
          {auditLogs.length > 0 && (
            <button onClick={() => dispatch({ type: 'CLEAR_AUDIT_LOGS' })}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-colors"
              style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
              <Trash2 size={14} /> مسح الكل
            </button>
          )}
        </div>
      </div>

      {/* Category Stats */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCatFilter('الكل')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          style={catFilter === 'الكل' ? { background: 'rgba(168,85,247,0.25)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.4)' } : { background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)' }}>
          الكل ({auditLogs.length})
        </button>
        {CATEGORIES.map(cat => {
          const s = CAT_STYLES[cat];
          return (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={catFilter === cat ? { background: s.bg, color: s.color, border: `1px solid ${s.color}40` } : { background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="flex-shrink-0">{s.icon}</span>
              {CAT_LABELS[cat]} ({categoryCounts[cat] || 0})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="بحث في سجل النشاط..."
          className="w-full h-10 pr-9 pl-3 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      {/* Logs Timeline */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {paged.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Shield size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">لا توجد سجلات نشاط</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {paged.map((log, i) => {
              const s = CAT_STYLES[log.category] || CAT_STYLES.system;
              const date = new Date(log.timestamp);
              return (
                <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: s.bg }}>
                    <span style={{ color: s.color }}>{s.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{log.action}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                        style={{ background: s.bg, color: s.color }}>
                        {CAT_LABELS[log.category]}
                      </span>
                      <span className="text-xs text-slate-500">{log.entity}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{log.details}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-slate-300">{log.user}</p>
                    <p className="text-xs text-slate-500">{date.toLocaleDateString('ar-SA')} {date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xs text-slate-500">صفحة {page} من {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-40 hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                <ChevronRight size={13} /> السابق
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-40 hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                التالي <ChevronLeft size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
