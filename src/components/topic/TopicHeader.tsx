import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Clock, ChevronRight, Play, CheckCircle2
} from 'lucide-react';
import { Progress } from '../ui/progress';

// ────────────────────────────────────────────
// Topic header: title, breadcrumb, progress,
// continue CTA, estimated time
// ────────────────────────────────────────────

interface TopicHeaderProps {
  className?: string;
  classId?: string;
  subjectName: string;
  topicName: string;
  topicDescription?: string;
  /** breadcrumb: "S1 > Mathematics > Topic 3" */
  breadcrumbLabel?: string;
  /** 0-100 overall topic completion */
  completionPercentage?: number;
  /** total estimated learning minutes */
  estimatedMinutes?: number;
  /** count of completed items / total */
  completedCount?: number;
  totalCount?: number;
  /** if student has started, show continue CTA */
  hasStarted?: boolean;
  onContinue?: () => void;
}

export const TopicHeader: React.FC<TopicHeaderProps> = ({
  className: classNameProp,
  classId,
  subjectName,
  topicName,
  topicDescription,
  completionPercentage = 0,
  estimatedMinutes,
  completedCount = 0,
  totalCount = 0,
  hasStarted = false,
  onContinue,
}) => {
  const isCompleted = completionPercentage >= 100;

  return (
    <header className={classNameProp}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-slate-400 font-medium mb-5">
        <Link
          to={classId ? `/classes/${classId}` : '/classes'}
          className="hover:text-slate-700 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Classes
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-slate-500">{subjectName}</span>
      </div>

      {/* Title block */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-[28px] sm:text-[34px] font-extrabold text-slate-900 tracking-[-0.025em] leading-[1.15] mb-3">
            {topicName}
          </h1>
          <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed max-w-2xl">
            {topicDescription || 'Master the fundamental concepts through curated lessons and structured practice.'}
          </p>
        </div>

        {/* Right: Stats + CTA */}
        <div className="flex flex-col items-start lg:items-end gap-3 lg:mt-1">
          {/* Meta chips */}
          <div className="flex items-center gap-3 flex-wrap">
            {estimatedMinutes != null && estimatedMinutes > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                ~{estimatedMinutes} min
              </span>
            )}
            {totalCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                <BookOpen className="w-3.5 h-3.5" />
                {completedCount}/{totalCount} items
              </span>
            )}
          </div>

          {/* Continue CTA (shows only if started) */}
          {hasStarted && !isCompleted && onContinue && (
            <button
              onClick={onContinue}
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-600/20 hover:shadow-md"
            >
              <Play className="w-4 h-4" />
              Continue Learning
            </button>
          )}

          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="flex items-center gap-3">
          <Progress
            value={completionPercentage}
            className="h-1.5 flex-1 bg-slate-100 [&>div]:bg-blue-500 [&>div]:transition-all [&>div]:duration-500"
          />
          <span className="text-[11px] font-semibold text-slate-400 tabular-nums whitespace-nowrap">
            {Math.round(completionPercentage)}%
          </span>
        </div>
      )}
    </header>
  );
};
