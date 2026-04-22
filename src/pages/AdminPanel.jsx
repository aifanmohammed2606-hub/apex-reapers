import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Users, Trophy, Swords, FileText, BarChart3,
  UserPlus, Edit2, Trash2, Plus, Search, RefreshCw,
  Crown, UserCheck, UserX, Calendar, Clock, DollarSign,
  CheckCircle2, XCircle, AlertCircle, Eye
} from 'lucide-react';
import { getRoleColor, getRoleIcon, getStatusColor, getFormatColor, formatDate, formatTime, filterBySearch } from '../utils/helpers';
import { ROLES, FORMATS, STATUSES, TYPES } from '../data/initialData';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';

// ─── TAB CONFIGURATION ───
const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'players', label: 'Players', icon: UserPlus },
  { id: 'tournaments', label: 'Tournaments', icon: Trophy },
  { id: 'submissions', label: 'Submissions', icon: FileText },
];

// ─── OVERVIEW TAB ───
function OverviewTab({ players, tournaments, userCount, submissionCount }) {
  const upcoming = tournaments.filter(t => t.status === 'Upcoming').length;
  const completed = tournaments.filter(t => t.status === 'Completed').length;
  const available = players.filter(p => p.available).length;

  const stats = [
    { label: 'Registered Users', value: userCount, color: 'from-blue-600/20 to-blue-900/10 border-blue-500/20 text-blue-400' },
    { label: 'Total Players', value: players.length, color: 'from-cyan-600/20 to-cyan-900/10 border-cyan-500/20 text-cyan-400' },
    { label: 'Tournaments', value: tournaments.length, color: 'from-yellow-600/20 to-yellow-900/10 border-yellow-500/20 text-yellow-400' },
    { label: 'Upcoming', value: upcoming, color: 'from-red-600/20 to-red-900/10 border-red-500/20 text-red-400' },
    { label: 'Completed', value: completed, color: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/20 text-emerald-400' },
    { label: 'Available Players', value: available, color: 'from-purple-600/20 to-purple-900/10 border-purple-500/20 text-purple-400' },
    { label: 'Submissions', value: submissionCount, color: 'from-amber-600/20 to-amber-900/10 border-amber-500/20 text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} border rounded-xl p-4`}>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-white font-display font-bold text-3xl leading-none">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-pit border border-steel/40 rounded-xl p-5">
        <h3 className="text-white font-display font-bold tracking-wide mb-4 flex items-center gap-2">
          <Clock size={16} className="text-amber-400" /> Recent Tournaments
        </h3>
        {tournaments.length === 0 ? (
          <p className="text-slate-500 text-sm">No tournaments yet.</p>
        ) : (
          <div className="space-y-2">
            {tournaments.slice(-5).reverse().map(t => (
              <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40">
                <Trophy size={14} className="text-yellow-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-display font-semibold truncate">{t.name}</p>
                  <p className="text-slate-500 text-xs font-mono">{formatDate(t.date)}</p>
                </div>
                <Badge className={getStatusColor(t.status)}>{t.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── USERS TAB ───
function UsersTab({ getAccessToken }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const token = getAccessToken();
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const filtered = users.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input-field pl-9"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={fetchUsers} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      <p className="text-slate-500 text-sm font-mono">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>

      <div className="bg-pit border border-steel/40 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-steel/30 bg-slate-900/40">
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">User</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Email</th>
                <th className="text-center px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Role</th>
                <th className="text-center px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Joined</th>
                <th className="text-center px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-steel/20 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-crimson-600 to-orange-600 rounded-lg flex items-center justify-center text-white font-display font-bold text-xs">
                        {(u.display_name || u.email)?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-white text-sm font-display font-semibold">{u.display_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm font-mono">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold ${u.role === 'admin' ? 'bg-amber-900/30 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                      {u.role === 'admin' ? '👑' : '👤'} {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500 text-xs font-mono">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleRole(u.id, u.role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all ${
                        u.role === 'admin'
                          ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-500/30'
                          : 'bg-amber-900/20 text-amber-400 hover:bg-amber-900/40 border border-amber-500/30'
                      }`}
                    >
                      {u.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── PLAYERS TAB (Admin CRUD) ───
function PlayersTab({ players, addPlayer, updatePlayer, deletePlayer, toggleAvailability }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = filterBySearch(players, search, ['name', 'role', 'secondaryRole']);

  const EMPTY_FORM = { name: '', role: 'Jungle', secondaryRole: '', available: true };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input-field pl-9" placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setModal('add')} className="btn-primary whitespace-nowrap">
          <Plus size={16} /> Add Player
        </button>
      </div>

      <p className="text-slate-500 text-sm font-mono">{filtered.length} player{filtered.length !== 1 ? 's' : ''}</p>

      <div className="bg-pit border border-steel/40 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-steel/30 bg-slate-900/40">
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Player</th>
                <th className="text-center px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Role</th>
                <th className="text-center px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="text-center px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Tournaments</th>
                <th className="text-center px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-steel/20 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center text-white font-display font-bold text-xs">{p.name.charAt(0)}</div>
                      <span className="text-white text-sm font-display font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={getRoleColor(p.role)}>{getRoleIcon(p.role)} {p.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleAvailability(p.id)} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold cursor-pointer transition-all ${p.available ? 'text-emerald-400 bg-emerald-900/20 hover:bg-emerald-900/40' : 'text-slate-500 bg-slate-800 hover:bg-slate-700'}`}>
                      {p.available ? <UserCheck size={12} /> : <UserX size={12} />}
                      {p.available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center text-white font-display font-bold">{(p.tournamentsPlayed || []).length}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setModal(p)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add New Player' : `Edit ${modal?.name}`}>
        <PlayerFormInline
          initial={modal === 'add' ? EMPTY_FORM : modal}
          isEdit={modal !== 'add'}
          onSubmit={(data) => {
            if (modal === 'add') addPlayer(data);
            else updatePlayer(modal.id, data);
            setModal(null);
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deletePlayer(deleteTarget.id); setDeleteTarget(null); }}
        title="Delete Player"
        message={`Remove ${deleteTarget?.name} from the roster? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

// Simple inline player form for admin panel
function PlayerFormInline({ initial, isEdit, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial);

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="label">Name *</label>
        <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Primary Role</label>
          <select className="select-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Secondary Role</label>
          <select className="select-field" value={form.secondaryRole || ''} onChange={e => setForm({ ...form, secondaryRole: e.target.value })}>
            <option value="">None</option>
            {ROLES.filter(r => r !== form.role).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-display font-semibold text-sm rounded-lg transition-all">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-display font-semibold text-sm rounded-lg transition-all">{isEdit ? 'Save' : 'Add'}</button>
      </div>
    </form>
  );
}

// ─── TOURNAMENTS TAB (Admin CRUD) ───
function TournamentsTab({ tournaments, addTournament, updateTournament, deleteTournament, players }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = filterBySearch(tournaments, search, ['name', 'format', 'status']);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input-field pl-9" placeholder="Search tournaments..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setModal('add')} className="btn-primary whitespace-nowrap">
          <Plus size={16} /> Add Tournament
        </button>
      </div>

      <p className="text-slate-500 text-sm font-mono">{filtered.length} tournament{filtered.length !== 1 ? 's' : ''}</p>

      <div className="bg-pit border border-steel/40 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-steel/30 bg-slate-900/40">
                <th className="text-left px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Tournament</th>
                <th className="text-center px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="text-center px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Format</th>
                <th className="text-center px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="text-center px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Lineup</th>
                <th className="text-center px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const lineupCount = Object.values(t.lineup || {}).filter(Boolean).length;
                return (
                  <tr key={t.id} className="border-b border-steel/20 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-display font-semibold">{t.name}</p>
                        {t.prizePool && <p className="text-yellow-400 text-xs font-mono">{t.prizePool}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400 text-xs font-mono">{formatDate(t.date)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={getFormatColor(t.format)}>{t.format}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={getStatusColor(t.status)}>{t.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-white font-display font-bold">{lineupCount}/5</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setModal(t)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteTarget(t)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Tournament' : `Edit ${modal?.name}`}>
        <TournamentFormInline
          initial={modal === 'add' ? null : modal}
          players={players}
          onSubmit={(data) => {
            if (modal === 'add') addTournament(data);
            else updateTournament(modal.id, data);
            setModal(null);
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteTournament(deleteTarget.id); setDeleteTarget(null); }}
        title="Delete Tournament"
        message={`Remove "${deleteTarget?.name}" permanently?`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function TournamentFormInline({ initial, players, onSubmit, onCancel }) {
  const defaultForm = {
    name: '', date: '', time: '', format: 'BO3', type: '5vs5',
    prizePool: '', status: 'Upcoming',
    availablePlayers: players.filter(p => p.available).map(p => p.id),
  };
  const [form, setForm] = useState(initial || defaultForm);

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="label">Name *</label>
        <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Date *</label>
          <input type="date" className="input-field" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        </div>
        <div>
          <label className="label">Time</label>
          <input type="time" className="input-field" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Format</label>
          <select className="select-field" value={form.format} onChange={e => setForm({ ...form, format: e.target.value })}>
            {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Type</label>
          <select className="select-field" value={form.type || '5vs5'} onChange={e => setForm({ ...form, type: e.target.value })}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="select-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Prize Pool</label>
        <input className="input-field" placeholder="e.g. ₱5,000" value={form.prizePool} onChange={e => setForm({ ...form, prizePool: e.target.value })} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-display font-semibold text-sm rounded-lg transition-all">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-display font-semibold text-sm rounded-lg transition-all">{initial ? 'Save' : 'Add'}</button>
      </div>
    </form>
  );
}

// ─── SUBMISSIONS TAB ───
function SubmissionsTab({ getAccessToken }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const token = getAccessToken();
        const res = await fetch('/api/submissions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data);
        }
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [getAccessToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={40} className="text-slate-700 mx-auto mb-3" />
        <p className="text-slate-500 font-display text-lg">No submissions yet</p>
        <p className="text-slate-600 text-sm font-mono mt-1">User submissions will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-pit border border-steel/40 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-steel/30 bg-slate-900/40">
              <th className="text-left px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">User ID</th>
              <th className="text-left px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Type</th>
              <th className="text-left px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Data</th>
              <th className="text-center px-4 py-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Date</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(s => (
              <tr key={s.id} className="border-b border-steel/20 hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 text-slate-400 text-xs font-mono">{s.user_id?.slice(0, 8)}...</td>
                <td className="px-4 py-3">
                  <Badge className="text-cyan-400 bg-cyan-900/20 border border-cyan-500/30">{s.submission_type}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-300 text-xs font-mono max-w-[300px] truncate">
                  {JSON.stringify(s.data)}
                </td>
                <td className="px-4 py-3 text-center text-slate-500 text-xs font-mono">
                  {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MAIN ADMIN PANEL ───
export default function AdminPanel() {
  const { players, tournaments, addPlayer, updatePlayer, deletePlayer, toggleAvailability, addTournament, updateTournament, deleteTournament } = useApp();
  const { isAdmin, getAccessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userCount, setUserCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);

  // Fetch counts for overview
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = getAccessToken();
        const [usersRes, subsRes] = await Promise.all([
          fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/submissions', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (usersRes.ok) {
          const users = await usersRes.json();
          setUserCount(users.length);
        }
        if (subsRes.ok) {
          const subs = await subsRes.json();
          setSubmissionCount(subs.length);
        }
      } catch (err) {
        console.error('Failed to fetch admin counts:', err);
      }
    };
    if (isAdmin) fetchCounts();
  }, [isAdmin, getAccessToken]);

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <Shield size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-white font-display font-bold text-2xl mb-2">Access Denied</h2>
        <p className="text-slate-500 font-body">You don't have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-900/30 via-amber-800/10 to-transparent border border-amber-500/20 rounded-2xl p-6">
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-600/20 border border-amber-500/30 rounded-xl flex items-center justify-center">
            <Shield size={24} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-white font-display font-black text-2xl tracking-wide">Admin Panel</h2>
            <p className="text-amber-400/70 text-sm font-mono tracking-widest">FULL CONTROL CENTER</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {ADMIN_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === id
                ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-white border border-transparent hover:border-steel/40'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          players={players}
          tournaments={tournaments}
          userCount={userCount}
          submissionCount={submissionCount}
        />
      )}
      {activeTab === 'users' && <UsersTab getAccessToken={getAccessToken} />}
      {activeTab === 'players' && (
        <PlayersTab
          players={players}
          addPlayer={addPlayer}
          updatePlayer={updatePlayer}
          deletePlayer={deletePlayer}
          toggleAvailability={toggleAvailability}
        />
      )}
      {activeTab === 'tournaments' && (
        <TournamentsTab
          tournaments={tournaments}
          addTournament={addTournament}
          updateTournament={updateTournament}
          deleteTournament={deleteTournament}
          players={players}
        />
      )}
      {activeTab === 'submissions' && <SubmissionsTab getAccessToken={getAccessToken} />}
    </div>
  );
}
