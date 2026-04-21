import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AppContext = createContext(null);

// Thin wrapper around fetch for JSON API calls to /api/* routes
async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API error');
  }
  return res.status === 200 || res.status === 201 ? res.json() : null;
}

export function AppProvider({ children }) {
  const [players, setPlayers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activePage, setActivePage] = useLocalStorage('ar_page', 'dashboard');
  const [activeTournamentId, setActiveTournamentId] = useLocalStorage('ar_tid', null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, t] = await Promise.all([
          api('/api/players'),
          api('/api/tournaments'),
        ]);
        setPlayers(p || []);
        setTournaments(t || []);
      } catch (err) {
        console.error('Failed to load DB:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const addPlayer = useCallback(async (data) => {
    try {
      const newPlayer = await api('/api/players', { method: 'POST', body: data });
      if (newPlayer) setPlayers((prev) => [...prev, newPlayer]);
    } catch(e) { console.error('Error adding player:', e); }
  }, []);

  const updatePlayer = useCallback(async (id, data) => {
    try {
      const updated = await api(`/api/players/${id}`, { method: 'PATCH', body: data });
      if (updated) setPlayers((prev) => prev.map((p) => p.id === id ? updated : p));
    } catch(e) { console.error('Error updating player:', e); }
  }, []);

  const deletePlayer = useCallback(async (id) => {
    try {
      await api(`/api/players/${id}`, { method: 'DELETE' });
      setPlayers((prev) => prev.filter((p) => p.id !== id));
      // Refresh tournaments — server-side handler cleaned up lineups/substitutes
      const updated = await api('/api/tournaments');
      if (updated) setTournaments(updated);
    } catch(e) { console.error('Error deleting player:', e); }
  }, []);

  const toggleAvailability = useCallback(async (id) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    try {
      const updated = await api(`/api/players/${id}`, { method: 'PATCH', body: { available: !player.available } });
      if (updated) setPlayers((prev) => prev.map((p) => p.id === id ? updated : p));
    } catch(e) { console.error('Error toggling availability:', e); }
  }, [players]);

  const addTournament = useCallback(async (data) => {
    try {
      const newT = await api('/api/tournaments', { method: 'POST', body: data });
      if (newT) setTournaments((prev) => [...prev, newT]);
    } catch(e) { console.error('Error adding tournament:', e); }
  }, []);

  const updateTournament = useCallback(async (id, data) => {
    try {
      const updated = await api(`/api/tournaments/${id}`, { method: 'PATCH', body: data });
      if (updated) setTournaments((prev) => prev.map(t => t.id === id ? updated : t));
    } catch(e) { console.error('Error updating tournament:', e); }
  }, []);

  const deleteTournament = useCallback(async (id) => {
    try {
      await api(`/api/tournaments/${id}`, { method: 'DELETE' });
      setTournaments((prev) => prev.filter(t => t.id !== id));
      // Refresh players — server-side handler cleaned up tournamentsPlayed
      const updated = await api('/api/players');
      if (updated) setPlayers(updated);
    } catch(e) { console.error('Error deleting tournament:', e); }
  }, []);

  const saveLineup = useCallback(async (tournamentId, lineup, substitutes) => {
    try {
      const updatedT = await api(`/api/tournaments/${tournamentId}/lineup`, {
        method: 'PATCH',
        body: { lineup, substitutes: substitutes || [] },
      });
      if (updatedT) setTournaments((prev) => prev.map(t => t.id === tournamentId ? updatedT : t));
      // Refresh players to pick up tournamentsPlayed changes done server-side
      const updatedPlayers = await api('/api/players');
      if (updatedPlayers) setPlayers(updatedPlayers);
    } catch(e) { console.error('Error saving lineup:', e); }
  }, []);

  const value = {
    players, tournaments, activePage, setActivePage, activeTournamentId, setActiveTournamentId,
    addPlayer, updatePlayer, deletePlayer, toggleAvailability,
    addTournament, updateTournament, deleteTournament,
    saveLineup,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-display">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm tracking-wide">Connecting to Database...</p>
        </div>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
