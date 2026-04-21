export const generateId = (prefix = 'id') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

export const getDaysUntil = (dateStr) => {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
};

export const getRoleColor = (role) => {
  const colors = {
    Jungle: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/30',
    Gold: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/30',
    Exp: 'text-purple-400 bg-purple-400/10 border border-purple-400/30',
    Mid: 'text-blue-400 bg-blue-400/10 border border-blue-400/30',
    Roam: 'text-orange-400 bg-orange-400/10 border border-orange-400/30',
  };
  return colors[role] || 'text-slate-400 bg-slate-800 border border-slate-700';
};

export const getRoleIcon = (role) => {
  const icons = { Jungle: '🌿', Gold: '💰', Exp: '⚡', Mid: '🔮', Roam: '🛡️' };
  return icons[role] || '👤';
};

export const getStatusColor = (status) => {
  const colors = {
    Upcoming: 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/30',
    Ongoing: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/30',
    Completed: 'text-slate-400 bg-slate-400/10 border border-slate-400/30',
  };
  return colors[status] || 'text-slate-400 bg-slate-800 border border-slate-700';
};

export const getFormatColor = (format) => {
  const colors = {
    BO1: 'text-slate-400 bg-slate-800',
    BO3: 'text-cyan-400 bg-cyan-900/30',
    BO5: 'text-red-400 bg-red-900/20',
  };
  return colors[format] || 'text-slate-400 bg-slate-800';
};

export const filterBySearch = (items, query, fields) => {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter((item) => fields.some((f) => String(item[f] || '').toLowerCase().includes(q)));
};

export const isLineupComplete = (lineup) => Object.values(lineup).every((v) => v !== '');
