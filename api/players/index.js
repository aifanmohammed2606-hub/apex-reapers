import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../_lib/authMiddleware.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Allow requests from your own frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    // Public — anyone can read players
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('createdAt', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    // Admin-only — create player
    const auth = await requireAdmin(req, res);
    if (!auth) return; // 401/403 already sent

    const body = req.body;
    const player = {
      ...body,
      tournamentsPlayed: body.tournamentsPlayed || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('players')
      .insert([player])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
