import { NavLink } from 'react-router-dom';
import { Home, Footprints, Users, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/walk', icon: Footprints, label: 'Walk' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto glass border-t border-charcoal/5 dark:border-white/5 safe-area-bottom z-30"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors min-w-[64px] focus-visible:ring-2 focus-visible:ring-accent ${
                isActive
                  ? 'text-accent'
                  : 'text-charcoal/40 dark:text-offwhite/40 hover:text-charcoal/70 dark:hover:text-offwhite/70'
              }`
            }
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px] font-semibold">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
