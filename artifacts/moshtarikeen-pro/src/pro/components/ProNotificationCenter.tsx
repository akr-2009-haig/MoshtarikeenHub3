import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { usePro } from '../store/ProContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ProNotificationCenter({ open, onClose }: Props) {
  const { state, dispatch } = usePro();
  const notifications = state.notifications;
  const unread = notifications.filter(n => !n.read).length;

  const icons = {
    info: <Info size={14} className="text-blue-400" />,
    success: <CheckCircle2 size={14} className="text-emerald-400" />,
    warning: <AlertTriangle size={14} className="text-amber-400" />,
    error: <XCircle size={14} className="text-red-400" />,
  };

  const colors = {
    info: 'border-blue-500/20 bg-blue-500/5',
    success: 'border-emerald-500/20 bg-emerald-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
    error: 'border-red-500/20 bg-red-500/5',
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-[9990]" onClick={onClose} />
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="fixed left-4 top-16 z-[9991] w-80 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#1a0a2e', border: '1px solid rgba(168,85,247,0.2)' }}>
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-purple-400" />
                <span className="text-white font-bold text-sm">الإشعارات</span>
                {unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs font-black flex items-center justify-center">{unread}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="قراءة الكل">
                    <CheckCheck size={14} />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="مسح الكل">
                    <Trash2 size={14} />
                  </button>
                )}
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  <Bell size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {notifications.map(n => (
                    <button key={n.id}
                      onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}
                      className={`w-full text-right p-3 rounded-xl border transition-all hover:bg-white/5 ${colors[n.type]} ${!n.read ? 'ring-1 ring-purple-500/20' : ''}`}>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex-shrink-0">{icons[n.type]}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${n.read ? 'text-slate-400' : 'text-white'}`}>{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {new Date(n.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0 mt-1" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
