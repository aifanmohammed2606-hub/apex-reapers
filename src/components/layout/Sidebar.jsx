import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard, Users, Trophy, Swords, BarChart3, ChevronRight, Skull
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'players', label: 'Players', icon: Users },
  { id: 'tournaments', label: 'Tournaments', icon: Trophy },
  { id: 'lineup', label: 'Lineup Manager', icon: Swords },
  { id: 'tracker', label: 'Participation', icon: BarChart3 },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { activePage, setActivePage, players, tournaments } = useApp();

  const navTo = (id) => {
    setActivePage(id);
    onClose?.();
  };

  const upcoming = tournaments.filter((t) => t.status === 'Upcoming').length;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-abyss border-r border-steel/40 z-40 flex flex-col
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-steel/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-crimson-600 rounded-lg flex items-center justify-center crimson-glow">
              <Skull size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-display font-bold text-base leading-tight tracking-wide">
                APEX REAPERS
              </p>
              <p className="text-mist text-xs font-mono tracking-widest">MLBB MANAGER</p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mx-4 mt-4 p-3 bg-steel/20 rounded-lg border border-steel/30">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <p className="text-white font-display font-bold text-lg leading-none">{players.length}</p>
              <p className="text-mist text-xs mt-0.5 font-mono">Players</p>
            </div>
            <div className="text-center">
              <p className="text-crimson-400 font-display font-bold text-lg leading-none">{upcoming}</p>
              <p className="text-mist text-xs mt-0.5 font-mono">Upcoming</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-mist text-xs font-mono uppercase tracking-widest px-2 mb-3 mt-1">Navigation</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;
            return (
              <button
                key={id}
                onClick={() => navTo(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display font-semibold tracking-wide transition-all duration-200 group
                  ${isActive
                    ? 'bg-crimson-600/20 text-white border-l-2 border-crimson-500 pl-[10px]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
              >
                <Icon size={16} className={isActive ? 'text-crimson-400' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="flex-1 text-left">{label}</span>
                {isActive && <ChevronRight size={14} className="text-crimson-400" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-steel/40">
          <p className="text-mist text-xs font-mono text-center">v1.0.0 • MLBB Season 2025</p>
        </div>
      </aside>
    </>
  );
}
