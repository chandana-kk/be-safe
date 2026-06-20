import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useSOS } from '../../context/SOSContext';
import { Link, useNavigate } from 'react-router-dom';

export default function NoContactsModal() {
  const { phase, dismissNoContacts } = useSOS();
  const navigate = useNavigate();

  if (phase !== 'no_contacts') return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-charcoal/60 backdrop-blur-sm px-4 pb-8 safe-area-bottom"
      role="dialog"
      aria-labelledby="no-contacts-title"
    >
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        className="card w-full max-w-sm p-6 relative"
      >
        <div className="w-14 h-14 rounded-2xl bg-coral/10 flex items-center justify-center mb-4">
          <Users className="w-7 h-7 text-coral" aria-hidden="true" />
        </div>
        <h2 id="no-contacts-title" className="text-xl font-bold mb-2">Add a contact first</h2>
        <p className="text-charcoal/60 dark:text-offwhite/60 text-sm mb-6">
          SOS needs at least one emergency contact to send alerts. Add someone you trust before you need help.
        </p>
        <Link to="/contacts" onClick={dismissNoContacts} className="btn-coral w-full mb-3">
          Add emergency contact
        </Link>
        <button type="button" onClick={() => { dismissNoContacts(); navigate('/'); }} className="btn-ghost w-full text-sm">
          Go back
        </button>
      </motion.div>
    </motion.div>
  );
}
