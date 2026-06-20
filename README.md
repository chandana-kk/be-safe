# SafeHer — AI-Powered Women's Safety PWA

**SafeHer** is a production-quality, offline-resilient women's safety Progressive Web App built for AI Bhoomi hackathon — designed to work as a real, fundable startup product.

![SafeHer](public/favicon.svg)

## Features

- **Core SOS Flow** — Tap-and-hold or shake-to-trigger with 3-second cancel countdown
- **Offline-First** — SOS, recording, alerts, and maps work without internet
- **Live Location Sharing** — Google Maps links updated every 10 seconds during active SOS
- **Emergency Alerts** — Web Share API → SMS deep link → copy fallback chain
- **Audio/Video Recording** — Saved to IndexedDB in 1-second chunks
- **Voice Announcements** — Web Speech API (fully offline)
- **Walk With Me** — 15-minute check-ins with auto-escalation to SOS
- **Hybrid Maps** — Google Maps (online) + Leaflet/OpenStreetMap (offline fallback)
- **Find & Call Nearest Police** — Honest one-tap calling (no fake auto-dispatch)
- **Dark Mode** — Auto after 7pm local time

## Tech Stack

- React 18 + Vite
- Tailwind CSS v4 + Framer Motion
- Leaflet.js + OpenStreetMap (offline)
- Google Maps JavaScript API (optional, online enhancement)
- vite-plugin-pwa
- IndexedDB + localStorage

## Quick Start

```bash
# Install dependencies
npm install

# Copy env template (optional — app works without Google Maps key)
cp .env.example .env

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GOOGLE_MAPS_API_KEY` | No | Enables Google Maps + Places API. App falls back to Leaflet silently if missing. |

## Install as PWA

1. Open the app in Chrome/Safari on mobile
2. Tap "Add to Home Screen"
3. SafeHer works offline after first load

## Architecture Notes

- **Data layer**: localStorage (contacts, settings) + IndexedDB (recordings) — structured for future MongoDB backend
- **AI insights**: Rule-based `safetyEngine.js` — swap for ML model in production
- **Police dispatch**: One-tap calling only — automated dispatch requires formal emergency services partnership

## Error Handling

All critical paths have graceful fallbacks:
- Geolocation denied → SOS works, manual alert copy
- Camera denied → SOS works, clear messaging
- No internet → Offline maps + SMS/share fallbacks
- No contacts → Prompt to add before SOS fires
- Missing API key → Silent Leaflet fallback

## License

MIT — Built for AI Bhoomi 2025
