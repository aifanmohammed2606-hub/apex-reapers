import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Authenticate request and return user info.
 * Extracts JWT from Authorization header, verifies it, and looks up profile role.
 *
 * @param {import('http').IncomingMessage} req
 * @returns {{ user: object, profile: object, isAdmin: boolean } | null}
 */
export async function getAuthUser(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) return null;

  // Verify JWT and get user
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  // Fetch profile (which stores role)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    user,
    profile: profile || { id: user.id, email: user.email, role: 'user' },
    isAdmin: profile?.role === 'admin',
  };
}

/**
 * Require admin role. Sends 401/403 and returns false if not authorized.
 * Returns the auth object if authorized.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {{ user: object, profile: object, isAdmin: boolean } | null}
 */
export async function requireAdmin(req, res) {
  const auth = await getAuthUser(req);

  if (!auth) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }

  if (!auth.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }

  return auth;
}

/**
 * Require any authenticated user. Sends 401 if not authenticated.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {{ user: object, profile: object, isAdmin: boolean } | null}
 */
export async function requireAuth(req, res) {
  const auth = await getAuthUser(req);

  if (!auth) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }

  return auth;
}
