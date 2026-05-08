import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Plus, X, Save, Trash2, Edit2, Check,
  Flag, Clock, AlertTriangle, Zap
} from 'lucide-react';
import { usePro } from '../store/ProContext';
import type { Task } from '../../types';

const PRIORITIES: Task['priority'][] = ['low', 'medium', 'high', 'critical'];
const PRIORITY_LABELS: Record<Task['priority'], string> = { low: 'منخفض', medium: 'متوسط', high: 'عالٍ', critical: 'حرج' };
const PRIORITY_COLORS: Record<Task['priority'], string> = { low: '#64748b', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444' };
const STATUSES: Task['status'][] = ['pending', 'in-progress', 'completed', 'cancelled'];
const STATUS_LABELS: Record<Task['status'], string> = { pending: 'معلق', 'in-progress': 'جارٍ', completed: 'مكتمل', cancelled: 'ملغي' };

const EMPTY_TASK: Omit<Task, 'id' | 'createdAt'> = {
  title: '', description: '', status: 'pending', priority: 'medium', dueDate: '', assignee: '', tags: [],
};

export function ProTasks() {
  const { state, dispatch, addAuditLog, addNotification } = usePro();
  const { tasks } = state;
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Task, 'id' | 'createdAt'>>({ ...EMPTY_TASK });
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = filterStatus === 'all' ? tasks : tasks.filter(t => t.status === filterStatus);

  const openAdd = () => { setForm({ ...EMPTY_TASK }); setEditId(null); setIsOpen(true); };
  const openEdit = (t: Task) => { const { id, createdAt, ...rest } = t; setForm(rest); setEditId(id); setIsOpen(true); };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editId) {
      dispatch({ type: 'UPDATE_TASK', payload: { id: editId, createdAt: tasks.find(t => t.id === editId)?.createdAt || new Date().toISOString(), ...form } });
    } else {
      const id = crypto.randomUUID();
      dispatch({ type: 'ADD_TASK', payload: { id, createdAt: new Date().toISOString(), ...form } });
      addNotification('مهمة جديدة', `تمت إضافة: ${form.title}`, 'info');
    }
    setIsOpen(false);
  };

  const handleComplete = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, status: task.status === 'completed' ? 'pending' : 'completed' } });
    if (task.status !== 'completed') addNotification('تم الإنجاز', `${task.title} مكتملة!`, 'success');
  };

  const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    critical: tasks.filter(t => t.priority === 'critical').length,
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <CheckSquare size={24} className="text-purple-400" /> إدارة المهام
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">{stats.total} مهمة · {stats.completed} مكتملة</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm hover:opacity-90 active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}>
          <Plus size={16} /> إضافة مهمة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'الإجمالي', value: stats.total, color: '#a855f7' },
          { label: 'معلق', value: stats.pending, color: '#64748b' },
          { label: 'جارٍ', value: stats.inProgress, color: '#3b82f6' },
          { label: 'مكتمل', value: stats.completed, color: '#10b981' },
          { label: 'حرج', value: stats.critical, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[{ v: 'all', l: 'الكل' }, ...STATUSES.map(s => ({ v: s, l: STATUS_LABELS[s] }))].map(opt => (
          <button key={opt.v} onClick={() => setFilterStatus(opt.v)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={filterStatus === opt.v ? { background: 'rgba(168,85,247,0.25)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.4)' } : { background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)' }}>
            {opt.l}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <CheckSquare size={28} className="mx-auto mb-2 text-slate-600" />
          <p className="text-slate-500 text-sm">لا توجد مهام</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task, i) => (
            <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:bg-white/5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${task.priority === 'critical' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
                opacity: task.status === 'cancelled' ? 0.5 : 1,
              }}>
              <button onClick={() => handleComplete(task.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 hover:border-purple-500'}`}>
                {task.status === 'completed' && <Check size={12} className="text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</p>
                  <span className="text-xs px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5"
                    style={{ background: `${PRIORITY_COLORS[task.priority]}20`, color: PRIORITY_COLORS[task.priority] }}>
                    <Flag size={9} />{PRIORITY_LABELS[task.priority]}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                    style={{
                      background: task.status === 'completed' ? 'rgba(16,185,129,0.15)' : task.status === 'in-progress' ? 'rgba(59,130,246,0.15)' : 'rgba(100,116,139,0.15)',
                      color: task.status === 'completed' ? '#10b981' : task.status === 'in-progress' ? '#3b82f6' : '#64748b',
                    }}>
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>
                {task.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>}
                {task.dueDate && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock size={9} /> {task.dueDate}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"><Edit2 size={12} /></button>
                <button onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 size={12} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
                <h3 className="font-black text-white">{editId ? 'تعديل مهمة' : 'إضافة مهمة'}</h3>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400"><X size={15} /></button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1 block">عنوان المهمة *</label>
                  <input value={form.title} onChange={e => f('title', e.target.value)} placeholder="أدخل عنوان المهمة..."
                    className="w-full h-10 px-3 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1 block">الوصف</label>
                  <textarea value={form.description || ''} onChange={e => f('description', e.target.value)} rows={2} placeholder="وصف المهمة..."
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none resize-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">الأولوية</label>
                    <select value={form.priority} onChange={e => f('priority', e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">الحالة</label>
                    <select value={form.status} onChange={e => f('status', e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1 block">تاريخ الاستحقاق</label>
                  <input type="date" value={form.dueDate || ''} onChange={e => f('dueDate', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
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
    </div>
  );
}
