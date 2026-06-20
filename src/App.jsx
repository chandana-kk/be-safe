import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SOSProvider } from './context/SOSContext';
import { WalkProvider } from './context/WalkContext';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import WalkPage from './pages/WalkPage';
import ContactsPage from './pages/ContactsPage';
import SettingsPage from './pages/SettingsPage';
import IncidentsPage from './pages/IncidentsPage';
import { useTheme } from './hooks/useTheme';
import { useShakeDetection } from './hooks/useShakeDetection';
import { useSOS } from './context/SOSContext';

function ThemeInit() {
  useTheme();
  return null;
}

function GlobalShakeListener() {
  const { phase, triggerSOS } = useSOS();
  useShakeDetection(() => triggerSOS('shake'), phase === 'idle' || phase === 'countdown');
  return null;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <ThemeInit />
      <SOSProvider>
        <WalkProvider>
          <GlobalShakeListener />
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/walk" element={<WalkPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/incidents" element={<IncidentsPage />} />
            </Route>
          </Routes>
        </WalkProvider>
      </SOSProvider>
    </BrowserRouter>
  );
}

export default function App() {
  return <AppRoutes />;
}
