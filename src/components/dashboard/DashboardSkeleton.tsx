import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const DashboardSkeleton: React.FC<{ type?: 'student' | 'teacher' | 'institution' | 'admin' }> = ({ type = 'student' }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div className="space-y-2">
            <Skeleton className="h-10 w-[300px] rounded-md" />
            <Skeleton className="h-4 w-[400px] rounded-md" />
          </div>
          <Skeleton className="h-12 w-[180px] rounded-lg" />
        </div>

        {/* Hero Cards Skeleton */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-[1_1_250px]">
              <Skeleton className="h-[140px] w-full rounded-2xl" />
            </div>
          ))}
        </div>

        {/* Main Content Areas Skeleton */}
        <div className="flex flex-wrap gap-6 items-stretch">
          <div className="flex-[1_1_300px]">
             <Skeleton className="h-[300px] w-full rounded-2xl" />
          </div>
          <div className="flex-[1_1_300px]">
             <Skeleton className="h-[300px] w-full rounded-2xl" />
          </div>
          <div className="flex-[1_1_300px]">
             <Skeleton className="h-[300px] w-full rounded-2xl" />
          </div>
        </div>

        {/* Wide Data Table Skeleton */}
        <Skeleton className="h-[400px] w-full rounded-2xl mt-8" />
      </div>
    </div>
  );
};
