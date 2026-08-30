import React from 'react';
import { ExternalLink, Compass, FolderTree, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  onOpenRegistry: () => void;
  onExploreSkills: () => void;
  onViewFileTree: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenRegistry,
  onExploreSkills,
  onViewFileTree,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-linear-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-blue-950/20 p-6 sm:p-8 transition-all">
      {/* Background subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Text Content */}
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display font-medium tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Technical Skills Registry
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            The canonical implementation catalog and reusable skill system for the modern enterprise. 35 production-ready skill packages. One consistent standard. Infinite leverage.
          </p>

          {/* Action Buttons (matching screenshot) */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenRegistry}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Open Registry</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onExploreSkills}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs font-medium shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Explore Skills</span>
            </button>

            <button
              onClick={onViewFileTree}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs font-medium shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FolderTree className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>View File Tree</span>
            </button>
          </div>
        </div>

        {/* Right: Isometric 3D Graphic (matching screenshot visual styling) */}
        <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-4/3 flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full drop-shadow-2xl overflow-visible select-none"
          >
            <defs>
              <linearGradient id="isoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="isoGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="cubeRight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>
            </defs>

            {/* Base platform wireframe */}
            <g transform="translate(200, 160)">
              {/* Lower base plane */}
              <polygon
                points="0,-60 160,25 0,110 -160,25"
                fill="url(#isoGrad1)"
                stroke="#93c5fd"
                strokeWidth="1"
                strokeOpacity="0.4"
              />
              
              {/* Stepped platform 1 */}
              <polygon
                points="0,-45 130,22 0,90 -130,22"
                fill="url(#isoGrad2)"
                stroke="#60a5fa"
                strokeWidth="1.2"
                strokeOpacity="0.6"
              />

              {/* Stepped platform 2 (Main pedestal) */}
              <polygon
                points="0,-30 100,20 0,70 -100,20"
                fill="white"
                fillOpacity="0.7"
                stroke="#3b82f6"
                strokeWidth="1.5"
              />

              {/* Floating Isometric TSR Slab */}
              <g className="animate-bounce" style={{ animationDuration: '4s' }}>
                <polygon
                  points="0,-85 80,-45 0,-5 -80,-45"
                  fill="url(#cubeTop)"
                  stroke="#93c5fd"
                  strokeWidth="1"
                />
                <polygon
                  points="-80,-45 0,-5 0,18 -80,-22"
                  fill="url(#cubeLeft)"
                  stroke="#3b82f6"
                  strokeWidth="0.8"
                />
                <polygon
                  points="0,-5 80,-45 80,-22 0,18"
                  fill="url(#cubeRight)"
                  stroke="#2563eb"
                  strokeWidth="0.8"
                />

                {/* TSR Inscription in perspective */}
                <text
                  x="0"
                  y="-42"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="22"
                  fontWeight="800"
                  letterSpacing="2"
                  transform="rotate(-5) skewX(-20)"
                  className="font-sans"
                >
                  TSR
                </text>
              </g>

              {/* Orbiting data satellites */}
              <circle cx="110" cy="-20" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="-110" cy="10" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="60" cy="50" r="4" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
