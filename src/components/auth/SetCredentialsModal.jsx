import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  Check
} from 'lucide-react';

export default function SetCredentialsModal() {
  const {
    user,
    profile,
    isSetupCredentialsOpen,
    closeSetupCredentialsModal,
    setupUserCredentials,
  } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-suggest a clean username from Google name or email prefix
  useEffect(() => {
    if (user && isSetupCredentialsOpen && !username) {
      const existingUsername = user.user_metadata?.username || profile?.username;
      if (existingUsername) {
        setUsername(existingUsername);
      } else {
        const rawSeed = user.user_metadata?.full_name 
          ? user.user_metadata.full_name.replace(/\s+/g, '_')
          : (user.email ? user.email.split('@')[0] : 'scholar');
        const cleanSeed = rawSeed.toLowerCase().replace(/[^a-z0-9_.]/g, '');
        setUsername(cleanSeed);
      }
    }
  }, [user, isSetupCredentialsOpen, profile]);

  if (!isSetupCredentialsOpen || !user) return null;

  const googleName = user.user_metadata?.full_name || user.user_metadata?.name || 'Google Scholar';
  const googleEmail = user.email || '';
  const avatarUrl = user.user_metadata?.avatar_url || profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(googleEmail)}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUname = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (!cleanUname) {
      setErrorMsg('Please enter a username.');
      return;
    }
    if (cleanUname.length < 3) {
      setErrorMsg('Username must be at least 3 characters long.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    const res = await setupUserCredentials({ username: cleanUname, password });
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to setup username and password.');
    } else {
      setSuccessMsg('Success! Your username and password have been configured.');
      setTimeout(() => {
        closeSetupCredentialsModal(false);
      }, 1200);
    }
  };

  const handleSkip = () => {
    closeSetupCredentialsModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden">
        
        {/* Futuristic Glowing Aura Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-r from-indigo-500/25 via-purple-500/25 to-pink-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={avatarUrl}
                alt="Google Avatar"
                className="w-12 h-12 rounded-2xl object-cover bg-slate-950 border-2 border-indigo-500/40 shadow-lg"
              />
              <div 
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md"
                title="Verified Google Account"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-white font-sans">
                  Set Username & Password
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {googleName} • <span className="text-slate-300 font-mono">{googleEmail}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Skip for now"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Banner */}
        <div className="px-6 py-3 bg-indigo-950/40 border-b border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your Google account has been verified! Set up a custom <strong>Username</strong> and <strong>Password</strong> below so you can sign in anytime using either <strong>Continue with Google</strong> or your <strong>Username + Password</strong>.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Error message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success message */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Username Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Choose Username
              </label>
              <span className="text-[10px] text-indigo-400 font-mono">
                Unique Login ID
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-slate-500">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                placeholder="e.g. gopalsarkar or dev_gopal"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 font-mono tracking-wide"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Use this username to sign in across any device (letters, numbers, _, .).
            </p>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Set Password
              </label>
              <span className="text-[10px] text-slate-500">
                Min 6 characters
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="inline-block animate-spin">⏳</span>
              ) : (
                <>
                  <span>Save Credentials & Launch Study OS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full py-2 text-center text-xs text-slate-400 hover:text-white transition-colors"
            >
              Skip for now (I will log in with Google)
            </button>
          </div>

          {/* Bottom Security Info */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Encrypted with Supabase Auth & PostgreSQL Security</span>
          </div>

        </form>

      </div>
    </div>
  );
}
