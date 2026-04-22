import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, Skull, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatTime, getDaysUntil } from '../../utils/helpers';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  players: 'Player Management',
  tournaments: 'Tournament Management',
  lineup: 'Lineup Manager',
  tracker: 'Participation Tracker',
  admin: 'Admin Panel',
  myprofile: 'My Profile',
  notifications: 'Notifications',
};

export default function Header({ onMenuClick }) {
  const { activePage, tournaments, setActivePage } = useApp();
  const { user, isAdmin, signOut } = useAuth();
  
  const upcoming = tournaments.filter((t) => t.status === 'Upcoming').length;

  return (
    <header className="h-16 bg-abyss/80 backdrop-blur-sm border-b border-steel/40 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-[50]">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-ghost hover:text-white hover:bg-steel/50 rounded-lg transition-all"
      >
        <Menu size={20} />
      </button>

      {/* Mobile logo */}
      <button 
        onClick={() => setActivePage('dashboard')}
        className="lg:hidden flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="w-7 h-7 bg-crimson-600 rounded-md flex items-center justify-center">
          <Skull size={14} className="text-white" />
        </div>
        <span className="text-white font-display font-bold text-sm tracking-wide">APEX</span>
      </button>

      <div className="flex-1 hidden lg:block">
        <h1 className="text-white font-display font-bold text-lg tracking-wide">
          {PAGE_TITLES[activePage] || 'Dashboard'}
        </h1>
        <p className="text-mist text-xs font-mono">Mobile Legends Bang Bang · Squad Manager</p>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Role badge */}
        {isAdmin && (
          <span className="hidden sm:flex items-center gap-1 px-2 py-1 bg-amber-900/20 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-mono">
            👑 Admin
          </span>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setActivePage('notifications')}
            className={`p-2 rounded-lg transition-all ${activePage === 'notifications' ? 'bg-crimson-600/20 text-crimson-400' : 'text-ghost hover:text-white hover:bg-steel/50'}`}
            title="Notifications"
          >
            <Bell size={18} />
          </button>
          {upcoming > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-crimson-600 rounded-full text-white text-[10px] flex items-center justify-center font-mono pointer-events-none ring-2 ring-abyss">
              {upcoming}
            </span>
          )}
        </div>

        {/* User Avatar */}
        <button 
          onClick={() => setActivePage('myprofile')}
          className={`w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-white text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer ring-offset-2 ring-offset-abyss ${
            activePage === 'myprofile' 
              ? 'ring-2 ring-crimson-500 bg-crimson-600' 
              : 'bg-gradient-to-br from-crimson-600 to-orange-600 hover:ring-2 hover:ring-crimson-500/50'
          }`}
          title="My Profile"
        >
          {user?.email?.charAt(0)?.toUpperCase() || 'U'}
        </button>

        {/* Sign out — compact */}
        <button
          onClick={signOut}
          className="p-2 text-ghost hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
