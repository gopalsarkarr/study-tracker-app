import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { 
  X, 
  Settings, 
  Cloud, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Trash2, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  Database,
  ExternalLink
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, logout, deleteAccount, isConfigured } = useAuth();
  const {
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,
    syncStatus,
    resetToDefaults,
  } = useStudy();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setIsDeleting(true);
    await deleteAccount();
    setIsDeleting(false);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-slate-900 dark:bg-slate-900 light:bg-white w-full max-w-lg rounded-3xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white light:text-slate-900">
                System & Cloud Settings
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-500">
                Preferences, synchronization status, and database config
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Cloud Synchronization Status Card */}
          <div className="p-4 rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 light:text-slate-800">
                  Cloud Synchronization Status
                </span>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-900 border border-slate-700">
                {syncStatus === 'synced' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400">☁ Synced</span>
                  </>
                )}
                {syncStatus === 'syncing' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-amber-400">🔄 Syncing...</span>
                  </>
                )}
                {syncStatus === 'error' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="text-rose-400">⚠ Offline Cache</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed space-y-1">
              <p>
                Mode: <strong className="text-slate-200 light:text-slate-800">{isConfigured ? 'Supabase PostgreSQL (Production)' : 'Interactive Simulator Mode'}</strong>
              </p>
              <p>
                Multi-device Realtime: <span className="text-emerald-400 font-mono font-bold">{isConfigured ? 'Enabled (Active WebSocket)' : 'Local Emulation'}</span>
              </p>
              <p>
                Row Level Security: <span className="text-indigo-400 font-mono font-bold">Enforced (User Isolation)</span>
              </p>
            </div>

            {/* Supabase connection guide tip */}
            {!isConfigured && (
              <div className="mt-3 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300">
                💡 <strong>Connect your own Supabase project:</strong> Add <code className="text-white bg-black/40 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="text-white bg-black/40 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> in <code className="text-white bg-black/40 px-1 py-0.5 rounded">.env</code>. The SQL migration script is located in <code className="text-white bg-black/40 px-1 py-0.5 rounded">supabase/migrations/001_initial_schema.sql</code>!
              </div>
            )}
          </div>

          {/* Preferences Row: Theme & Audio */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Preferences
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-3 rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex items-center justify-between text-xs hover:border-indigo-500 transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-300 light:text-slate-700">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span>Appearance</span>
                </div>
                <span className="font-mono font-bold text-indigo-400 capitalize">{theme}</span>
              </button>

              {/* Sound toggle */}
              <button
                onClick={toggleSound}
                className="p-3 rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex items-center justify-between text-xs hover:border-indigo-500 transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-300 light:text-slate-700">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  <span>Sound FX</span>
                </div>
                <span className="font-mono font-bold text-indigo-400">{soundEnabled ? 'On' : 'Muted'}</span>
              </button>
            </div>
          </div>

          {/* Account Actions */}
          {user && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Session Management
              </h4>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 light:text-slate-700 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 hover:bg-slate-800 border border-slate-800 light:border-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 text-amber-400" />
                <span>Log Out of Current Session</span>
              </button>
            </div>
          )}

          {/* Danger Zone: Delete Account */}
          {user && (
            <div className="pt-4 border-t border-slate-800 dark:border-slate-800 light:border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">
                Danger Zone
              </h4>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account & Erase Cloud History</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-3">
                  <div className="flex items-start gap-2 text-rose-300 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>
                      This permanently deletes your account and study history. This action cannot be undone. Type <strong>DELETE</strong> below to confirm:
                    </span>
                  </div>

                  <input
                    type="text"
                    value={deleteInput}
                    onChange={e => setDeleteInput(e.target.value)}
                    placeholder="Type DELETE"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-rose-500/40 text-white font-mono text-xs focus:outline-none focus:border-rose-400"
                  />

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={deleteInput !== 'DELETE' || isDeleting}
                      onClick={handleDeleteAccount}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 transition-colors"
                    >
                      {isDeleting ? 'Deleting...' : 'Confirm Permanent Deletion'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
