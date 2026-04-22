import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Swords, Save, ChevronDown, X, UserCheck, AlertCircle, Trophy } from 'lucide-react';
import { getRoleColor, getRoleIcon, getStatusColor, getFormatColor, formatDate } from '../utils/helpers';
import { ROLES } from '../data/initialData';
import Badge from '../components/ui/Badge';

function RoleSlot({ role, selectedId, players, allSelected, onSelect, availableForTournament, readOnly }) {
  const [open, setOpen] = useState(false);
  const selected = players.find((p) => p.id === selectedId);

  // Available players: not selected elsewhere, globally available, and RSVp'd to this tournament
  const options = players.filter((p) => {
    if (!p.available) return false;
    if (availableForTournament && !availableForTournament.includes(p.id)) return false;
    if (allSelected.includes(p.id) && p.id !== selectedId) return false;
    
    // Strict Role Filtering
    const matchesPrimary = p.role === role;
    const matchesSecondary = p.secondaryRole === role;
    const matchesFlexible = p.flexibleRoles && p.flexibleRoles.includes(role);
    if (!matchesPrimary && !matchesSecondary && !matchesFlexible) return false;

    return true;
  });

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-xs font-mono font-bold uppercase tracking-widest ${getRoleColor(role).split(' ')[0]}`}>
          {getRoleIcon(role)} {role}
        </span>
      </div>

      {selected ? (
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${getRoleColor(role)} bg-opacity-10 group`}>
          <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center text-white font-display font-bold flex-shrink-0">
            {selected.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-display font-semibold text-sm truncate">{selected.name}</p>
            <p className="text-slate-500 text-xs font-mono">{(selected.tournamentsPlayed || []).length} played</p>
          </div>
          {!readOnly && (
            <button
              onClick={() => onSelect('')}
              className="p-1 text-slate-500 hover:text-red-400 rounded transition-all opacity-0 group-hover:opacity-100"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => !readOnly && setOpen(!open)}
          className={`w-full flex items-center justify-between px-3 py-3 bg-slate-800/60 border border-dashed border-slate-700 rounded-xl text-sm font-display transition-all ${
            !readOnly 
              ? 'hover:bg-slate-800 hover:border-slate-600 text-slate-400 hover:text-white cursor-pointer' 
              : 'text-slate-500 cursor-default'
          }`}
        >
          <span>{readOnly ? 'Empty Slot' : `Select ${role}`}</span>
          {!readOnly && <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />}
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-pit border border-steel/60 rounded-xl shadow-2xl overflow-hidden animate-scaleIn">
          {options.length === 0 ? (
            <div className="p-3 text-center text-slate-500 text-xs font-mono">No available players</div>
          ) : (
            options.map((p) => (
              <button
                key={p.id}
                onClick={() => { onSelect(p.id); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/80 transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-red-700 to-orange-700 rounded-lg flex items-center justify-center text-white font-display font-bold text-xs flex-shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-white text-sm font-display font-semibold truncate">{p.name}</p>
                  <p className="text-slate-500 text-xs font-mono">{p.role}{p.secondaryRole ? ` · ${p.secondaryRole}` : ''}</p>
                </div>
                <span className="text-slate-500 text-xs font-mono flex-shrink-0">{(p.tournamentsPlayed || []).length}T</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function Lineup() {
  const { players, tournaments, saveLineup, activeTournamentId } = useApp();
  const { isAdmin } = useAuth();
  const [selectedTournamentId, setSelectedTournamentId] = useState(() => {
    if (activeTournamentId && tournaments.find((t) => t.id === activeTournamentId)) {
      return activeTournamentId;
    }
    return tournaments.find((t) => t.status === 'Upcoming')?.id || '';
  });
  const [saved, setSaved] = useState(false);

  const tournament = tournaments.find((t) => t.id === selectedTournamentId);
  const maxSlots = tournament?.type === '3vs3' ? 3 : 5;
  const tournamentRoles = tournament?.type === '3vs3' ? ['Slot 1', 'Slot 2', 'Slot 3'] : ROLES;

  const [lineup, setLineup] = useState(
    tournament?.lineup || { Jungle: '', Gold: '', Exp: '', Mid: '', Roam: '' }
  );
  const [substitutes, setSubstitutes] = useState(tournament?.substitutes || []);

  // When tournament changes, load its lineup
  const handleTournamentChange = (id) => {
    setSelectedTournamentId(id);
    const t = tournaments.find((t) => t.id === id);
    setLineup(t?.lineup || { Jungle: '', Gold: '', Exp: '', Mid: '', Roam: '' });
    setSubstitutes(t?.substitutes || []);
    setSaved(false);
  };

  useEffect(() => {
    if (activeTournamentId && activeTournamentId !== selectedTournamentId && tournaments.find((t) => t.id === activeTournamentId)) {
      handleTournamentChange(activeTournamentId);
    }
  }, [activeTournamentId, selectedTournamentId, tournaments]);

  const allSelected = [
    ...Object.values(lineup).filter(Boolean),
    ...substitutes,
  ];

  const handleSave = () => {
    if (!selectedTournamentId) return;
    saveLineup(selectedTournamentId, lineup, substitutes);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const filledCount = tournamentRoles.filter(role => lineup[role]).length;
  const isComplete = filledCount === maxSlots;

  const availableSubs = players.filter((p) => {
    if (!p.available) return false;
    if (tournament?.availablePlayers && !tournament.availablePlayers.includes(p.id)) return false;
    if (allSelected.includes(p.id)) return false;
    return true;
  });

  const toggleSub = (id) => {
    setSubstitutes((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setSaved(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tournament Selector */}
      <div className="bg-pit border border-steel/40 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-red-400" />
          <h3 className="text-white font-display font-bold tracking-wide">Select Tournament</h3>
        </div>
        {tournaments.length === 0 ? (
          <p className="text-slate-500 text-sm font-body">No tournaments yet. Create one first.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tournaments
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTournamentChange(t.id)}
                  className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                    selectedTournamentId === t.id
                      ? 'bg-red-600/15 border-red-500/40 text-white'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <p className="font-display font-semibold text-sm truncate">{t.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge className={getFormatColor(t.format)}>{t.format}</Badge>
                    <Badge className={getStatusColor(t.status)}>{t.status}</Badge>
                  </div>
                  <p className="text-slate-500 text-xs font-mono mt-1">{formatDate(t.date)}</p>
                </button>
              ))}
          </div>
        )}
      </div>

      {tournament && (
        <>
          {/* Progress Bar */}
          <div className="bg-pit border border-steel/40 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-mono">Lineup Progress</span>
              <span className={`text-sm font-display font-bold ${isComplete ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {filledCount}/{maxSlots} {isComplete ? '✓ Complete' : 'slots filled'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                style={{ width: `${(filledCount / maxSlots) * 100}%` }}
              />
            </div>
          </div>

          {/* Role Slots Grid */}
          <div className="bg-pit border border-steel/40 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <Swords size={16} className="text-red-400" />
              <h3 className="text-white font-display font-bold tracking-wide">Main Lineup — {tournament.name}</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournamentRoles.map((role) => (
                <RoleSlot
                  key={role}
                  role={role}
                  selectedId={lineup[role]}
                  players={players}
                  allSelected={allSelected}
                  availableForTournament={tournament?.availablePlayers}
                  readOnly={!isAdmin}
                  onSelect={(id) => { setLineup({ ...lineup, [role]: id }); setSaved(false); }}
                />
              ))}
            </div>
          </div>

          {/* Substitutes */}
          <div className="bg-pit border border-steel/40 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck size={16} className="text-cyan-400" />
              <h3 className="text-white font-display font-bold tracking-wide">Substitutes</h3>
              <span className="text-slate-500 text-xs font-mono">(optional)</span>
            </div>
            {availableSubs.length === 0 && substitutes.length === 0 ? (
              <p className="text-slate-500 text-sm font-body">All available players are in the main lineup.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[...substitutes, ...availableSubs.filter((p) => !substitutes.includes(p.id))].map((p) => {
                  const player = typeof p === 'string' ? players.find((pl) => pl.id === p) : p;
                  if (!player) return null;
                  const isInSub = substitutes.includes(player.id);
                  return (
                    <button
                      key={player.id}
                      onClick={() => isAdmin && toggleSub(player.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-display font-semibold transition-all ${
                        isInSub
                          ? 'bg-cyan-900/20 border-cyan-500/40 text-cyan-400'
                          : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
                      } ${isAdmin ? 'hover:text-white cursor-pointer' : 'cursor-default'}`}
                    >
                      <span>{player.name}</span>
                      <Badge className={getRoleColor(player.role)}>{player.role}</Badge>
                      {isInSub && isAdmin && <X size={12} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Warning: unavailable players globally out of sync */}
          {Object.entries(lineup).some(([role, id]) => {
            if (!tournamentRoles.includes(role)) return false; // Ignore slots not used in this type
            const p = players.find((pl) => pl.id === id);
            return p && (!p.available || (tournament.availablePlayers && !tournament.availablePlayers.includes(p.id)));
          }) && (
            <div className="flex items-start gap-3 bg-yellow-900/10 border border-yellow-500/20 rounded-xl p-4">
              <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-300 text-sm font-body">Some selected players are marked as unavailable globally or for this event.</p>
            </div>
          )}

          {/* Save Button */}
          {isAdmin && (
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-xs font-mono">
                {substitutes.length} substitute{substitutes.length !== 1 ? 's' : ''} selected
              </p>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-display font-bold tracking-wide text-sm transition-all duration-200 ${
                  saved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                <Save size={16} />
                {saved ? '✓ Saved!' : 'Save Lineup'}
              </button>
            </div>
          )}
        </>
      )}

      {!tournament && tournaments.length > 0 && (
        <div className="text-center py-12 text-slate-500">
          <Swords size={40} className="mx-auto mb-3 text-slate-700" />
          <p className="font-display">Select a tournament above to manage its lineup</p>
        </div>
      )}
    </div>
  );
}
