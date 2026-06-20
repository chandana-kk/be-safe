/**
 * safetyEngine.js — Rule-based safety risk recommendations.
 * This is a SIMULATION of AI insights for the hackathon pilot.
 * Production: swap this module for a trained ML model API call.
 */

const TIME_RISK = {
  night: 0.7,   // 9pm–5am
  evening: 0.4, // 7pm–9pm
  day: 0.1,
};

function getTimeRisk() {
  const hour = new Date().getHours();
  if (hour >= 21 || hour < 5) return TIME_RISK.night;
  if (hour >= 19) return TIME_RISK.evening;
  return TIME_RISK.day;
}

export function assessSafetyRisk({ isOnline, hasContacts, lastLocation, isWalking }) {
  const factors = [];
  let score = 0;

  const timeRisk = getTimeRisk();
  score += timeRisk;
  if (timeRisk >= 0.4) {
    factors.push({
      type: 'time',
      level: timeRisk >= 0.6 ? 'high' : 'medium',
      message: timeRisk >= 0.6
        ? 'Late hours — consider sharing your live location with a trusted contact.'
        : 'Evening hours — stay aware of your surroundings.',
    });
  }

  if (!hasContacts) {
    score += 0.5;
    factors.push({
      type: 'contacts',
      level: 'high',
      message: 'No emergency contacts saved. Add at least one trusted contact before you need help.',
    });
  }

  if (!isOnline) {
    score += 0.15;
    factors.push({
      type: 'connectivity',
      level: 'low',
      message: 'You\'re offline — SOS still works. Alerts will use SMS or share.',
    });
  }

  if (isWalking) {
    factors.push({
      type: 'walk',
      level: 'info',
      message: 'Walk With Me is active. Next check-in keeps you connected.',
    });
  }

  if (lastLocation?.accuracy && lastLocation.accuracy > 100) {
    score += 0.1;
    factors.push({
      type: 'gps',
      level: 'low',
      message: 'GPS signal is weak. Move to an open area if you need precise location sharing.',
    });
  }

  const normalized = Math.min(score, 1);
  let level = 'low';
  if (normalized >= 0.6) level = 'high';
  else if (normalized >= 0.35) level = 'medium';

  return {
    score: normalized,
    level,
    factors,
    recommendation:
      level === 'high'
        ? 'Consider starting Walk With Me or keeping SafeHer on your home screen.'
        : level === 'medium'
          ? 'You\'re moderately prepared. Quick tip: test your SOS button once.'
          : 'You\'re set up well. SafeHer is ready if you need it.',
  };
}

export function getWalkTip() {
  const tips = [
    'Stay on well-lit paths when possible.',
    'Keep one ear open — avoid both earbuds at high volume.',
    'Share your route with a friend before heading out.',
    'Trust your instincts. It\'s okay to change direction.',
    'Keep SafeHer accessible — add it to your home screen.',
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}
