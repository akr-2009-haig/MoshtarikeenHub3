import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, Users, ClipboardList, BarChart3,
  Settings, Shield, FileText, Database, Activity, Bell,
  TrendingUp, Zap, LogOut, Moon, Sun, ChevronLeft
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  keywords?: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onExit: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

export function ProCommandPalette({ open, onClose, onNavigate, onExit, onToggleTheme, isDark }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: 'dashboard', label: 'لوحة التحكم التنفيذية', icon: <LayoutDashboard size={16} />, action: () => { onNavigate('dashboard'); onClose(); }, category: 'تنقل', keywords: ['dashboard', 'رئيسي'] },
    { id: 'analytics', label: 'مركز التحليلات', icon: <BarChart3 size={16} />, action: () => { onNavigate('analytics'); onClose(); }, category: 'تنقل' },
    { id: 'subscribers', label: 'إدارة المشتركين', icon: <Users size={16} />, action: () => { onNavigate('subscribers'); onClose(); }, category: 'تنقل', keywords: ['subscribers', 'مشتركين'] },
    { id: 'operations', label: 'سجل العمليات', icon: <ClipboardList size={16} />, action: () => { onNavigate('operations'); onClose(); }, category: 'تنقل' },
    { id: 'financials', label: 'المركز المالي', icon: <TrendingUp size={16} />, action: () => { onNavigate('financials'); onClose(); }, category: 'تنقل' },
    { id: 'reports', label: 'مركز التقارير', icon: <FileText size={16} />, action: () => { onNavigate('reports'); onClose(); }, category: 'تنقل' },
    { id: 'inquiry', label: 'الاستعلام عن الأرباح', icon: <Search size={16} />, action: () => { onNavigate('inquiry'); onClose(); }, category: 'تنقل' },
    { id: 'audit', label: 'سجل المراجعة', icon: <Shield size={16} />, action: () => { onNavigate('audit'); onClose(); }, category: 'تنقل' },
    { id: 'health', label: 'صحة النظام', icon: <Activity size={16} />, action: () => { onNavigate('health'); onClose(); }, category: 'تنقل' },
    { id: 'backup', label: 'النسخ الاحتياطي', icon: <Database size={16} />, action: () => { onNavigate('backup'); onClose(); }, category: 'تنقل' },
    { id: 'tasks', label: 'إدارة المهام', icon: <Zap size={16} />, action: () => { onNavigate('tasks'); onClose(); }, category: 'تنقل' },
    { id: 'notifications', label: 'الإشعارات', icon: <Bell size={16} />, action: () => { onNavigate('notifications'); onClose(); }, category: 'تنقل' },
    { id: 'settings', label: 'الإعدادات', icon: <Settings size={16} />, action: () => { onNavigate('settings'); onClose(); }, category: 'تنقل' },
    { id: 'theme', label: isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن', icon: isDark ? <Sun size={16} /> : <Moon size={16} />, action: () => { onToggleTheme(); onClose(); }, category: 'إعدادات' },
    { id: 'exit', label: 'الخروج من النظام المتقدم', icon: <LogOut size={16} />, action: () => { onExit(); onClose(); }, category: 'نظام' },
  ];

  const filtered = query.trim()
    ? commands.filter(c =>
        c.label.includes(query) ||
        c.description?.includes(query) ||
        c.keywords?.some(k => k.includes(query.toLowerCase())) ||
        c.category.includes(query)
      )
    : commands;

  const categories = [...new Set(filtered.map(c => c.category))];

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-start justify-center pt-24 px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#1a0a2e', border: '1px solid rgba(168,85,247,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search size={18} className="text-purple-400 flex-shrink-0" />
              <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                placeholder="البحث في الأوامر والصفحات..."
                className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-sm font-medium" />
              <div className="flex items-center gap-1 text-xs text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/10">
                <span>ESC</span>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin py-2">
              {categories.map(cat => (
                <div key={cat}>
                  <p className="px-4 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{cat}</p>
                  {filtered.filter(c => c.category === cat).map((cmd, i) => (
                    <button key={cmd.id} onClick={cmd.action}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-500/10 transition-colors text-right group"
                      style={{ direction: 'rtl' }}>
                      <span className="text-purple-400 group-hover:text-purple-300 transition-colors flex-shrink-0">{cmd.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{cmd.label}</p>
                        {cmd.description && <p className="text-xs text-slate-500 truncate">{cmd.description}</p>}
                      </div>
                      <ChevronLeft size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  <Search size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد نتائج لـ "{query}"</p>
                </div>
              )}
            </div>
            <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-600">
              <span>Ctrl+K للفتح</span>
              <span>↑↓ للتنقل · Enter للتنفيذ</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
