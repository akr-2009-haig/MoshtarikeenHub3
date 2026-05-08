import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCheck, Trash2, Info, CheckCircle2, AlertTriangle,
  XCircle, X, Filter
} from 'lucide-react';
import { usePro } from '../store/ProContext';
import type { Notification } from '../../types';
import { useState } from 'react';

const TYPE_ICONS: Record<Notification['type'], React.ReactNode> = {
  info: <Info size={16} className="text-blue-400" />,
  success: <CheckCircle2 size={16} className="text-emerald-400" />,
  warning: <AlertTriangle size={16} className="text-amber-400" />,
  error: <XCircle size={16} className="text-red-400" />,
};

const TYPE_STYLES: Record<Notification['type'], { bg: string; border: string; glow: string }> = {
  info: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', glow: '#3b82f6' },
  success: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', glow: '#10b981' },
  warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', glow: '#f59e0b' },
  error: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', glow: '#ef4444' },
};

export function ProNotifications() {
  const { state, dispatch } = usePro();
  const { notifications } = state;
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = typeFilter === 'all' ? notifications :
    typeFilter === 'unread' ? notifications.filter(n => !n.read) :
    notifications.filter(n => n.type === typeFilter);

  const unreadCount = notifications.filter(n => !n.read).length;
  const stats = {
    all: notifications.length,
    unread: unreadCount,
    success: notifications.filter(n => n.type === 'success').length,
    warning: notifications.filter(n => n.type === 'warning').length,
    error: notifications.filter(n => n.type === 'error').length,
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Bell size={24} className="text-purple-400" /> مركز الإشعارات
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">{unreadCount} إشعار غير مقروء</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-emerald-400 hover:bg-emerald-400/10 transition-colors"
              style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
              <CheckCheck size={14} /> قراءة الكل
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-colors"
              style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
              <Trash2 size={14} /> مسح الكل
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: 'all', label: 'الكل', value: stats.all, color: '#a855f7' },
          { key: 'unread', label: 'غير مقروء', value: stats.unread, color: '#3b82f6' },
          { key: 'success', label: 'ناجح', value: stats.success, color: '#10b981' },
          { key: 'warning', label: 'تحذير', value: stats.warning, color: '#f59e0b' },
          { key: 'error', label: 'خطأ', value: stats.error, color: '#ef4444' },
        ].map(s => (
          <button key={s.key} onClick={() => setTypeFilter(s.key)}
            className="rounded-xl p-3 text-center transition-all"
            style={{
              background: typeFilter === s.key ? `${s.color}20` : `${s.color}08`,
              border: `1px solid ${typeFilter === s.key ? s.color + '50' : s.color + '25'}`,
              boxShadow: typeFilter === s.key ? `0 0 15px ${s.color}20` : 'none',
            }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Bell size={28} className="mx-auto mb-2 text-slate-600" />
          <p className="text-slate-500 text-sm">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((notif, i) => {
              const s = TYPE_STYLES[notif.type];
              return (
                <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer hover:bg-white/5"
                  style={{
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    boxShadow: !notif.read ? `0 0 15px ${s.glow}10` : 'none',
                  }}
                  onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notif.id })}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.glow}20` }}>
                    {TYPE_ICONS[notif.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-bold ${notif.read ? 'text-slate-400' : 'text-white'}`}>{notif.title}</p>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />}
                      {notif.category && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc' }}>{notif.category}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {new Date(notif.timestamp).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notif.id }); }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors flex-shrink-0">
                    <X size={13} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
