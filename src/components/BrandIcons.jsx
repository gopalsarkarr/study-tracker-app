import React from 'react';
import { Link2 } from 'lucide-react';

export const LeetCodeIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
  </svg>
);

export const SheryiansIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

export const GitHubIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const YouTubeIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

/**
 * Returns customized styling, icon, and call-to-action text according to the URL
 */
export function getLinkMetadata(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return null;
  const lower = url.toLowerCase().trim();

  if (lower.includes('leetcode.com')) {
    return {
      type: 'leetcode',
      platform: 'LeetCode',
      cta: 'Solve on LeetCode',
      shortCta: 'LeetCode',
      IconComponent: LeetCodeIcon,
      badgeClass:
        'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400 hover:text-amber-300 shadow-amber-500/10',
      pillClass:
        'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
      accentColor: '#f59e0b',
    };
  }

  if (lower.includes('sheryians.com')) {
    return {
      type: 'sheryians',
      platform: 'Sheryians',
      cta: 'Open Sheryians Class',
      shortCta: 'Sheryians',
      IconComponent: SheryiansIcon,
      badgeClass:
        'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-400 hover:text-rose-300 shadow-rose-500/10',
      pillClass:
        'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20',
      accentColor: '#f43f5e',
    };
  }

  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    return {
      type: 'youtube',
      platform: 'YouTube',
      cta: 'Watch Lecture Video',
      shortCta: 'Lecture Video',
      IconComponent: YouTubeIcon,
      badgeClass:
        'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 hover:border-red-400 hover:text-red-300 shadow-red-500/10',
      pillClass:
        'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20',
      accentColor: '#ef4444',
    };
  }

  if (lower.includes('github.com')) {
    return {
      type: 'github',
      platform: 'GitHub',
      cta: 'View on GitHub',
      shortCta: 'GitHub',
      IconComponent: GitHubIcon,
      badgeClass:
        'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:border-slate-500 hover:text-white shadow-slate-900/30',
      pillClass:
        'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700',
      accentColor: '#94a3b8',
    };
  }

  return {
    type: 'generic',
    platform: 'Resource',
    cta: 'Open Mission Link',
    shortCta: 'Mission Resource',
    IconComponent: Link2,
    badgeClass:
      'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-400 hover:text-indigo-300 shadow-indigo-500/10',
    pillClass:
      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20',
    accentColor: '#6366f1',
  };
}
