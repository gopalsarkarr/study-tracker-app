import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Flame, 
  Zap, 
  Moon, 
  Heart, 
  Trophy, 
  Smile,
  Bot
} from 'lucide-react';

/**
 * Web Audio Synthesized Pet Sounds (Lightweight, instant, zero external asset dependencies)
 */
let petAudioCtx = null;

function getPetAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!petAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      petAudioCtx = new AudioContextClass();
    }
  }
  if (petAudioCtx && petAudioCtx.state === 'suspended') {
    petAudioCtx.resume();
  }
  return petAudioCtx;
}

function playPetTone(type, isMuted = false) {
  if (isMuted) return;
  try {
    const ctx = getPetAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'chirp' || type === 'boop') {
      // Cute blip chirp on tap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'sleepy') {
      // Soft gentle descending purr
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, now); // E4
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.25); // A3
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === 'motivated') {
      // Energetic upward two-tone
      [523.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.08, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.13);
      });
    } else if (type === 'happy') {
      // Playful bounce arpeggio
      [659.25, 880, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.09, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.15);
      });
    } else if (type === 'victory') {
      // Joyous victory fanfare
      const melody = [
        { f: 523.25, d: 0.08 },
        { f: 659.25, d: 0.08 },
        { f: 783.99, d: 0.08 },
        { f: 1046.5, d: 0.22 },
      ];
      let offset = 0;
      melody.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + offset);
        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + note.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + note.d + 0.02);
        offset += note.d * 0.85;
      });
    }
  } catch (e) {
    console.debug('Pet sound skipped:', e);
  }
}

export default function StudyPet() {
  const {
    todayCompletionPct,
    todayCompletedCount,
    isTodayPerfect,
    soundEnabled,
  } = useStudy();

  const [petMuted, setPetMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPerformingTrick, setIsPerformingTrick] = useState(false);
  const [speechIndex, setSpeechIndex] = useState(0);
  const [isCelebratingTask, setIsCelebratingTask] = useState(false);
  const [heartParticles, setHeartParticles] = useState([]);

  const prevCompletedCountRef = useRef(todayCompletedCount);

  // Determine Pet Mood & Traits based on progress percentage
  const petMood = useMemo(() => {
    const pct = todayCompletionPct || 0;

    if (isTodayPerfect || pct === 100) {
      return {
        level: 'celebrating',
        label: 'LEGEND MODE',
        icon: Trophy,
        themeColor: '#fbbf24', // Gold
        accentBg: 'from-amber-400 to-emerald-400',
        glowStyle: '0 0 32px rgba(251, 191, 36, 0.65), 0 0 16px rgba(16, 185, 129, 0.5)',
        haloBorder: 'border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.5)]',
        floatClass: 'animate-pet-dance-victory',
        expression: 'crowned',
        soundType: 'victory',
        messages: [
          'MISSION ACCOMPLISHED! You are an absolute legend! 🏆👑',
          '100% Perfection locked into the cloud! Proud of you! 🎉',
          'Astronomical discipline! All missions conquered! 🌟',
          'Take a victory bow, Architect. Flawless work! 💫',
        ],
      };
    }

    if (pct >= 81) {
      return {
        level: 'excited',
        label: 'HYPER OVERDRIVE',
        icon: Flame,
        themeColor: '#f59e0b', // Amber/Orange
        accentBg: 'from-amber-500 to-rose-500',
        glowStyle: '0 0 28px rgba(245, 158, 11, 0.55), 0 0 12px rgba(239, 68, 68, 0.4)',
        haloBorder: 'border-amber-500/70 shadow-[0_0_18px_rgba(245,158,11,0.45)]',
        floatClass: 'animate-pet-bounce-happy',
        expression: 'stars',
        soundType: 'happy',
        messages: [
          'Just ONE more mission to 100%! GO FOR IT! 🔥',
          'Maximum velocity! Finish today strong! ⚡',
          'Unstoppable momentum! The summit is in reach! 🎯',
          'Look at that score climb! Incredible dedication! 🚀',
        ],
      };
    }

    if (pct >= 61) {
      return {
        level: 'happy',
        label: 'HIGH ENERGY',
        icon: Heart,
        themeColor: '#10b981', // Emerald
        accentBg: 'from-emerald-400 to-teal-500',
        glowStyle: '0 0 24px rgba(16, 185, 129, 0.5), 0 0 10px rgba(45, 212, 191, 0.4)',
        haloBorder: 'border-emerald-500/60 shadow-[0_0_16px_rgba(16,185,129,0.4)]',
        floatClass: 'animate-pet-bounce-happy',
        expression: 'joyful',
        soundType: 'happy',
        messages: [
          "More than halfway! You're crushing it! 💚",
          'Daily progress looks beautiful! Keep gliding! 🌟',
          'Top-tier consistency! Streak is locked in! 💫',
          'Your focus is unmatched today! Keep going! 🏃‍♂️',
        ],
      };
    }

    if (pct >= 41) {
      return {
        level: 'motivated',
        label: 'PEAK VELOCITY',
        icon: Zap,
        themeColor: '#a855f7', // Electric Purple
        accentBg: 'from-indigo-500 to-purple-500',
        glowStyle: '0 0 22px rgba(168, 85, 247, 0.45), 0 0 10px rgba(99, 102, 241, 0.35)',
        haloBorder: 'border-purple-500/60 shadow-[0_0_14px_rgba(168,85,247,0.35)]',
        floatClass: 'animate-pet-float-energetic',
        expression: 'focused',
        soundType: 'motivated',
        messages: [
          'Halfway mark surpassed! Deep focus unlocked! 🧠',
          'Thrusters at 60%! Keep building momentum! ⚡',
          'Every task repeated builds your future self! 🚀',
          'You are doing phenomenal! Keep the rhythm! 🔥',
        ],
      };
    }

    if (pct >= 21) {
      return {
        level: 'calm',
        label: 'FOCUSED / ONLINE',
        icon: Bot,
        themeColor: '#38bdf8', // Cyan
        accentBg: 'from-sky-400 to-indigo-500',
        glowStyle: '0 0 18px rgba(56, 189, 248, 0.4), 0 0 8px rgba(99, 102, 241, 0.3)',
        haloBorder: 'border-sky-500/50 shadow-[0_0_12px_rgba(56,189,248,0.3)]',
        floatClass: 'animate-pet-float',
        expression: 'calm',
        soundType: 'chirp',
        messages: [
          'Systems online! First missions in progress. 💫',
          'Good rhythm! Stay steady and conquer today. 🎯',
          'Foundational habit locked in. Next target ready! ⚡',
          'Small disciplines repeat into great destinies! ✨',
        ],
      };
    }

    // 0 - 20%
    return {
      level: 'sleepy',
      label: 'LOW POWER / SLEEPY',
      icon: Moon,
      themeColor: '#818cf8', // Lavender Indigo
      accentBg: 'from-slate-700 to-indigo-900',
      glowStyle: '0 0 14px rgba(129, 140, 248, 0.3)',
      haloBorder: 'border-indigo-500/30 shadow-[0_0_10px_rgba(129,140,248,0.2)]',
      floatClass: 'animate-pet-float-slow',
      expression: 'sleepy',
      soundType: 'sleepy',
      messages: [
        'Zzz... Ready for our first mission? 💤',
        'Check off 1 task to power up my thrusters! 🥱',
        'Every master starts with step one! Wake me up! 🚀',
        "Your future self awaits. Let's conquer a task! ⚡",
      ],
    };
  }, [todayCompletionPct, isTodayPerfect]);

  // React to newly completed tasks with a celebration bounce & chirp
  useEffect(() => {
    if (todayCompletedCount > prevCompletedCountRef.current) {
      setIsCelebratingTask(true);
      if (soundEnabled && !petMuted) {
        playPetTone(petMood.soundType, false);
      }
      const t = setTimeout(() => setIsCelebratingTask(false), 2000);
      return () => clearTimeout(t);
    }
    prevCompletedCountRef.current = todayCompletedCount;
  }, [todayCompletedCount, petMood.soundType, soundEnabled, petMuted]);

  // On click/tap, perform cute reaction trick & cycle speech
  const handlePetClick = () => {
    if (isPerformingTrick) return;
    setIsPerformingTrick(true);
    setSpeechIndex(prev => (prev + 1) % petMood.messages.length);

    // Play reaction sound
    if (soundEnabled && !petMuted) {
      playPetTone(petMood.soundType || 'boop', false);
    }

    // Spawn heart particles
    const newHeart = { id: Date.now() + Math.random(), x: (Math.random() - 0.5) * 40 };
    setHeartParticles(prev => [...prev.slice(-4), newHeart]);

    setTimeout(() => {
      setIsPerformingTrick(false);
    }, 850);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setPetMuted(prev => !prev);
  };

  const MoodIcon = petMood.icon;
  const currentMessage = petMood.messages[speechIndex % petMood.messages.length];

  return (
    <div 
      className="relative flex flex-col items-center justify-end mb-2 select-none group/pet cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePetClick}
      title="Click to interact with your AI Study Companion!"
    >
      {/* Interactive Speech Bubble */}
      <div 
        className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 sm:w-72 p-3 rounded-2xl bg-slate-950/92 dark:bg-slate-950/92 light:bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl transition-all duration-300 pointer-events-auto z-30 ${
          isHovered || isPerformingTrick || isCelebratingTask
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-90 translate-y-1 scale-98 sm:opacity-95'
        }`}
        style={{
          boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.6), ${petMood.glowStyle}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tail pointing down toward Pet */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-3 h-3 bg-slate-950 border-r border-b border-slate-700/80 rotate-45" />

        {/* Speech Bubble Header: Pet Name + Mood Status Pill + Mini Audio Toggle */}
        <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-800/80 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              NOVA • AI
            </span>
            <span 
              className="px-2 py-0.2 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
              style={{
                backgroundColor: `${petMood.themeColor}20`,
                color: petMood.themeColor,
                border: `1px solid ${petMood.themeColor}40`,
              }}
            >
              <MoodIcon className="w-2.5 h-2.5" />
              <span>{petMood.label}</span>
            </span>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleMute}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={petMuted ? 'Unmute Pet Audio' : 'Mute Pet Audio'}
            aria-label="Toggle Pet Audio"
          >
            {petMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
          </button>
        </div>

        {/* Motivational Message */}
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {currentMessage}
        </p>

        {/* Footer tip */}
        <div className="mt-1.5 text-[9px] text-slate-400 flex items-center justify-between">
          <span>Click Nova for a boost!</span>
          <span className="font-mono text-indigo-400 font-bold">{todayCompletionPct}% Progress</span>
        </div>
      </div>

      {/* Heart / Sparkle Burst Particles on Tap */}
      {heartParticles.map(p => (
        <div
          key={p.id}
          className="absolute -top-6 text-pink-400 animate-out fade-out slide-out-to-top-8 duration-700 pointer-events-none text-base z-20"
          style={{ transform: `translateX(${p.x}px)` }}
        >
          ✨
        </div>
      ))}

      {/* Floating Animated Pet Body Container */}
      <div 
        className={`relative transition-transform duration-300 ${
          isPerformingTrick 
            ? 'animate-pet-trick' 
            : isCelebratingTask
            ? 'animate-pet-bounce-happy'
            : petMood.floatClass
        }`}
      >
        {/* Soft Ambient Radial Glow Halo behind Pet */}
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-60 transition-all duration-700 pointer-events-none -z-10"
          style={{
            background: `radial-gradient(circle, ${petMood.themeColor} 0%, transparent 70%)`,
            transform: 'scale(1.6)',
          }}
        />

        {/* Holographic Crown / Halo for 100% Victory */}
        {(isTodayPerfect || todayCompletionPct === 100) && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center animate-bounce z-20">
            <Trophy className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
          </div>
        )}

        {/* Sleepy Floating ZZZ for 0-20% */}
        {petMood.level === 'sleepy' && !isPerformingTrick && (
          <div className="absolute -top-3 -right-2 text-indigo-300 font-mono font-bold text-[11px] select-none pointer-events-none animate-pulse">
            Z<span className="text-[9px]">z</span><span className="text-[7px]">z</span>
          </div>
        )}

        {/* Futuristic AI Companion SVG Character */}
        <div 
          className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-500"
          style={{
            filter: `drop-shadow(${petMood.glowStyle})`,
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible transition-all duration-500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Chassis Obsidian Gradient */}
              <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="50%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              {/* Visor Glass Gradient */}
              <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="100%" stopColor="#090d16" />
              </linearGradient>

              {/* Dynamic Energy Accent Gradient */}
              <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={petMood.themeColor} />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>

              {/* Thruster Plume Gradient */}
              <linearGradient id="thrusterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={petMood.themeColor} stopOpacity="0.9" />
                <stop offset="100%" stopColor={petMood.themeColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Orbiting Subtle Cyber Ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke={petMood.themeColor}
              strokeWidth="1.2"
              strokeDasharray="4 8"
              strokeOpacity="0.5"
              className="animate-spin"
              style={{ animationDuration: '18s', transformOrigin: '50px 50px' }}
            />

            {/* Left Robotic Ear / Antenna */}
            <g className="transition-transform duration-300" style={{ transformOrigin: '32px 28px' }}>
              <path
                d="M32 28 L20 12 C18 10 24 6 28 8 L36 24 Z"
                fill="url(#chassisGrad)"
                stroke={petMood.themeColor}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="20" cy="11" r="2.5" fill={petMood.themeColor} className="animate-pulse" />
            </g>

            {/* Right Robotic Ear / Antenna */}
            <g className="transition-transform duration-300" style={{ transformOrigin: '68px 28px' }}>
              <path
                d="M68 28 L80 12 C82 10 76 6 72 8 L64 24 Z"
                fill="url(#chassisGrad)"
                stroke={petMood.themeColor}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="80" cy="11" r="2.5" fill={petMood.themeColor} className="animate-pulse" />
            </g>

            {/* Bottom Thruster Ion Energy Plume */}
            <g className="animate-thruster">
              <path
                d="M44 76 Q50 96 56 76 Z"
                fill="url(#thrusterGrad)"
              />
              <circle cx="50" cy="80" r="3" fill="#ffffff" opacity="0.8" />
            </g>

            {/* Main Spherical Chassis Body */}
            <circle
              cx="50"
              cy="50"
              r="30"
              fill="url(#chassisGrad)"
              stroke={petMood.themeColor}
              strokeWidth="2"
            />

            {/* Top Gloss Reflection Highlight */}
            <ellipse
              cx="45"
              cy="28"
              rx="14"
              ry="5"
              fill="#ffffff"
              opacity="0.18"
            />

            {/* Front Glossy Visor Screen */}
            <rect
              x="26"
              y="35"
              width="48"
              height="28"
              rx="14"
              fill="url(#visorGrad)"
              stroke="#334155"
              strokeWidth="1.2"
            />

            {/* Dynamic Facial Expressions on Visor */}
            {petMood.expression === 'sleepy' && (
              <g stroke={petMood.themeColor} strokeWidth="2.5" strokeLinecap="round" opacity="0.9">
                {/* Drowsy curved eyes */}
                <path d="M36 49 Q40 53 44 49" fill="none" />
                <path d="M56 49 Q60 53 64 49" fill="none" />
                {/* Gentle mouth */}
                <path d="M48 56 Q50 58 52 56" fill="none" strokeWidth="1.5" />
              </g>
            )}

            {petMood.expression === 'calm' && (
              <g fill={petMood.themeColor} className="animate-pet-blink">
                {/* Round glowing eyes */}
                <ellipse cx="40" cy="49" rx="4" ry="5" />
                <ellipse cx="60" cy="49" rx="4" ry="5" />
                {/* Eye reflections */}
                <circle cx="38.5" cy="47" r="1.5" fill="#ffffff" />
                <circle cx="58.5" cy="47" r="1.5" fill="#ffffff" />
                {/* Calm mouth */}
                <path d="M47 56 Q50 58 53 56" stroke={petMood.themeColor} strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </g>
            )}

            {petMood.expression === 'focused' && (
              <g fill={petMood.themeColor}>
                {/* Confident focused anime eyes */}
                <path d="M35 46 Q41 43 45 49 Q40 53 35 46 Z" />
                <path d="M65 46 Q59 43 55 49 Q60 53 65 46 Z" />
                <circle cx="41" cy="47" r="1.2" fill="#ffffff" />
                <circle cx="59" cy="47" r="1.2" fill="#ffffff" />
                {/* Confident smile */}
                <path d="M46 56 Q50 60 54 56" stroke={petMood.themeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
              </g>
            )}

            {petMood.expression === 'joyful' && (
              <g stroke={petMood.themeColor} strokeWidth="2.8" strokeLinecap="round" fill="none">
                {/* Happy arch eyes ^ ^ */}
                <path d="M35 50 Q40 43 45 50" />
                <path d="M55 50 Q60 43 65 50" />
                {/* Cute rosy cheek blush */}
                <circle cx="33" cy="54" r="2.5" fill="#f43f5e" opacity="0.6" stroke="none" />
                <circle cx="67" cy="54" r="2.5" fill="#f43f5e" opacity="0.6" stroke="none" />
                {/* Happy open mouth */}
                <path d="M46 55 Q50 60 54 55" strokeWidth="2" />
              </g>
            )}

            {petMood.expression === 'stars' && (
              <g fill={petMood.themeColor}>
                {/* Star eyes ★ ★ */}
                <path d="M40 43 L42 47 L46 48 L43 51 L44 55 L40 53 L36 55 L37 51 L34 48 L38 47 Z" />
                <path d="M60 43 L62 47 L66 48 L63 51 L64 55 L60 53 L56 55 L57 51 L54 48 L58 47 Z" />
                {/* Excited smile */}
                <path d="M45 55 Q50 62 55 55" stroke={petMood.themeColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
              </g>
            )}

            {petMood.expression === 'crowned' && (
              <g>
                {/* Ecstatic happy eyes ≧ ≦ */}
                <path d="M35 48 L44 45 L36 53" stroke={petMood.themeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M65 48 L56 45 L64 53" stroke={petMood.themeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* Rosy blush */}
                <circle cx="33" cy="54" r="2.5" fill="#ec4899" opacity="0.7" />
                <circle cx="67" cy="54" r="2.5" fill="#ec4899" opacity="0.7" />
                {/* Big joyous smile */}
                <path d="M44 54 Q50 62 56 54 Z" fill={petMood.themeColor} />
              </g>
            )}

            {/* Left Magnetic Hovering Hand */}
            <g className="transition-transform duration-300 group-hover/pet:-translate-y-1">
              <ellipse cx="16" cy="52" rx="4.5" ry="6" fill="url(#chassisGrad)" stroke={petMood.themeColor} strokeWidth="1.2" />
              <circle cx="16" cy="52" r="1.5" fill={petMood.themeColor} />
            </g>

            {/* Right Magnetic Hovering Hand (Waves on hover) */}
            <g className="transition-transform duration-300 group-hover/pet:-translate-y-2 group-hover/pet:rotate-12">
              <ellipse cx="84" cy="52" rx="4.5" ry="6" fill="url(#chassisGrad)" stroke={petMood.themeColor} strokeWidth="1.2" />
              <circle cx="84" cy="52" r="1.5" fill={petMood.themeColor} />
            </g>
          </svg>
        </div>
      </div>

      {/* Floating Status Indicator Pill below Pet */}
      <div className="flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] text-slate-300 font-mono shadow-sm">
        <span 
          className="w-1.5 h-1.5 rounded-full animate-ping"
          style={{ backgroundColor: petMood.themeColor }}
        />
        <span className="font-bold text-white tracking-wide">NOVA</span>
        <span className="text-slate-500">•</span>
        <span style={{ color: petMood.themeColor }}>{petMood.label.split(' ')[0]}</span>
      </div>

    </div>
  );
}
