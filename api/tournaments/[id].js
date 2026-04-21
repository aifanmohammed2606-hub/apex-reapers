import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (!id) return res.status(400).json({ error: 'Tournament ID is required' });

  if (req.method === 'PATCH') {
    const { data, error } = await supabase
      .from('tournaments')
      .update({ ...req.body, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    // Remove tournament from players' tournamentsPlayed arrays
    const { data: players } = await supabase.from('players').select('*');

    if (players) {
      for (const p of players) {
        if ((p.tournamentsPlayed || []).includes(id)) {
          const nextTourns = p.tournamentsPlayed.filter((tid) => tid !== id);
          await supabase.from('players').update({ tournamentsPlayed: nextTourns }).eq('id', p.id);
        }
      }
    }

    const { error } = await supabase.from('tournaments').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
