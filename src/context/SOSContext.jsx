import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { generateId, SOS_COUNTDOWN_SEC } from '../lib/constants';
import { getContacts, saveIncident, getSettings } from '../lib/storage';
import { sendEmergencyAlert, sendSafeAlert, copyAlertMessage } from '../lib/alerts';
import { speak, stopSpeaking, SOS_ANNOUNCEMENTS } from '../lib/speech';
import { getCurrentPosition, startLocationPolling } from '../lib/location';
import { useRecording } from '../hooks/useRecording';

const SOSContext = createContext(null);

export function SOSProvider({ children }) {
  const [phase, setPhase] = useState('idle'); // idle | countdown | active | recovery | no_contacts
  const [countdown, setCountdown] = useState(SOS_COUNTDOWN_SEC);
  const [incident, setIncident] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [alertResults, setAlertResults] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [triggerMethod, setTriggerMethod] = useState(null);

  const countdownRef = useRef(null);
  const stopPollingRef = useRef(null);
  const confirmRef = useRef(null);
  const recording = useRecording();

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const confirmSOSInternal = useCallback(async (method) => {
    clearCountdown();
    const incidentId = generateId();
    const contacts = getContacts();
    const settings = getSettings();

    const newIncident = {
      id: incidentId,
      type: method === 'walk' ? 'walk_escalation' : 'sos',
      startedAt: new Date().toISOString(),
      locationTrail: [],
      contactsNotified: [],
      recordingIds: [],
      triggerMethod: method,
    };

    setIncident(newIncident);
    setPhase('active');

    // Parallel: location, recording, alerts, voice
    const { location: loc, error: locErr } = await getCurrentPosition();
    if (loc) {
      setLocation(loc);
      newIncident.locationTrail.push(loc);
    } else {
      setLocationError(locErr);
    }

    // Start live location polling
    stopPollingRef.current = startLocationPolling((updatedLoc) => {
      setLocation(updatedLoc);
      setIncident((prev) => {
        if (!prev) return prev;
        const trail = [...prev.locationTrail, updatedLoc].slice(-50);
        return { ...prev, locationTrail: trail };
      });
    });

    // Recording
    const recResult = await recording.startRecording(incidentId);
    if (!recResult.success && settings.voiceEnabled) {
      speak(SOS_ANNOUNCEMENTS.recordingUnavailable);
    }

    // Alerts
    const { message, results } = await sendEmergencyAlert({
      contacts,
      lat: loc?.lat,
      lng: loc?.lng,
    });
    setAlertMessage(message);
    setAlertResults(results);

    newIncident.contactsNotified = results;
    saveIncident(newIncident);
    setIncident({ ...newIncident });

    // Voice announcement
    if (settings.voiceEnabled) {
      if (locErr && !loc) {
        speak(SOS_ANNOUNCEMENTS.locationUnavailable);
      } else {
        speak(SOS_ANNOUNCEMENTS.activated);
      }
    }
  }, [clearCountdown, recording]);

  useEffect(() => {
    confirmRef.current = confirmSOSInternal;
  }, [confirmSOSInternal]);

  const activateSOS = useCallback(async (method = 'button') => {
    const contacts = getContacts();
    if (!contacts.length) {
      setPhase('no_contacts');
      return;
    }

    setTriggerMethod(method);
    setPhase('countdown');
    setCountdown(SOS_COUNTDOWN_SEC);

    const settings = getSettings();
    if (settings.voiceEnabled) {
      speak(SOS_ANNOUNCEMENTS.countdown);
    }

    clearCountdown();
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearCountdown();
          confirmRef.current?.(method);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearCountdown]);

  const confirmSOSNow = useCallback(() => {
    clearCountdown();
    confirmSOSInternal(triggerMethod || 'button');
  }, [clearCountdown, confirmSOSInternal, triggerMethod]);

  const cancelSOS = useCallback(async () => {
    clearCountdown();
    stopSpeaking();
    if (recording.isRecording) {
      await recording.cancelRecording();
    }
    setPhase('idle');
    setCountdown(SOS_COUNTDOWN_SEC);
    setTriggerMethod(null);
  }, [clearCountdown, recording]);

  const markSafe = useCallback(async () => {
    stopSpeaking();
    if (stopPollingRef.current) {
      stopPollingRef.current();
      stopPollingRef.current = null;
    }

    const recResult = await recording.stopRecording();
    const contacts = getContacts();
    const settings = getSettings();

    if (recResult.recordingId && incident) {
      incident.recordingIds.push(recResult.recordingId);
    }

    const endedAt = new Date().toISOString();
    if (incident) {
      saveIncident({ ...incident, endedAt, recordingIds: incident.recordingIds });
    }

    await sendSafeAlert({ contacts });
    if (settings.voiceEnabled) {
      speak(SOS_ANNOUNCEMENTS.safe);
    }

    setPhase('recovery');
  }, [incident, recording]);

  const dismissRecovery = useCallback(() => {
    setPhase('idle');
    setIncident(null);
    setLocation(null);
    setLocationError(null);
    setAlertResults([]);
    setAlertMessage('');
    setTriggerMethod(null);
  }, []);

  const copyAlert = useCallback(async () => {
    if (alertMessage) {
      return copyAlertMessage(alertMessage);
    }
    return false;
  }, [alertMessage]);

  // External trigger (shake, walk escalation)
  const triggerSOS = useCallback((method = 'shake') => {
    if (phase === 'idle') {
      activateSOS(method);
    } else if (phase === 'countdown') {
      confirmSOSNow();
    }
  }, [phase, activateSOS, confirmSOSNow]);

  useEffect(() => {
    return () => {
      clearCountdown();
      if (stopPollingRef.current) stopPollingRef.current();
    };
  }, [clearCountdown]);

  const dismissNoContacts = useCallback(() => {
    setPhase('idle');
  }, []);

  const value = {
    phase,
    countdown,
    incident,
    location,
    locationError,
    alertResults,
    alertMessage,
    triggerMethod,
    recording,
    activateSOS,
    confirmSOSNow,
    cancelSOS,
    markSafe,
    dismissRecovery,
    copyAlert,
    triggerSOS,
    dismissNoContacts,
  };

  return <SOSContext.Provider value={value}>{children}</SOSContext.Provider>;
}

export function useSOS() {
  const ctx = useContext(SOSContext);
  if (!ctx) throw new Error('useSOS must be used within SOSProvider');
  return ctx;
}
