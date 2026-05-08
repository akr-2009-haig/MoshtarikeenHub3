import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Eye, EyeOff, GripVertical, Save, RotateCcw, Check } from 'lucide-react';
import { usePro } from '../store/ProContext';
import { DEFAULT_QUERY_FIELDS } from '../store/storage';
import type { QueryFieldConfig } from '../../types';

export function ProFieldManager() {
  const { state, dispatch, addAuditLog, addNotification } = usePro();
  const [fields, setFields] = useState<QueryFieldConfig[]>([...state.queryFields].sort((a, b) => a.order - b.order));
  const [saved, setSaved] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const toggleVisible = (key: string) => {
    setFields(f => f.map(field => field.key === key ? { ...field, visible: !field.visible } : field));
  };

  const handleSave = () => {
    dispatch({ type: 'SET_QUERY_FIELDS', payload: fields });
    addAuditLog('تحديث حقول الاستعلام', 'query-fields', 'fields', 'تم تحديث إعدادات الحقول', 'update');
    addNotification('تم الحفظ', 'تم حفظ إعدادات الحقول', 'success');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setFields([...DEFAULT_QUERY_FIELDS]);
  };

  const handleDragStart = (i: number) => setDragIndex(i);
  const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOver(i); };
  const handleDrop = (e: React.DragEvent, target: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === target) return;
    const newFields = [...fields];
    const [moved] = newFields.splice(dragIndex, 1);
    newFields.splice(target, 0, moved);
    setFields(newFields.map((f, i) => ({ ...f, order: i })));
    setDragIndex(null);
    setDragOver(null);
  };

  const groups = [...new Set(fields.map(f => f.group || 'أخرى'))];
  const visibleCount = fields.filter(f => f.visible).length;

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Settings size={24} className="text-purple-400" /> مدير حقول الاستعلام
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">تخصيص الحقول المعروضة في نظام الاستعلام · {visibleCount}/{fields.length} حقل مفعّل</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
            <RotateCcw size={13} /> إعادة الضبط
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: saved ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            {saved ? <><Check size={14} /> محفوظ</> : <><Save size={14} /> حفظ</>}
          </button>
        </div>
      </div>

      <div className="rounded-2xl p-4" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <p className="text-purple-300 text-sm">
          <span className="font-bold">تلميح:</span> اسحب الحقول لإعادة ترتيبها، أو انقر على أيقونة العين لإظهارها/إخفائها في صفحة الاستعلام.
        </p>
      </div>

      {groups.map(group => {
        const groupFields = fields.filter(f => (f.group || 'أخرى') === group);
        return (
          <div key={group} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <h3 className="text-white font-black text-sm">{group}</h3>
              <span className="text-xs text-slate-500">{groupFields.filter(f => f.visible).length}/{groupFields.length} ظاهر</span>
            </div>
            <div className="divide-y divide-white/5">
              {groupFields.map((field) => {
                const globalIndex = fields.findIndex(f => f.key === field.key);
                return (
                  <motion.div key={field.key}
                    draggable
                    onDragStart={() => handleDragStart(globalIndex)}
                    onDragOver={e => handleDragOver(e, globalIndex)}
                    onDrop={e => handleDrop(e, globalIndex)}
                    className="flex items-center gap-3 px-5 py-3 transition-colors"
                    style={{
                      opacity: dragIndex === globalIndex ? 0.5 : 1,
                      background: dragOver === globalIndex ? 'rgba(168,85,247,0.1)' : undefined,
                      cursor: 'grab',
                    }}>
                    <GripVertical size={16} className="text-slate-600 flex-shrink-0 cursor-grab" />
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${field.visible ? 'text-white' : 'text-slate-500'}`}>{field.label}</p>
                      <p className="text-xs text-slate-600 font-mono">{field.key}</p>
                    </div>
                    {field.required && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>مطلوب</span>
                    )}
                    <button onClick={() => !field.required && toggleVisible(field.key)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: field.visible ? '#10b981' : '#475569' }}
                      disabled={field.required}>
                      {field.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
