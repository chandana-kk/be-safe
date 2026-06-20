import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Circle, Copy, Check, Phone, MapPin, Users, AlertTriangle } from 'lucide-react';
import { useSOS } from '../../context/SOSContext';
import MapView from '../map/MapView';
import Badge from '../common/Badge';
import { buildMapsLink, EMERGENCY_NUMBER } from '../../lib/constants';

export default function ActiveSOSScreen() {
  const {
    phase,
    location,
    locationError,
    alertResults,
    alertMessage,
    incident,
    recording,
    markSafe,
    copyAlert,
  } = useSOS();

  const [policeStation, setPoliceStation] = useState(null);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (recording.previewStream && videoRef.current) {
      videoRef.current.srcObject = recording.previewStream;
    }
  }, [recording.previewStream]);

  if (phase !== 'active') return null;

  const mapsLink = buildMapsLink(location?.lat, location?.lng);
  const hasCopyFallback = alertResults.some((r) => r.status === 'fallback' || r.method === 'copy');

  const handleCopy = async () => {
    const ok = await copyAlert();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-40 bg-charcoal overflow-y-auto safe-area-top safe-area-bottom"
    >
      {/* Recording indicator — always visible */}
      <div className="sticky top-0 z-10 bg-coral px-4 py-3 flex items-center justify-center gap-2">
        <Circle className="w-3 h-3 fill-white text-white recording-dot" aria-hidden="true" />
        <span className="text-white font-bold text-sm tracking-wide">
          {recording.isRecording ? 'RECORDING IN PROGRESS' : recording.error ? 'RECORDING UNAVAILABLE' : 'SOS ACTIVE'}
        </span>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-[480px] mx-auto">
        <div>
          <h1 className="text-offwhite text-2xl font-bold mb-1">Help is on the way</h1>
          <p className="text-offwhite/60 text-sm">Stay calm. Your alerts are being sent.</p>
        </div>

        {/* Live recording preview */}
        {recording.previewStream && (
          <div className="card overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-40 object-cover"
              aria-label="Live recording preview"
            />
          </div>
        )}
        {recording.error && (
          <div className="card p-4 flex items-start gap-3 bg-charcoal-light">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-offwhite">Recording not available</p>
              <p className="text-xs text-offwhite/50 mt-1">{recording.error}. SOS alerts still active.</p>
            </div>
          </div>
        )}

        {/* Map */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-offwhite font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-coral" aria-hidden="true" />
              Live Location
            </h2>
            {location?.accuracy && (
              <span className="text-xs text-offwhite/40">±{Math.round(location.accuracy)}m</span>
            )}
          </div>
          {locationError && !location && (
            <div className="card p-3 mb-2 text-sm text-warning bg-warning/10">
              Location unavailable — {locationError}. Share alert manually below.
            </div>
          )}
          <MapView
            lat={location?.lat}
            lng={location?.lng}
            height="180px"
            policeStation={policeStation}
            onPoliceFound={setPoliceStation}
            trail={incident?.locationTrail || []}
          />
          {mapsLink && (
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent-soft mt-2 inline-block underline"
            >
              Open live Google Maps link ↗
            </a>
          )}
        </div>

        {/* Police — honest labeling */}
        {policeStation && (
          <div className="card p-4 bg-charcoal-light">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-offwhite text-sm">{policeStation.label || 'Find & Call Nearest Police'}</h3>
              {policeStation.isFallback && <Badge variant="demo">Hotline</Badge>}
            </div>
            <p className="text-offwhite/70 text-sm mb-1">{policeStation.name}</p>
            {policeStation.distance && (
              <p className="text-offwhite/40 text-xs mb-3">{policeStation.distance} away</p>
            )}
            <a
              href={`tel:${policeStation.phone || EMERGENCY_NUMBER}`}
              className="btn-primary w-full text-sm py-3"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              Call {policeStation.phone || EMERGENCY_NUMBER}
            </a>
            <p className="text-[10px] text-offwhite/30 mt-2 text-center">
              Does not auto-dispatch — you initiate the call
            </p>
          </div>
        )}

        {/* Contacts notified */}
        <div>
          <h2 className="text-offwhite font-semibold flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-accent" aria-hidden="true" />
            Contacts Alerted
          </h2>
          <div className="space-y-2">
            {alertResults.map((r, i) => (
              <div key={i} className="card p-3 flex items-center justify-between bg-charcoal-light">
                <span className="text-sm text-offwhite">{r.contactName}</span>
                <Badge variant={r.status === 'sent' ? 'accent' : r.status === 'fallback' ? 'demo' : 'emergency'}>
                  {r.status === 'sent' ? `${r.method} sent` : r.status === 'fallback' ? 'Copy needed' : 'Failed'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Copy fallback */}
        {(hasCopyFallback || alertMessage) && (
          <button type="button" onClick={handleCopy} className="btn-ghost w-full border border-offwhite/10 text-offwhite">
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy alert message'}
          </button>
        )}

        {/* I'm Safe */}
        <button type="button" onClick={markSafe} className="w-full py-4 rounded-[var(--radius-button)] bg-success text-white font-bold text-lg">
          I'm Safe Now
        </button>
      </div>
    </motion.div>
  );
}
