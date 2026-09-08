import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Check, 
  Pin, 
  ExternalLink, 
  Target, 
  Layers, 
  Flame,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

const SAMPLE_PRESETS = [
  {
    title: 'Dream Tech Workspace',
    caption: 'Clean desk, minimal distractions, dual monitors, high-output coding environment.',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    tag: 'Workspace 💻',
  },
  {
    title: 'LeetCode & Algorithm Mastery',
    caption: '1 Problem a day beats 100 in a month. Consistency compounds into mastery.',
    imageUrl: 'https://images.unsplash.com/photo-1516116211227-bbc13c734186?auto=format&fit=crop&w=1200&q=80',
    tag: 'DSA Mastery ⚡',
  },
  {
    title: 'Peak of Mountain at Sunrise',
    caption: 'The view from the top is only understood by those who suffered the climb.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    tag: 'Discipline 🏔️',
  },
  {
    title: 'Silicon Valley / Dream Career',
    caption: 'Build software that impacts millions of lives. Never give up on the dream.',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Career Goal 🎯',
  },
];

export default function VisionGalleryManager() {
  const {
    visionPhotos,
    activeVisionIndex,
    addVisionPhoto,
    deleteVisionPhoto,
    setActiveVisionIndex,
  } = useStudy();

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tag, setTag] = useState('Career Goal 🎯');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setCaption(preset.caption);
    setImageUrl(preset.imageUrl);
    setTag(preset.tag);
    setErrorMsg('');
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a goal title (একটি টাইটেল দিন)');
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMsg('Please provide an image link (ছবির URL লিংক দিন)');
      return;
    }

    addVisionPhoto({
      title: title.trim(),
      caption: caption.trim() || 'Keep pushing forward every single day.',
      imageUrl: imageUrl.trim(),
      tag: tag.trim() || 'Target Goal',
    });

    setTitle('');
    setCaption('');
    setImageUrl('');
    setErrorMsg('');
    setSuccessMsg('Photo added to Vision Board! It is now active up top next to the Study Pet.');
    setTimeout(() => setSuccessMsg(''), 4000);

    // Smooth scroll back up to hero if desired
    const heroEl = document.getElementById('hero-vision-card');
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="vision-gallery-section"
      className="w-full bg-slate-900/90 dark:bg-slate-900/90 light:bg-white rounded-3xl p-6 sm:p-8 border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl backdrop-blur-xl transition-all"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white light:text-slate-900 tracking-tight">
                Target Vision Board & Dream Photo Manager
              </h2>
              <p className="text-xs text-indigo-400 font-mono mt-0.5">
                Live Synced with Hero Display (Pet Companion's Left Side)
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-2 max-w-3xl leading-relaxed">
            এখানে আপনার পছন্দের ড্রিম গোল, মোটিভেশনাল ফটো ও ক্যাপশন অ্যাড করুন। আপনি এখানে যে ফটো ও নোট যুক্ত করবেন, তা সাথে সাথে উপরে <strong>Study Pet-এর বাম পাশে</strong> লাইভ ভেসে উঠবে।
          </p>
        </div>

        {/* Active Photos Count Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-300 self-start sm:self-center">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>{visionPhotos?.length || 0} Vision Cards</span>
        </div>
      </div>

      {/* Main Content: Form (Left) & Gallery Grid (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* Left Column: Add Vision Photo Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-800/80 light:border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>নতুন ফটো ও লক্ষ্য যোগ করুন (Add Photo)</span>
              </h3>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Instant Hero Sync
              </span>
            </div>

            {/* Quick Inspiration Presets */}
            <div className="mb-4">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-2">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                <span>Quick Inspiration Presets (ক্লিক করে সহজে ট্রাই করুন):</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-slate-700/60 hover:border-indigo-500/40 transition-colors"
                  >
                    {preset.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAdd} className="space-y-3.5">
              {/* Image URL Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                  Photo URL / ইমেজ লিংক <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-slate-900/90 dark:bg-slate-900/90 light:bg-white rounded-xl border border-slate-700/70 text-xs text-white light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {imageUrl && (
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-indigo-400"
                      title="Test URL in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Goal Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                  Goal Title / লক্ষ্যের নাম <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Crack FAANG / 500+ LeetCode Milestone"
                  className="w-full px-3 py-2 bg-slate-900/90 dark:bg-slate-900/90 light:bg-white rounded-xl border border-slate-700/70 text-xs text-white light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Motivation Note / Caption */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                  Motivational Note / অনুপ্রেরণামূলক ক্যাপশন
                </label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. ছোট ছোট অভ্যাস প্রতিদিন বজায় রাখলে বড় লক্ষ্য অর্জিত হবে..."
                  className="w-full px-3 py-2 bg-slate-900/90 dark:bg-slate-900/90 light:bg-white rounded-xl border border-slate-700/70 text-xs text-white light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Category Tag */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                  Tag / ক্যাটাগরি
                </label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/90 dark:bg-slate-900/90 light:bg-white rounded-xl border border-slate-700/70 text-xs text-white light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Career Goal 🎯">Career Goal 🎯</option>
                  <option value="DSA Mastery ⚡">DSA Mastery ⚡</option>
                  <option value="Dream Setup 💻">Dream Setup 💻</option>
                  <option value="Discipline 🏔️">Discipline 🏔️</option>
                  <option value="Focus & Routine 🧠">Focus & Routine 🧠</option>
                </select>
              </div>

              {/* Live Preview Box if image entered */}
              {imageUrl && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-700"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white truncate">{title || 'Goal Title Preview'}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1 italic mt-0.5">{caption || 'Caption Preview'}</p>
                    <span className="text-[9px] font-mono text-indigo-400">{tag}</span>
                  </div>
                </div>
              )}

              {/* Error & Success Messages */}
              {errorMsg && (
                <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                  {errorMsg}
                </p>
              )}
              {successMsg && (
                <p className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{successMsg}</span>
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save to Vision Board & Show Up Top ✨</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Vision Photo Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              <span>আপনার সেভ করা ফটোগুলো (Saved Motivation Cards)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Click "Pin to Hero" to select
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {visionPhotos && visionPhotos.length > 0 ? (
              visionPhotos.map((photo, idx) => {
                const isActive = activeVisionIndex === idx;

                return (
                  <div
                    key={photo.id || idx}
                    className={`relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between p-3 ${
                      isActive
                        ? 'bg-slate-950/90 border-indigo-500 shadow-xl shadow-indigo-500/15 ring-2 ring-indigo-500/50'
                        : 'bg-slate-950/50 hover:bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Active Ribbon / Badge */}
                    {isActive && (
                      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[9px] font-bold font-mono tracking-wider flex items-center gap-1 shadow-md">
                        <Pin className="w-2.5 h-2.5" />
                        <span>ACTIVE IN HERO</span>
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-900 mb-2.5 border border-slate-800">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                    </div>

                    {/* Meta info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono font-bold text-indigo-400">
                          {photo.tag || 'TARGET GOAL'}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {photo.title}
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed italic">
                        "{photo.caption}"
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-800/80">
                      {isActive ? (
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                          <Check className="w-3 h-3" />
                          <span>Showing Up Top Beside Pet</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveVisionIndex(idx)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[10px] font-semibold border border-indigo-500/30 transition-colors flex items-center gap-1"
                        >
                          <Pin className="w-3 h-3" />
                          <span>Pin to Hero (উপরে দেখান)</span>
                        </button>
                      )}

                      {/* Delete button (allow delete if more than 1 photo) */}
                      {visionPhotos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteVisionPhoto(photo.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-12 text-slate-500 text-xs">
                No vision photos found. Add your first goal photo on the left!
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
