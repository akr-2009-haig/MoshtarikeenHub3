import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Filter, Edit2, Trash2, Eye, Star, Crown,
  Download, Upload, ChevronLeft, ChevronRight, X, Save, Phone,
  CreditCard, Building2, Database, Globe, Cpu, Wallet, AlertCircle,
  CheckCircle2, TrendingUp, Shield, Tag, SortAsc
} from 'lucide-react';
import { usePro } from '../store/ProContext';
import type { Subscriber } from '../../types';

const STATUSES = ['نشط', 'غير نشط', 'معلق', 'مغلق', 'قيد المراجعة'];
const VIP_LEVELS = ['none', 'silver', 'gold', 'platinum'] as const;
const VIP_LABELS = { none: 'عادي', silver: 'فضي', gold: 'ذهبي', platinum: 'بلاتيني' };
const VIP_COLORS = { none: '#64748b', silver: '#94a3b8', gold: '#f59e0b', platinum: '#a855f7' };

const EMPTY_SUB: Omit<Subscriber, 'id'> = {
  name: '', phone: '', iban: '', subscriptionAmount: 0, profits: 0,
  systemFees: 0, systemAccount: '', walletAddress: '', bankName: '',
  joinDate: '', subscriberStatus: 'نشط', notes: '', currency: 'SAR',
  platform: '', vipLevel: 'none', rating: 3, tags: [],
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

export function ProSubscribers() {
  const { state, dispatch, addAuditLog, addNotification } = usePro();
  const { subscribers, operations } = state;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [vipFilter, setVipFilter] = useState('الكل');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'profits' | 'subscriptionAmount' | 'joinDate'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Subscriber, 'id'>>({ ...EMPTY_SUB });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    let subs = [...subscribers];
    if (statusFilter !== 'الكل') subs = subs.filter(s => s.subscriberStatus === statusFilter);
    if (vipFilter !== 'الكل') subs = subs.filter(s => (s.vipLevel || 'none') === vipFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      subs = subs.filter(s => s.name.toLowerCase().includes(q) || s.phone.includes(q) || s.iban.toLowerCase().includes(q) || s.platform?.toLowerCase().includes(q) || '');
    }
    subs.sort((a, b) => {
      let v: number;
      if (sortBy === 'name') v = a.name.localeCompare(b.name, 'ar');
      else if (sortBy === 'profits') v = (a.profits || 0) - (b.profits || 0);
      else if (sortBy === 'subscriptionAmount') v = (a.subscriptionAmount || 0) - (b.subscriptionAmount || 0);
      else v = a.joinDate.localeCompare(b.joinDate);
      return sortAsc ? v : -v;
    });
    return subs;
  }, [subscribers, search, statusFilter, vipFilter, sortBy, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => { setForm({ ...EMPTY_SUB, joinDate: new Date().toISOString().split('T')[0] }); setEditId(null); setIsOpen(true); };
  const openEdit = (s: Subscriber) => { const { id, ...rest } = s; setForm(rest); setEditId(id); setIsOpen(true); };

  const handleSave = () => {
    if (editId) {
      dispatch({ type: 'UPDATE_SUBSCRIBER', payload: { id: editId, ...form, updatedAt: new Date().toISOString() } });
      addAuditLog('تحديث مشترك', 'subscriber', editId, form.name, 'update');
      addNotification('تحديث ناجح', `تم تحديث بيانات ${form.name}`, 'success');
    } else {
      const id = crypto.randomUUID();
      dispatch({ type: 'ADD_SUBSCRIBER', payload: { id, ...form, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } });
      addAuditLog('إضافة مشترك', 'subscriber', id, form.name, 'create');
      addNotification('إضافة ناجحة', `تم إضافة المشترك ${form.name}`, 'success');
    }
    setIsOpen(false);
    setPage(1);
  };

  const handleDelete = (id: string) => {
    const sub = subscribers.find(s => s.id === id);
    dispatch({ type: 'DELETE_SUBSCRIBER', payload: id });
    if (sub) {
      addAuditLog('حذف مشترك', 'subscriber', id, sub.name, 'delete');
      addNotification('حذف', `تم حذف المشترك ${sub.name}`, 'warning');
    }
    setDeleteId(null);
  };

  const viewSub = viewId ? subscribers.find(s => s.id === viewId) : null;
  const subOps = viewSub ? operations.filter(o => o.subscriberName === viewSub.name) : [];

  const f = (key: keyof typeof form, val: any) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users size={24} className="text-purple-400" />
            إدارة المشتركين
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">{subscribers.length} مشترك · {subscribers.filter(s => s.subscriberStatus === 'نشط').length} نشط</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}>
            <Plus size={16} /> إضافة مشترك
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="بحث بالاسم أو الجوال أو المنصة..."
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
        <select value={vipFilter} onChange={e => { setVipFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 rounded-xl text-sm text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <option value="الكل">كل التصنيفات</option>
          {VIP_LEVELS.map(v => <option key={v} value={v}>{VIP_LABELS[v]}</option>)}
        </select>
        <button onClick={() => { setSortAsc(a => !a); }}
          className="h-10 px-3 rounded-xl text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <SortAsc size={14} /> {sortAsc ? 'تصاعدي' : 'تنازلي'}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'نشطون', value: subscribers.filter(s => s.subscriberStatus === 'نشط').length, color: '#10b981' },
          { label: 'إجمالي الأرباح', value: `${subscribers.reduce((a,s) => a+s.profits, 0).toLocaleString()} ر.س`, color: '#a855f7' },
          { label: 'رسوم مستحقة', value: `${subscribers.reduce((a,s) => a+s.systemFees, 0).toLocaleString()} ر.س`, color: '#f59e0b' },
          { label: 'VIP مشتركون', value: subscribers.filter(s => s.vipLevel && s.vipLevel !== 'none').length, color: '#f59e0b' },
        ].map(item => (
          <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
            <p className="text-lg font-black" style={{ color: item.color }}>{item.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['#', 'المشترك', 'الجوال', 'الأرباح', 'الاشتراك', 'الحالة', 'VIP', 'المنصة', ''].map(h => (
                  <th key={h} className="text-right text-slate-400 font-bold text-xs px-4 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((sub, i) => (
                <motion.tr key={sub.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{(page - 1) * PER_PAGE + i + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black text-white shadow"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{sub.name}</p>
                        {sub.iban && <p className="text-xs text-slate-500 font-mono">{sub.iban.slice(-6)}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 text-sm">{sub.phone || '—'}</td>
                  <td className="px-4 py-3.5 text-emerald-400 font-bold text-sm">{sub.profits?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3.5 text-blue-400 font-bold text-sm">{sub.subscriptionAmount?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{
                      background: sub.subscriberStatus === 'نشط' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                      color: sub.subscriberStatus === 'نشط' ? '#10b981' : '#94a3b8',
                      border: `1px solid ${sub.subscriberStatus === 'نشط' ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.2)'}`,
                    }}>{sub.subscriberStatus}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    {sub.vipLevel && sub.vipLevel !== 'none' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit"
                        style={{ background: `${VIP_COLORS[sub.vipLevel]}20`, color: VIP_COLORS[sub.vipLevel], border: `1px solid ${VIP_COLORS[sub.vipLevel]}30` }}>
                        <Crown size={10} />{VIP_LABELS[sub.vipLevel]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs">{sub.platform || '—'}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      <button onClick={() => setViewId(sub.id)} className="p-1.5 rounded-lg transition-colors hover:bg-emerald-500/20 text-emerald-400" title="عرض"><Eye size={13} /></button>
                      <button onClick={() => openEdit(sub)} className="p-1.5 rounded-lg transition-colors hover:bg-blue-500/20 text-blue-400" title="تعديل"><Edit2 size={13} /></button>
                      <button onClick={() => setDeleteId(sub.id)} className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20 text-red-400" title="حذف"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={9} className="text-center py-12 text-slate-500">
                  <Users size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد نتائج</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xs text-slate-500">صفحة {page} من {totalPages} · {filtered.length} مشترك</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-40 transition-colors hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                <ChevronRight size={13} /> السابق
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-40 transition-colors hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                التالي <ChevronLeft size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
              style={{ background: '#1a0a2e', border: '1px solid rgba(168,85,247,0.3)' }}>
              <div className="h-1 flex-shrink-0" style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7, #06b6d4)' }} />
              <div className="p-5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <h3 className="font-black text-white">{editId ? 'تعديل مشترك' : 'إضافة مشترك جديد'}</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X size={16} /></button>
              </div>
              <div className="p-5 overflow-y-auto scrollbar-thin space-y-4" dir="rtl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'الاسم الكامل', icon: <Users size={14} />, required: true },
                    { key: 'phone', label: 'رقم الجوال', icon: <Phone size={14} /> },
                    { key: 'iban', label: 'رقم الآيبان', icon: <CreditCard size={14} /> },
                    { key: 'bankName', label: 'اسم البنك', icon: <Building2 size={14} /> },
                    { key: 'systemAccount', label: 'حساب النظام', icon: <Database size={14} /> },
                    { key: 'walletAddress', label: 'المحفظة الرقمية', icon: <Wallet size={14} /> },
                    { key: 'currency', label: 'العملة', icon: <Globe size={14} /> },
                    { key: 'platform', label: 'المنصة', icon: <Cpu size={14} /> },
                    { key: 'joinDate', label: 'تاريخ الانضمام', icon: null, type: 'date' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block">{field.label}{(field as any).required && ' *'}</label>
                      <div className="relative">
                        {field.icon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{field.icon}</span>}
                        <input type={(field as any).type || 'text'}
                          value={(form as any)[field.key] || ''}
                          onChange={e => f(field.key as any, e.target.value)}
                          className={`w-full h-10 ${field.icon ? 'pr-9' : 'pr-3'} pl-3 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-colors`}
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                      </div>
                    </div>
                  ))}
                  {[
                    { key: 'subscriptionAmount', label: 'مبلغ الاشتراك' },
                    { key: 'profits', label: 'الأرباح' },
                    { key: 'systemFees', label: 'رسوم النظام' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block">{field.label}</label>
                      <input type="number" value={(form as any)[field.key] || 0} onChange={e => f(field.key as any, Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">حالة المشترك</label>
                    <select value={form.subscriberStatus} onChange={e => f('subscriberStatus', e.target.value)}
                      className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">مستوى VIP</label>
                    <select value={form.vipLevel || 'none'} onChange={e => f('vipLevel', e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      {VIP_LEVELS.map(v => <option key={v} value={v}>{VIP_LABELS[v]}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">ملاحظات</label>
                  <textarea value={form.notes || ''} onChange={e => f('notes', e.target.value)} rows={3}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none resize-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
              </div>
              <div className="p-5 border-t border-white/10 flex gap-3 flex-shrink-0">
                <button onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                  <Save size={15} />{editId ? 'حفظ التعديل' : 'إضافة المشترك'}
                </button>
                <button onClick={() => setIsOpen(false)} className="h-11 px-5 rounded-xl font-bold text-slate-300 hover:bg-white/10 transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {viewSub && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setViewId(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
              style={{ background: '#1a0a2e', border: '1px solid rgba(168,85,247,0.3)' }}
              onClick={e => e.stopPropagation()}>
              <div className="h-1 flex-shrink-0" style={{ background: 'linear-gradient(90deg, #10b981, #a855f7, #3b82f6)' }} />
              <div className="p-5 overflow-y-auto scrollbar-thin" dir="rtl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-white">ملف المشترك</h3>
                  <button onClick={() => setViewId(null)} className="text-slate-400 hover:text-white w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X size={16} /></button>
                </div>
                <div className="flex items-center gap-4 mb-5 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.1))', border: '1px solid rgba(168,85,247,0.2)' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-black text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    {viewSub.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white">{viewSub.name}</h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>{viewSub.subscriberStatus}</span>
                      {viewSub.vipLevel && viewSub.vipLevel !== 'none' && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                          style={{ background: `${VIP_COLORS[viewSub.vipLevel]}20`, color: VIP_COLORS[viewSub.vipLevel] }}>
                          <Crown size={10} />{VIP_LABELS[viewSub.vipLevel]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: 'الجوال', value: viewSub.phone }, { label: 'الآيبان', value: viewSub.iban, mono: true },
                    { label: 'البنك', value: viewSub.bankName }, { label: 'العملة', value: viewSub.currency },
                    { label: 'المنصة', value: viewSub.platform }, { label: 'تاريخ الانضمام', value: viewSub.joinDate },
                  ].filter(f => f.value).map(field => (
                    <div key={field.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-xs text-slate-400 mb-1">{field.label}</p>
                      <p className={`text-sm font-bold text-white break-all ${(field as any).mono ? 'font-mono text-xs' : ''}`}>{field.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'الاشتراك', value: viewSub.subscriptionAmount, color: '#3b82f6' },
                    { label: 'الأرباح', value: viewSub.profits, color: '#10b981' },
                    { label: 'الرسوم', value: viewSub.systemFees, color: '#f59e0b' },
                  ].map(item => (
                    <div key={item.label} className="text-center p-3 rounded-xl" style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
                      <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                      <p className="text-lg font-black" style={{ color: item.color }}>{item.value?.toLocaleString() || 0}</p>
                    </div>
                  ))}
                </div>
                {subOps.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-2">آخر العمليات ({subOps.length})</p>
                    <div className="space-y-1">
                      {subOps.slice(0, 5).map(op => (
                        <div key={op.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <span className="text-xs text-slate-300">{op.operation}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-400">{op.amount}</span>
                            <span className="text-xs text-slate-500">{op.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
              style={{ background: '#1a0a2e', border: '1px solid rgba(239,68,68,0.3)' }} dir="rtl">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                <Trash2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">تأكيد الحذف</h3>
              <p className="text-slate-400 text-sm mb-5">سيتم حذف هذا المشترك نهائياً ولا يمكن التراجع.</p>
              <div className="flex gap-3">
                <button onClick={() => deleteId && handleDelete(deleteId)}
                  className="flex-1 h-10 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors">حذف</button>
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 h-10 rounded-xl font-bold text-slate-300 hover:bg-white/10 transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.15)' }}>إلغاء</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
