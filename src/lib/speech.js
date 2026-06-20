/** Web Speech API — fully offline voice announcements */

let speaking = false;

export function speak(text, { rate = 0.95, pitch = 1, volume = 1 } = {}) {
  if (!window.speechSynthesis) return Promise.resolve(false);

  return new Promise((resolve) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      speaking = false;
      resolve(true);
    };
    utterance.onerror = () => {
      speaking = false;
      resolve(false);
    };

    speaking = true;
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    speaking = false;
  }
}

export function isSpeaking() {
  return speaking;
}

export const SOS_ANNOUNCEMENTS = {
  countdown: 'Emergency countdown started. Release to cancel, or hold to confirm immediately.',
  activated: 'SOS activated. Your location is being shared with your emergency contacts. Recording has started.',
  recordingUnavailable: 'SOS activated. Recording was not available, but your location alert is being sent.',
  locationUnavailable: 'SOS activated. Location could not be determined. Please share your alert manually.',
  safe: 'You are marked safe. A follow-up message has been sent to your contacts.',
  walkCheckin: 'Walk check-in. You have been on the move for fifteen minutes. Are you still okay?',
  walkEscalation: 'No response received. Activating emergency SOS for your safety.',
};
