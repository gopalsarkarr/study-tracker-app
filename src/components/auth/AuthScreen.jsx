import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Cloud, 
  ShieldCheck,
  Eye,
  EyeOff,
  Compass
} from 'lucide-react';

export default function AuthScreen({ onGuestDemo }) {
  const {
    signUp,
    login,
    signInWithGoogle,
    resetPassword,
    authError,
    isConfigured,
  } = useAuth();

  const [tab, setTab] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGoogleSignIn = async () => {
    setLocalError('');
    setIsGoogleLoading(true);
    const res = await signInWithGoogle();
    if (!res.success) {
      setLocalError(res.error || 'Failed to initialize Google Sign In.');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (tab === 'forgot') {
      const resetTarget = (email || loginIdentifier).trim();
      if (!resetTarget || !resetTarget.includes('@')) {
        setLocalError('Please enter a valid email address to receive reset instructions.');
        return;
      }
      setIsSubmitting(true);
      const res = await resetPassword(resetTarget);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMessage('Password reset link sent to your email!');
      } else {
        setLocalError(res.error || 'Failed to send reset email.');
      }
      return;
    }

    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    if (tab === 'signup') {
      if (!fullName.trim()) {
        setLocalError('Please enter your full name.');
        return;
      }

      const cleanUname = username.trim().toLowerCase();
      if (!cleanUname) {
        setLocalError('Please enter a username.');
        return;
      }
      if (cleanUname.length < 3) {
        setLocalError('Username must be at least 3 characters long.');
        return;
      }
      if (!/^[a-z0-9_.]+$/.test(cleanUname)) {
        setLocalError('Username can only contain letters, numbers, underscores, and dots.');
        return;
      }

      if (!email.trim() || !email.includes('@')) {
        setLocalError('Please enter a valid Gmail or email address.');
        return;
      }

      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match. Please check again.');
        return;
      }

      setIsSubmitting(true);
      const res = await signUp({ email, password, fullName, username: cleanUname });
      setIsSubmitting(false);
      if (!res.success) {
        setLocalError(res.error || 'Failed to create account.');
      }
    } else {
      // Login flow
      if (!loginIdentifier.trim()) {
        setLocalError('Please enter your username or email address.');
        return;
      }
      setIsSubmitting(true);
      const res = await login({ identifier: loginIdentifier.trim(), password });
      setIsSubmitting(false);
      if (!res.success) {
        setLocalError(res.error || 'Invalid username/email or password.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Cinematic Background Atmosphere */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-25 filter blur-sm scale-105"
        style={{ backgroundImage: `url('/images/hero_study_night.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/60 z-0" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-800/80 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Brand Header */}
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/25 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white font-sans">
              ASCEND
            </h1>
            <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold">
              STUDY OS
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {tab === 'login' && 'Sign in to access your cloud study records & streak.'}
            {tab === 'signup' && 'Create your personal account to begin tracking.'}
            {tab === 'forgot' && 'Enter your email to receive password reset link.'}
          </p>
        </div>

        {/* Tab Switcher */}
        {tab !== 'forgot' && (
          <div className="flex border-b border-slate-800 bg-slate-950/60 mx-6 rounded-2xl p-1 mb-4">
            <button
              onClick={() => { setTab('login'); setLocalError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'login'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setLocalError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'signup'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          
          {/* Error Message */}
          {(localError || authError) && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || authError}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google OAuth Option (for Login & Signup) */}
          {tab !== 'forgot' && (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-white hover:bg-slate-100 text-slate-900 shadow-lg shadow-black/20 transition-all flex items-center justify-center gap-2.5 border border-slate-200 group disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <span className="inline-block animate-spin">⏳</span>
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>
                  {tab === 'signup' ? 'Continue with Google (Recommended)' : 'Sign In with Google'}
                </span>
              </button>

              {tab === 'signup' && (
                <p className="text-[11px] text-center text-slate-400">
                  ⚡ Sign up instantly with Google, then customize your Username & Password.
                </p>
              )}

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-mono tracking-wider text-slate-500">
                  Or {tab === 'signup' ? 'Sign Up Manually' : 'with Username / Email'}
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>
            </div>
          )}

          {/* Full Name (Sign Up only) */}
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Gopal Sarkar"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Username (Sign Up only) */}
          {tab === 'signup' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Username
                </label>
                <span className="text-[10px] text-indigo-400 font-mono font-semibold">
                  Quick Login ID
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-slate-500">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  placeholder="e.g. gopalsarkar or dev_gopal"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                You can use this username anytime with your password to log in.
              </p>
            </div>
          )}

          {/* Email for Signup */}
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Username or Email for Login */}
          {tab === 'login' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Username or Email Address
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="Username (e.g. gopalsarkar) or Gmail"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Email for Forgot Password */}
          {tab === 'forgot' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Password (if not forgot) */}
          {tab !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setLocalError(''); setSuccessMessage(''); }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (Sign Up only) */}
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : (
              <>
                <span>
                  {tab === 'login' && 'Sign In to Study OS'}
                  {tab === 'signup' && 'Create Account & Start (500 Pts)'}
                  {tab === 'forgot' && 'Send Password Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Back to Login if on forgot tab */}
          {tab === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setTab('login'); setLocalError(''); setSuccessMessage(''); }}
                className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
              >
                ← Back to Sign In
              </button>
            </div>
          )}

          {/* Or Explore Guest Demo */}
          <div className="pt-3 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={onGuestDemo}
              className="text-xs text-slate-400 hover:text-indigo-400 transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Or Explore Dashboard as Guest Demo</span>
            </button>
          </div>

          {/* Security Assurance footer */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted with Row Level Security & Cloud Sync</span>
          </div>

        </form>

      </div>

    </div>
  );
}
