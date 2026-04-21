import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Edit2, Trash2, Trophy, Calendar, Clock, DollarSign } from 'lucide-react';
import { formatDate, formatTime, getDaysUntil, getStatusColor, getFormatColor, filterBySearch } from '../utils/helpers';
import { FORMATS, STATUSES, TYPES } from '../data/initialData';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

function TournamentForm({ initial, onSubmit, onCancel, players }) {
  const defaultForm = {
    name: '', date: '', time: '', format: 'BO3', type: '5vs5',
    prizePool: '', status: 'Upcoming', availablePlayers: players.filter(p => p.available).map(p => p.id)
  };
  const [form, setForm] = useState(initial || defaultForm);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.date) e.date = 'Date is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Tournament Name *</label>
        <input
          className={`input-field ${errors.name ? 'border-red-500' : ''}`}
          placeholder="e.g. Shadow Cup Season 2"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <p className="text-red-400 text-xs mt-1 font-mono">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Date *</label>
          <input
            type="date"
            className={`input-field ${errors.date ? 'border-red-500' : ''}`}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          {errors.date && <p className="text-red-400 text-xs mt-1 font-mono">{errors.date}</p>}
        </div>
        <div>
          <label className="label">Time</label>
          <input
            type="time"
            className="input-field"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Format</label>
          <select className="select-field" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
            {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Type</label>
          <select className="select-field" value={form.type || '5vs5'} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="select-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Prize Pool</label>
        <input
          className="input-field"
          placeholder="e.g. ₱5,000"
          value={form.prizePool}
          onChange={(e) => setForm({ ...form, prizePool: e.target.value })}
        />
      </div>

      <div className="pt-2 border-t border-steel/30">
        <label className="label mb-2 flex items-center gap-2">
          Available Players
          <span className="text-slate-500 text-[10px] uppercase tracking-wider">(for this tournament)</span>
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
          {players.filter(p => p.available).map((p) => {
            const isChecked = form.availablePlayers?.includes(p.id);
            return (
              <label key={p.id} className={`flex items-center gap-2 p-2 rounded-lg border text-sm cursor-pointer transition-all ${isChecked ? 'bg-cyan-900/20 border-cyan-500/40 text-cyan-400' : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 text-slate-400'}`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isChecked}
                  onChange={(e) => {
                    const next = e.target.checked 
                      ? [...(form.availablePlayers || []), p.id]
                      : (form.availablePlayers || []).filter(id => id !== p.id);
                    setForm({ ...form, availablePlayers: next });
                  }}
                />
                <div className={`w-3 h-3 rounded flex items-center justify-center border ${isChecked ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500'}`}>
                  {isChecked && <div className="w-1.5 h-1.5 bg-pit rounded-sm" />}
                </div>
                <span className="truncate">{p.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-display font-semibold text-sm rounded-lg transition-all">
          Cancel
        </button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-display font-semibold text-sm rounded-lg transition-all">
          {initial ? 'Save Changes' : 'Add Tournament'}
        </button>
      </div>
    </form>
  );
}

function TournamentCard({ t, onEdit, onDelete, onSetLineup }) {
  const days = getDaysUntil(t.date);
  const lineupCount = Object.values(t.lineup || {}).filter(Boolean).length;

  return (
    <div className="bg-pit border border-steel/40 rounded-xl p-5 hover:border-steel/60 transition-all duration-200 animate-fadeIn">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-display font-bold text-base leading-tight truncate">{t.name}</h3>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge className={getStatusColor(t.status)}>{t.status}</Badge>
            <Badge className={getFormatColor(t.format)}>{t.format}</Badge>
            <Badge className="text-purple-400 bg-purple-900/20 border border-purple-500/30">{t.type || '5vs5'}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEdit(t)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all">
            <Edit2 size={15} />
          </button>
          <button onClick={() => onDelete(t)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={13} className="text-slate-500 flex-shrink-0" />
          <span className="text-slate-400 font-body truncate">{formatDate(t.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock size={13} className="text-slate-500 flex-shrink-0" />
          <span className="text-slate-400 font-body">{formatTime(t.time)}</span>
        </div>
        {t.prizePool && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign size={13} className="text-yellow-500 flex-shrink-0" />
            <span className="text-yellow-400 font-display font-bold">{t.prizePool}</span>
          </div>
        )}
        {days !== null && t.status === 'Upcoming' && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 font-mono text-xs">
              {days < 0 ? 'Past due' : days === 0 ? '🔴 TODAY' : `${days}d left`}
            </span>
          </div>
        )}
      </div>

      {/* Lineup Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-500 text-xs font-mono">Lineup</span>
          <span className="text-slate-400 text-xs font-mono">{lineupCount}/5</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${lineupCount === 5 ? 'bg-emerald-500' : lineupCount > 0 ? 'bg-yellow-500' : 'bg-slate-700'}`}
            style={{ width: `${(lineupCount / 5) * 100}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => onSetLineup(t)}
        className="w-full py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-display font-semibold text-xs rounded-lg transition-all tracking-wide"
      >
        {lineupCount === 5 ? '✓ Lineup Set — Edit' : 'Set Lineup →'}
      </button>
    </div>
  );
}

export default function Tournaments() {
  const { tournaments, addTournament, updateTournament, deleteTournament, setActivePage, setActiveTournamentId, players } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = filterBySearch(tournaments, search, ['name', 'format', 'status'])
    .filter((t) => statusFilter === 'All' || t.status === statusFilter)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input-field pl-9"
            placeholder="Search tournaments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                statusFilter === s ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button onClick={() => setModal('add')} className="btn-primary whitespace-nowrap">
          <Plus size={16} /> Add Tournament
        </button>
      </div>

      <p className="text-slate-500 text-sm font-mono">{filtered.length} tournament{filtered.length !== 1 ? 's' : ''}</p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No tournaments found"
          message={search ? 'Try a different search term' : 'Create your first tournament'}
          action={!search && <button onClick={() => setModal('add')} className="btn-primary mx-auto"><Plus size={16} /> Add Tournament</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <TournamentCard
              key={t.id}
              t={t}
              onEdit={(t) => setModal(t)}
              onDelete={(t) => setDeleteTarget(t)}
              onSetLineup={() => { setActiveTournamentId(t.id); setActivePage('lineup'); }}
            />
          ))}
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Tournament' : `Edit ${modal?.name}`}>
        <TournamentForm
          initial={modal === 'add' ? undefined : modal}
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
        message={`Remove "${deleteTarget?.name}" permanently? Player participation records will also be cleared.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
