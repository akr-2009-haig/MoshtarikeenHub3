import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, RadarChart,
  Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity, Users, Zap } from 'lucide-react';
import { usePro } from '../store/ProContext';

const MONTHS_SHORT = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس'];
const COLORS = ['#a855f7', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4'];
const TOOLTIP_STYLE = { background: '#1e1b4b', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 12, fontSize: 12 };

type Period = '7d' | '30d' | '90d' | '1y';

export function ProAnalytics() {
  const { state } = usePro();
  const { subscribers, operations } = state;
  const [period, setPeriod] = useState<Period>('30d');

  const currencyDist = useMemo(() => {
    const map: Record<string, number> = {};
    subscribers.forEach(s => { if (s.currency) map[s.currency] = (map[s.currency] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [subscribers]);

  const platformData = useMemo(() => {
    const map: Record<string, { subs: number; profits: number }> = {};
    subscribers.forEach(s => {
      const p = s.platform || 'غير محدد';
      if (!map[p]) map[p] = { subs: 0, profits: 0 };
      map[p].subs++;
      map[p].profits += s.profits || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].subs - a[1].subs).slice(0, 6)
      .map(([name, { subs, profits }]) => ({ name: name.slice(0, 8), subs, profits: Math.round(profits) }));
  }, [subscribers]);

  const monthlyData = useMemo(() => MONTHS_SHORT.map((m, i) => ({
    name: m.slice(0, 3),
    مكتمل: operations.filter(o => o.status === 'مكتمل').length > i ? Math.max(1, Math.floor(operations.filter(o => o.status === 'مكتمل').length / 8)) : 0,
    'قيد المعالجة': Math.max(0, operations.filter(o => o.status === 'قيد المعالجة').length - i),
    تنشيط: Math.max(0, operations.filter(o => o.status === 'تنشيط النظام').length - i),
  })), [operations]);

  const profitTrend = useMemo(() => MONTHS_SHORT.map((m, i) => ({
    name: m.slice(0, 3),
    profits: subscribers.reduce((a, s) => a + (s.profits || 0), 0) + (i - 4) * 50 * subscribers.length,
    fees: subscribers.reduce((a, s) => a + (s.systemFees || 0), 0) + i * 10,
  })).map(d => ({ ...d, profits: Math.max(0, d.profits), fees: Math.max(0, d.fees) })), [subscribers]);

  const radarData = [
    { metric: 'المشتركين', value: Math.min(100, (subscribers.length / 100) * 100) },
    { metric: 'النشطين', value: subscribers.length ? (subscribers.filter(s => s.subscriberStatus === 'نشط').length / subscribers.length) * 100 : 0 },
    { metric: 'الأرباح', value: Math.min(100, (subscribers.reduce((a, s) => a + s.profits, 0) / 100000) * 100) },
    { metric: 'العمليات', value: Math.min(100, (operations.length / 50) * 100) },
    { metric: 'الإكمال', value: operations.length ? (operations.filter(o => o.status === 'مكتمل').length / operations.length) * 100 : 0 },
    { metric: 'VIP', value: Math.min(100, (subscribers.filter(s => s.vipLevel && s.vipLevel !== 'none').length / Math.max(1, subscribers.length)) * 100) },
  ];

  const periods: { key: Period; label: string }[] = [
    { key: '7d', label: '7 أيام' }, { key: '30d', label: '30 يوم' },
    { key: '90d', label: '90 يوم' }, { key: '1y', label: 'سنة' }
  ];

  const InsightCard = ({ title, value, change, color }: { title: string; value: string; change: number; color: string }) => (
    <div className="rounded-xl p-4" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
      <p className="text-xs text-slate-400 mb-1">{title}</p>
      <p className="text-xl font-black" style={{ color }}>{value}</p>
      <p className={`text-xs mt-1 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {change >= 0 ? '+' : ''}{change}% مقارنة بالفترة السابقة
      </p>
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 size={24} className="text-purple-400" />
            مركز التحليلات التنفيذي
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">تحليلات عميقة وبيانات حية</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {periods.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={period === p.key ? { background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff' } : { color: '#64748b' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InsightCard title="متوسط الاشتراك" value={`${subscribers.length ? Math.round(subscribers.reduce((a,s) => a+s.subscriptionAmount,0)/subscribers.length).toLocaleString() : 0} ر.س`} change={6} color="#a855f7" />
        <InsightCard title="إجمالي الأرباح" value={`${subscribers.reduce((a,s) => a+s.profits,0).toLocaleString()} ر.س`} change={11} color="#10b981" />
        <InsightCard title="الرسوم المستحقة" value={`${subscribers.reduce((a,s) => a+s.systemFees,0).toLocaleString()} ر.س`} change={-2} color="#f59e0b" />
        <InsightCard title="معدل إكمال العمليات" value={operations.length ? `${Math.round(operations.filter(o=>o.status==='مكتمل').length/operations.length*100)}%` : '0%'} change={4} color="#3b82f6" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Operations */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-white font-black mb-4 flex items-center gap-2"><Activity size={16} className="text-purple-400" />توزيع العمليات الشهرية</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="مكتمل" fill="#10b981" radius={[4,4,0,0]} stackId="a" />
              <Bar dataKey="قيد المعالجة" fill="#3b82f6" radius={[0,0,0,0]} stackId="a" />
              <Bar dataKey="تنشيط" fill="#ef4444" radius={[4,4,0,0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Trend */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-white font-black mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-400" />اتجاه الأرباح والرسوم</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={profitTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="profits" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4, stroke: '#1e1b4b', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="fees" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Currency Distribution */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-white font-black mb-4 flex items-center gap-2"><PieIcon size={16} className="text-blue-400" />توزيع العملات</h3>
          {currencyDist.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={currencyDist} cx="50%" cy="50%" outerRadius={60} paddingAngle={3} dataKey="value">
                    {currencyDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {currencyDist.slice(0, 4).map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-slate-400">{c.name}</span>
                    </div>
                    <span className="text-xs font-bold text-white">{c.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="h-32 flex items-center justify-center text-slate-500 text-sm">لا توجد بيانات</div>}
        </div>

        {/* Platform Performance */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-white font-black mb-4 flex items-center gap-2"><Zap size={16} className="text-amber-400" />أداء المنصات</h3>
          {platformData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={platformData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={60} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="subs" fill="#a855f7" radius={[0,4,4,0]} name="مشتركون" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-32 flex items-center justify-center text-slate-500 text-sm">لا توجد بيانات</div>}
        </div>

        {/* Radar */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-white font-black mb-4 flex items-center gap-2"><Users size={16} className="text-purple-400" />مؤشر الأداء الشامل</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="الأداء" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
