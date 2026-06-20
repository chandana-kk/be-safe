import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wifi, WifiOff, Shield } from 'lucide-react';
import SOSButton from '../components/sos/SOSButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { assessSafetyRisk } from '../lib/safetyEngine';
import { getContacts, getLastLocation } from '../lib/storage';
import { useWalk } from '../context/WalkContext';
import Badge from '../components/common/Badge';

export default function HomePage() {
  const { isActive: walkActive } = useWalk();
  const isOnline = useOnlineStatus();
  const contacts = getContacts();
  const lastLocation = getLastLocation();

  const risk = useMemo(
    () => assessSafetyRisk({
      isOnline,
      hasContacts: contacts.length > 0,
      lastLocation,
      isWalking: walkActive,
    }),
    [isOnline, contacts.length, lastLocation, walkActive]
  );

  const riskColor = {
    low: 'text-success',
    medium: 'text-warning',
    high: 'text-coral',
  }[risk.level];

  return (
    <div className="px-4 pt-6 safe-area-top">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-extrabold tracking-tight"
          >
            Safe<span className="text-gradient-accent">Her</span>
          </motion.h1>
          <p className="text-xs text-charcoal/50 dark:text-offwhite/50 mt-0.5">
            Your safety companion
          </p>
        </div>
        <div className="flex items-center gap-2">
          {walkActive && <Badge variant="accent">Walk active</Badge>}
          <Badge variant={isOnline ? 'accent' : 'offline'}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'Online' : 'Offline ready'}
          </Badge>
        </div>
      </header>

      {/* AI Insight card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-4 mb-8 border-accent/10"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-accent" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Safety Insight</span>
              <Badge variant="demo">Pilot</Badge>
            </div>
            <p className={`text-sm font-semibold ${riskColor} mb-1 capitalize`}>{risk.level} readiness</p>
            <p className="text-xs text-charcoal/60 dark:text-offwhite/60">{risk.recommendation}</p>
          </div>
        </div>
        {risk.factors.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {risk.factors.slice(0, 2).map((f, i) => (
              <li key={i} className="text-xs text-charcoal/50 dark:text-offwhite/50 flex items-start gap-2">
                <Shield className="w-3 h-3 mt-0.5 shrink-0 text-accent/60" aria-hidden="true" />
                {f.message}
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* SOS Button — centerpiece */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="flex flex-col items-center py-6"
      >
        <SOSButton />
      </motion.div>

      {/* Quick status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 grid grid-cols-2 gap-3"
      >
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-accent">{contacts.length}</p>
          <p className="text-xs text-charcoal/50 dark:text-offwhite/50">Emergency contacts</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-accent">{isOnline ? '✓' : '✓'}</p>
          <p className="text-xs text-charcoal/50 dark:text-offwhite/50">
            {isOnline ? 'Full features' : 'Offline SOS ready'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
