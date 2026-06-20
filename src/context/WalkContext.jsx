import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { WALK_CHECKIN_INTERVAL_MS, WALK_GRACE_PERIOD_MS, generateId } from '../lib/constants';
import { saveWalkSession, getWalkSession } from '../lib/storage';
import { speak, SOS_ANNOUNCEMENTS } from '../lib/speech';
import { getSettings } from '../lib/storage';
import { useSOS } from './SOSContext';

const WalkContext = createContext(null);

export function WalkProvider({ children }) {
  const [isActive, setIsActive] = useState(false);
  const [nextCheckinAt, setNextCheckinAt] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinNumber, setCheckinNumber] = useState(0);

  const timerRef = useRef(null);
  const elapsedRef = useRef(null);
  const graceRef = useRef(null);
  const { triggerSOS, phase } = useSOS();

  const scheduleServiceWorkerCheckin = useCallback((fireAt) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'WALK_CHECKIN_SCHEDULE',
        fireAt,
        graceMs: WALK_GRACE_PERIOD_MS,
      });
    }
  }, []);

  const startWalk = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    const now = Date.now();
    const session = {
      id: generateId(),
      startedAt: new Date().toISOString(),
      nextCheckinAt: now + WALK_CHECKIN_INTERVAL_MS,
      checkinCount: 0,
    };

    saveWalkSession(session);
    setIsActive(true);
    setNextCheckinAt(session.nextCheckinAt);
    setElapsedMs(0);
    setCheckinNumber(0);
    scheduleServiceWorkerCheckin(session.nextCheckinAt);

    elapsedRef.current = setInterval(() => {
      setElapsedMs((e) => e + 1000);
    }, 1000);
  }, [scheduleServiceWorkerCheckin]);

  const stopWalk = useCallback(() => {
    saveWalkSession(null);
    setIsActive(false);
    setNextCheckinAt(null);
    setShowCheckin(false);
    setElapsedMs(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    if (graceRef.current) clearTimeout(graceRef.current);

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'WALK_CHECKIN_CANCEL' });
    }
  }, []);

  const escalateToSOS = useCallback(() => {
    if (phase !== 'idle') return;
    stopWalk();
    const settings = getSettings();
    if (settings.voiceEnabled) {
      speak(SOS_ANNOUNCEMENTS.walkEscalation);
    }
    triggerSOS('walk');
  }, [phase, stopWalk, triggerSOS]);

  const fireCheckin = useCallback(() => {
    setShowCheckin(true);
    setCheckinNumber((n) => n + 1);

    const settings = getSettings();
    if (settings.voiceEnabled) {
      speak(SOS_ANNOUNCEMENTS.walkCheckin);
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('SafeHer — Walk Check-in', {
        body: 'You\'ve been on the move for 15 minutes. Still doing okay?',
        icon: '/favicon.svg',
        tag: 'walk-checkin',
        requireInteraction: true,
      });
    }

    graceRef.current = setTimeout(() => {
      escalateToSOS();
    }, WALK_GRACE_PERIOD_MS);
  }, [escalateToSOS]);

  const respondSafe = useCallback(() => {
    setShowCheckin(false);
    if (graceRef.current) clearTimeout(graceRef.current);

    const next = Date.now() + WALK_CHECKIN_INTERVAL_MS;
    setNextCheckinAt(next);
    saveWalkSession({
      ...getWalkSession(),
      nextCheckinAt: next,
      checkinCount: checkinNumber + 1,
    });
    scheduleServiceWorkerCheckin(next);
  }, [checkinNumber, scheduleServiceWorkerCheckin]);

  const respondNeedHelp = useCallback(() => {
    setShowCheckin(false);
    if (graceRef.current) clearTimeout(graceRef.current);
    escalateToSOS();
  }, [escalateToSOS]);

  // Main check-in timer
  useEffect(() => {
    if (!isActive || !nextCheckinAt) return;

    const msUntil = nextCheckinAt - Date.now();
    if (msUntil <= 0) {
      fireCheckin();
      return;
    }

    timerRef.current = setTimeout(fireCheckin, msUntil);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, nextCheckinAt, fireCheckin]);

  // Restore session on mount
  useEffect(() => {
    const session = getWalkSession();
    if (session?.nextCheckinAt) {
      setIsActive(true);
      setNextCheckinAt(session.nextCheckinAt);
      setCheckinNumber(session.checkinCount || 0);
      const started = new Date(session.startedAt).getTime();
      setElapsedMs(Date.now() - started);
      elapsedRef.current = setInterval(() => {
        setElapsedMs(Date.now() - started);
      }, 1000);
      scheduleServiceWorkerCheckin(session.nextCheckinAt);
    }
    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, [scheduleServiceWorkerCheckin]);

  // Listen for SW messages
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (event) => {
      if (event.data?.type === 'WALK_CHECKIN_FIRE') {
        fireCheckin();
      } else if (event.data?.type === 'WALK_ESCALATE') {
        escalateToSOS();
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [fireCheckin, escalateToSOS]);

  const progress = nextCheckinAt
    ? 1 - Math.max(0, nextCheckinAt - Date.now()) / WALK_CHECKIN_INTERVAL_MS
    : 0;

  const value = {
    isActive,
    nextCheckinAt,
    elapsedMs,
    showCheckin,
    checkinNumber,
    progress,
    startWalk,
    stopWalk,
    respondSafe,
    respondNeedHelp,
  };

  return <WalkContext.Provider value={value}>{children}</WalkContext.Provider>;
}

export function useWalk() {
  const ctx = useContext(WalkContext);
  if (!ctx) throw new Error('useWalk must be used within WalkProvider');
  return ctx;
}
