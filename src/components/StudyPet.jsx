import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Flame, 
  Zap, 
  Heart, 
  Trophy, 
  Smile,
  AlertTriangle,
  FlameKindling
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

    if (type === 'angry') {
      // Irritated grumpy buzz / growl
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.18);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'boop' || type === 'chirp') {
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
    todayTotalCount,
    isTodayPerfect,
    soundEnabled,
  } = useStudy();

  const [petMuted, setPetMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPerformingTrick, setIsPerformingTrick] = useState(false);
  const [speechIndex, setSpeechIndex] = useState(0);
  const [isCelebratingTask, setIsCelebratingTask] = useState(false);
  const [popParticles, setPopParticles] = useState([]);

  const prevCompletedCountRef = useRef(todayCompletedCount);

  // Determine Pet Mood & Traits: ANGRY when nothing is done -> SUPER HAPPY when completed!
  const petMood = useMemo(() => {
    const count = todayCompletedCount || 0;
    const pct = todayCompletionPct || 0;

    // 1. Mission Completed / 100% (ULTRA HAPPY / CELEBRATING!)
    if (isTodayPerfect || (todayTotalCount > 0 && count === todayTotalCount) || pct === 100) {
      return {
        level: 'celebrating',
        label: 'SUPER HAPPY • 100% DONE! 🏆',
        icon: Trophy,
        themeColor: '#fbbf24', // Gold
        glowStyle: '0 0 35px rgba(251, 191, 36, 0.85), 0 0 18px rgba(16, 185, 129, 0.7)',
        floatClass: 'animate-pet-dance-victory',
        expression: 'crowned',
        soundType: 'victory',
        statusTag: 'ECSTATIC',
        badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        messages: [
          'YAYYY! I AM SO HAPPY! 100% COMPLETED! YOU ARE A LEGEND! 🏆👑',
          'NO MORE ANGER! You did EVERYTHING today! Best Architect ever! 💖🎉',
          'Flawless victory achieved! All missions crushed! 🌟',
          'I love seeing you succeed! Take a well-deserved bow! 💫',
        ],
      };
    }

    // 2. High Progress (75% - 99%) -> VERY HAPPY & HYPED!
    if (pct >= 75) {
      return {
        level: 'excited',
        label: 'VERY HAPPY • ALMOST DONE! 💖',
        icon: Heart,
        themeColor: '#f59e0b', // Radiant Amber / Emerald
        glowStyle: '0 0 30px rgba(245, 158, 11, 0.7), 0 0 14px rgba(16, 185, 129, 0.5)',
        floatClass: 'animate-pet-bounce-happy',
        expression: 'stars',
        soundType: 'happy',
        statusTag: 'HYPER HAPPY',
        badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        messages: [
          'LOOK AT THAT! My anger is totally gone! You are doing amazing! 🥰🔥',
          'Just ONE last push for 100%! Finish it so we can celebrate! 🌟',
          'You turned my fury into pure joy today! Almost there! 💖🎯',
          'Unstoppable velocity! Conquering tasks like a master! ⚡',
        ],
      };
    }

    // 3. Medium Progress (40% - 74%) -> HAPPY & MOTIVATED!
    if (pct >= 40) {
      return {
        level: 'happy',
        label: 'HAPPY • GOOD PROGRESS! ✨',
        icon: Smile,
        themeColor: '#10b981', // Emerald Green
        glowStyle: '0 0 25px rgba(16, 185, 129, 0.6), 0 0 10px rgba(52, 211, 153, 0.4)',
        floatClass: 'animate-pet-float-energetic',
        expression: 'joyful',
        soundType: 'happy',
        statusTag: 'HAPPY',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        messages: [
          "Yes! Now that's what I like to see! You're working hard! 🥰",
          'I am so happy you started! Keep that momentum rolling! 💚',
          'Halfway mark conquered! No more anger from me today! 🚀',
          'Every mission completed makes me smile! Keep going! 🏃‍♂️',
        ],
      };
    }

    // 4. Low Progress but started (1 task or 1% - 39%) -> COOLING DOWN / TSUNDERE
    if (count > 0) {
      return {
        level: 'calming',
        label: 'COOLING DOWN • KEEP GOING 😤',
        icon: Zap,
        themeColor: '#f97316', // Orange
        glowStyle: '0 0 20px rgba(249, 115, 22, 0.5), 0 0 10px rgba(239, 68, 68, 0.3)',
        floatClass: 'animate-pet-float',
        expression: 'smirk',
        soundType: 'motivated',
        statusTag: 'STERN',
        badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        messages: [
          'Hmph! Finally you did 1 mission... But do NOT stop now! 😤',
          'Okay, I am slightly less angry now. Keep building the momentum! ⚡',
          'Good start! Complete more tasks so I can become super happy! 🏃‍♂️',
          'Don’t slack off! The next mission is waiting right below! 🎯',
        ],
      };
    }

    // 5. ZERO TASKS DONE (Jokhon Kichu Na Korbo) -> 100% ANGRY / RAGE MODE! 😡💢
    return {
      level: 'angry',
      label: 'ANGRY • STUDY NOW! 💢',
      icon: Flame,
      themeColor: '#ef4444', // Crimson Red
      glowStyle: '0 0 35px rgba(239, 68, 68, 0.85), 0 0 18px rgba(220, 38, 38, 0.7)',
      floatClass: 'animate-pet-angry-shake',
      expression: 'angry',
      soundType: 'angry',
      statusTag: 'FURIOUS',
      badgeBg: 'bg-rose-500/25 text-rose-300 border-rose-500/50 animate-pulse',
      messages: [
        'OI! ZERO missions done today?! Go study or solve a problem NOW! 😡💢',
        'Why are you just staring at me?! Open LeetCode right this second! 😤🔥',
        'I am SO ANGRY! Complete at least ONE mission to calm me down! 💢',
        'Stop procrastinating! Click "Start Today\'s Mission" below! 💥',
        'Your streak will DIE if you don\'t take action! GO STUDY! 🚨',
      ],
    };
  }, [todayCompletionPct, todayCompletedCount, todayTotalCount, isTodayPerfect]);

  // React to newly completed tasks with a celebration bounce & happy sound
  useEffect(() => {
    if (todayCompletedCount > prevCompletedCountRef.current) {
      setIsCelebratingTask(true);
      if (soundEnabled && !petMuted) {
        playPetTone(petMood.soundType || 'happy', false);
      }
      const t = setTimeout(() => setIsCelebratingTask(false), 2200);
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
      playPetTone(petMood.soundType, false);
    }

    // Spawn floating particle: smoke/fire if angry, hearts/stars if happy
    const isAngry = petMood.level === 'angry';
    const particleIcon = isAngry ? (Math.random() > 0.5 ? '💢' : '🔥') : (Math.random() > 0.5 ? '💖' : '✨');
    const newParticle = { 
      id: Date.now() + Math.random(), 
      x: (Math.random() - 0.5) * 40,
      icon: particleIcon
    };
    setPopParticles(prev => [...prev.slice(-4), newParticle]);

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
  const isAngry = petMood.level === 'angry';

  return (
    <div 
      className="relative flex flex-col items-center justify-end mb-2 select-none group/pet cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePetClick}
      title={isAngry ? "Nova is angry! Complete a mission to make Nova happy!" : "Nova is happy with your progress! Click to interact!"}
    >
      {/* Interactive Speech Bubble */}
      <div 
        className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 sm:w-72 p-3 rounded-2xl bg-slate-950/95 dark:bg-slate-950/95 light:bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl transition-all duration-300 pointer-events-auto z-30 ${
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
            <span className={`font-extrabold tracking-wider ${
              isAngry 
                ? 'text-rose-400 animate-pulse' 
                : 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'
            }`}>
              NOVA • AI
            </span>
            <span 
              className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border ${petMood.badgeBg}`}
            >
              <MoodIcon className="w-2.5 h-2.5" />
              <span>{petMood.statusTag}</span>
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

        {/* Motivational / Scolding Message */}
        <p className={`text-xs leading-relaxed font-semibold ${
          isAngry ? 'text-rose-200' : 'text-slate-200'
        }`}>
          {currentMessage}
        </p>

        {/* Footer tip */}
        <div className="mt-2 text-[9px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-850">
          <span>{isAngry ? '⚠️ Complete 1 mission to calm Nova down!' : '🎉 Keep completing tasks!'}</span>
          <span className="font-mono font-bold" style={{ color: petMood.themeColor }}>
            {todayCompletedCount}/{todayTotalCount} Done
          </span>
        </div>
      </div>

      {/* Floating particles on click: Smoke/Fire for Angry, Sparkles/Hearts for Happy */}
      {popParticles.map(p => (
        <div
          key={p.id}
          className="absolute -top-6 animate-out fade-out slide-out-to-top-8 duration-700 pointer-events-none text-lg z-20"
          style={{ transform: `translateX(${p.x}px)` }}
        >
          {p.icon}
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
          className="absolute inset-0 rounded-full blur-xl opacity-65 transition-all duration-700 pointer-events-none -z-10"
          style={{
            background: `radial-gradient(circle, ${petMood.themeColor} 0%, transparent 70%)`,
            transform: 'scale(1.65)',
          }}
        />

        {/* Holographic Crown / Halo for 100% Victory */}
        {(isTodayPerfect || todayCompletionPct === 100) && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center animate-bounce z-20">
            <Trophy className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
          </div>
        )}

        {/* Pulsating Angry Vein Symbol 💢 when ANGRY (Kichu na korle) */}
        {isAngry && !isPerformingTrick && (
          <div className="absolute -top-4 -right-1 text-red-500 font-bold text-lg select-none pointer-events-none animate-anger-vein z-20 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]">
            💢
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
                <stop offset="0%" stopColor={isAngry ? '#450a0a' : '#1e1b4b'} />
                <stop offset="50%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              {/* Visor Glass Gradient */}
              <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="100%" stopColor={isAngry ? '#1f0404' : '#090d16'} />
              </linearGradient>

              {/* Dynamic Energy Accent Gradient */}
              <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={petMood.themeColor} />
                <stop offset="100%" stopColor={isAngry ? '#b91c1c' : '#c084fc'} />
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
              strokeWidth={isAngry ? '1.8' : '1.2'}
              strokeDasharray={isAngry ? '2 4' : '4 8'}
              strokeOpacity="0.65"
              className="animate-spin"
              style={{ animationDuration: isAngry ? '4s' : '18s', transformOrigin: '50px 50px' }}
            />

            {/* Left Robotic Ear / Antenna (flattens backwards when angry) */}
            <g className="transition-transform duration-300" style={{ transformOrigin: '32px 28px', transform: isAngry ? 'rotate(-10deg)' : 'none' }}>
              <path
                d="M32 28 L20 12 C18 10 24 6 28 8 L36 24 Z"
                fill="url(#chassisGrad)"
                stroke={petMood.themeColor}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="20" cy="11" r="2.5" fill={petMood.themeColor} className="animate-pulse" />
            </g>

            {/* Right Robotic Ear / Antenna (flattens backwards when angry) */}
            <g className="transition-transform duration-300" style={{ transformOrigin: '68px 28px', transform: isAngry ? 'rotate(10deg)' : 'none' }}>
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
              strokeWidth={isAngry ? '2.5' : '2'}
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
              stroke={isAngry ? '#ef4444' : '#334155'}
              strokeWidth={isAngry ? '1.8' : '1.2'}
            />

            {/* Dynamic Facial Expressions on Visor */}

            {/* 1. ANGRY EXPRESSION (0 tasks completed - Kichu na korle) */}
            {petMood.expression === 'angry' && (
              <g>
                {/* Furious angled eyebrows */}
                <path d="M33 42 L46 47" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                <path d="M67 42 L54 47" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />

                {/* Fiery red eyes with sharp look */}
                <circle cx="39" cy="49" r="4.5" fill="#ef4444" className="animate-pulse" />
                <circle cx="61" cy="49" r="4.5" fill="#ef4444" className="animate-pulse" />
                <circle cx="40.5" cy="48" r="1.5" fill="#ffffff" />
                <circle cx="59.5" cy="48" r="1.5" fill="#ffffff" />

                {/* Angry pouting / grinding mouth */}
                <path d="M44 59 Q50 54 56 59" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </g>
            )}

            {/* 2. SMIRK / TSUNDERE (1-39% progress) */}
            {petMood.expression === 'smirk' && (
              <g>
                {/* One raised eyebrow */}
                <path d="M34 43 L44 46" stroke={petMood.themeColor} strokeWidth="2" strokeLinecap="round" />
                <path d="M56 46 L66 43" stroke={petMood.themeColor} strokeWidth="2" strokeLinecap="round" />
                
                {/* Curious squinting eyes */}
                <ellipse cx="39" cy="49" rx="3.5" ry="4.5" fill={petMood.themeColor} />
                <ellipse cx="61" cy="49" rx="3.5" ry="4.5" fill={petMood.themeColor} />
                <circle cx="38" cy="48" r="1.2" fill="#ffffff" />
                <circle cx="60" cy="48" r="1.2" fill="#ffffff" />

                {/* Stern half-smile */}
                <path d="M46 56 Q50 55 54 58" stroke={petMood.themeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
              </g>
            )}

            {/* 3. JOYFUL / HAPPY (40-74% progress) */}
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

            {/* 4. STARS / SUPER EXCITED (75-99% progress) */}
            {petMood.expression === 'stars' && (
              <g fill={petMood.themeColor}>
                {/* Star eyes ★ ★ */}
                <path d="M40 43 L42 47 L46 48 L43 51 L44 55 L40 53 L36 55 L37 51 L34 48 L38 47 Z" />
                <path d="M60 43 L62 47 L66 48 L63 51 L64 55 L60 53 L56 55 L57 51 L54 48 L58 47 Z" />
                {/* Cheerful rosy blush */}
                <circle cx="33" cy="54" r="2.5" fill="#f59e0b" opacity="0.6" />
                <circle cx="67" cy="54" r="2.5" fill="#f59e0b" opacity="0.6" />
                {/* Excited smile */}
                <path d="M45 55 Q50 62 55 55" stroke={petMood.themeColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
              </g>
            )}

            {/* 5. CROWNED / LEGEND HAPPY (100% complete) */}
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

            {/* Left Magnetic Hovering Hand (shakes if angry) */}
            <g className={`transition-transform duration-300 ${isAngry ? 'group-hover/pet:rotate-12' : 'group-hover/pet:-translate-y-1'}`}>
              <ellipse cx="16" cy="52" rx="4.5" ry="6" fill="url(#chassisGrad)" stroke={petMood.themeColor} strokeWidth="1.2" />
              <circle cx="16" cy="52" r="1.5" fill={petMood.themeColor} />
            </g>

            {/* Right Magnetic Hovering Hand */}
            <g className={`transition-transform duration-300 ${isAngry ? 'group-hover/pet:-rotate-12' : 'group-hover/pet:-translate-y-2 group-hover/pet:rotate-12'}`}>
              <ellipse cx="84" cy="52" rx="4.5" ry="6" fill="url(#chassisGrad)" stroke={petMood.themeColor} strokeWidth="1.2" />
              <circle cx="84" cy="52" r="1.5" fill={petMood.themeColor} />
            </g>
          </svg>
        </div>
      </div>

      {/* Floating Status Indicator Pill below Pet */}
      <div className={`flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border text-[10px] font-mono shadow-sm transition-colors ${
        isAngry ? 'border-red-500/50 text-red-300' : 'border-slate-800 text-slate-300'
      }`}>
        <span 
          className="w-1.5 h-1.5 rounded-full animate-ping"
          style={{ backgroundColor: petMood.themeColor }}
        />
        <span className="font-bold text-white tracking-wide">NOVA</span>
        <span className="text-slate-500">•</span>
        <span style={{ color: petMood.themeColor }}>{petMood.statusTag}</span>
      </div>

    </div>
  );
}
