import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useSOS } from '../../context/SOSContext';

export default function SOSButton() {
  const { phase, activateSOS, confirmSOSNow, cancelSOS } = useSOS();
  const isCountdown = phase === 'countdown';

  const handlePointerDown = () => {
    if (phase === 'idle') {
      activateSOS('button');
    } else if (phase === 'countdown') {
      confirmSOSNow();
    }
  };

  const handlePointerUp = () => {
    // Short tap during countdown cancels if released quickly — handled by countdown timer
  };

  if (phase === 'active' || phase === 'recovery') return null;

  return (
    <div className="flex flex-col items-center">
      <motion.button
        type="button"
        aria-label={isCountdown ? 'Hold to confirm SOS immediately' : 'Hold to activate SOS emergency alert'}
        className={`relative w-44 h-44 rounded-full flex flex-col items-center justify-center text-white font-bold focus-visible:ring-4 focus-visible:ring-coral/50 ${
          isCountdown ? 'bg-coral-dark scale-95' : 'bg-coral sos-pulse shadow-[var(--shadow-glow-coral)]'
        }`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        whileTap={{ scale: 0.95 }}
        animate={isCountdown ? { scale: [0.95, 1, 0.95] } : {}}
        transition={{ repeat: isCountdown ? Infinity : 0, duration: 0.8 }}
      >
        <Shield className="w-12 h-12 mb-1" strokeWidth={1.5} aria-hidden="true" />
        <span className="text-lg tracking-wide">{isCountdown ? 'CONFIRM' : 'SOS'}</span>
        <span className="text-xs font-normal opacity-80 mt-0.5">
          {isCountdown ? 'Hold to skip wait' : 'Hold 1 sec'}
        </span>
      </motion.button>
      {isCountdown && (
        <button
          type="button"
          onClick={cancelSOS}
          className="mt-4 text-sm text-charcoal/50 dark:text-offwhite/50 underline focus-visible:ring-2 focus-visible:ring-accent rounded px-2"
        >
          Cancel
        </button>
      )}
      <p className="mt-4 text-xs text-charcoal/40 dark:text-offwhite/40 text-center max-w-[200px]">
        Or shake phone 3× quickly
      </p>
    </div>
  );
}
