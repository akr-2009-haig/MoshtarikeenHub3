import { useEffect } from 'react';
import { usePro } from '../store/ProContext';

export function useProTheme() {
  const { state, dispatch } = usePro();
  const theme = state.proTheme;

  useEffect(() => {
    const root = document.documentElement;
    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme.mode]);

  useEffect(() => {
    const root = document.documentElement;
    const sizes = { sm: '13px', md: '15px', lg: '17px' };
    root.style.fontSize = sizes[theme.fontSize];
  }, [theme.fontSize]);

  const setMode = (mode: 'dark' | 'light') => {
    dispatch({ type: 'SET_PRO_THEME', payload: { mode } });
  };

  const setAccent = (accent: 'purple' | 'gold' | 'blue' | 'emerald') => {
    dispatch({ type: 'SET_PRO_THEME', payload: { accent } });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'SET_PRO_THEME', payload: { sidebarCollapsed: !theme.sidebarCollapsed } });
  };

  const accentColors = {
    purple: { primary: '#a855f7', secondary: '#7c3aed', glow: 'rgba(168,85,247,0.3)', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
    gold: { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245,158,11,0.3)', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
    blue: { primary: '#3b82f6', secondary: '#1d4ed8', glow: 'rgba(59,130,246,0.3)', gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' },
    emerald: { primary: '#10b981', secondary: '#059669', glow: 'rgba(16,185,129,0.3)', gradient: 'linear-gradient(135deg, #059669, #10b981)' },
  };

  return { theme, setMode, setAccent, toggleSidebar, accentColors, currentAccent: accentColors[theme.accent] };
}
