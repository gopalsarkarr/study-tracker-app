import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Cloud, 
  ShieldCheck 
} from 'lucide-react';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    closeAuthModal,
    signUp,
    login,
    resetPassword,
    authError,
    isConfigured,
  } = useAuth();

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientError, setClientError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientError('');
    setResetSuccess(false);

    if (authModalTab === 'forgot') {
      const resetTarget = (email || loginIdentifier).trim();
      if (!resetTarget || !resetTarget.includes('@')) {
        setClientError('Please provide a valid email address to receive reset instructions.');
        return;
      }
      setIsSubmitting(true);
      const res = await resetPassword(resetTarget);
      setIsSubmitting(false);
      if (res.success) {
        setResetSuccess(true);
      }
      return;
    }

    if (!password) {
      setClientError('Password is required.');
      return;
    }

    if (authModalTab === 'signup') {
      if (!fullName.trim()) {
        setClientError('Full name is required.');
        return;
      }

      const cleanUname = username.trim().toLowerCase();
      if (!cleanUname) {
        setClientError('Username is required.');
        return;
      }
      if (cleanUname.length < 3) {
        setClientError('Username must be at least 3 characters.');
        return;
      }
      if (!/^[a-z0-9_.]+$/.test(cleanUname)) {
        setClientError('Username can only contain letters, numbers, underscores, and dots.');
        return;
      }

      if (!email.trim() || !email.includes('@')) {
        setClientError('Please provide a valid Gmail or email address.');
        return;
      }

      if (password.length < 6) {
        setClientError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setClientError('Passwords do not match.');
        return;
      }

      setIsSubmitting(true);
      await signUp({ email, password, fullName, username: cleanUname });
      setIsSubmitting(false);
    } else {
      // Login flow
      if (!loginIdentifier.trim()) {
        setClientError('Please enter your username or email address.');
        return;
      }
      setIsSubmitting(true);
      await login({ identifier: loginIdentifier.trim(), password });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-slate-900 dark:bg-slate-900 light:bg-white w-full max-w-md rounded-3xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl overflow-hidden transition-all">
        
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white light:text-slate-900">
                {authModalTab === 'login' && 'Welcome Back, Scholar'}
                {authModalTab === 'signup' && 'Create Your Study OS'}
                {authModalTab === 'forgot' && 'Reset Password'}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span>{isConfigured ? 'Live Cloud Database' : 'Interactive Cloud Simulator'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Sign In / Sign Up */}
        {authModalTab !== 'forgot' && (
          <div className="flex border-b border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-950/40">
            <button
              onClick={() => { setAuthModalTab('login'); setClientError(''); }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                authModalTab === 'login'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthModalTab('signup'); setClientError(''); }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                authModalTab === 'signup'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Error Message */}
          {(clientError || authError) && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{clientError || authError}</span>
            </div>
          )}

          {/* Reset Success Message */}
          {resetSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Password reset instructions dispatched to your email!</span>
            </div>
          )}

          {/* Full Name for Signup */}
          {authModalTab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Gopal Sarkar"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Username for Signup */}
          {authModalTab === 'signup' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600">
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
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                You can use this username anytime with your password to log in.
              </p>
            </div>
          )}

          {/* Actual Email for Signup */}
          {authModalTab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-1">
                Actual Gmail / Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Username or Email for Login */}
          {authModalTab === 'login' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-1">
                Username or Email Address
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="Username (e.g. gopalsarkar) or Gmail"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Email for Forgot Password */}
          {authModalTab === 'forgot' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Password (if not forgot) */}
          {authModalTab !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600">
                  Password
                </label>
                {authModalTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setAuthModalTab('forgot'); setClientError(''); }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Confirm Password for Signup */}
          {authModalTab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Remember me option for login */}
          {authModalTab === 'login' && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember session on this device</span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : (
              <>
                <span>
                  {authModalTab === 'login' && 'Sign In to Dashboard'}
                  {authModalTab === 'signup' && 'Create Cloud Account'}
                  {authModalTab === 'forgot' && 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Back to login if forgot */}
          {authModalTab === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setAuthModalTab('login'); setClientError(''); }}
                className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
              >
                ← Back to Sign In
              </button>
            </div>
          )}

          {/* Security & Multi-device assurance banner */}
          <div className="pt-4 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Encrypted with Row Level Security & Multi-Device Sync</span>
          </div>

        </form>

      </div>
    </div>
  );
}
