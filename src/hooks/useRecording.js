import { useRef, useCallback, useState } from 'react';
import { generateId } from '../lib/constants';
import { saveRecordingBlob } from '../lib/db';

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [previewStream, setPreviewStream] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const incidentIdRef = useRef(null);
  const startTimeRef = useRef(null);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setPreviewStream(null);
  }, []);

  const startRecording = useCallback(async (incidentId) => {
    setError(null);
    incidentIdRef.current = incidentId;
    chunksRef.current = [];
    startTimeRef.current = Date.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      streamRef.current = stream;
      setPreviewStream(stream);

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : 'video/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(1000); // 1-second chunks to IndexedDB survival
      setIsRecording(true);
      return { success: true };
    } catch (err) {
      cleanupStream();
      const msg = err.name === 'NotAllowedError'
        ? 'Camera/microphone permission denied'
        : err.message || 'Recording unavailable';
      setError(msg);
      return { success: false, error: msg };
    }
  }, [cleanupStream]);

  const stopRecording = useCallback(async () => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      const incidentId = incidentIdRef.current;

      if (!recorder || recorder.state === 'inactive') {
        cleanupStream();
        setIsRecording(false);
        resolve({ recordingId: null, blob: null });
        return;
      }

      recorder.onstop = async () => {
        const durationMs = Date.now() - (startTimeRef.current || Date.now());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const recordingId = generateId();

        if (blob.size > 0 && incidentId) {
          await saveRecordingBlob({
            id: recordingId,
            blob,
            incidentId,
            mimeType: recorder.mimeType,
            durationMs,
          });
        }

        cleanupStream();
        setIsRecording(false);
        mediaRecorderRef.current = null;
        chunksRef.current = [];
        resolve({ recordingId: blob.size > 0 ? recordingId : null, blob, durationMs });
      };

      recorder.stop();
    });
  }, [cleanupStream]);

  const cancelRecording = useCallback(async () => {
    // Save partial footage even on cancel
    return stopRecording();
  }, [stopRecording]);

  return {
    isRecording,
    previewStream,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
