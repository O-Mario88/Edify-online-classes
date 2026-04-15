import React from 'react';

// ────────────────────────────────────────────
// Skeleton loading state for the topic page
// ────────────────────────────────────────────

export const TopicPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f4f0]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex gap-10">
          {/* Sidebar skeleton */}
          <div className="hidden md:block w-64 lg:w-72 flex-shrink-0 space-y-2">
            <div className="h-3 w-28 bg-slate-200/60 rounded mb-6 animate-pulse" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <div className="w-7 h-7 rounded-lg bg-slate-200/60 animate-pulse" />
                <div className={`h-4 rounded bg-slate-200/60 animate-pulse`} style={{ width: `${60 + Math.random() * 30}%` }} />
              </div>
            ))}
          </div>

          {/* Main content skeleton */}
          <div className="flex-1 max-w-4xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-5">
              <div className="h-3 w-14 bg-slate-200/60 rounded animate-pulse" />
              <div className="h-3 w-3 bg-slate-200/60 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-200/60 rounded animate-pulse" />
            </div>

            {/* Title */}
            <div className="h-9 w-3/4 bg-slate-200/60 rounded-lg mb-3 animate-pulse" />
            <div className="h-5 w-2/3 bg-slate-200/60 rounded mb-6 animate-pulse" />

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-200/60 rounded-full mb-10 animate-pulse" />

            {/* Sections */}
            {Array.from({ length: 3 }).map((_, si) => (
              <div key={si} className="mb-10">
                {/* Section header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-slate-200/60 animate-pulse" />
                  <div className="h-5 w-44 bg-slate-200/60 rounded animate-pulse" />
                </div>
                <div className="h-px bg-slate-200/40 mb-6 ml-12" />

                {/* Two-column cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-0 md:ml-12">
                  <div className="space-y-3">
                    <div className="h-3 w-12 bg-slate-200/60 rounded animate-pulse mb-3" />
                    {Array.from({ length: 2 }).map((_, ci) => (
                      <div key={ci} className="h-[88px] rounded-xl bg-white/60 border border-slate-200/40 animate-pulse" />
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-14 bg-slate-200/60 rounded animate-pulse mb-3" />
                    <div className="h-[88px] rounded-xl bg-white/60 border border-slate-200/40 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
