import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Skull, Mail, Lock, Chrome, ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
        setSuccess('Account created! Check your email to confirm, then log in.');
        setMode('login');
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen bg-void hex-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-crimson-600 rounded-2xl crimson-glow mb-4">
            <Skull size={32} className="text-white" />
          </div>
          <h1 className="text-white font-display font-black text-3xl tracking-wide">
            APEX <span className="text-gradient-red">REAPERS</span>
          </h1>
          <p className="text-mist text-sm font-mono tracking-widest mt-1">MLBB TOURNAMENT MANAGER</p>
        </div>

        {/* Card */}
        <div className="bg-abyss border border-steel/60 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          {/* Tab Toggle */}
          <div className="flex bg-pit rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-display font-bold tracking-wide transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-crimson-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn size={14} /> Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-display font-bold tracking-wide transition-all duration-200 ${
                mode === 'signup'
                  ? 'bg-crimson-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus size={14} /> Sign Up
            </button>
          </div>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 hover:bg-white/10 border border-steel/60 hover:border-steel rounded-xl text-white font-display font-semibold text-sm transition-all duration-200 mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-steel/40"></div>
            <span className="text-mist text-xs font-mono uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-steel/40"></div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {mode === 'signup' && (
                <p className="text-slate-500 text-xs font-mono mt-1">Min 6 characters</p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-xs font-mono">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                <AlertCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <p className="text-emerald-400 text-xs font-mono">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-crimson-600 hover:bg-crimson-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-bold text-sm tracking-wide rounded-xl transition-all duration-200 crimson-glow"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-mist text-xs font-mono mt-6 tracking-wide">
          APEX REAPERS © 2025 · MLBB Tournament Manager
        </p>
      </div>
    </div>
  );
}
