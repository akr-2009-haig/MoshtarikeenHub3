import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, User, Phone, CreditCard, Building2, Database, Globe,
  Cpu, Wallet, TrendingUp, AlertCircle, Shield, Eye, EyeOff,
  CheckCircle2, Calendar, ChevronLeft, ChevronRight, RefreshCw,
  ClipboardList, Hash
} from 'lucide-react';
import { usePro } from '../store/ProContext';
import type { Subscriber, Operation } from '../../types';

const OPS_PER_PAGE = 8;

export function ProProfitInquiry() {
  const { state } = usePro();
  const { subscribers, operations, queryFields } = state;

  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [found, setFound] = useState<Subscriber | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [opsPage, setOpsPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const subscriberOps = useMemo(() =>
    found ? operations.filter(o => o.subscriberName === found.name) : []
  , [found, operations]);

  const totalOpsPages = Math.max(1, Math.ceil(subscriberOps.length / OPS_PER_PAGE));
  const pagedOps = subscriberOps.slice((opsPage - 1) * OPS_PER_PAGE, opsPage * OPS_PER_PAGE);

  const visibleFields = useMemo(() =>
    queryFields.filter(f => f.visible).sort((a, b) => a.order - b.order)
  , [queryFields]);

  const doSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearched(false);
    setFound(null);
    setProgress(0);
    setShowWallet(false);
    setOpsPage(1);

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          const q = query.trim().toLowerCase();
          const result = subscribers.find(s =>
            s.name.toLowerCase().includes(q) ||
            s.phone.includes(q) ||
            s.iban.toLowerCase().includes(q) ||
            s.systemAccount?.toLowerCase().includes(q) ||
            s.walletAddress?.toLowerCase().includes(q)
          ) || null;
          setFound(result);
          setSearched(true);
          setIsSearching(false);
        }, 400);
      }
      setProgress(p);
    }, 80);
  };

  const clear = () => { setQuery(''); setSearched(false); setFound(null); setProgress(0); inputRef.current?.focus(); };

  const statusBadge = (status: string) => {
    const s = {
      'مكتمل': { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
      'تنشيط النظام': { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
      'قيد المعالجة': { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    }[status] || { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' };
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: s.bg, color: s.color }}>{status}</span>
    );
  };

  const renderField = (field: typeof visibleFields[0], sub: Subscriber) => {
    const val = sub[field.key];
    if (!val && val !== 0) return null;

    const iconMap: Record<string, React.ReactNode> = {
      phone: <Phone size={13} className="text-purple-400" />,
      iban: <CreditCard size={13} className="text-blue-400" />,
      bankName: <Building2 size={13} className="text-emerald-400" />,
      systemAccount: <Database size={13} className="text-amber-400" />,
      walletAddress: <Hash size={13} className="text-purple-400" />,
      currency: <Globe size={13} className="text-cyan-400" />,
      platform: <Cpu size={13} className="text-orange-400" />,
      joinDate: <Calendar size={13} className="text-slate-400" />,
      subscriberStatus: <CheckCircle2 size={13} className="text-emerald-400" />,
    };

    if (field.key === 'walletAddress') {
      return (
        <div key={field.key} className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {iconMap[field.key]}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400">{field.label}</p>
            <p className="text-sm font-bold text-white break-all font-mono text-xs">
              {showWallet ? String(val) : `${String(val).slice(0, 10)}...`}
            </p>
            <button onClick={() => setShowWallet(v => !v)} className="flex items-center gap-1 text-xs text-purple-400 mt-1">
              {showWallet ? <EyeOff size={10} /> : <Eye size={10} />} {showWallet ? 'إخفاء' : 'إظهار'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={field.key} className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {iconMap[field.key] || <Shield size={13} className="text-slate-400" />}
        <div className="min-w-0">
          <p className="text-xs text-slate-400">{field.label}</p>
          <p className={`text-sm font-bold text-white break-all ${['iban', 'systemAccount'].includes(field.key) ? 'font-mono text-xs' : ''}`}>
            {String(val)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto" dir="rtl">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Search size={24} className="text-purple-400" /> الاستعلام عن الأرباح
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">ابحث بالاسم أو رقم الجوال أو الآيبان</p>
      </div>

      {/* Search Box */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="أدخل الاسم أو رقم الجوال أو رقم الآيبان..."
              className="w-full h-12 pr-10 pl-4 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)' }} />
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          </div>
          <button onClick={doSearch} disabled={isSearching || !query.trim()}
            className="h-12 px-6 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', minWidth: 80 }}>
            {isSearching ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
            {isSearching ? '' : 'بحث'}
          </button>
        </div>

        <AnimatePresence>
          {isSearching && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">جارٍ البحث...</span>
                <span className="text-sm font-black text-purple-400">{Math.round(progress)}%</span>
              </div>
              <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div className="absolute inset-y-0 right-0 rounded-full"
                  style={{ width: `${progress}%`, left: 'auto', background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }}
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'إجمالي المشتركين', value: subscribers.length, color: '#a855f7' },
            { label: 'نشطون', value: subscribers.filter(s => s.subscriberStatus === 'نشط').length, color: '#10b981' },
            { label: 'برسوم مستحقة', value: subscribers.filter(s => s.systemFees > 0).length, color: '#f59e0b' },
          ].map(item => (
            <div key={item.label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-2xl font-black" style={{ color: item.color }}>{item.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {searched && !found && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(100,116,139,0.2)' }}>
                <Search size={26} className="text-slate-400" />
              </div>
              <p className="text-lg font-black text-white">لم يُعثر على مشترك</p>
              <p className="text-slate-400 text-sm mt-1 mb-4">تحقق من البيانات المُدخلة</p>
              <button onClick={clear}
                className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl font-bold text-sm text-purple-400 hover:bg-purple-400/10 transition-colors"
                style={{ border: '1px solid rgba(168,85,247,0.3)' }}>
                <RefreshCw size={13} /> بحث جديد
              </button>
            </div>
          </motion.div>
        )}

        {searched && found && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Profile Card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7, #10b981)' }} />
              <div className="p-5">
                <div className="flex items-start gap-4 mb-5">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 8px 20px rgba(168,85,247,0.3)' }}>
                      {found.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-emerald-500 border-2 flex items-center justify-center"
                      style={{ borderColor: '#1a0a2e' }}>
                      <CheckCircle2 size={10} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-xl font-black text-white">{found.name}</h3>
                      {statusBadge(found.subscriberStatus)}
                    </div>
                    {found.joinDate && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={10} /> عضو منذ {found.joinDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {visibleFields.filter(f => !['name', 'subscriberStatus', 'profits', 'subscriptionAmount', 'systemFees'].includes(f.key))
                    .map(field => renderField(field, found))
                    .filter(Boolean)}
                </div>

                {/* Financial */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'مبلغ الاشتراك', value: found.subscriptionAmount, color: '#3b82f6', icon: <Wallet size={16} /> },
                    { label: 'الأرباح', value: found.profits, color: '#10b981', icon: <TrendingUp size={16} /> },
                    { label: 'رسوم النظام', value: found.systemFees, color: '#f59e0b', icon: <AlertCircle size={16} /> },
                  ].map(item => (
                    <div key={item.label} className="text-center p-3 rounded-xl" style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
                      <div className="flex justify-center mb-1" style={{ color: item.color }}>{item.icon}</div>
                      <p className="text-lg font-black" style={{ color: item.color }}>{(item.value || 0).toLocaleString()}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>

                {found.notes && (
                  <div className="mt-4 p-3 rounded-xl flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-200">{found.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Operations */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} className="text-purple-400" />
                  <h4 className="font-black text-white">سجل عمليات المشترك</h4>
                </div>
                <span className="text-xs text-slate-500">{subscriberOps.length} عملية</span>
              </div>
              {pagedOps.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <ClipboardList size={22} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد عمليات</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {['العملية', 'المبلغ', 'التاريخ', 'الحالة'].map(h => (
                          <th key={h} className="text-right text-slate-400 font-bold text-xs px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedOps.map(op => (
                        <tr key={op.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-300">{op.operation}</td>
                          <td className={`px-4 py-3 text-sm font-bold ${op.status === 'مكتمل' ? 'text-emerald-400' : op.status === 'تنشيط النظام' ? 'text-red-400' : 'text-blue-400'}`}>{op.amount}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{op.date}</td>
                          <td className="px-4 py-3">{statusBadge(op.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {totalOpsPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
                  <span className="text-xs text-slate-500">صفحة {opsPage} من {totalOpsPages}</span>
                  <div className="flex gap-2">
                    <button disabled={opsPage === 1} onClick={() => setOpsPage(p => p - 1)}
                      className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-40 hover:bg-white/10"
                      style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                      <ChevronRight size={12} /> السابق
                    </button>
                    <button disabled={opsPage === totalOpsPages} onClick={() => setOpsPage(p => p + 1)}
                      className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-40 hover:bg-white/10"
                      style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                      التالي <ChevronLeft size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button onClick={clear}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                <RefreshCw size={13} /> بحث جديد
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
