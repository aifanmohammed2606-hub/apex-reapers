import { Menu, Bell, Skull } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  players: 'Player Management',
  tournaments: 'Tournament Management',
  lineup: 'Lineup Manager',
  tracker: 'Participation Tracker',
};

export default function Header({ onMenuClick }) {
  const { activePage, tournaments } = useApp();
  const upcoming = tournaments.filter((t) => t.status === 'Upcoming').length;

  return (
    <header className="h-16 bg-abyss/80 backdrop-blur-sm border-b border-steel/40 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-20">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-ghost hover:text-white hover:bg-steel/50 rounded-lg transition-all"
      >
        <Menu size={20} />
      </button>

      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2">
        <div className="w-7 h-7 bg-crimson-600 rounded-md flex items-center justify-center">
          <Skull size={14} className="text-white" />
        </div>
        <span className="text-white font-display font-bold text-sm tracking-wide">APEX</span>
      </div>

      <div className="flex-1 hidden lg:block">
        <h1 className="text-white font-display font-bold text-lg tracking-wide">
          {PAGE_TITLES[activePage] || 'Dashboard'}
        </h1>
        <p className="text-mist text-xs font-mono">Mobile Legends Bang Bang · Squad Manager</p>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notification badge */}
        <div className="relative">
          <button className="p-2 text-ghost hover:text-white hover:bg-steel/50 rounded-lg transition-all">
            <Bell size={18} />
          </button>
          {upcoming > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-crimson-600 rounded-full text-white text-xs flex items-center justify-center font-mono">
              {upcoming}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 bg-gradient-to-br from-crimson-600 to-orange-600 rounded-lg flex items-center justify-center font-display font-bold text-white text-sm">
          AR
        </div>
      </div>
    </header>
  );
}
