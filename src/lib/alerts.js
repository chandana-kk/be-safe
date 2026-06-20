import { buildAlertMessage, buildSafeMessage } from './constants';

/**
 * Emergency alert fallback chain — always gives the user a way to send.
 * Order: Web Share API → sms: deep link → copy to clipboard
 */
export async function sendEmergencyAlert({ contacts, lat, lng, userName }) {
  const message = buildAlertMessage({ lat, lng, userName });
  const results = [];

  for (const contact of contacts) {
    const result = await alertContact({ contact, message });
    results.push(result);
  }

  return { message, results };
}

export async function sendSafeAlert({ contacts, userName }) {
  const message = buildSafeMessage({ userName });
  const results = [];

  for (const contact of contacts) {
    const result = await alertContact({ contact, message, isSafe: true });
    results.push(result);
  }

  return { message, results };
}

async function alertContact({ contact, message, isSafe = false }) {
  const base = {
    contactId: contact.id,
    contactName: contact.name,
    status: 'failed',
    method: 'failed',
  };

  // (a) Web Share API — works offline on many mobile browsers
  if (navigator.share) {
    try {
      await navigator.share({
        title: isSafe ? 'SafeHer — I\'m Safe' : 'SafeHer Emergency Alert',
        text: message,
      });
      return { ...base, method: 'share', status: 'sent' };
    } catch (err) {
      if (err?.name === 'AbortError') {
        return { ...base, method: 'share', status: 'failed' };
      }
    }
  }

  // (b) SMS deep link
  if (contact.phone) {
    const smsBody = encodeURIComponent(message);
    const smsUrl = `sms:${contact.phone}?body=${smsBody}`;
    try {
      window.location.href = smsUrl;
      return { ...base, method: 'sms', status: 'sent' };
    } catch {
      // fall through to copy
    }
  }

  // (c) Copy fallback handled by UI — mark as fallback
  return { ...base, method: 'copy', status: 'fallback' };
}

export async function copyAlertMessage(message) {
  try {
    await navigator.clipboard.writeText(message);
    return true;
  } catch {
    // Legacy fallback
    const ta = document.createElement('textarea');
    ta.value = message;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}
