import React, { useState, useEffect, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { 
  Flame, 
  Gauge, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Trophy, 
  Sunrise, 
  SunMedium, 
  MoonStar,
  Layers,
  Compass
} from 'lucide-react';
import StudyPet from './StudyPet';
import HeroVisionCard from './HeroVisionCard';

const HERO_IMAGES = [
  {
    id: 'night_study',
    title: 'Deep Late-Night Focus',
    subtitle: 'Quiet intensity and algorithmic mastery',
    url: '/images/hero_study_night.jpg',
  },
  {
    id: 'coding_workspace',
    title: 'Engineering The Future',
    subtitle: 'Dual monitors, clean code, uninterrupted flow',
    url: '/images/hero_coding_workspace.jpg',
  },
  {
    id: 'mountain_sunrise',
    title: 'The Summit of Discipline',
    subtitle: 'Every habit climbs another peak toward greatness',
    url: '/images/hero_mountain_sunrise.jpg',
  },
];

export default function MotivationHero() {
  const {
    currentStreak,
    currentCreditScore,
    todayCompletedCount,
    todayTotalCount,
    todayCompletionPct,
    isTodayPerfect,
    highestScore,
  } = useStudy();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Rotate hero background every 9 seconds automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImageIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  // Time of Day determination
  const timeContext = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        period: 'Morning',
        greeting: 'Good Morning, Architect',
        icon: Sunrise,
        timeQuote: 'A new day. A new opportunity to improve. ☀️',
        subQuote: 'The morning hours belong to the disciplined. Seize the momentum early.',
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        period: 'Afternoon',
        greeting: 'Good Afternoon, Scholar',
        icon: SunMedium,
        timeQuote: "The day isn't over. Keep moving forward. 🌤️",
        subQuote: 'Consistency in the afternoon separates the determined from the rest.',
      };
    } else {
      return {
        period: 'Night',
        greeting: 'Good Evening, Master',
        icon: MoonStar,
        timeQuote: 'While others rest, your future is being built. 🌙',
        subQuote: 'The quiet hours are where true breakthroughs happen.',
      };
    }
  }, []);

  // Dynamic Performance-driven Motivational Quote
  const dynamicQuote = useMemo(() => {
    if (isTodayPerfect) {
      return {
        headline: "You're building the person you promised yourself you would become. 🔥",
        detail: "100% of today's missions conquered! Your credit score and compounding momentum are unmatched.",
        badge: 'MISSION ACCOMPLISHED',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      };
    }
    if (currentStreak >= 7) {
      return {
        headline: "Don't break the streak. You've come too far to stop now. 🔥",
        detail: `You have locked in ${currentStreak} consecutive days of relentless focus. Protect the chain at all costs.`,
        badge: `${currentStreak}-DAY STREAK DEFENDER`,
        badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      };
    }
    if (currentCreditScore >= 850) {
      return {
        headline: "You have ascended into Study Legend territory. 🏆",
        detail: "Your consistency and deep-work velocity place you in the top 1% of dedicated minds.",
        badge: 'LEGEND STATUS',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      };
    }
    if (todayCompletionPct >= 50) {
      return {
        headline: "The finish line is in sight. Finish strong today. ⚡",
        detail: `${todayCompletedCount} of ${todayTotalCount} tasks checked. Push through and make today flawless.`,
        badge: 'HALF-WAY SURPASS',
        badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      };
    }
    return {
      headline: "Your future self is waiting. Start with one task today. 🚀",
      detail: "Small disciplines repeated every day lead to astronomical achievements over time.",
      badge: "TODAY'S MISSION AWAITS",
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    };
  }, [isTodayPerfect, currentStreak, currentCreditScore, todayCompletionPct, todayCompletedCount, todayTotalCount]);

  const scrollToTasks = () => {
    const el = document.getElementById('tasks-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const TimeIcon = timeContext.icon;

  return (
    <section className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 mb-8 mt-2 transition-all">
      {/* Background Rotating Images with Dark Vignette Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {HERO_IMAGES.map((img, idx) => (
          <div
            key={img.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              activeImageIndex === idx ? 'opacity-100 scale-105 transition-transform duration-[12000ms]' : 'opacity-0 scale-100'
            }`}
            style={{
              backgroundImage: `url(${img.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}

        {/* Cinematic Multi-Layer Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
        <div className="absolute inset-0 bg-indigo-950/20 mix-blend-overlay" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-14 flex flex-col justify-between min-h-[460px] text-white">
        
        {/* Top Bar inside Hero: Time Badge + Milestone Recognition */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Time of Day greeting badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
            <TimeIcon className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold tracking-wide text-slate-200">
              {timeContext.period} Session • {timeContext.greeting}
            </span>
          </div>

          {/* Dynamic Achievement Badge */}
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md border text-xs font-bold font-mono uppercase tracking-wider ${dynamicQuote.badgeColor} shadow-lg`}>
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>{dynamicQuote.badge}</span>
          </div>

          {/* Image Scene Selector Pills */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-md px-2 py-1 rounded-full border border-slate-700/50">
            {HERO_IMAGES.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIndex(idx)}
                className={`text-[11px] px-2.5 py-0.5 rounded-full transition-all duration-300 ${
                  activeImageIndex === idx
                    ? 'bg-indigo-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {img.title.split(' ')[0]}
              </button>
            ))}
          </div>

        </div>

        {/* Center: Powerful Motivational Headlines */}
        <div className="my-8 max-w-3xl">
          <p className="text-sm sm:text-base font-semibold text-indigo-400 tracking-wide uppercase mb-2 flex items-center gap-2">
            <span>{timeContext.timeQuote}</span>
          </p>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
            {dynamicQuote.headline}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed drop-shadow">
            {dynamicQuote.detail}
          </p>
        </div>

        {/* Bottom Section: Personalized Progress Summary HUD + Call To Action */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pt-4 border-t border-slate-800/80">
          
          {/* Personalized Mission HUD stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full lg:w-auto">
            
            {/* Task Completion Box */}
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-slate-800/80 shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Today's Mission</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-white">
                {todayCompletedCount} / {todayTotalCount}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium">
                {todayCompletionPct}% Conquered
              </div>
            </div>

            {/* Current Streak Box */}
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-slate-800/80 shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                <span>Current Streak</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-amber-400">
                {currentStreak} Days
              </div>
              <div className="text-[11px] text-amber-300/80 font-medium">
                Active Fire 🔥
              </div>
            </div>

            {/* Study Score Box */}
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-slate-800/80 shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                <span>Study Score</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-indigo-400">
                {currentCreditScore}
              </div>
              <div className="text-[11px] text-indigo-300/80 font-medium">
                High: {highestScore}
              </div>
            </div>

          </div>

          {/* Right Group: Target Vision Photo Card (placed to the left & slightly above the Pet) + Pet & Action Button */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center lg:justify-end gap-3 sm:gap-4 w-full lg:w-auto">
            {/* Target Vision Card placed to the left and slightly above the pet */}
            <div id="hero-vision-card" className="w-full sm:w-auto flex justify-center sm:justify-end sm:-translate-y-2">
              <HeroVisionCard />
            </div>

            {/* Interactive Dynamic Call to Action Button with Floating Study Pet */}
            <div className="flex flex-col items-center lg:items-end w-full sm:w-auto relative pt-4 sm:pt-0">
              {/* Cute Interactive Floating Study Pet Companion */}
              <StudyPet />

              {/* Main Action Button */}
              <button
                onClick={scrollToTasks}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 ${
                  isTodayPerfect
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                    : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50 ring-1 ring-white/20'
                }`}
              >
                {isTodayPerfect ? (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
                    <span>Mission Completed! 🎉</span>
                  </>
                ) : (
                  <>
                    <span>Start Today's Mission</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
