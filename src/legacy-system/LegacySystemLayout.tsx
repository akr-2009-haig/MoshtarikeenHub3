import React, { useState, useMemo } from 'react';
import {
  Users, LayoutDashboard, Settings, Bell, LogOut, Lock, Database,
  ArrowRight, Key, FileText, Activity, Mail, RefreshCw, Smartphone, 
  MapPin, Shield, ClipboardList, UserPlus, SlidersHorizontal, PanelLeftClose, PanelLeftOpen, CalendarClock, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import {
  Subscriber, Operation, SystemConfig, LiveStats, Tab,
  DashboardTab, SystemAdminTab, AdminPanel, AddOperationsTab, AddSubscriberTab
} from '../pages/Index';

type LegacyTab = 'dashboard' | 'admin' | 'addOperations' | 'addSubscriber' | 'systemAdmin';

export function LegacySystemLayout({
  subscribers, operations, systemConfig,
  onOperationsChange, onSubscribersChange, onConfigChange,
  onExit
}: {
  subscribers: Subscriber[];
  operations: Operation[];
  systemConfig: SystemConfig;
  onOperationsChange: (o: Operation[]) => void;
  onSubscribersChange: (s: Subscriber[]) => void;
  onConfigChange: (c: Partial<SystemConfig>) => void;
  onExit: () => void;
}) {
  const [activeTab, setActiveTab] = useState<LegacyTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sn = systemConfig.sectionNames;
  const co = systemConfig.cardOverrides;

  const completedOps = operations.filter(o => o.status === 'مكتمل').length;
  const activationOps = operations.filter(o => o.status === 'تنشيط النظام').length;

  const liveStats: LiveStats = useMemo(() => ({
    totalSubscribers: co.totalSubscribers || String(subscribers.length),
    totalProfits: co.totalProfits || '١٬٢٨٤٬٥٠٠ ر.س',
    activeSubscriptions: co.activeSubscriptions || String(subscribers.filter(s => s.subscriberStatus === 'نشط').length),
    pendingRequests: co.pendingFees || String(subscribers.filter(s => s.systemFees > 0).length),
    activeCount: co.activeCount || String(subscribers.filter(s => s.subscriberStatus === 'نشط').length),
    completedOpsStr: co.completedOps || String(completedOps),
    totalSubsCount: co.totalSubsCount || String(subscribers.length),
    activationOpsStr: co.activationOps || String(activationOps),
  }), [subscribers, co, completedOps, activationOps]);

  const navItems: { tab: LegacyTab; icon: React.ReactNode; label: string }[] = [
    { tab: 'dashboard', icon: <LayoutDashboard size={20} />, label: sn.dashboard },
    { tab: 'systemAdmin', icon: <SlidersHorizontal size={20} />, label: sn.systemAdmin },
    { tab: 'admin', icon: <Shield size={20} />, label: sn.admin },
    { tab: 'addOperations', icon: <ClipboardList size={20} />, label: sn.addOperations },
    { tab: 'addSubscriber', icon: <UserPlus size={20} />, label: sn.addSubscriber },
  ];

  const systemDisplayDate = systemConfig.systemDate
    || new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex bg-slate-50 relative w-full h-[calc(100vh-3.5rem)] border-t border-slate-200" dir="rtl">
      {/* ── Legacy Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 256 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="bg-gradient-to-b from-slate-900 to-slate-800 text-white hidden lg:flex flex-col h-full shadow-2xl z-20 overflow-hidden flex-shrink-0"
      >
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <Database size={20} className="text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
                <p className="font-black text-sm leading-tight whitespace-nowrap">النظام القديم</p>
                <p className="text-xs text-slate-400 whitespace-nowrap">Legacy Hub</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-2 space-y-1 mt-3 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)}
              title={sidebarCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.tab
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30 shadow-lg'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <span className="flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex-1 text-right truncate text-sm">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
          
          <Separator className="my-2 bg-white/10" />
          
          <button onClick={onExit}
            title={sidebarCollapsed ? 'العودة' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <LogOut size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>خروج من النظام القديم</span>}
          </button>
        </nav>

        <div className="p-3 border-t border-white/10">
          <button onClick={() => setSidebarCollapsed(c => !c)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}>
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <><PanelLeftClose size={16} /><span>طي الشريط</span></>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex lg:hidden gap-1 flex-wrap">
              {navItems.map(item => (
                <button key={item.tab} onClick={() => setActiveTab(item.tab)}
                  title={item.label}
                  className={`p-1.5 rounded-lg transition-colors ${activeTab === item.tab ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {React.cloneElement(item.icon as React.ReactElement, { size: 15 })}
                </button>
              ))}
               <button onClick={onExit}
                  title="العودة"
                  className={`p-1.5 rounded-lg transition-colors bg-amber-100 text-amber-600 hover:bg-amber-200 ml-2`}>
                  <LogOut size={15} />
                </button>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <h1 className="text-base font-black text-slate-800">
                {navItems.find(n => n.tab === activeTab)?.label ?? 'النظام'}
              </h1>
              <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-xs">كلاسيك</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-500">
              <CalendarClock size={12} /><span>{systemDisplayDate}</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <DashboardTab
                stats={liveStats}
                subscribers={subscribers}
                operations={operations}
                institutionalText={systemConfig.institutionalText}
                sectionName={sn.dashboard}
              />
            </motion.div>
          )}
          {activeTab === 'systemAdmin' && (
            <motion.div key="systemAdmin" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <SystemAdminTab
                systemConfig={systemConfig}
                onConfigChange={onConfigChange}
                subscribersCount={subscribers.length}
                sectionName={sn.systemAdmin}
              />
            </motion.div>
          )}
          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AdminPanel subscribers={subscribers} operations={operations} sectionName={sn.admin} />
            </motion.div>
          )}
          {activeTab === 'addOperations' && (
            <motion.div key="ops" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AddOperationsTab
                operations={operations}
                onOperationsChange={onOperationsChange}
                subscriberNames={subscribers.map(s => s.name)}
                sectionName={sn.addOperations}
              />
            </motion.div>
          )}
          {activeTab === 'addSubscriber' && (
            <motion.div key="sub" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AddSubscriberTab
                subscribers={subscribers}
                onSubscribersChange={onSubscribersChange}
                sectionName={sn.addSubscriber}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
