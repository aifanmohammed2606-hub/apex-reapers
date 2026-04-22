import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  User, Edit2, Save, CheckCircle2, UserCheck, UserX, Shield, Swords, Trophy
} from 'lucide-react';
import { getRoleColor, getRoleIcon } from '../utils/helpers';
import { ROLES } from '../data/initialData';
import Badge from '../components/ui/Badge';

export default function MyProfile({ isOnboarding }) {
  const { getAccessToken, user } = useAuth();
  const { refreshPlayers } = useApp();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    role: 'Jungle',
    secondaryRole: '',
    flexibleRoles: [],
    available: true,
  });

  const fetchProfile = useCallback(async () => {
    try {
      const token = getAccessToken();
      const res = await fetch('/api/players/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        if (data) {
          setForm({
            name: data.name || '',
            role: data.role || 'Jungle',
            secondaryRole: data.secondaryRole || '',
            flexibleRoles: data.flexibleRoles || [],
            available: data.available !== false,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (!form.name.trim()) {
      setError('Player name is required');
      setSaving(false);
      return;
    }

    try {
      const token = getAccessToken();
      const method = profile ? 'PATCH' : 'POST';
      const res = await fetch('/api/players/me', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save');
      }

      const data = await res.json();
      setProfile(data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Update global context so the onboarding gate unlocks
      await refreshPlayers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // ─── NO PROFILE YET — SHOW CREATE FORM ───
  if (!profile) {
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fadeIn">
        {/* Welcome */}
        <div className="relative overflow-hidden bg-gradient-to-r from-cyan-900/30 via-cyan-800/10 to-transparent border border-cyan-500/20 rounded-2xl p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-600/20 border border-cyan-500/30 rounded-2xl mb-4">
            <User size={32} className="text-cyan-400" />
          </div>
          <h2 className="text-white font-display font-black text-2xl tracking-wide mb-1">
            Create Your Player Profile
          </h2>
          <p className="text-slate-400 text-sm font-body">
            Set up your identity as an Apex Reaper. You can edit this later.
          </p>
        </div>

        {/* Create Form */}
        <div className="bg-pit border border-steel/40 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Player Name *</label>
              <input
                className="input-field"
                placeholder="e.g. ShadowBlade"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Primary Role *</label>
                <select
                  className="select-field"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Secondary Role</label>
                <select
                  className="select-field"
                  value={form.secondaryRole}
                  onChange={(e) => setForm({ ...form, secondaryRole: e.target.value })}
                >
                  <option value="">None</option>
                  {ROLES.filter((r) => r !== form.role).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
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
                {form.available ? 'Available for tournaments' : 'Not available'}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-xs font-mono">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-crimson-600 hover:bg-crimson-500 disabled:opacity-50 text-white font-display font-bold text-sm tracking-wide rounded-xl transition-all duration-200 crimson-glow"
            >
              {saving ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <Swords size={16} /> Create My Profile
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── HAS PROFILE — SHOW PROFILE VIEW / EDIT ───
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Profile Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-900/30 via-red-800/10 to-transparent border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-crimson-600 to-orange-600 rounded-2xl flex items-center justify-center text-white font-display font-black text-2xl flex-shrink-0 crimson-glow">
            {profile.name?.charAt(0)?.toUpperCase() || 'P'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-display font-black text-2xl tracking-wide truncate">
              {profile.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className={getRoleColor(profile.role)}>
                {getRoleIcon(profile.role)} {profile.role}
              </Badge>
              {profile.secondaryRole && (
                <Badge className="text-slate-400 bg-slate-800 border border-slate-700">
                  {getRoleIcon(profile.secondaryRole)} {profile.secondaryRole}
                </Badge>
              )}
              {profile.flexibleRoles && profile.flexibleRoles.length > 0 && (
                <div className="flex items-center gap-1 ml-1 border-l border-steel/30 pl-2">
                  {profile.flexibleRoles.map(fr => (
                    <Badge key={fr} className="text-slate-500 bg-slate-800/50 border border-slate-700/50 text-[10px] px-1.5 py-0">
                      {fr}
                    </Badge>
                  ))}
                </div>
              )}
              <div className={`flex items-center gap-1 text-xs font-mono ${profile.available ? 'text-emerald-400' : 'text-slate-500'}`}>
                {profile.available ? <UserCheck size={12} /> : <UserX size={12} />}
                {profile.available ? 'Available' : 'Unavailable'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${
              editing
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30'
            }`}
          >
            <Edit2 size={14} />
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-xl animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <p className="text-emerald-400 text-sm font-display font-semibold">Profile updated successfully!</p>
        </div>
      )}

      {/* Profile Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-pit border border-steel/40 rounded-xl p-4 text-center">
          <Trophy size={20} className="text-yellow-400 mx-auto mb-2" />
          <p className="text-white font-display font-bold text-2xl">{(profile.tournamentsPlayed || []).length}</p>
          <p className="text-slate-500 text-xs font-mono">Tournaments</p>
        </div>
        <div className="bg-pit border border-steel/40 rounded-xl p-4 text-center">
          <Swords size={20} className="text-red-400 mx-auto mb-2" />
          <p className="text-white font-display font-bold text-sm mt-1">{profile.role}</p>
          <p className="text-slate-500 text-xs font-mono">Primary Role</p>
        </div>
        <div className="bg-pit border border-steel/40 rounded-xl p-4 text-center">
          <Shield size={20} className={`mx-auto mb-2 ${profile.available ? 'text-emerald-400' : 'text-slate-600'}`} />
          <p className={`font-display font-bold text-sm mt-1 ${profile.available ? 'text-emerald-400' : 'text-slate-500'}`}>
            {profile.available ? 'Ready' : 'Away'}
          </p>
          <p className="text-slate-500 text-xs font-mono">Status</p>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="bg-pit border border-steel/40 rounded-xl p-6 animate-fadeIn">
          <h3 className="text-white font-display font-bold tracking-wide mb-4 flex items-center gap-2">
            <Edit2 size={16} className="text-blue-400" /> Edit Profile
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Player Name *</label>
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Primary Role</label>
                <select
                  className="select-field"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Secondary Role</label>
                <select
                  className="select-field"
                  value={form.secondaryRole}
                  onChange={(e) => setForm({ ...form, secondaryRole: e.target.value })}
                >
                  <option value="">None</option>
                  {ROLES.filter((r) => r !== form.role).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
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
                {form.available ? 'Available for tournaments' : 'Not available'}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-xs font-mono">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setForm({
                    name: profile.name,
                    role: profile.role,
                    secondaryRole: profile.secondaryRole || '',
                    flexibleRoles: profile.flexibleRoles || [],
                    available: profile.available,
                  });
                }}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-display font-semibold text-sm rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-crimson-600 hover:bg-crimson-500 disabled:opacity-50 text-white font-display font-semibold text-sm rounded-lg transition-all"
              >
                {saving ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Save size={14} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account Info */}
      <div className="bg-pit border border-steel/40 rounded-xl p-5">
        <h3 className="text-white font-display font-bold tracking-wide mb-3 text-sm">Account Info</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-slate-500 text-xs font-mono mb-0.5">Email</p>
            <p className="text-slate-300 text-sm font-body">{user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs font-mono mb-0.5">Member Since</p>
            <p className="text-slate-300 text-sm font-body">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
