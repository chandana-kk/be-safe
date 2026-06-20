import { useEffect, useRef, useCallback } from 'react';
import { getSettings } from '../lib/storage';

/**
 * Shake detection — 3 shakes within ~2 seconds.
 * Calibrated threshold prevents false triggers during walking/jogging.
 */
export function useShakeDetection(onShake, enabled = true) {
  const shakeCountRef = useRef(0);
  const lastShakeRef = useRef(0);
  const lastTriggerRef = useRef(0);
  const onShakeRef = useRef(onShake);

  useEffect(() => {
    onShakeRef.current = onShake;
  }, [onShake]);

  const handleMotion = useCallback((event) => {
    const settings = getSettings();
    if (!enabled || !settings.shakeEnabled) return;

    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const { x = 0, y = 0, z = 0 } = acc;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const threshold = settings.shakeSensitivity + 9.8; // ~9.8 is gravity at rest

    const now = Date.now();

    // Cooldown after trigger — 5 seconds
    if (now - lastTriggerRef.current < 5000) return;

    if (magnitude > threshold) {
      // Debounce individual shake peaks — 300ms minimum between counts
      if (now - lastShakeRef.current < 300) return;

      lastShakeRef.current = now;

      // Reset count if window expired (2 seconds)
      if (now - shakeCountRef.current > 2000) {
        shakeCountRef.current = now;
      }

      const shakesInWindow = Math.floor((now - shakeCountRef.current) / 300) + 1;

      if (shakesInWindow >= 3) {
        lastTriggerRef.current = now;
        shakeCountRef.current = 0;
        onShakeRef.current?.();
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const requestPermission = async () => {
      if (typeof DeviceMotionEvent !== 'undefined' &&
          typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const state = await DeviceMotionEvent.requestPermission();
          if (state !== 'granted') return;
        } catch {
          return;
        }
      }
    };

    requestPermission();
    window.addEventListener('devicemotion', handleMotion, { passive: true });
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [enabled, handleMotion]);
}
