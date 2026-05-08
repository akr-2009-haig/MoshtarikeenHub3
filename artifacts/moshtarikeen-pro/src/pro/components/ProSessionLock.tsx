import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { usePro } from '../store/ProContext';

export function ProSessionLock() {
  const { state, setSessionLocked } = usePro();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleUnlock = () => {
    if (pin === state.proSettings.sessionPin) {
      setSessionLocked(false);
      setPin('');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" dir="rtl"
      style={{ background: 'linear-gradient(135deg, #0a0014 0%, #0f172a 50%, #0a001f 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? 'rgba(168,85,247,0.3)' : 'rgba(245,158,11,0.2)',
              filter: 'blur(60px)',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: Math.random() * 4 + 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-sm mx-4">
        <div className="rounded-3xl p-8 text-center"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 0 40px rgba(168,85,247,0.4)' }}>
            <Lock size={36} className="text-white" />
          </motion.div>

          <h2 className="text-2xl font-black text-white mb-1">الجلسة مقفلة</h2>
          <p className="text-slate-400 text-sm mb-8">أدخل رمز PIN للمتابعة</p>

          <div className="relative mb-4">
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={e => setPin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              placeholder="رمز PIN"
              className="w-full h-14 rounded-2xl text-center text-2xl font-black text-white placeholder:text-slate-500 outline-none tracking-widest"
              style={{
                background: error ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.08)',
                border: `2px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(168,85,247,0.3)'}`,
              }}
              autoFocus
            />
            <button onClick={() => setShowPin(v => !v)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
              {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm mb-3 font-bold">
              رمز PIN غير صحيح
            </motion.p>
          )}

          <button onClick={handleUnlock}
            className="w-full h-12 rounded-2xl font-black text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 20px rgba(168,85,247,0.4)' }}>
            <Shield size={16} className="inline ml-2" />
            فتح الجلسة
          </button>

          <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
            <Lock size={10} />
            Moshtarikeen Hub PRO
          </p>
        </div>
      </motion.div>
    </div>
  );
}
