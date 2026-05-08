import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, Activity, AlertCircle, CheckCircle2, Clock,
  Crown, Star, Zap, ArrowUpRight, BarChart3, DollarSign, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { usePro } from '../store/ProContext';
import { ProKPICard } from '../components/ProKPICard';

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

function generateChartData(subscribers: any[], operations: any[]) {
  const base = [480, 520, 610, 580, 720, 800, 760, 890, 1020, 950, 1100, 1284];
  return MONTHS.slice(0, 8).map((m, i) => ({
    name: m.slice(0, 3),
    profits: base[i] + subscribers.length * 10,
    target: base[i] * 1.1,
    subs: Math.max(0, subscribers.length - (7 - i) * 2),
  }));
}

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ProDashboard() {
  const { state } = usePro();
  const { subscribers, operations } = state;

  const stats = useMemo(() => {
    const active = subscribers.filter(s => s.subscriberStatus === 'نشط').length;
    const totalProfit = subscribers.reduce((a, s) => a + (s.profits || 0), 0);
    const totalFees = subscribers.reduce((a, s) => a + (s.systemFees || 0), 0);
    const totalSub = subscribers.reduce((a, s) => a + (s.subscriptionAmount || 0), 0);
    const completed = operations.filter(o => o.status === 'مكتمل').length;
    const pending = operations.filter(o => o.status === 'قيد المعالجة').length;
    const vip = subscribers.filter(s => s.vipLevel && s.vipLevel !== 'none').length;
    const withFees = subscribers.filter(s => s.systemFees > 0).length;
    return { active, totalProfit, totalFees, totalSub, completed, pending, vip, withFees };
  }, [subscribers, operations]);

  const chartData = useMemo(() => generateChartData(subscribers, operations), [subscribers, operations]);

  const statusDist = useMemo(() => {
    const map: Record<string, number> = {};
    subscribers.forEach(s => { map[s.subscriberStatus || 'غير محدد'] = (map[s.subscriberStatus || 'غير محدد'] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [subscribers]);

  const platformDist = useMemo(() => {
    const map: Record<string, number> = {};
    subscribers.forEach(s => { if (s.platform) map[s.platform] = (map[s.platform] || 0) + 1; });
    return Object.entries(map).slice(0, 5).map(([name, value]) => ({ name, value }));
  }, [subscribers]);

  const recentOps = operations.slice(0, 8);

  const kpiCards = [
    { title: 'إجمالي المشتركين', value: subscribers.length, subtitle: `${stats.active} نشط`, icon: <Users size={22} />, color: '#a855f7', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)', glow: 'rgba(168,85,247,0.3)', trend: 12, trendLabel: 'هذا الشهر', badge: 'إجمالي' },
    { title: 'إجمالي الأرباح', value: stats.totalProfit, subtitle: 'ر.س', icon: <TrendingUp size={22} />, color: '#10b981', gradient: 'linear-gradient(135deg, #059669, #10b981)', glow: 'rgba(16,185,129,0.3)', trend: 8, trendLabel: 'مقارنة بالشهر الماضي' },
    { title: 'رسوم مستحقة', value: stats.totalFees, subtitle: `${stats.withFees} مشترك`, icon: <AlertCircle size={22} />, color: '#f59e0b', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', glow: 'rgba(245,158,11,0.3)', trend: -3, trendLabel: 'الأسبوع الماضي' },
    { title: 'العمليات المكتملة', value: stats.completed, subtitle: `${stats.pending} قيد المعالجة`, icon: <CheckCircle2 size={22} />, color: '#3b82f6', gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', glow: 'rgba(59,130,246,0.3)', trend: 5, trendLabel: 'هذا الأسبوع' },
  ];

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'صباح الخير' : now.getHours() < 17 ? 'مساء الخير' : 'مساء النور';

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(15,23,42,0.8) 50%, rgba(29,78,216,0.2) 100%)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full opacity-20"
              style={{ width: 100 + i * 40, height: 100 + i * 40, left: `${10 + i * 15}%`, top: '50%', transform: 'translateY(-50%)', background: i % 2 === 0 ? 'rgba(168,85,247,0.3)' : 'rgba(245,158,11,0.2)', filter: 'blur(30px)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }} />
          ))}
        </div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-amber-400 text-sm font-bold">النظام المتقدم PRO</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white">{greeting}، المدير</h1>
            <p className="text-slate-400 mt-1 text-sm">
              {now.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-2xl font-black text-white">{subscribers.length}</p>
              <p className="text-xs text-slate-400">مشترك</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-2xl font-black text-emerald-400">{stats.active}</p>
              <p className="text-xs text-slate-400">نشط</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-2xl font-black text-purple-400">{operations.length}</p>
              <p className="text-xs text-slate-400">عملية</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <ProKPICard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-black">نمو الأرباح الشهرية</h3>
              <p className="text-slate-400 text-xs mt-0.5">المقارنة مع الهدف المخطط</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
              <Activity size={10} className="inline ml-1" />مباشر
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="proGradProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="proGradTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 12, fontSize: 12 }}
                formatter={(v: number, n: string) => [v.toLocaleString(), n === 'profits' ? 'الأرباح' : 'الهدف']} />
              <Area type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 5" fillOpacity={1} fill="url(#proGradTarget)" />
              <Area type="monotone" dataKey="profits" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#proGradProfit)"
                dot={{ fill: '#a855f7', strokeWidth: 2, r: 4, stroke: '#1e1b4b' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-white font-black mb-1">توزيع حالات المشتركين</h3>
          <p className="text-slate-400 text-xs mb-4">حسب الحالة الحالية</p>
          {statusDist.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {statusDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusDist.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-slate-400 truncate max-w-[80px]">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">لا توجد بيانات</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Operations */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-purple-400" />
              <h3 className="text-white font-black">آخر العمليات</h3>
            </div>
            <span className="text-xs text-slate-500">{operations.length} إجمالي</span>
          </div>
          <div className="divide-y divide-white/5">
            {recentOps.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-sm">لا توجد عمليات</div>
            ) : recentOps.map(op => (
              <div key={op.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  op.status === 'مكتمل' ? 'bg-emerald-500/20' : op.status === 'تنشيط النظام' ? 'bg-red-500/20' : 'bg-blue-500/20'
                }`}>
                  {op.status === 'مكتمل' ? <CheckCircle2 size={14} className="text-emerald-400" /> :
                    op.status === 'تنشيط النظام' ? <AlertCircle size={14} className="text-red-400" /> :
                      <Clock size={14} className="text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{op.subscriberName}</p>
                  <p className="text-xs text-slate-500">{op.operation} · {op.date}</p>
                </div>
                <span className={`text-sm font-bold ${op.status === 'مكتمل' ? 'text-emerald-400' : op.status === 'تنشيط النظام' ? 'text-red-400' : 'text-blue-400'}`}>
                  {op.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-purple-400" />
            <h3 className="text-white font-black">توزيع المنصات</h3>
          </div>
          {platformDist.length > 0 ? (
            <div className="space-y-3">
              {platformDist.map((p, i) => (
                <div key={p.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300 font-medium truncate max-w-[120px]">{p.name}</span>
                    <span className="font-black text-white">{p.value}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(p.value / Math.max(...platformDist.map(x => x.value))) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">لا توجد بيانات للمنصات</div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10">
            {[
              { label: 'متوسط الاشتراك', value: subscribers.length ? Math.round(subscribers.reduce((a, s) => a + s.subscriptionAmount, 0) / subscribers.length).toLocaleString() : '0', color: '#a855f7' },
              { label: 'إجمالي رسوم', value: stats.totalFees.toLocaleString(), color: '#f59e0b' },
              { label: 'معدل الإكمال', value: operations.length ? `${Math.round(stats.completed / operations.length * 100)}%` : '0%', color: '#10b981' },
            ].map(item => (
              <div key={item.label} className="text-center p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-lg font-black" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-tight">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
