import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract and verify JWT
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Try to find existing profile
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Auto-create profile on first login
  if (!profile) {
    const newProfile = {
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      role: 'user', // default role — admin must be promoted manually
      created_at: new Date().toISOString(),
    };

    const { data: created, error: createErr } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    if (createErr) {
      return res.status(500).json({ error: 'Failed to create profile: ' + createErr.message });
    }
    profile = created;
  }

  return res.status(200).json(profile);
}
