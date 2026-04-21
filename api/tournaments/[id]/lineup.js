import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { lineup, substitutes } = req.body;

  if (!id) return res.status(400).json({ error: 'Tournament ID is required' });

  // Update the tournament lineup
  const { data: updatedT, error: tError } = await supabase
    .from('tournaments')
    .update({ lineup, substitutes: substitutes || [], updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (tError) return res.status(500).json({ error: tError.message });

  // Update tournamentsPlayed on each player accordingly
  const allInLineup = [...Object.values(lineup).filter(Boolean), ...(substitutes || [])];
  const { data: players } = await supabase.from('players').select('*');

  if (players) {
    for (const p of players) {
      const wasIn = (p.tournamentsPlayed || []).includes(id);
      const isIn = allInLineup.includes(p.id);
      let updatedPlayed = null;

      if (isIn && !wasIn) updatedPlayed = [...(p.tournamentsPlayed || []), id];
      if (!isIn && wasIn) updatedPlayed = (p.tournamentsPlayed || []).filter((tid) => tid !== id);

      if (updatedPlayed !== null) {
        await supabase.from('players').update({ tournamentsPlayed: updatedPlayed }).eq('id', p.id);
      }
    }
  }

  return res.status(200).json(updatedT);
}
