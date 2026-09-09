import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { formatFullDate } from '../utils/dateUtils';
import ProfileModal from './profile/ProfileModal';
import SettingsModal from './settings/SettingsModal';
import { 
  Flame, 
  Gauge, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles, 
  User, 
  Settings, 
  LogOut, 
  Cloud, 
  ChevronDown, 
  LogIn
} from 'lucide-react';
import { LeetCodeIcon, SheryiansIcon, GitHubIcon, YouTubeIcon } from './BrandIcons';

export default function Navbar() {
  const {
    user,
    profile,
    logout,
    openAuthModal,
    isConfigured,
  } = useAuth();

  const {
    todayISO,
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,
    syncStatus,
    currentStreak,
    currentCreditScore,
    todayCompletionPct,
    todayCompletedCount,
    todayTotalCount,
    resetToDefaults,
  } = useStudy();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset dashboard to realistic pre-seeded demo records? This will refresh your 30-day activity data.')) {
      resetToDefaults();
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Architect';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.email || 'Scholar')}`;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/85 dark:bg-slate-950/85 light:bg-white/85 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-white light:text-slate-900 font-sans">
                ASCEND
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                STUDY OS
              </span>
            </div>
            <p className="text-xs text-slate-400 light:text-slate-500 hidden sm:block">
              {formatFullDate(todayISO)}
            </p>
          </div>
        </div>

        {/* Quick Launchpad / Study Platform Shortcuts */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm">
          {/* LeetCode */}
          <a
            href="https://leetcode.com/u/gopalsarkar/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Gopal's LeetCode Profile"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/15 border border-transparent hover:border-amber-500/30 transition-all duration-200 group"
          >
            <LeetCodeIcon className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-mono">LeetCode</span>
          </a>

          {/* Sheryians Classroom */}
          <a
            href="https://classroom.sheryians.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Sheryians Coding School Classroom"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all duration-200 group"
          >
            <SheryiansIcon className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-mono">Sheryians</span>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/gopalsarkarr"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Gopal's GitHub Profile"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 light:hover:bg-slate-200 border border-transparent hover:border-slate-600 transition-all duration-200 group"
          >
            <GitHubIcon className="w-4 h-4 text-slate-300 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline font-mono">GitHub</span>
          </a>

          {/* YouTube */}
          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Open YouTube Study Lectures"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/15 border border-transparent hover:border-red-500/30 transition-all duration-200 group"
          >
            <YouTubeIcon className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline font-mono">YouTube</span>
          </a>
        </div>

        {/* Center Live HUD stats */}
        <div className="hidden xl:flex items-center gap-3">
          {/* Cloud Sync Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 border border-slate-800 light:border-slate-200 text-xs">
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 font-medium">Sync:</span>
            <span className="text-emerald-400 font-mono font-bold capitalize">
              {syncStatus}
            </span>
          </div>

          {/* Streak pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30 animate-bounce" />
            <span className="text-xs font-medium text-slate-300 light:text-slate-700">Streak:</span>
            <span className="text-xs font-bold text-amber-400 font-mono">{currentStreak} Days</span>
          </div>

          {/* Credit Score pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm">
            <Gauge className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-medium text-slate-300 light:text-slate-700">Score:</span>
            <span className="text-xs font-bold text-indigo-400 font-mono">{currentCreditScore}</span>
          </div>

          {/* Today's Tasks pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-medium text-slate-300 light:text-slate-700">Today:</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">{todayCompletedCount}/{todayTotalCount} ({todayCompletionPct}%)</span>
          </div>
        </div>

        {/* Right Controls: Sound, Theme, Reset, and User Profile / Auth */}
        <div className="flex items-center gap-2">
          
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Audio Effects' : 'Unmute Audio Effects'}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 light:hover:text-slate-900 bg-slate-900/60 light:bg-slate-100 hover:bg-slate-800/80 border border-slate-800 light:border-slate-200 transition-all duration-200"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 light:hover:text-slate-900 bg-slate-900/60 light:bg-slate-100 hover:bg-slate-800/80 border border-slate-800 light:border-slate-200 transition-all duration-200"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* User Account / Profile Dropdown Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 border border-slate-800 light:border-slate-200 hover:border-indigo-500 transition-all"
              >
                <img
                  src={avatarUrl}
                  alt="User"
                  className="w-7 h-7 rounded-xl object-cover bg-slate-950 border border-indigo-500/40"
                />
                <span className="text-xs font-bold text-slate-200 light:text-slate-800 hidden md:inline max-w-[100px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 light:border-slate-200 mb-1">
                    <div className="text-xs font-bold text-white light:text-slate-900 truncate">
                      {displayName}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {user.email}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsProfileOpen(true)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-300 light:text-slate-700 hover:text-white light:hover:text-slate-900 hover:bg-slate-800 light:hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>View Profile & Stats</span>
                  </button>

                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-300 light:text-slate-700 hover:text-white light:hover:text-slate-900 hover:bg-slate-800 light:hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-purple-400" />
                    <span>Cloud & Settings</span>
                  </button>

                  <div className="my-1 border-t border-slate-800 light:border-slate-200" />

                  <button
                    onClick={logout}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 rounded-xl transition-all transform active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Cloud</span>
            </button>
          )}

        </div>

      </div>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
}
