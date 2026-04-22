import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../_lib/authMiddleware.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // All operations require admin role
  const auth = await requireAdmin(req, res);
  if (!auth) return;

  if (req.method === 'GET') {
    // List all user profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  if (req.method === 'PATCH') {
    // Update a user's role
    const { userId, role } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId is required' });
    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'role must be "admin" or "user"' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
