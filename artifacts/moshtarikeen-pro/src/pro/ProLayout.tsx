import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, ClipboardList, BarChart3, TrendingUp,
  FileText, Shield, Activity, Settings, Database, Search,
  Bell, Command, Menu, X, ChevronLeft, Crown, Sparkles,
  LogOut, CheckSquare, Eye, Zap
} from 'lucide-react';
import { usePro } from './store/ProContext';
import { useProTheme } from './hooks/useProTheme';
import { ProCommandPalette } from './components/ProCommandPalette';
import { ProNotificationCenter } from './components/ProNotificationCenter';
import { ProSessionLock } from './components/ProSessionLock';

type Tab =
  | 'dashboard' | 'analytics' | 'subscribers' | 'operations' | 'financials'
  | 'reports' | 'inquiry' | 'audit' | 'health' | 'backup' | 'tasks'
  | 'notifications' | 'settings' | 'fields';

interface NavItem {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  group: string;
  accent?: string;
}

interface ProLayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  onExit: () => void;
}

export function ProLayout({ children, activeTab, onTabChange, onExit }: ProLayoutProps) {
  const { state, isSessionLocked } = usePro();
  const { theme, toggleSidebar, setMode, currentAccent } = useProTheme();
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadNotifs = state.notifications.filter(n => !n.read).length;

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={18} />, group: 'رئيسي', accent: currentAccent.primary },
    { id: 'analytics', label: 'مركز التحليلات', icon: <BarChart3 size={18} />, group: 'رئيسي' },
    { id: 'subscribers', label: 'إدارة المشتركين', icon: <Users size={18} />, badge: state.subscribers.filter(s => s.subscriberStatus === 'نشط').length, group: 'الإدارة' },
    { id: 'operations', label: 'سجل العمليات', icon: <ClipboardList size={18} />, badge: state.operations.filter(o => o.status === 'قيد المعالجة').length || undefined, group: 'الإدارة' },
    { id: 'financials', label: 'المركز المالي', icon: <TrendingUp size={18} />, group: 'الإدارة' },
    { id: 'inquiry', label: 'استعلام الأرباح', icon: <Search size={18} />, group: 'الاستعلام' },
    { id: 'reports', label: 'مركز التقارير', icon: <FileText size={18} />, group: 'التقارير' },
    { id: 'tasks', label: 'إدارة المهام', icon: <CheckSquare size={18} />, badge: state.tasks.filter(t => t.status === 'pending').length || undefined, group: 'الأدوات' },
    { id: 'fields', label: 'مدير الحقول', icon: <Eye size={18} />, group: 'الأدوات' },
    { id: 'notifications', label: 'الإشعارات', icon: <Bell size={18} />, badge: unreadNotifs || undefined, group: 'النظام' },
    { id: 'audit', label: 'سجل المراجعة', icon: <Shield size={18} />, group: 'النظام' },
    { id: 'health', label: 'صحة النظام', icon: <Activity size={18} />, group: 'النظام' },
    { id: 'settings', label: 'الإعدادات', icon: <Settings size={18} />, group: 'النظام' },
  ];

  const groups = [...new Set(navItems.map(n => n.group))];

  const NavItemComp = ({ item, collapsed }: { item: NavItem; collapsed: boolean }) => (
    <button
      onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all group relative"
      style={activeTab === item.id ? {
        background: `${currentAccent.primary}20`,
        color: currentAccent.primary,
        border: `1px solid ${currentAccent.primary}30`,
        boxShadow: `0 0 15px ${currentAccent.glow}`,
      } : { color: '#64748b', border: '1px solid transparent' }}>
      <span className={`flex-shrink-0 transition-colors ${activeTab === item.id ? '' : 'group-hover:text-slate-200'}`}>{item.icon}</span>
      {!collapsed && (
        <>
          <span className="text-sm font-bold flex-1 text-right truncate transition-colors group-hover:text-slate-200">{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="text-xs font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center text-white"
              style={{ background: activeTab === item.id ? currentAccent.primary : '#ef4444' }}>
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && item.badge !== undefined && item.badge > 0 && (
        <span className="absolute -top-1 -left-1 text-xs w-4 h-4 rounded-full text-white flex items-center justify-center"
          style={{ background: '#ef4444', fontSize: '9px' }}>
          {item.badge > 9 ? '9+' : item.badge}
        </span>
      )}
      {activeTab === item.id && (
        <motion.div layoutId="sidebar-active" className="absolute right-0 top-1 bottom-1 w-0.5 rounded-full"
          style={{ background: currentAccent.gradient }} />
      )}
    </button>
  );

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-3 py-4 mb-2 ${collapsed ? 'justify-center' : ''}`}>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: currentAccent.gradient, boxShadow: `0 4px 15px ${currentAccent.glow}` }}>
          <Crown size={18} className="text-white" />
        </motion.div>
        {!collapsed && (
          <div>
            <p className="text-white font-black text-sm leading-tight">النظام المتقدم</p>
            <p className="text-xs font-bold leading-tight flex items-center gap-1" style={{ color: currentAccent.primary }}>
              <Sparkles size={9} /> PRO Edition
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 space-y-4">
        {groups.map(group => (
          <div key={group}>
            {!collapsed && (
              <p className="text-xs font-black text-slate-600 uppercase tracking-widest px-3 mb-1.5">{group}</p>
            )}
            <div className="space-y-0.5">
              {navItems.filter(n => n.group === group).map(item => (
                <NavItemComp key={item.id} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className={`px-2 py-3 border-t mt-2 space-y-1 ${collapsed ? '' : ''}`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black text-white"
              style={{ background: currentAccent.gradient }}>م</div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-xs truncate">المدير</p>
              <p className="text-slate-500 text-xs">Administrator</p>
            </div>
          </div>
        )}
        <button onClick={onExit}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
          style={{ direction: 'rtl' }}>
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-bold">الخروج إلى النظام الأساسي</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" dir="rtl"
      style={{ background: 'linear-gradient(135deg, #0a0014 0%, #0f172a 60%, #0c1a3d 100%)', fontFamily: "'Cairo', sans-serif" }}>

      {/* Session Lock */}
      {isSessionLocked && <ProSessionLock />}

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: theme.sidebarCollapsed ? 64 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col flex-shrink-0 h-full overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
        }}>
        <SidebarContent collapsed={theme.sidebarCollapsed} />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-64 flex flex-col lg:hidden"
              style={{ background: '#0f0a20', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <p className="text-white font-black text-sm">القائمة</p>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-hidden">
                <SidebarContent collapsed={false} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-3.5 flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-slate-400 transition-colors">
              <Menu size={20} />
            </button>
            {/* Desktop collapse */}
            <button onClick={toggleSidebar} className="hidden lg:flex p-2 rounded-xl hover:bg-white/10 text-slate-400 transition-colors">
              <ChevronLeft size={18} className={`transition-transform ${theme.sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
            <div className="hidden sm:block">
              <p className="text-white font-black text-sm">{navItems.find(n => n.id === activeTab)?.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Command */}
            <button onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl text-slate-400 text-xs font-bold transition-colors hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <Command size={13} /> K
            </button>
            {/* Notifications */}
            <button onClick={() => setNotifOpen(v => !v)} className="relative p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <Bell size={18} />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center leading-none">
                  {unreadNotifs > 9 ? '9+' : unreadNotifs}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Command Palette */}
      <ProCommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={tab => { onTabChange(tab as Tab); }}
        onExit={onExit}
        onToggleTheme={() => setMode(theme.mode === 'dark' ? 'light' : 'dark')}
        isDark={theme.mode === 'dark'}
      />

      {/* Notification Center */}
      <ProNotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}

export type { Tab };
