import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, DollarSign, AlertCircle, Wallet, BarChart3,
  ArrowUpRight, ArrowDownRight, Download, PieChart
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { usePro } from '../store/ProContext';
import { exportSubscribersCSV } from '../store/storage';

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
const COLORS = ['#10b981', '#a855f7', '#3b82f6', '#f59e0b', '#ef4444'];
const TOOLTIP_STYLE = { background: '#1e1b4b', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 12, fontSize: 12 };

export function ProFinancials() {
  const { state } = usePro();
  const { subscribers, operations } = state;

  const totals = useMemo(() => ({
    subscriptions: subscribers.reduce((a, s) => a + (s.subscriptionAmount || 0), 0),
    profits: subscribers.reduce((a, s) => a + (s.profits || 0), 0),
    fees: subscribers.reduce((a, s) => a + (s.systemFees || 0), 0),
    net: subscribers.reduce((a, s) => a + (s.profits || 0) - (s.systemFees || 0), 0),
  }), [subscribers]);

  const bankDist = useMemo(() => {
    const map: Record<string, { count: number; profits: number; subscriptions: number }> = {};
    subscribers.forEach(s => {
      const b = s.bankName || 'غير محدد';
      if (!map[b]) map[b] = { count: 0, profits: 0, subscriptions: 0 };
      map[b].count++;
      map[b].profits += s.profits || 0;
      map[b].subscriptions += s.subscriptionAmount || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].profits - a[1].profits).slice(0, 6)
      .map(([name, v]) => ({ name: name.slice(0, 10), ...v }));
  }, [subscribers]);

  const currencyRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    subscribers.forEach(s => { if (s.currency) map[s.currency] = (map[s.currency] || 0) + (s.profits || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [subscribers]);

  const topProfitSubs = useMemo(() =>
    [...subscribers].sort((a, b) => (b.profits || 0) - (a.profits || 0)).slice(0, 8)
  , [subscribers]);

  const monthlyRevenue = useMemo(() => MONTHS.map((m, i) => ({
    name: m.slice(0, 3),
    subscriptions: Math.round(totals.subscriptions * (0.7 + i * 0.05)),
    profits: Math.round(totals.profits * (0.7 + i * 0.05)),
    fees: Math.round(totals.fees * (0.8 + i * 0.04)),
  })), [totals]);

  const FinCard = ({ title, value, subtitle, color, icon, change }: any) => (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2 opacity-10"
        style={{ background: color, filter: 'blur(20px)' }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-slate-400 text-xs mb-1">{title}</p>
            <p className="text-2xl font-black" style={{ color }}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
            <span style={{ color }}>{icon}</span>
          </div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {change >= 0 ? '+' : ''}{change}% مقارنة بالشهر الماضي
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <TrendingUp size={24} className="text-emerald-400" /> المركز المالي
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">نظرة شاملة على المؤشرات المالية</p>
        </div>
        <button onClick={() => exportSubscribersCSV(subscribers)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90"
          style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <Download size={15} /> تصدير
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FinCard title="إجمالي الاشتراكات" value={totals.subscriptions} subtitle="ر.س" color="#3b82f6" icon={<Wallet size={18} />} change={8} />
        <FinCard title="إجمالي الأرباح" value={totals.profits} subtitle="ر.س" color="#10b981" icon={<TrendingUp size={18} />} change={12} />
        <FinCard title="الرسوم المستحقة" value={totals.fees} subtitle="ر.س" color="#f59e0b" icon={<AlertCircle size={18} />} change={-3} />
        <FinCard title="صافي الدخل" value={totals.net} subtitle="بعد خصم الرسوم" color="#a855f7" icon={<DollarSign size={18} />} change={10} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-white font-black mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-blue-400" />الإيرادات الشهرية</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="fGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="subscriptions" stroke="#3b82f6" strokeWidth={2} fill="url(#fGrad2)" name="الاشتراكات" />
              <Area type="monotone" dataKey="profits" stroke="#10b981" strokeWidth={2.5} fill="url(#fGrad1)" name="الأرباح" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-white font-black mb-4 flex items-center gap-2"><PieChart size={16} className="text-purple-400" />الإيرادات حسب العملة</h3>
          {currencyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RePieChart>
                <Pie data={currencyRevenue} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {currencyRevenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v.toLocaleString() + ' ر.س', 'الأرباح']} />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">لا توجد بيانات</div>
          )}
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {currencyRevenue.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-slate-400">{c.name}: {c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bank Distribution */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-white font-black mb-4">الأرباح حسب البنك</h3>
          {bankDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bankDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="profits" fill="#10b981" radius={[4,4,0,0]} name="الأرباح" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">لا توجد بيانات</div>
          )}
        </div>

        {/* Top Subscribers by Profit */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-5 py-4 border-b border-white/10">
            <h3 className="text-white font-black">أعلى المشتركين أرباحاً</h3>
          </div>
          {topProfitSubs.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm">لا توجد بيانات</div>
          ) : (
            <div className="divide-y divide-white/5">
              {topProfitSubs.map((sub, i) => (
                <div key={sub.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs font-black w-5 text-center" style={{ color: i < 3 ? '#f59e0b' : '#64748b' }}>#{i + 1}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: i < 3 ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'rgba(255,255,255,0.1)' }}>
                    {sub.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{sub.name}</p>
                    <p className="text-xs text-slate-500">{sub.platform || sub.bankName || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-400">{(sub.profits || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-500">ر.س</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
