import { useState, useEffect, useCallback } from 'react';
import { getSettings } from '../lib/storage';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => computeDark(getSettings()));

  const refresh = useCallback(() => {
    setIsDark(computeDark(getSettings()));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [isDark]);

  // Re-check every minute for 7pm auto-switch
  useEffect(() => {
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { isDark, refresh };
}

function computeDark(settings) {
  if (settings.darkModeOverride === true) return true;
  if (settings.darkModeOverride === false) return false;
  const hour = new Date().getHours();
  return hour >= 19 || hour < 6;
}
