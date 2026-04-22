import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../_lib/authMiddleware.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // All operations require authentication
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const userId = auth.user.id;

  // GET — fetch my player profile
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }

    // Return null if no profile exists yet (not an error)
    return res.status(200).json(data || null);
  }

  // POST — create my player profile (one-time only)
  if (req.method === 'POST') {
    // Check if user already has a profile
    const { data: existing } = await supabase
      .from('players')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'You already have a player profile. You can edit it instead.' });
    }

    const body = req.body;
    const player = {
      name: body.name,
      role: body.role,
      secondaryRole: body.secondaryRole || null,
      available: body.available !== undefined ? body.available : true,
      user_id: userId,
      tournamentsPlayed: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('players')
      .insert([player])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'You already have a player profile.' });
      }
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  }

  // PATCH — update my own player profile
  if (req.method === 'PATCH') {
    const { data: myProfile } = await supabase
      .from('players')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!myProfile) {
      return res.status(404).json({ error: 'No player profile found. Create one first.' });
    }

    // Only allow updating specific fields (not id, user_id, tournamentsPlayed, etc.)
    const allowed = {};
    if (req.body.name !== undefined) allowed.name = req.body.name;
    if (req.body.role !== undefined) allowed.role = req.body.role;
    if (req.body.secondaryRole !== undefined) allowed.secondaryRole = req.body.secondaryRole;
    if (req.body.available !== undefined) allowed.available = req.body.available;
    allowed.updatedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('players')
      .update(allowed)
      .eq('id', myProfile.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
