import { motion } from 'framer-motion';
import { Heart, FileText, Phone } from 'lucide-react';
import { useSOS } from '../../context/SOSContext';
import { Link } from 'react-router-dom';

export default function PostIncidentScreen() {
  const { phase, dismissRecovery } = useSOS();

  if (phase !== 'recovery') return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 bg-charcoal flex items-center justify-center px-6 safe-area-top safe-area-bottom"
    >
      <div className="text-center max-w-sm">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6"
        >
          <Heart className="w-10 h-10 text-success" aria-hidden="true" />
        </motion.div>

        <h1 className="text-offwhite text-2xl font-bold mb-3">You're safe</h1>
        <p className="text-offwhite/60 text-sm mb-8 leading-relaxed">
          Your contacts have been notified that you're okay. Your recording has been saved locally on this device.
        </p>

        <div className="space-y-3">
          <Link
            to="/incidents"
            onClick={dismissRecovery}
            className="btn-primary w-full"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            Log incident report
          </Link>
          <a href="tel:181" className="btn-ghost w-full text-offwhite border border-offwhite/10">
            <Phone className="w-4 h-4" aria-hidden="true" />
            Women Helpline (181)
          </a>
          <button
            type="button"
            onClick={dismissRecovery}
            className="text-offwhite/40 text-sm underline mt-4"
          >
            Return home
          </button>
        </div>
      </div>
    </motion.div>
  );
}
