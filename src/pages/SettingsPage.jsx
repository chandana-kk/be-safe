import { useState } from 'react';
import { getSettings, saveSettings } from '../lib/storage';
import { useTheme } from '../hooks/useTheme';
import Badge from '../components/common/Badge';

export default function SettingsPage() {
  const [settings, setSettings] = useState(getSettings);
  const { refresh: refreshTheme } = useTheme();

  const update = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);
    if (key === 'darkModeOverride') refreshTheme();
  };

  return (
    <div className="px-4 py-6 safe-area-top">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-charcoal/60 dark:text-offwhite/60 mb-8">Customize your safety experience</p>

      <div className="space-y-6">
        <section className="card p-4 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-charcoal/50 dark:text-offwhite/50">SOS Triggers</h2>

          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="font-medium">Shake to SOS</p>
              <p className="text-xs text-charcoal/50 dark:text-offwhite/50">Shake phone 3× to trigger</p>
            </div>
            <input
              type="checkbox"
              checked={settings.shakeEnabled}
              onChange={(e) => update('shakeEnabled', e.target.checked)}
              className="w-5 h-5 accent-accent rounded"
            />
          </label>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Shake sensitivity</p>
              <span className="text-xs text-accent font-bold">{settings.shakeSensitivity}</span>
            </div>
            <input
              type="range"
              min="8"
              max="25"
              value={settings.shakeSensitivity}
              onChange={(e) => update('shakeSensitivity', Number(e.target.value))}
              className="w-full accent-accent"
              aria-label="Shake sensitivity"
            />
            <p className="text-xs text-charcoal/40 dark:text-offwhite/40 mt-1">Higher = less sensitive (fewer false triggers)</p>
          </div>
        </section>

        <section className="card p-4 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-charcoal/50 dark:text-offwhite/50">Accessibility</h2>

          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="font-medium">Voice announcements</p>
              <p className="text-xs text-charcoal/50 dark:text-offwhite/50">Spoken SOS status updates (offline)</p>
            </div>
            <input
              type="checkbox"
              checked={settings.voiceEnabled}
              onChange={(e) => update('voiceEnabled', e.target.checked)}
              className="w-5 h-5 accent-accent rounded"
            />
          </label>
        </section>

        <section className="card p-4 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-charcoal/50 dark:text-offwhite/50">Appearance</h2>

          <div className="grid grid-cols-3 gap-2">
            {[
              { value: null, label: 'Auto', desc: 'Dark after 7pm' },
              { value: true, label: 'Dark', desc: 'Always dark' },
              { value: false, label: 'Light', desc: 'Always light' },
            ].map(({ value, label, desc }) => (
              <button
                key={String(value)}
                type="button"
                onClick={() => update('darkModeOverride', value)}
                className={`p-3 rounded-xl text-center transition-all border-2 ${
                  settings.darkModeOverride === value
                    ? 'border-accent bg-accent/10'
                    : 'border-transparent bg-charcoal/5 dark:bg-white/5'
                }`}
              >
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-[10px] text-charcoal/40 dark:text-offwhite/40">{desc}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-charcoal/50 dark:text-offwhite/50 mb-3">About</h2>
          <p className="text-sm text-charcoal/60 dark:text-offwhite/60 mb-2">
            SafeHer v1.0 — AI Bhoomi Hackathon Pilot
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="demo">Pilot</Badge>
            <Badge variant="offline">Offline-first</Badge>
          </div>
          <p className="text-xs text-charcoal/40 dark:text-offwhite/40 mt-3">
            Data stored locally on this device. Production deployment would sync via secure backend.
          </p>
        </section>
      </div>
    </div>
  );
}
