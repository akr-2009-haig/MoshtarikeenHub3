import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, RefreshCw, CheckCircle2, Users,
  TrendingUp, ClipboardList, Shield, BarChart3, Zap
} from 'lucide-react';
import { usePro } from '../store/ProContext';
import { exportSubscribersCSV, exportOperationsCSV, exportStorageJSON } from '../store/storage';

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  generate: () => void;
  tags: string[];
}

export function ProReports() {
  const { state, addAuditLog, addNotification } = usePro();
  const { subscribers, operations } = state;
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Set<string>>(new Set());

  const handleGenerate = (id: string, fn: () => void) => {
    setGenerating(id);
    setTimeout(() => {
      fn();
      setGenerating(null);
      setGenerated(prev => new Set([...prev, id]));
      addAuditLog('تصدير تقرير', 'report', id, `تقرير: ${id}`, 'export');
      addNotification('تقرير جاهز', 'تم تحميل التقرير بنجاح', 'success');
    }, 1200);
  };

  const reports: ReportTemplate[] = [
    {
      id: 'subs-csv', title: 'تقرير المشتركين الكامل', color: '#10b981',
      description: `جميع بيانات ${subscribers.length} مشترك بصيغة CSV`,
      icon: <Users size={20} />, tags: ['CSV', 'مشتركون'],
      generate: () => exportSubscribersCSV(subscribers),
    },
    {
      id: 'ops-csv', title: 'تقرير العمليات الكامل', color: '#3b82f6',
      description: `${operations.length} عملية مسجّلة بصيغة CSV`,
      icon: <ClipboardList size={20} />, tags: ['CSV', 'عمليات'],
      generate: () => exportOperationsCSV(operations),
    },
    {
      id: 'full-backup', title: 'النسخة الاحتياطية الكاملة', color: '#a855f7',
      description: 'تصدير جميع البيانات بصيغة JSON',
      icon: <Shield size={20} />, tags: ['JSON', 'نسخ احتياطي'],
      generate: () => exportStorageJSON(state),
    },
    {
      id: 'active-subs', title: 'تقرير المشتركين النشطين', color: '#f59e0b',
      description: `${subscribers.filter(s => s.subscriberStatus === 'نشط').length} مشترك نشط`,
      icon: <CheckCircle2 size={20} />, tags: ['CSV', 'نشطون'],
      generate: () => exportSubscribersCSV(subscribers.filter(s => s.subscriberStatus === 'نشط')),
    },
    {
      id: 'completed-ops', title: 'العمليات المكتملة', color: '#06b6d4',
      description: `${operations.filter(o => o.status === 'مكتمل').length} عملية مكتملة`,
      icon: <TrendingUp size={20} />, tags: ['CSV', 'مكتملة'],
      generate: () => exportOperationsCSV(operations.filter(o => o.status === 'مكتمل')),
    },
    {
      id: 'pending-fees', title: 'المشتركون برسوم مستحقة', color: '#ef4444',
      description: `${subscribers.filter(s => s.systemFees > 0).length} مشترك لديهم رسوم`,
      icon: <Zap size={20} />, tags: ['CSV', 'رسوم'],
      generate: () => exportSubscribersCSV(subscribers.filter(s => s.systemFees > 0)),
    },
  ];

  const summaryStats = [
    { label: 'إجمالي المشتركين', value: subscribers.length, color: '#a855f7' },
    { label: 'النشطون', value: subscribers.filter(s => s.subscriberStatus === 'نشط').length, color: '#10b981' },
    { label: 'العمليات', value: operations.length, color: '#3b82f6' },
    { label: 'إجمالي الأرباح', value: `${subscribers.reduce((a,s) => a+s.profits,0).toLocaleString()} ر.س`, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <FileText size={24} className="text-purple-400" /> مركز التقارير
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">تصدير وتنزيل تقارير تفصيلية</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryStats.map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report, i) => (
          <motion.div key={report.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: `${report.color}08`, border: `1px solid ${report.color}25` }}>
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-10"
              style={{ background: report.color, filter: 'blur(20px)' }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${report.color}20` }}>
                  <span style={{ color: report.color }}>{report.icon}</span>
                </div>
                <div className="flex gap-1">
                  {report.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: `${report.color}15`, color: report.color, border: `1px solid ${report.color}25` }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="font-black text-white text-sm mb-1">{report.title}</h3>
              <p className="text-xs text-slate-400 mb-4">{report.description}</p>
              <button
                onClick={() => handleGenerate(report.id, report.generate)}
                disabled={generating === report.id}
                className="w-full h-9 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: `${report.color}25`, color: report.color, border: `1px solid ${report.color}35` }}>
                {generating === report.id ? (
                  <><RefreshCw size={14} className="animate-spin" /> جارٍ التصدير...</>
                ) : generated.has(report.id) ? (
                  <><CheckCircle2 size={14} /> تم التصدير</>
                ) : (
                  <><Download size={14} /> تنزيل التقرير</>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-white font-black mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-purple-400" />ملخص إحصائي سريع</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'إجمالي الاشتراكات', value: subscribers.reduce((a,s) => a+s.subscriptionAmount,0).toLocaleString() + ' ر.س', color: '#3b82f6' },
            { label: 'إجمالي الأرباح', value: subscribers.reduce((a,s) => a+s.profits,0).toLocaleString() + ' ر.س', color: '#10b981' },
            { label: 'الرسوم المستحقة', value: subscribers.reduce((a,s) => a+s.systemFees,0).toLocaleString() + ' ر.س', color: '#f59e0b' },
            { label: 'عمليات مكتملة', value: operations.filter(o => o.status === 'مكتمل').length.toString(), color: '#10b981' },
            { label: 'قيد المعالجة', value: operations.filter(o => o.status === 'قيد المعالجة').length.toString(), color: '#3b82f6' },
            { label: 'معدل الإكمال', value: operations.length ? Math.round(operations.filter(o => o.status === 'مكتمل').length / operations.length * 100) + '%' : '0%', color: '#a855f7' },
          ].map(item => (
            <div key={item.label} className="text-center p-3 rounded-xl" style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
              <p className="text-base font-black" style={{ color: item.color }}>{item.value}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
