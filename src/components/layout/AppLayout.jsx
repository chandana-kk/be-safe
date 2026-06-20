import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import SOSCountdown from '../sos/SOSCountdown';
import ActiveSOSScreen from '../sos/ActiveSOSScreen';
import PostIncidentScreen from '../sos/PostIncidentScreen';
import NoContactsModal from '../sos/NoContactsModal';

export default function AppLayout() {
  return (
    <div className="min-h-dvh pb-20">
      <Outlet />
      <BottomNav />
      <SOSCountdown />
      <ActiveSOSScreen />
      <PostIncidentScreen />
      <NoContactsModal />
    </div>
  );
}
