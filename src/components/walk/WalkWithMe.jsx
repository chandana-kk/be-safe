import { motion, AnimatePresence } from 'framer-motion';
import { Footprints, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useWalk } from '../../context/WalkContext';
import MapView from '../map/MapView';
import { getLastLocation } from '../../lib/storage';
import { getWalkTip } from '../../lib/safetyEngine';
import { useMemo } from 'react';

function formatElapsed(ms) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function WalkWithMe() {
  const {
    isActive,
    elapsedMs,
    progress,
    showCheckin,
    startWalk,
    stopWalk,
    respondSafe,
    respondNeedHelp,
  } = useWalk();

  const lastLocation = getLastLocation();
  const tip = useMemo(() => getWalkTip(), [isActive]);

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Walk With Me</h1>
        <p className="text-charcoal/60 dark:text-offwhite/60 text-sm">
          15-minute safety check-ins while you're on the move
        </p>
      </div>

      {!isActive ? (
        <div className="space-y-6">
          <div className="card p-6 text-center">
            <Footprints className="w-12 h-12 text-accent mx-auto mb-4" aria-hidden="true" />
            <p className="text-sm text-charcoal/60 dark:text-offwhite/60 mb-6">
              We'll check in every 15 minutes. If you don't respond within 2 minutes, SOS activates automatically.
            </p>
            <button type="button" onClick={startWalk} className="btn-primary w-full">
              Start Walk With Me
            </button>
          </div>
          <div className="card p-4 bg-accent/5 border-accent/10">
            <p className="text-xs text-accent font-semibold mb-1">Safety tip</p>
            <p className="text-sm">{tip}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Progress ring */}
          <div className="card p-6 flex flex-col items-center">
            <div className="relative w-44 h-44 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
                <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="8" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#6C63FF"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{formatElapsed(elapsedMs)}</span>
                <span className="text-xs text-charcoal/50 dark:text-offwhite/50">elapsed</span>
              </div>
            </div>
            <p className="text-sm text-charcoal/60 dark:text-offwhite/60 text-center">
              Next check-in in {Math.ceil((1 - progress) * 15)} min
            </p>
          </div>

          <MapView lat={lastLocation?.lat} lng={lastLocation?.lng} height="160px" />

          <button type="button" onClick={stopWalk} className="btn-ghost w-full text-sm">
            End walk safely
          </button>
        </div>
      )}

      {/* Check-in modal */}
      <AnimatePresence>
        {showCheckin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/70 backdrop-blur-sm px-4 pb-8 safe-area-bottom"
            role="alertdialog"
            aria-labelledby="checkin-title"
          >
            <motion.div
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              exit={{ y: 60 }}
              className="card w-full max-w-sm p-6"
            >
              <ShieldCheck className="w-10 h-10 text-accent mb-4" aria-hidden="true" />
              <h2 id="checkin-title" className="text-xl font-bold mb-2">Still doing okay?</h2>
              <p className="text-sm text-charcoal/60 dark:text-offwhite/60 mb-6">
                You've been on the move for 15 minutes. Tap a response within 2 minutes.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={respondSafe} className="btn-primary py-4">
                  I'm Safe
                </button>
                <button type="button" onClick={respondNeedHelp} className="btn-coral py-4">
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  Need Help
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
