import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { 
  Compass, 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  Sparkles, 
  ExternalLink,
  PlusCircle,
  Image as ImageIcon
} from 'lucide-react';

export default function HeroVisionCard() {
  const {
    visionPhotos,
    activeVisionIndex,
    setActiveVisionIndex,
  } = useStudy();

  const [isHovered, setIsHovered] = useState(false);

  // Auto-cycle through vision photos every 12 seconds if not hovered
  useEffect(() => {
    if (!visionPhotos || visionPhotos.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setActiveVisionIndex((activeVisionIndex + 1) % visionPhotos.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [visionPhotos, activeVisionIndex, isHovered, setActiveVisionIndex]);

  const currentPhoto = visionPhotos && visionPhotos.length > 0
    ? visionPhotos[activeVisionIndex % visionPhotos.length]
    : null;

  const handlePrev = (e) => {
    e.stopPropagation();
    if (!visionPhotos || visionPhotos.length === 0) return;
    const newIdx = (activeVisionIndex - 1 + visionPhotos.length) % visionPhotos.length;
    setActiveVisionIndex(newIdx);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (!visionPhotos || visionPhotos.length === 0) return;
    const newIdx = (activeVisionIndex + 1) % visionPhotos.length;
    setActiveVisionIndex(newIdx);
  };

  const scrollToManager = (e) => {
    e.stopPropagation();
    const el = document.getElementById('vision-gallery-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!currentPhoto) {
    return (
      <div 
        onClick={scrollToManager}
        className="w-full sm:w-60 md:w-64 p-3 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-dashed border-indigo-500/40 text-center cursor-pointer hover:border-indigo-400 transition-all group/card shadow-xl mb-3 sm:mb-0 sm:self-start"
      >
        <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 mb-2 group-hover/card:scale-110 transition-transform">
          <ImageIcon className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-white">Target Vision Board</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Click to add your dream goal photo at the bottom!</p>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full sm:w-60 md:w-64 p-2 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-700/80 shadow-2xl transition-all duration-300 hover:border-indigo-500/70 hover:shadow-indigo-500/15 group/vision mb-3 sm:mb-2 sm:self-start"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={scrollToManager}
      title="Click to manage your Vision Board photos at the bottom!"
    >
      {/* Top Floating Badge & Navigation Arrows */}
      <div className="flex items-center justify-between gap-1 pb-1.5 px-1">
        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-300 font-mono">
          <Target className="w-3 h-3 text-indigo-400 animate-pulse" />
          <span className="truncate max-w-[120px]">{currentPhoto.tag || 'TARGET GOAL'}</span>
        </div>

        {/* Carousel arrows if more than 1 photo */}
        {visionPhotos.length > 1 && (
          <div className="flex items-center gap-1 opacity-85 group-hover/vision:opacity-100 transition-opacity">
            <button
              onClick={handlePrev}
              className="p-1 rounded-md bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-colors"
              title="Previous Photo"
            >
              <ChevronLeft className="w-2.5 h-2.5" />
            </button>
            <span className="text-[9px] font-mono text-slate-400">
              {activeVisionIndex + 1}/{visionPhotos.length}
            </span>
            <button
              onClick={handleNext}
              className="p-1 rounded-md bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-colors"
              title="Next Photo"
            >
              <ChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>

      {/* Image Container with Zoom hover */}
      <div className="relative w-full h-28 sm:h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
        <img
          src={currentPhoto.imageUrl}
          alt={currentPhoto.title}
          className="w-full h-full object-cover group-hover/vision:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Subtle bottom shadow vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Quick manage icon hint */}
        <div className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 backdrop-blur-md text-white/80 opacity-0 group-hover/vision:opacity-100 transition-opacity">
          <ExternalLink className="w-3 h-3" />
        </div>
      </div>

      {/* Title & Caption Details */}
      <div className="pt-2 px-1">
        <h4 className="text-xs font-bold text-white line-clamp-1 group-hover/vision:text-indigo-300 transition-colors">
          {currentPhoto.title}
        </h4>
        <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 mt-0.5 font-medium">
          "{currentPhoto.caption}"
        </p>

        {/* Bottom Hint */}
        <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
          <span>Vision Board</span>
          <span className="text-indigo-400 hover:underline">Edit at bottom ↓</span>
        </div>
      </div>
    </div>
  );
}
