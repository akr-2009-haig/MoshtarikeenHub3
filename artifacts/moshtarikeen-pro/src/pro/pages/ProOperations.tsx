import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Plus, Search, Filter, Edit2, Trash2, Save, X,
  ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, Zap
} from 'lucide-react';
import { usePro } from '../store/ProContext';
import type { Operation } from '../../types';

const STATUSES = ['مكتمل', 'قيد المعالجة', 'تنشيط النظام', 'معلق', 'مرفوض'];
const OPERATIONS_LIST = [
  'إيداع', 'سحب', 'تحويل', 'اشتراك جديد', 'تجديد اشتراك', 'تنشيط النظام',
  'دفع رسوم', 'استرجاع', 'تعليق', 'إلغاء', 'ترقية', 'تخفيض'
];

const EMPTY_OP: Omit<Operation, 'id'> = {
  subscriberName: '', operation: '', amount: '', date: '', status: 'مكتمل', notes: '',
};

const STATUS_STYLES: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  'مكتمل': { bg: 'rgba(16,185,129,0.15)', color: '#10b981', icon: <CheckCircle2 size={12} /> },
  'قيد المعالجة': { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', icon: <Clock size={12} /> },
  'تنشيط النظام': { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', icon: <AlertCircle size={12} /> },
  'معلق': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', icon: <Clock size={12} /> },
  'مرفوض': { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', icon: <X size={12} /> },
};

export function ProOperations() {
  const { state, dispatch, addAuditLog, addNotification } = usePro();
  const { operations, subscribers } = state;
  const subscriberNames = useMemo(() => subscribers.map(s => s.name), [subscribers]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Operation, 'id'>>({ ...EMPTY_OP });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const PER_PAGE = 12;

  const filtered = useMemo(() => {
    let ops = [...operations];
    if (statusFilter !== 'الكل') ops = ops.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      ops = ops.filter(o => o.subscriberName.toLowerCase().includes(q) || o.operation.includes(q) || o.amount.includes(q));
    }
    return ops;
  }, [operations, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => { setForm({ ...EMPTY_OP, date: new Date().toISOString().split('T')[0] }); setEditId(null); setIsOpen(true); };
  const openEdit = (op: Operation) => { const { id, ...rest } = op; setForm(rest); setEditId(id); setIsOpen(true); };

  const handleSave = () => {
    if (editId) {
      dispatch({ type: 'UPDATE_OPERATION', payload: { id: editId, ...form } });
      addAuditLog('تحديث عملية', 'operation', editId, `${form.subscriberName} - ${form.operation}`, 'update');
    } else {
      const id = crypto.randomUUID();
      dispatch({ type: 'ADD_OPERATION', payload: { id, ...form, createdAt: new Date().toISOString() } });
      addAuditLog('إضافة عملية', 'operation', id, `${form.subscriberName} - ${form.operation}`, 'create');
      addNotification('عملية جديدة', `تمت إضافة عملية ${form.operation} لـ ${form.subscriberName}`, 'success');
    }
    setIsOpen(false);
    setPage(1);
  };

  const handleDelete = (id: string) => {
    const op = operations.find(o => o.id === id);
    dispatch({ type: 'DELETE_OPERATION', payload: id });
    if (op) addAuditLog('حذف عملية', 'operation', id, `${op.subscriberName} - ${op.operation}`, 'delete');
    setDeleteId(null);
  };

  const stats = useMemo(() => ({
    completed: operations.filter(o => o.status === 'مكتمل').length,
    pending: operations.filter(o => o.status === 'قيد المعالجة').length,
    activation: operations.filter(o => o.status === 'تنشيط النظام').length,
    total: operations.length,
  }), [operations]);

  const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ClipboardList size={24} className="text-purple-400" /> سجل العمليات
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">{operations.length} عملية مسجّلة</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}>
          <Plus size={16} /> إضافة عملية
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'الإجمالي', value: stats.total, color: '#a855f7' },
          { label: 'مكتملة', value: stats.completed, color: '#10b981' },
          { label: 'قيد المعالجة', value: stats.pending, color: '#3b82f6' },
          { label: 'تنشيط النظام', value: stats.activation, color: '#ef4444' },
        ].map(item => (
          <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
            <p className="text-2xl font-black" style={{ color: item.color }}>{item.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="بحث في العمليات..."
            className="w-full h-10 pr-9 pl-3 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 rounded-xl text-sm text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <option value="الكل">جميع الحالات</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['#', 'المشترك', 'العملية', 'المبلغ', 'التاريخ', 'الحالة', ''].map(h => (
                  <th key={h} className="text-right text-slate-400 font-bold text-xs px-4 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((op, i) => {
                const style = STATUS_STYLES[op.status] || STATUS_STYLES['مكتمل'];
                return (
                  <motion.tr key={op.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-slate-500 text-xs">{(page - 1) * PER_PAGE + i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                          {(op.subscriberName || '?').charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-white">{op.subscriberName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{op.operation}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${op.status === 'مكتمل' ? 'text-emerald-400' : op.status === 'تنشيط النظام' ? 'text-red-400' : 'text-blue-400'}`}>
                        {op.amount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{op.date}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold w-fit"
                        style={{ background: style.bg, color: style.color, border: `1px solid ${style.color}40` }}>
                        {style.icon}{op.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(op)} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"><Edit2 size={13} /></button>
                        <button onClick={() => setDeleteId(op.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {paged.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">
                  <ClipboardList size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد عمليات</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xs text-slate-500">صفحة {page} من {totalPages} · {filtered.length} عملية</span>
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

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="rounded-2xl w-full max-w-md overflow-hidden"
              style={{ background: '#1a0a2e', border: '1px solid rgba(168,85,247,0.3)' }} dir="rtl">
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }} />
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-black text-white">{editId ? 'تعديل العملية' : 'إضافة عملية'}</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">اسم المشترك</label>
                  <input list="subs-list" value={form.subscriberName} onChange={e => f('subscriberName', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                  <datalist id="subs-list">{subscriberNames.map(n => <option key={n} value={n} />)}</datalist>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">نوع العملية</label>
                  <select value={form.operation} onChange={e => f('operation', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <option value="">اختر العملية</option>
                    {OPERATIONS_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">المبلغ</label>
                    <input value={form.amount} onChange={e => f('amount', e.target.value)} placeholder="0.00 ر.س"
                      className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">التاريخ</label>
                    <input type="date" value={form.date} onChange={e => f('date', e.target.value)}
                      className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">الحالة</label>
                  <select value={form.status} onChange={e => f('status', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">ملاحظات</label>
                  <textarea value={form.notes || ''} onChange={e => f('notes', e.target.value)} rows={2}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
              </div>
              <div className="p-5 border-t border-white/10 flex gap-3">
                <button onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                  <Save size={15} />{editId ? 'حفظ' : 'إضافة'}
                </button>
                <button onClick={() => setIsOpen(false)} className="h-11 px-5 rounded-xl font-bold text-slate-300 hover:bg-white/10"
                  style={{ border: '1px solid rgba(255,255,255,0.15)' }}>إلغاء</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="rounded-2xl p-6 text-center w-full max-w-sm"
              style={{ background: '#1a0a2e', border: '1px solid rgba(239,68,68,0.3)' }} dir="rtl">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                <Trash2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">حذف العملية؟</h3>
              <p className="text-slate-400 text-sm mb-5">لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-3">
                <button onClick={() => deleteId && handleDelete(deleteId)} className="flex-1 h-10 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700">حذف</button>
                <button onClick={() => setDeleteId(null)} className="flex-1 h-10 rounded-xl font-bold text-slate-300 hover:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>إلغاء</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
