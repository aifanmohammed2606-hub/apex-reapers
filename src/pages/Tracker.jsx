import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { formatDate, getRoleColor, getRoleIcon, getFormatColor } from '../utils/helpers';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

export default function Tracker() {
  const { players, tournaments } = useApp();
  const [highlight, setHighlight] = useState('idle'); // 'idle' | 'all'

  const sorted = [...tournaments].sort((a, b) => new Date(a.date) - new Date(b.date));

  const neverPlayed = players.filter((p) => (p.tournamentsPlayed || []).length === 0);
  const mostActive = [...players].sort(
    (a, b) => (b.tournamentsPlayed || []).length - (a.tournamentsPlayed || []).length
  )[0];

  const displayPlayers =
    highlight === 'idle' && neverPlayed.length > 0 ? neverPlayed : players;

  if (players.length === 0 || tournaments.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Nothing to track yet"
        message="Add players and tournaments first, then assign lineups to see participation data here."
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-pit border border-steel/40 rounded-xl p-4">
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">Total Players</p>
          <p className="text-white font-display font-black text-3xl">{players.length}</p>
        </div>
        <div className="bg-pit border border-steel/40 rounded-xl p-4">
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">Tournaments</p>
          <p className="text-white font-display font-black text-3xl">{tournaments.length}</p>
        </div>
        <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4">
          <p className="text-purple-400 text-xs font-mono uppercase tracking-widest mb-1">Idle Players</p>
          <p className="text-white font-display font-black text-3xl">{neverPlayed.length}</p>
        </div>
        <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-emerald-400 text-xs font-mono uppercase tracking-widest mb-1">Top Player</p>
          <p className="text-white font-display font-bold text-base truncate">{mostActive?.name || '—'}</p>
          <p className="text-emerald-400 text-xs font-mono">{(mostActive?.tournamentsPlayed || []).length} played</p>
        </div>
      </div>

      {/* Filter toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-slate-500 text-xs font-mono uppercase tracking-widest">Show:</span>
        {[
          { id: 'all', label: 'All Players' },
          { id: 'idle', label: `Idle Only (${neverPlayed.length})` },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setHighlight(opt.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              highlight === opt.id ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Idle Player Alert */}
      {neverPlayed.length > 0 && (
        <div className="flex items-start gap-3 bg-yellow-900/10 border border-yellow-500/20 rounded-xl p-4">
          <AlertTriangle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-300 font-display font-semibold text-sm mb-1">
              {neverPlayed.length} player{neverPlayed.length !== 1 ? 's have' : ' has'} never been assigned to a tournament
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {neverPlayed.map((p) => (
                <span key={p.id} className="px-2 py-0.5 bg-yellow-900/20 border border-yellow-500/20 text-yellow-400 text-xs font-mono rounded">
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Participation Table */}
      <div className="bg-pit border border-steel/40 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-steel/40 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-red-400" />
            <h3 className="text-white font-display font-bold tracking-wide">Participation Matrix</h3>
          </div>
          <p className="text-slate-500 text-xs font-mono">
            Showing {displayPlayers.length} of {players.length} players
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-steel/30 bg-slate-900/40">
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest w-44 sticky left-0 bg-slate-900/90 z-10">
                  Player
                </th>
                <th className="text-center px-3 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest w-16">
                  Total
                </th>
                {sorted.map((t) => (
                  <th key={t.id} className="text-center px-2 py-3 min-w-[90px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-white text-xs font-display font-semibold leading-tight text-center max-w-[80px] truncate" title={t.name}>
                        {t.name.length > 10 ? t.name.slice(0, 9) + '…' : t.name}
                      </span>
                      <Badge className={getFormatColor(t.format)}>{t.format}</Badge>
                      <span className="text-slate-600 text-xs font-mono">{formatDate(t.date).split(',')[0]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayPlayers.map((player, idx) => {
                const count = (player.tournamentsPlayed || []).length;
                const isIdle = count === 0;
                return (
                  <tr
                    key={player.id}
                    className={`border-b border-steel/20 transition-colors ${
                      isIdle ? 'bg-purple-900/5 hover:bg-purple-900/10' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    {/* Player Name - sticky */}
                    <td className="px-4 py-3 sticky left-0 bg-inherit z-10">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-display font-bold text-xs flex-shrink-0 ${
                          isIdle ? 'bg-purple-800' : 'bg-gradient-to-br from-red-600 to-orange-600'
                        }`}>
                          {player.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-display font-semibold truncate ${isIdle ? 'text-purple-300' : 'text-white'}`}>
                            {player.name}
                          </p>
                          <span className={`text-xs font-mono ${getRoleColor(player.role).split(' ')[0]}`}>
                            {getRoleIcon(player.role)} {player.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Total count */}
                    <td className="px-3 py-3 text-center">
                      <span className={`font-display font-black text-base ${
                        count === 0 ? 'text-purple-400' : count >= 3 ? 'text-emerald-400' : 'text-yellow-400'
                      }`}>
                        {count}
                      </span>
                    </td>

                    {/* Per-tournament cells */}
                    {sorted.map((t) => {
                      const played = (player.tournamentsPlayed || []).includes(t.id);
                      // Check if they were a substitute
                      const isSub = !played && (t.substitutes || []).includes(player.id);
                      return (
                        <td key={t.id} className="px-2 py-3 text-center">
                          {played ? (
                            <div className="flex justify-center">
                              <CheckCircle2 size={18} className="text-emerald-400" />
                            </div>
                          ) : isSub ? (
                            <div className="flex justify-center">
                              <span className="text-yellow-400 text-xs font-mono font-bold">SUB</span>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <XCircle size={16} className="text-slate-700" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-5 py-3 border-t border-steel/30 bg-slate-900/20 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-slate-400 text-xs font-mono">Played</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-xs font-mono font-bold">SUB</span>
            <span className="text-slate-400 text-xs font-mono">Substitute</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle size={14} className="text-slate-700" />
            <span className="text-slate-400 text-xs font-mono">Not played</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-800" />
            <span className="text-slate-400 text-xs font-mono">Never played</span>
          </div>
        </div>
      </div>
    </div>
  );
}
