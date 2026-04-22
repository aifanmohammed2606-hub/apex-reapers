import { useApp } from '../context/AppContext';
import { Bell, Calendar, Clock, Trophy, ChevronRight, AlertCircle } from 'lucide-react';
import { formatDate, formatTime, getDaysUntil } from '../utils/helpers';
import Badge from '../components/ui/Badge';

export default function Notifications() {
  const { tournaments } = useApp();

  const upcomingTournaments = tournaments
    .filter((t) => t.status === 'Upcoming')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-white font-display font-black text-2xl tracking-wide flex items-center gap-2">
            <Bell className="text-crimson-500" size={24} /> Notifications
          </h2>
          <p className="text-slate-500 text-sm font-mono mt-1">
            Stay updated with upcoming tournaments and match schedules.
          </p>
        </div>
        <Badge className="bg-crimson-600/20 text-crimson-400 border-crimson-500/30">
          {upcomingTournaments.length} Upcoming
        </Badge>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {upcomingTournaments.length === 0 ? (
          <div className="bg-pit border border-steel/40 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-steel/20 rounded-full mb-4 text-slate-600">
              <Bell size={32} />
            </div>
            <h3 className="text-white font-display font-bold text-lg mb-2">No New Notifications</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              You're all caught up! When new tournaments are scheduled, they'll appear here.
            </p>
          </div>
        ) : (
          upcomingTournaments.map((t) => {
            const daysLeft = getDaysUntil(t.date);
            
            return (
              <div 
                key={t.id} 
                className="group relative bg-pit border border-steel/40 rounded-2xl p-5 hover:border-crimson-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-crimson-900/10"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Icon/Badge */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    daysLeft === 0 ? 'bg-red-500/20 text-red-400' : 'bg-crimson-600/10 text-crimson-500'
                  }`}>
                    <Trophy size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="text-white font-display font-black text-lg tracking-wide group-hover:text-crimson-400 transition-colors truncate">
                        Upcoming Match: {t.name}
                      </h4>
                      {daysLeft === 0 && (
                        <span className="flex-shrink-0 px-2 py-0.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-tighter rounded animate-pulse">
                          Starting Today
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-mono">
                        <Calendar size={14} className="text-slate-600" />
                        <span>Date: {formatDate(t.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-mono">
                        <Clock size={14} className="text-slate-600" />
                        <span>Time: {t.time ? formatTime(t.time) : 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-mono sm:col-span-2 lg:col-span-1">
                        <AlertCircle size={14} className="text-slate-600" />
                        <span className={daysLeft <= 1 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                          {daysLeft === 0 ? 'Happening Now' : daysLeft < 0 ? 'Past Event' : `${daysLeft} days remaining`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Link (Visual only) */}
                  <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={20} className="text-slate-600" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-steel/20 to-void border border-steel/30 rounded-2xl p-5 flex items-start gap-4 mt-8">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 flex-shrink-0">
          <AlertCircle size={20} />
        </div>
        <div>
          <h5 className="text-white font-display font-bold text-sm mb-1">Stay Notified</h5>
          <p className="text-slate-500 text-xs leading-relaxed max-w-md">
            The system automatically generates notifications for tournaments with an 'Upcoming' status. 
            Once a tournament becomes 'Ongoing' or 'Completed', it will be removed from this list.
          </p>
        </div>
      </div>
    </div>
  );
}
