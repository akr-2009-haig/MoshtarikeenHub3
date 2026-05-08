import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ProKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color: string;
  gradient: string;
  glow: string;
  animate?: boolean;
  badge?: string;
  onClick?: () => void;
}

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const startRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = displayed;
    startTimeRef.current = null;
    const target = value;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startRef.current + (target - startRef.current) * eased);
      setDisplayed(current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{displayed.toLocaleString('ar-SA')}</>;
}

export function ProKPICard({
  title, value, subtitle, icon, trend, trendLabel,
  color, gradient, glow, animate = true, badge, onClick
}: ProKPICardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const isNumeric = typeof value === 'number' || /^[\d,.]+$/.test(String(value).replace(/\s/g, ''));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${color}25`,
        boxShadow: `0 4px 30px ${color}10`,
      }}>
      <div className="absolute inset-0 opacity-5 rounded-2xl" style={{ background: gradient }} />
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 opacity-10"
        style={{ background: gradient, filter: 'blur(20px)' }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-slate-400 text-xs font-medium mb-1">{title}</p>
            <div className="text-3xl font-black" style={{ color }}>
              {animate && isNumeric ? (
                <AnimatedNumber value={numericValue} />
              ) : (
                String(value)
              )}
            </div>
            {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: gradient, boxShadow: `0 4px 15px ${glow}` }}>
            <span className="text-white">{icon}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {trend !== undefined ? (
            <div className="flex items-center gap-1.5">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                trend > 0 ? 'bg-emerald-500/15 text-emerald-400' :
                trend < 0 ? 'bg-red-500/15 text-red-400' :
                'bg-slate-500/15 text-slate-400'
              }`}>
                {trend > 0 ? <TrendingUp size={11} /> : trend < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
                {trend > 0 ? '+' : ''}{trend}%
              </div>
              {trendLabel && <span className="text-slate-500 text-xs">{trendLabel}</span>}
            </div>
          ) : <span />}
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-60" style={{ background: gradient }} />
    </motion.div>
  );
}
