import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Trophy, Swords, BarChart3, ChevronRight, Skull,
  LogOut, Shield, User
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { id: 'myprofile', label: 'My Profile', icon: User, adminOnly: false, userOnly: true },
  { id: 'tracker', label: 'Participation', icon: BarChart3, adminOnly: false },
  { id: 'players', label: 'Players', icon: Users, adminOnly: false },
  { id: 'tournaments', label: 'Tournaments', icon: Trophy, adminOnly: false },
  { id: 'lineup', label: 'Lineup Manager', icon: Swords, adminOnly: false },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { activePage, setActivePage, players, tournaments } = useApp();
  const { isAdmin, user, signOut } = useAuth();

  const navTo = (id) => {
    setActivePage(id);
    onClose?.();
  };

  const upcoming = tournaments.filter((t) => t.status === 'Upcoming').length;

  // Filter nav items based on role
  // Admin: sees all except userOnly items (they use full Players page instead of My Profile)
  // User: sees non-adminOnly items
  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (isAdmin) return !item.userOnly;
    return !item.adminOnly;
  });

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
          <button 
            onClick={() => navTo('dashboard')}
            className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 bg-crimson-600 rounded-lg flex items-center justify-center crimson-glow">
              <Skull size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-display font-bold text-base leading-tight tracking-wide">
                APEX REAPERS
              </p>
              <p className="text-mist text-xs font-mono tracking-widest">MLBB MANAGER</p>
            </div>
          </button>
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
          {visibleNavItems.map(({ id, label, icon: Icon }) => {
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

          {/* Admin Panel — only visible to admins */}
          {isAdmin && (
            <>
              <div className="h-px bg-steel/30 my-3" />
              <p className="text-mist text-xs font-mono uppercase tracking-widest px-2 mb-3">Admin</p>
              <button
                onClick={() => navTo('admin')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display font-semibold tracking-wide transition-all duration-200 group
                  ${activePage === 'admin'
                    ? 'bg-amber-600/20 text-amber-400 border-l-2 border-amber-500 pl-[10px]'
                    : 'text-amber-500/70 hover:text-amber-400 hover:bg-amber-900/20'
                  }`}
              >
                <Shield size={16} className={activePage === 'admin' ? 'text-amber-400' : 'text-amber-500/50 group-hover:text-amber-400'} />
                <span className="flex-1 text-left">Admin Panel</span>
                {activePage === 'admin' && <ChevronRight size={14} className="text-amber-400" />}
              </button>
            </>
          )}
        </nav>

        {/* User info & Sign Out */}
        <div className="p-4 border-t border-steel/40 space-y-3">
          {/* User badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-crimson-600 to-orange-600 rounded-lg flex items-center justify-center text-white font-display font-bold text-xs flex-shrink-0">
              {user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-display font-semibold truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-mist text-xs font-mono truncate">{isAdmin ? '👑 Admin' : 'Member'}</p>
            </div>
          </div>

          {/* Sign out button */}
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 py-2 bg-steel/30 hover:bg-red-900/30 border border-steel/40 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-lg text-xs font-display font-semibold transition-all duration-200"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
