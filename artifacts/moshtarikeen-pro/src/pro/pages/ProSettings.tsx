import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Moon, Sun, Save, Lock, Bell, Database,
  Palette, Globe, Shield, Eye, EyeOff, Check, Zap, Clock
} from 'lucide-react';
import { usePro } from '../store/ProContext';
import { clearStorage } from '../store/storage';

export function ProSettings() {
  const { state, dispatch, addAuditLog, addNotification } = usePro();
  const { proSettings, proTheme } = state;
  const [showPin, setShowPin] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localSettings, setLocalSettings] = useState({ ...proSettings });
  const [localTheme, setLocalTheme] = useState({ ...proTheme });

  const handleSave = () => {
    dispatch({ type: 'SET_PRO_SETTINGS', payload: localSettings });
    dispatch({ type: 'SET_PRO_THEME', payload: localTheme });
    addAuditLog('تحديث الإعدادات', 'settings', 'general', 'تم تحديث إعدادات النظام', 'update');
    addNotification('تم الحفظ', 'تم حفظ الإعدادات بنجاح', 'success');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearData = () => {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع.')) {
      clearStorage();
      window.location.reload();
    }
  };

  const upd = (k: keyof typeof localSettings, v: any) => setLocalSettings(p => ({ ...p, [k]: v }));
  const updT = (k: keyof typeof localTheme, v: any) => setLocalTheme(p => ({ ...p, [k]: v }));

  const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-5 py-3.5 border-b border-white/10 flex items-center gap-2">
        <span className="text-purple-400">{icon}</span>
        <h3 className="text-white font-black text-sm">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );

  const Toggle = ({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${value ? 'bg-purple-600' : 'bg-white/10'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? 'left-0.5 translate-x-5' : 'left-0.5'}`} />
      </button>
    </div>
  );

  const accentOptions = [
    { value: 'purple', label: 'بنفسجي', color: '#a855f7' },
    { value: 'gold', label: 'ذهبي', color: '#f59e0b' },
    { value: 'blue', label: 'أزرق', color: '#3b82f6' },
    { value: 'emerald', label: 'زمردي', color: '#10b981' },
  ];

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Settings size={24} className="text-purple-400" /> الإعدادات
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">تخصيص النظام وإدارة الإعدادات</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
          style={{ background: saved ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}>
          {saved ? <><Check size={15} /> محفوظ</> : <><Save size={15} /> حفظ الإعدادات</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Theme */}
        <Section title="المظهر والألوان" icon={<Palette size={16} />}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">وضع العرض</p>
              <p className="text-xs text-slate-500 mt-0.5">الوضع الداكن أو الفاتح</p>
            </div>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <button onClick={() => updT('mode', 'dark')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={localTheme.mode === 'dark' ? { background: 'rgba(168,85,247,0.3)', color: '#c084fc' } : { color: '#64748b' }}>
                <Moon size={12} /> داكن
              </button>
              <button onClick={() => updT('mode', 'light')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={localTheme.mode === 'light' ? { background: 'rgba(168,85,247,0.3)', color: '#c084fc' } : { color: '#64748b' }}>
                <Sun size={12} /> فاتح
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-white mb-2">لون التمييز</p>
            <div className="flex gap-2">
              {accentOptions.map(opt => (
                <button key={opt.value} onClick={() => updT('accent', opt.value as any)}
                  title={opt.label}
                  className="w-10 h-10 rounded-xl transition-all flex items-center justify-center"
                  style={{
                    background: opt.color,
                    boxShadow: localTheme.accent === opt.value ? `0 0 0 3px ${opt.color}40, 0 0 15px ${opt.color}30` : 'none',
                    opacity: localTheme.accent === opt.value ? 1 : 0.5,
                  }}>
                  {localTheme.accent === opt.value && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-white mb-2">كثافة العرض</p>
            <div className="flex gap-2">
              {[{ value: 'compact', label: 'مضغوط' }, { value: 'normal', label: 'عادي' }, { value: 'comfortable', label: 'مريح' }].map(opt => (
                <button key={opt.value} onClick={() => updT('density', opt.value as any)}
                  className="flex-1 h-9 rounded-xl text-xs font-bold transition-all"
                  style={localTheme.density === opt.value ? { background: 'rgba(168,85,247,0.25)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.4)' } : { background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-white mb-2">حجم الخط</p>
            <div className="flex gap-2">
              {[{ value: 'sm', label: 'صغير' }, { value: 'md', label: 'متوسط' }, { value: 'lg', label: 'كبير' }].map(opt => (
                <button key={opt.value} onClick={() => updT('fontSize', opt.value as any)}
                  className="flex-1 h-9 rounded-xl text-xs font-bold transition-all"
                  style={localTheme.fontSize === opt.value ? { background: 'rgba(168,85,247,0.25)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.4)' } : { background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="الإشعارات" icon={<Bell size={16} />}>
          <Toggle label="الإشعارات" desc="إظهار الإشعارات التلقائية" value={localSettings.notifications} onChange={v => upd('notifications', v)} />
          <Toggle label="الأصوات" desc="تشغيل أصوات الإشعارات" value={localSettings.soundAlerts} onChange={v => upd('soundAlerts', v)} />
        </Section>

        {/* Auto Save */}
        <Section title="الحفظ التلقائي" icon={<Database size={16} />}>
          <Toggle label="الحفظ التلقائي" desc="حفظ البيانات تلقائياً" value={localSettings.autoSave} onChange={v => upd('autoSave', v)} />
          {localSettings.autoSave && (
            <div>
              <p className="text-sm font-bold text-white mb-2">فترة الحفظ (ثانية): {localSettings.autoSaveInterval}</p>
              <input type="range" min={5} max={120} step={5} value={localSettings.autoSaveInterval} onChange={e => upd('autoSaveInterval', Number(e.target.value))}
                className="w-full accent-purple-500" />
              <div className="flex justify-between text-xs text-slate-500 mt-1"><span>5 ث</span><span>120 ث</span></div>
            </div>
          )}
        </Section>

        {/* Session Lock */}
        <Section title="قفل الجلسة" icon={<Lock size={16} />}>
          <Toggle label="قفل الجلسة التلقائي" desc="قفل النظام تلقائياً عند عدم النشاط" value={localSettings.sessionLock} onChange={v => upd('sessionLock', v)} />
          {localSettings.sessionLock && (
            <>
              <div>
                <p className="text-sm font-bold text-white mb-2">مهلة القفل: {localSettings.sessionLockTimeout} دقيقة</p>
                <input type="range" min={1} max={60} value={localSettings.sessionLockTimeout} onChange={e => upd('sessionLockTimeout', Number(e.target.value))}
                  className="w-full accent-purple-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-2">رمز PIN</p>
                <div className="relative">
                  <input type={showPin ? 'text' : 'password'} value={localSettings.sessionPin} onChange={e => upd('sessionPin', e.target.value)}
                    placeholder="أدخل رمز PIN (4-8 أرقام)"
                    className="w-full h-10 pr-3 pl-10 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                  <button onClick={() => setShowPin(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </Section>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <h3 className="text-red-400 font-black mb-2 flex items-center gap-2"><Shield size={16} />منطقة الخطر</h3>
        <p className="text-slate-400 text-sm mb-4">هذه الإجراءات لا يمكن التراجع عنها. تأكد قبل المتابعة.</p>
        <button onClick={handleClearData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-red-400 text-sm transition-all hover:bg-red-400/15"
          style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
          <Database size={15} /> مسح جميع البيانات
        </button>
      </div>
    </div>
  );
}
