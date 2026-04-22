import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../_lib/authMiddleware.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (!id) return res.status(400).json({ error: 'Player ID is required' });

  if (req.method === 'PATCH') {
    // Admin-only — update player
    const auth = await requireAdmin(req, res);
    if (!auth) return;

    const { data, error } = await supabase
      .from('players')
      .update({ ...req.body, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    // Admin-only — delete player
    const auth = await requireAdmin(req, res);
    if (!auth) return;

    // Remove player from any tournament lineups/substitutes first
    const { data: tournaments } = await supabase.from('tournaments').select('*');

    if (tournaments) {
      for (const t of tournaments) {
        let needsUpdate = false;
        const lineup = { ...t.lineup };
        Object.keys(lineup).forEach((role) => {
          if (lineup[role] === id) { lineup[role] = ''; needsUpdate = true; }
        });
        const substitutes = (t.substitutes || []).filter((s) => s !== id);
        if (substitutes.length !== (t.substitutes || []).length) needsUpdate = true;

        if (needsUpdate) {
          await supabase.from('tournaments').update({ lineup, substitutes }).eq('id', t.id);
        }
      }
    }

    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
