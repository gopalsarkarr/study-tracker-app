import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { formatFullDate } from '../../utils/dateUtils';
import { 
  X, 
  User, 
  Flame, 
  Gauge, 
  CheckCircle2, 
  Trophy, 
  Award, 
  Calendar, 
  Edit3, 
  Save, 
  Mail, 
  Sparkles,
  Shield
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Arch1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber7',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Titan4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Apex9',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Zen3',
];

export default function ProfileModal({ isOpen, onClose }) {
  const { user, profile, updateProfile } = useAuth();
  const {
    currentCreditScore,
    highestScore,
    currentStreak,
    dailyHistory,
    tasks,
  } = useStudy();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || 'Scholar');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || user?.user_metadata?.avatar_url || PRESET_AVATARS[0]);
  const [isSaving, setIsSaving] = useState(false);

  // Compute lifetime aggregate statistics from dailyHistory
  const lifetimeStats = useMemo(() => {
    let totalCompleted = 0;
    let totalPoints = 0;
    let totalActiveDays = 0;

    Object.values(dailyHistory).forEach(rec => {
      if (rec.completedTaskIds?.length > 0) {
        totalCompleted += rec.completedTaskIds.length;
        totalPoints += (rec.dailyPoints || 0);
        totalActiveDays += 1;
      }
    });

    return {
      totalCompleted,
      totalPoints,
      totalActiveDays,
    };
  }, [dailyHistory]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({ fullName, avatarUrl });
    setIsSaving(false);
    setIsEditing(false);
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Architect';
  const displayEmail = user?.email || 'guest@scholar.os';
  const memberSince = user?.created_at ? formatFullDate(user.created_at.split('T')[0]) : 'September 2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-slate-900 dark:bg-slate-900 light:bg-white w-full max-w-xl rounded-3xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Profile Header with Banner */}
        <div className="relative h-28 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-4 flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/40 text-indigo-300 border border-indigo-400/30">
              Verified Cloud Profile
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-black/30 hover:bg-black/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar and Identity */}
        <div className="relative px-6 pb-6 pt-0">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-6 gap-4">
            
            {/* Avatar image */}
            <div className="flex items-end gap-4">
              <div className="relative w-24 h-24 rounded-2xl bg-slate-950 p-1 border-2 border-indigo-500/60 shadow-xl overflow-hidden shrink-0">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-xl bg-slate-900"
                />
              </div>

              <div>
                <h3 className="text-xl font-black text-white light:text-slate-900">
                  {displayName}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{displayEmail}</span>
                </div>
              </div>
            </div>

            {/* Edit Toggle */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 light:text-slate-700 bg-slate-800 light:bg-slate-100 hover:bg-slate-700 border border-slate-700 light:border-slate-200 transition-colors self-start sm:self-end flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>

          </div>

          {/* Edit Form (if editing) */}
          {isEditing && (
            <form onSubmit={handleSave} className="mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Choose Avatar</label>
                <div className="flex items-center gap-2">
                  {PRESET_AVATARS.map((av, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setAvatarUrl(av)}
                      className={`w-10 h-10 rounded-xl p-0.5 border-2 transition-all ${
                        avatarUrl === av ? 'border-indigo-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="preset" className="w-full h-full rounded-lg bg-slate-900" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Lifetime Performance Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            
            {/* Credit Score */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 text-center">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                <span>Credit Score</span>
              </div>
              <div className="text-xl font-bold font-mono text-indigo-400 mt-0.5">
                {currentCreditScore}
              </div>
              <div className="text-[10px] text-slate-500">
                Peak: {highestScore}
              </div>
            </div>

            {/* Streak */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 text-center">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Current Streak</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                {currentStreak} Days
              </div>
              <div className="text-[10px] text-slate-500">
                Consistency Locked
              </div>
            </div>

            {/* Total Tasks Done */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 text-center">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tasks Conquered</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {lifetimeStats.totalCompleted}
              </div>
              <div className="text-[10px] text-slate-500">
                Across All Categories
              </div>
            </div>

            {/* Total Study Points */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 text-center">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-purple-400" />
                <span>Points Earned</span>
              </div>
              <div className="text-xl font-bold font-mono text-purple-400 mt-0.5">
                +{lifetimeStats.totalPoints}
              </div>
              <div className="text-[10px] text-slate-500">
                Cognitive Capital
              </div>
            </div>

            {/* Active Study Days */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 text-center">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Active Days</span>
              </div>
              <div className="text-xl font-bold font-mono text-blue-400 mt-0.5">
                {lifetimeStats.totalActiveDays}
              </div>
              <div className="text-[10px] text-slate-500">
                Tracked Sessions
              </div>
            </div>

            {/* User ID / Account Status */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 text-center">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>Security</span>
              </div>
              <div className="text-sm font-bold font-mono text-teal-400 mt-1 truncate">
                RLS Enforced
              </div>
              <div className="text-[10px] text-slate-500">
                Encrypted Cloud
              </div>
            </div>

          </div>

          {/* Account Metadata footer */}
          <div className="pt-4 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <span>Member Since: <strong className="text-slate-200 light:text-slate-800">{memberSince}</strong></span>
            <span className="font-mono text-[10px] text-slate-500 truncate max-w-[180px]">
              ID: {user?.id || 'guest-session'}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
