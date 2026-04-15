import React from 'react';
import {
  Video, BookOpen, FileText, ClipboardList, Pencil, FolderKanban,
  Zap, Wrench, Presentation, CheckCircle2, Clock, Lock,
  ArrowRight, Sparkles, User as UserIcon, AlertTriangle
} from 'lucide-react';

// ────────────────────────────────────────────
// Type map for icons, colors, labels
// ────────────────────────────────────────────
const TYPE_CONFIG: Record<string, {
  icon: React.ElementType;
  accent: string;       // bg for left stripe / icon tint
  accentText: string;   // text for type label
  label: string;
  bg: string;           // card surface tint
  hoverBorder: string;
}> = {
  video: {
    icon: Video,
    accent: 'bg-rose-500',
    accentText: 'text-rose-600',
    label: 'Video Lesson',
    bg: 'hover:bg-rose-50/40',
    hoverBorder: 'hover:border-rose-200',
  },
  notes: {
    icon: BookOpen,
    accent: 'bg-blue-500',
    accentText: 'text-blue-600',
    label: 'Study Notes',
    bg: 'hover:bg-blue-50/40',
    hoverBorder: 'hover:border-blue-200',
  },
  textbook: {
    icon: BookOpen,
    accent: 'bg-indigo-500',
    accentText: 'text-indigo-600',
    label: 'Textbook',
    bg: 'hover:bg-indigo-50/40',
    hoverBorder: 'hover:border-indigo-200',
  },
  pdf: {
    icon: FileText,
    accent: 'bg-sky-500',
    accentText: 'text-sky-600',
    label: 'PDF Document',
    bg: 'hover:bg-sky-50/40',
    hoverBorder: 'hover:border-sky-200',
  },
  slides: {
    icon: Presentation,
    accent: 'bg-amber-500',
    accentText: 'text-amber-600',
    label: 'Slides',
    bg: 'hover:bg-amber-50/40',
    hoverBorder: 'hover:border-amber-200',
  },
  exercise: {
    icon: ClipboardList,
    accent: 'bg-[#b8a97e]',
    accentText: 'text-[#8e8268]',
    label: 'Practice Set',
    bg: 'hover:bg-[#faf8f3]',
    hoverBorder: 'hover:border-[#ddd5c2]',
  },
  quiz: {
    icon: Zap,
    accent: 'bg-violet-500',
    accentText: 'text-violet-600',
    label: 'Quiz',
    bg: 'hover:bg-violet-50/40',
    hoverBorder: 'hover:border-violet-200',
  },
  assignment: {
    icon: Pencil,
    accent: 'bg-purple-500',
    accentText: 'text-purple-600',
    label: 'Assignment',
    bg: 'hover:bg-purple-50/40',
    hoverBorder: 'hover:border-purple-200',
  },
  project: {
    icon: FolderKanban,
    accent: 'bg-emerald-500',
    accentText: 'text-emerald-600',
    label: 'Project',
    bg: 'hover:bg-emerald-50/40',
    hoverBorder: 'hover:border-emerald-200',
  },
  activity: {
    icon: Zap,
    accent: 'bg-orange-500',
    accentText: 'text-orange-600',
    label: 'Activity',
    bg: 'hover:bg-orange-50/40',
    hoverBorder: 'hover:border-orange-200',
  },
  revision: {
    icon: BookOpen,
    accent: 'bg-cyan-500',
    accentText: 'text-cyan-600',
    label: 'Revision',
    bg: 'hover:bg-cyan-50/40',
    hoverBorder: 'hover:border-cyan-200',
  },
  intervention: {
    icon: Wrench,
    accent: 'bg-red-500',
    accentText: 'text-red-600',
    label: 'Support Material',
    bg: 'hover:bg-red-50/40',
    hoverBorder: 'hover:border-red-200',
  },
};

const DEFAULT_CONFIG = {
  icon: FileText,
  accent: 'bg-slate-400',
  accentText: 'text-slate-500',
  label: 'Resource',
  bg: 'hover:bg-slate-50/40',
  hoverBorder: 'hover:border-slate-300',
};

// ────────────────────────────────────────────
// Status types
// ────────────────────────────────────────────
export type CardStatus =
  | 'not_started'
  | 'started'
  | 'in_progress'
  | 'completed'
  | 'locked'
  | 'overdue';

export type CardBadge = 'teacher_assigned' | 'ai_recommended' | 'none';

export interface TopicContentCardProps {
  id: string;
  title: string;
  type: string;               // video, notes, exercise, assignment, project, etc.
  duration?: string;           // "35 MIN", "20 MIN"
  status?: CardStatus;
  completionPercentage?: number;
  badge?: CardBadge;
  lane: 'learn' | 'practice'; // which column
  onClick?: () => void;
}

export const TopicContentCard: React.FC<TopicContentCardProps> = ({
  title,
  type,
  duration,
  status = 'not_started',
  completionPercentage = 0,
  badge = 'none',
  lane,
  onClick,
}) => {
  const config = TYPE_CONFIG[type] || DEFAULT_CONFIG;
  const Icon = config.icon;
  const isCompleted = status === 'completed';
  const isLocked = status === 'locked';
  const isOverdue = status === 'overdue';
  const isInProgress = status === 'in_progress' || status === 'started';
  const hasProgress = completionPercentage > 0 && completionPercentage < 100;

  const getCompletedActionLabel = (t: string) => {
    if (t === 'video') return "Rewatch";
    if (['notes', 'textbook', 'pdf', 'slides'].includes(t)) return "Review Notes";
    if (['exercise', 'quiz', 'assignment', 'project'].includes(t)) return "Retry Practice";
    return "Revisit";
  };

  // CTA text
  const ctaText =
    isLocked ? 'Locked' :
    isCompleted ? getCompletedActionLabel(type) :
    isInProgress ? (lane === 'learn' ? 'Continue' : 'Resume') :
    lane === 'learn' ? (type === 'video' ? 'Watch' : 'Read') : 'Start';

  return (
    <button
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={`
        group relative w-full text-left rounded-xl border transition-all duration-200
        ${isLocked
          ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
          : `bg-white border-slate-200/80 ${config.bg} ${config.hoverBorder}
             shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]
             cursor-pointer active:scale-[0.995]`
        }
        ${isCompleted ? 'ring-1 ring-emerald-200/60' : ''}
      `}
    >
      {/* Left accent stripe */}
      <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${config.accent} ${isLocked ? 'opacity-30' : 'opacity-60 group-hover:opacity-100'} transition-opacity`} />

      <div className="flex items-start gap-3.5 p-4 pl-5">
        {/* Icon */}
        <div className={`mt-0.5 flex-shrink-0 p-2 rounded-lg ${isCompleted ? 'bg-emerald-50' : 'bg-slate-50'} transition-colors group-hover:scale-105`}>
          {isCompleted
            ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
            : isLocked
              ? <Lock className="w-4.5 h-4.5 text-slate-400" />
              : <Icon className={`w-4.5 h-4.5 ${config.accentText} opacity-70`} />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h5 className={`text-[15px] font-semibold leading-snug mb-1 transition-colors ${
            isCompleted ? 'text-slate-600' : 'text-slate-900 group-hover:text-slate-800'
          }`}>
            {title}
          </h5>

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${config.accentText} opacity-80`}>
              {config.label}
            </span>
            {duration && (
              <>
                <span className="text-slate-300 text-[10px]">·</span>
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />{duration}
                </span>
              </>
            )}
            {isOverdue && (
              <>
                <span className="text-slate-300 text-[10px]">·</span>
                <span className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />Overdue
                </span>
              </>
            )}
          </div>

          {/* Progress bar (inline, subtle) */}
          {hasProgress && !isCompleted && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${config.accent}`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 tabular-nums">{completionPercentage}%</span>
            </div>
          )}
        </div>

        {/* CTA / Status */}
        <div className="flex-shrink-0 flex items-center gap-2 mt-1">
          {/* Badge */}
          {badge === 'teacher_assigned' && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100">
              <UserIcon className="w-3 h-3" />Assigned
            </span>
          )}
          {badge === 'ai_recommended' && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
              <Sparkles className="w-3 h-3" />Suggested
            </span>
          )}

          {/* CTA button */}
          {!isLocked && (
            <span className={`
              inline-flex items-center gap-1 text-[12px] font-semibold px-3.5 py-1.5 rounded-lg
              transition-all duration-200 whitespace-nowrap
              ${isCompleted
                ? 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100'
                : `text-slate-600 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white`
              }
            `}>
              {ctaText}
              <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
