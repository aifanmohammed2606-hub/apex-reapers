import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, UserCheck, UserX, Users } from 'lucide-react';
import { getRoleColor, getRoleIcon, filterBySearch } from '../utils/helpers';
import { ROLES } from '../data/initialData';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

const EMPTY_FORM = { name: '', role: 'Jungle', secondaryRole: '', flexibleRoles: [], available: true };

function PlayerForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.role) e.role = 'Primary role is required';
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
        <label className="label">Player Name *</label>
        <input
          className={`input-field ${errors.name ? 'border-red-500' : ''}`}
          placeholder="e.g. ShadowBlade"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <p className="text-red-400 text-xs mt-1 font-mono">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Primary Role *</label>
          <select className="select-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Secondary Role</label>
          <select className="select-field" value={form.secondaryRole} onChange={(e) => setForm({ ...form, secondaryRole: e.target.value })}>
            <option value="">None</option>
            {ROLES.filter((r) => r !== form.role).map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="pt-1">
        <label className="label mb-2 flex items-center gap-2">
          Flexible Roles
          <span className="text-slate-500 text-[10px] uppercase tracking-wider">(Additional Playable Roles)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {ROLES.filter(r => r !== form.role && r !== form.secondaryRole).map((r) => {
            const isChecked = form.flexibleRoles?.includes(r);
            return (
              <label key={r} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${isChecked ? 'bg-cyan-900/20 border-cyan-500/40 text-cyan-400 font-bold' : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 text-slate-400'}`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isChecked}
                  onChange={(e) => {
                    const next = e.target.checked 
                      ? [...(form.flexibleRoles || []), r]
                      : (form.flexibleRoles || []).filter(fr => fr !== r);
                    setForm({ ...form, flexibleRoles: next });
                  }}
                />
                {r}
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <label className="label">Availability</label>
        <button
          type="button"
          onClick={() => setForm({ ...form, available: !form.available })}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-display font-semibold text-sm transition-all ${
            form.available
              ? 'bg-emerald-900/20 border-emerald-500/40 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          {form.available ? <UserCheck size={16} /> : <UserX size={16} />}
          {form.available ? 'Available' : 'Unavailable'}
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-display font-semibold text-sm rounded-lg transition-all">
          Cancel
        </button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-display font-semibold text-sm rounded-lg transition-all">
          {initial ? 'Save Changes' : 'Add Player'}
        </button>
      </div>
    </form>
  );
}

function PlayerCard({ player, onEdit, onDelete, onToggle, readOnly }) {
  return (
    <div className="bg-pit border border-steel/40 rounded-xl p-4 hover:border-steel/60 transition-all duration-200 animate-fadeIn group">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg flex-shrink-0">
          {player.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-display font-bold text-base truncate">{player.name}</h3>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${player.available ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge className={getRoleColor(player.role)}>{getRoleIcon(player.role)} {player.role}</Badge>
            {player.secondaryRole && (
              <Badge className="text-slate-400 bg-slate-800 border border-slate-700">
                {getRoleIcon(player.secondaryRole)} {player.secondaryRole}
              </Badge>
            )}
            {player.flexibleRoles && player.flexibleRoles.length > 0 && (
              <div className="flex items-center gap-1 ml-1 border-l border-steel/30 pl-2">
                {player.flexibleRoles.map(fr => (
                  <Badge key={fr} className="text-slate-500 bg-slate-800/50 border border-slate-700/50 text-[10px] px-1.5 py-0">
                    {fr}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-steel/30 flex items-center gap-3">
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div>
            <p className="text-slate-500 text-xs font-mono">Tournaments</p>
            <p className="text-white font-display font-bold text-lg leading-none mt-0.5">
              {(player.tournamentsPlayed || []).length}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs font-mono">Status</p>
            <p className={`text-xs font-mono font-bold mt-0.5 ${player.available ? 'text-emerald-400' : 'text-slate-500'}`}>
              {player.available ? 'AVAILABLE' : 'UNAVAILABLE'}
            </p>
          </div>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-1">
            <button onClick={() => onToggle(player.id)} className={`p-1.5 rounded-lg transition-all text-xs ${player.available ? 'text-emerald-400 hover:bg-emerald-900/20' : 'text-slate-500 hover:bg-slate-800'}`} title="Toggle availability">
              {player.available ? <UserCheck size={15} /> : <UserX size={15} />}
            </button>
            <button onClick={() => onEdit(player)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all" title="Edit">
              <Edit2 size={15} />
            </button>
            <button onClick={() => onDelete(player)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all" title="Delete">
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Players() {
  const { players, addPlayer, updatePlayer, deletePlayer, toggleAvailability } = useApp();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [modal, setModal] = useState(null); // null | 'add' | player object (edit)
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = filterBySearch(players, search, ['name', 'role', 'secondaryRole'])
    .filter((p) => roleFilter === 'All' || p.role === roleFilter);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input-field pl-9"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', ...ROLES].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                roleFilter === r ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button onClick={() => setModal('add')} className="btn-primary whitespace-nowrap">
            <Plus size={16} /> Add Player
          </button>
        )}
      </div>

      {/* Count */}
      <div className="flex items-center gap-2">
        <p className="text-slate-500 text-sm font-mono">{filtered.length} player{filtered.length !== 1 ? 's' : ''}</p>
        {search && <button onClick={() => setSearch('')} className="text-red-400 text-xs hover:text-red-300 font-mono">Clear</button>}
        {!isAdmin && <span className="text-slate-600 text-xs font-mono ml-auto">Read-only</span>}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No players found"
          message={search ? 'Try a different search term' : 'Add your first player to get started'}
          action={!search && isAdmin && <button onClick={() => setModal('add')} className="btn-primary mx-auto"><Plus size={16} /> Add Player</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              readOnly={!isAdmin}
              onEdit={(player) => setModal(player)}
              onDelete={(player) => setDeleteTarget(player)}
              onToggle={toggleAvailability}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal — admin only */}
      {isAdmin && (
        <Modal
          isOpen={!!modal}
          onClose={() => setModal(null)}
          title={modal === 'add' ? 'Add New Player' : `Edit ${modal?.name}`}
        >
          <PlayerForm
            initial={modal === 'add' ? undefined : modal}
            onSubmit={(data) => {
              if (modal === 'add') addPlayer(data);
              else updatePlayer(modal.id, data);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {/* Delete Confirm — admin only */}
      {isAdmin && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => { deletePlayer(deleteTarget.id); setDeleteTarget(null); }}
          title="Delete Player"
          message={`Remove ${deleteTarget?.name} from the roster? This cannot be undone.`}
          confirmLabel="Delete"
        />
      )}
    </div>
  );
}
