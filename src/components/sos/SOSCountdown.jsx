import { motion } from 'framer-motion';
import { useSOS } from '../../context/SOSContext';
import { SOS_COUNTDOWN_SEC } from '../../lib/constants';

export default function SOSCountdown() {
  const { phase, countdown, cancelSOS } = useSOS();

  if (phase !== 'countdown') return null;

  const progress = (SOS_COUNTDOWN_SEC - countdown) / SOS_COUNTDOWN_SEC;
  const circumference = 2 * Math.PI * 54;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm px-6"
      role="alertdialog"
      aria-labelledby="countdown-title"
      aria-describedby="countdown-desc"
    >
      <div className="text-center">
        <h2 id="countdown-title" className="text-offwhite text-xl font-bold mb-2">
          Activating SOS
        </h2>
        <p id="countdown-desc" className="text-offwhite/60 text-sm mb-8">
          Release or tap Cancel to stop
        </p>

        <div className="relative w-36 h-36 mx-auto mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#FF4D6D"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-coral">
            {countdown}
          </span>
        </div>

        <button type="button" onClick={cancelSOS} className="btn-ghost text-offwhite border border-offwhite/20">
          Cancel SOS
        </button>
      </div>
    </motion.div>
  );
}
