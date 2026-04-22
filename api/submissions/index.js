import { createClient } from '@supabase/supabase-js';
import { requireAuth, requireAdmin } from '../_lib/authMiddleware.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    // Admin can see all submissions; regular user sees only their own
    const auth = await requireAuth(req, res);
    if (!auth) return;

    if (auth.isAdmin) {
      const { data, error } = await supabase
        .from('user_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    } else {
      const { data, error } = await supabase
        .from('user_submissions')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
  }

  if (req.method === 'POST') {
    // Any authenticated user can submit once per type
    const auth = await requireAuth(req, res);
    if (!auth) return;

    const { submission_type, data: submissionData } = req.body;

    if (!submission_type) {
      return res.status(400).json({ error: 'submission_type is required' });
    }

    // Check if user already submitted this type
    const { data: existing } = await supabase
      .from('user_submissions')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('submission_type', submission_type)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'You have already submitted this. Only one submission per user is allowed.' });
    }

    const { data, error } = await supabase
      .from('user_submissions')
      .insert([{
        user_id: auth.user.id,
        submission_type,
        data: submissionData || {},
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return res.status(409).json({ error: 'You have already submitted this. Only one submission per user is allowed.' });
      }
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
