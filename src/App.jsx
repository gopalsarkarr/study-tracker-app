import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudyProvider } from './context/StudyContext';
import Navbar from './components/Navbar';
import MotivationHero from './components/MotivationHero';
import Speedometer from './components/Speedometer';
import TaskManager from './components/TaskManager';
import ProgressGraph from './components/ProgressGraph';
import ActivityCalendar from './components/ActivityCalendar';
import VisionGalleryManager from './components/VisionGalleryManager';
import CelebrationModal from './components/CelebrationModal';
import AuthModal from './components/auth/AuthModal';
import AuthScreen from './components/auth/AuthScreen';
import SetCredentialsModal from './components/auth/SetCredentialsModal';
import { Sparkles, Shield, Cpu, Compass } from 'lucide-react';

function DashboardContent() {
  const { user, loading } = useAuth();
  const [isGuestDemo, setIsGuestDemo] = useState(false);

  // Show loading spinner while initial session is verified
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <p className="text-xs font-mono text-slate-400">Verifying Cloud Session...</p>
      </div>
    );
  }

  // If user is not authenticated and has not explicitly opted for Guest Demo, require Sign In / Sign Up
  if (!user && !isGuestDemo) {
    return <AuthScreen onGuestDemo={() => setIsGuestDemo(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 transition-colors duration-300 flex flex-col font-sans">
      
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Guest Demo Banner notice if browsing as guest */}
      {!user && isGuestDemo && (
        <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 border-b border-indigo-500/30 px-4 py-2 text-center text-xs text-indigo-200 flex items-center justify-center gap-3">
          <span>👀 You are viewing the <strong>Guest Demo Dashboard</strong>. Changes will not sync across devices.</span>
          <button
            onClick={() => setIsGuestDemo(false)}
            className="font-bold underline text-white hover:text-indigo-300"
          >
            Create Permanent Account →
          </button>
        </div>
      )}

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* 1. Motivational Cinematic Hero Section */}
        <MotivationHero />

        {/* 2. Central Analytics Row: Speedometer + Growth Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Motorcycle Analog Speedometer Meter (7 cols) */}
          <div className="lg:col-span-7 flex">
            <Speedometer />
          </div>

          {/* Core Philosophy & Quick Growth Insights Card (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 dark:bg-slate-900/90 light:bg-white rounded-3xl p-4 sm:p-5 border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="p-1.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white light:text-slate-900">
                    The Cognitive Credit Engine
                  </h3>
                  <span className="text-[10px] text-indigo-400 font-mono">
                    Multi-Device Cloud Architecture
                  </span>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-300 light:text-slate-600 leading-relaxed mb-3">
                Just like financial credit reflects compounding trustworthiness, your <strong>Study Credit Score</strong> measures intellectual discipline and consistency. High-leverage skills compound at 2.2x value.
              </p>

              {/* Multiplier Tiers summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800/80 light:border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="font-semibold text-slate-200 light:text-slate-800">Skills & Study</span>
                  </div>
                  <span className="font-mono font-bold text-indigo-400 text-[11px]">+20 to +50 Pts (2.2x)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800/80 light:border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-slate-200 light:text-slate-800">Fitness & Reading</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-[11px]">+10 to +20 Pts (1.2x)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800/80 light:border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-semibold text-slate-200 light:text-slate-800">Daily Routines</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-[11px]">+2 to +10 Pts (0.3x)</span>
                </div>
              </div>
            </div>

            {/* Bottom Motivation Anchor */}
            <div className="mt-3 pt-3 border-t border-slate-800 dark:border-slate-800 light:border-slate-200">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                <Compass className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="italic line-clamp-1">"We are what we repeatedly do. Excellence, then, is not an act, but a habit."</span>
              </div>
            </div>

          </div>

        </div>

        {/* 3. Categorized Task & Progress Management (with Weekly Frequency) */}
        <TaskManager />

        {/* 4. 100-Day Study Progress Graph (Recharts Area Chart) */}
        <ProgressGraph />

        {/* 5. Monthly Study Activity Calendar (Heatmap Grid + Detail Modal) */}
        <ActivityCalendar />

        {/* 6. Target Vision Board & Motivation Photo Gallery Manager */}
        <VisionGalleryManager />

      </main>

      {/* Global Modals */}
      <CelebrationModal />
      <AuthModal />
      <SetCredentialsModal />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 py-8 bg-slate-950 dark:bg-slate-950 light:bg-white text-center text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-slate-300 light:text-slate-700">ASCEND // STUDY OS</span>
            <span>•</span>
            <span>Cloud-Synchronized Personal Academic Command Center</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 light:text-slate-600">
            <span>Supabase PostgreSQL + RLS</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">Multi-Device Realtime Sync Active</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <DashboardContent />
      </StudyProvider>
    </AuthProvider>
  );
}
