import React from 'react';

export const DashboardSkeleton: React.FC<{ type?: 'student' | 'teacher' | 'institution' | 'admin' }> = ({ type = 'student' }) => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background ambient gradient to emulate data depth */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-slate-200/40 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 relative z-10">
        
        {/* Header Skeleton structure */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 w-full md:w-auto">
            <div className="h-10 w-3/4 md:w-80 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-1/2 md:w-64 bg-slate-200/60 rounded-md animate-pulse delay-75" />
          </div>
          <div className="h-12 w-full md:w-48 bg-slate-200 rounded-xl animate-pulse delay-100" />
        </div>

        {/* Hero Cards Skeleton */}
        <div className="flex flex-wrap gap-6">
          {[...Array(type === 'admin' ? 5 : 4)].map((_, i) => (
            <div key={i} className="flex-[1_1_250px] h-36 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative">
               <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 to-transparent" />
               <div className="p-5 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                     <div className="h-3 w-1/3 bg-slate-200 rounded-full" />
                     <div className="h-6 w-6 bg-slate-100 rounded-md" />
                  </div>
                  <div className="h-8 w-1/2 bg-slate-200 rounded-lg" />
               </div>
            </div>
          ))}
        </div>

        {/* Main Content Areas Skeleton */}
        <div className="flex flex-wrap gap-8 items-stretch">
          <div className="flex-[2_2_600px] bg-white rounded-2xl border border-slate-100 shadow-sm h-80 relative overflow-hidden p-6 flex flex-col gap-4">
               <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 to-transparent delay-150" />
               <div className="h-6 w-1/4 bg-slate-200 rounded-md mb-4" />
               <div className="h-12 w-full bg-slate-50 rounded-xl" />
               <div className="h-12 w-full bg-slate-50 rounded-xl" />
               <div className="h-12 w-full bg-slate-50 rounded-xl" />
          </div>
          <div className="flex-[1_1_300px] bg-white rounded-2xl border border-slate-100 shadow-sm h-80 relative overflow-hidden p-6 flex flex-col gap-6">
               <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 to-transparent delay-300" />
               <div className="h-6 w-1/2 bg-slate-200 rounded-md" />
               <div className="flex-1 flex flex-col gap-3 justify-center items-center">
                  <div className="h-20 w-20 rounded-full bg-slate-100" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded-md" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
               </div>
          </div>
        </div>

      </div>
    </div>
  );
};
