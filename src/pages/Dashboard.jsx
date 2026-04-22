import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Trophy, Users, Calendar, AlertCircle, TrendingUp, Clock, Zap } from 'lucide-react';
import { formatDate, formatTime, getDaysUntil, getStatusColor, getFormatColor, getRoleColor, getRoleIcon } from '../utils/helpers';
import Badge from '../components/ui/Badge';

function StatCard({ icon: Icon, label, value, sub, color = 'red', onClick }) {
  const colors = {
    red: 'from-red-600/20 to-red-900/10 border-red-500/20 text-red-400',
    cyan: 'from-cyan-600/20 to-cyan-900/10 border-cyan-500/20 text-cyan-400',
    yellow: 'from-yellow-600/20 to-yellow-900/10 border-yellow-500/20 text-yellow-400',
    purple: 'from-purple-600/20 to-purple-900/10 border-purple-500/20 text-purple-400',
  };
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-gradient-to-br ${colors[color]} border rounded-xl p-5 transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-1">{label}</p>
          <p className="text-white font-display font-bold text-3xl leading-none">{value}</p>
          {sub && <p className="text-slate-500 text-xs mt-1.5 font-body">{sub}</p>}
        </div>
        <div className="p-2.5 bg-black/20 rounded-lg">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { players, tournaments, setActivePage, setActiveTournamentId } = useApp();
  const { isAdmin } = useAuth();

  const upcoming = tournaments.filter((t) => t.status === 'Upcoming');
  const completed = tournaments.filter((t) => t.status === 'Completed');
  const neverPlayed = players.filter((p) => (p.tournamentsPlayed || []).length === 0);
  const available = players.filter((p) => p.available);

  const nextTournament = upcoming.sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-900/30 via-red-800/10 to-transparent border border-red-500/20 rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-64 h-full opacity-5">
          <div className="text-[120px] font-display font-black text-white leading-none select-none">AR</div>
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-red-400" />
            <span className="text-red-400 text-xs font-mono tracking-widest uppercase">Squad Active</span>
          </div>
          <h2 className="text-white font-display font-black text-2xl lg:text-3xl tracking-wide">
            Welcome back, <span className="text-gradient-red">{isAdmin ? 'Commander' : 'Reaper'}</span>
          </h2>
          <p className="text-slate-400 text-sm font-body mt-1">
            {upcoming.length} upcoming tournament{upcoming.length !== 1 ? 's' : ''} · {available.length} players ready
            {!isAdmin && <span className="text-slate-500"> · View-only mode</span>}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Players" value={players.length} sub={`${available.length} available`} color="cyan" onClick={isAdmin ? () => setActivePage('players') : undefined} />
        <StatCard icon={Trophy} label="Tournaments" value={tournaments.length} sub={`${completed.length} completed`} color="yellow" onClick={isAdmin ? () => setActivePage('tournaments') : undefined} />
        <StatCard icon={Calendar} label="Upcoming" value={upcoming.length} sub="scheduled matches" color="red" onClick={isAdmin ? () => setActivePage('tournaments') : undefined} />
        <StatCard icon={AlertCircle} label="Idle Players" value={neverPlayed.length} sub="haven't played yet" color="purple" onClick={() => setActivePage('tracker')} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Next Tournament */}
        <div className="bg-pit border border-steel/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-red-400" />
            <h3 className="text-white font-display font-bold tracking-wide">Next Tournament</h3>
          </div>
          {nextTournament ? (
            <div className="space-y-3">
              <div>
                <p className="text-white font-display font-bold text-xl">{nextTournament.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className={getFormatColor(nextTournament.format)}>{nextTournament.format}</Badge>
                  <Badge className={getStatusColor(nextTournament.status)}>{nextTournament.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-800/50 rounded-lg p-3">
                <div>
                  <p className="text-slate-500 text-xs font-mono mb-0.5">Date</p>
                  <p className="text-white text-sm font-body">{formatDate(nextTournament.date)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-mono mb-0.5">Time</p>
                  <p className="text-white text-sm font-body">{formatTime(nextTournament.time)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-mono mb-0.5">Prize Pool</p>
                  <p className="text-yellow-400 text-sm font-display font-bold">{nextTournament.prizePool || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-mono mb-0.5">Days Left</p>
                  <p className="text-red-400 text-sm font-display font-bold">
                    {(() => {
                      const d = getDaysUntil(nextTournament.date);
                      if (d === null) return '—';
                      if (d < 0) return 'Past';
                      if (d === 0) return 'TODAY';
                      return `${d}d`;
                    })()}
                  </p>
                </div>
              </div>
              {isAdmin && (
                <button onClick={() => { setActiveTournamentId(nextTournament.id); setActivePage('lineup'); }} className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-display font-semibold text-sm rounded-lg transition-all">
                  Set Lineup →
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No upcoming tournaments</p>
              {isAdmin && (
                <button onClick={() => setActivePage('tournaments')} className="mt-3 text-red-400 text-xs font-display hover:text-red-300 transition-colors">
                  Create one →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Player Roster */}
        <div className="bg-pit border border-steel/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-red-400" />
              <h3 className="text-white font-display font-bold tracking-wide">Roster Overview</h3>
            </div>
            {isAdmin && (
              <button onClick={() => setActivePage('players')} className="text-slate-500 hover:text-red-400 text-xs font-mono transition-colors">View All →</button>
            )}
          </div>
          {players.length === 0 ? (
            <div className="text-center py-8">
              <Users size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No players yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {players.slice(0, 5).map((player) => (
                <div key={player.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {player.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-display font-semibold text-sm truncate">{player.name}</p>
                    <p className="text-slate-500 text-xs font-mono">{(player.tournamentsPlayed || []).length} tournaments</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${getRoleColor(player.role)}`}>{getRoleIcon(player.role)} {player.role}</span>
                    <div className={`w-2 h-2 rounded-full ${player.available ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  </div>
                </div>
              ))}
              {players.length > 5 && (
                <p className="text-slate-600 text-xs font-mono text-center pt-1">+{players.length - 5} more players</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Idle Players Warning */}
      {neverPlayed.length > 0 && (
        <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-purple-300 font-display font-semibold text-sm mb-1">Players Without Tournament Experience</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {neverPlayed.map((p) => (
                  <span key={p.id} className="px-2 py-0.5 bg-purple-900/30 border border-purple-500/30 text-purple-400 text-xs font-mono rounded">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
            {isAdmin && (
              <button onClick={() => setActivePage('lineup')} className="text-purple-400 text-xs font-mono flex-shrink-0 hover:text-purple-300 transition-colors">
                Assign →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
