import React from 'react';
import { Play, ClipboardList, CheckCircle2 } from 'lucide-react';
import { TopicContentCard, TopicContentCardProps } from './TopicContentCard';

// ────────────────────────────────────────────
// Section block: renders one pedagogical phase
// (e.g. "Introduction & Overview", "Worked Examples")
// ────────────────────────────────────────────

interface TopicSectionBlockProps {
  /** Section title, e.g. "Introduction & Overview" */
  title: string;
  /** Optional short description */
  description?: string;
  /** Section index (1-based) for numbering */
  index: number;
  /** Learn lane items (video, notes, slides, readings) */
  learnItems: TopicContentCardProps[];
  /** Practice lane items (exercise, quiz, assignment, project) */
  practiceItems: TopicContentCardProps[];
  /** Total items completed in this section */
  completedCount?: number;
  /** Total items in this section */
  totalCount?: number;
}

export const TopicSectionBlock: React.FC<TopicSectionBlockProps> = ({
  title,
  description,
  index,
  learnItems,
  practiceItems,
  completedCount = 0,
  totalCount = 0,
}) => {
  const allLearnDone = learnItems.length > 0 && learnItems.every(i => i.status === 'completed');
  const allPracticeDone = practiceItems.length > 0 && practiceItems.every(i => i.status === 'completed');
  const sectionDone = totalCount > 0 && completedCount >= totalCount;

  return (
    <section className="relative">
      {/* Section header */}
      <div className="flex items-start gap-4 mb-6">
        {/* Number pill */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
          ${sectionDone
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-500'
          }
        `}>
          {sectionDone ? <CheckCircle2 className="w-4 h-4" /> : index}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {title}
            </h2>
            {totalCount > 0 && (
              <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                {completedCount}/{totalCount} completed
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-500 mt-1 leading-relaxed max-w-xl">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent mb-6 ml-12" />

      {/* Two-lane layout: Learn | Practice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 ml-0 md:ml-12">
        {/* Learn column */}
        <div>
          {learnItems.length > 0 && (
            <>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                Learn
                {allLearnDone && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-1" />}
              </h3>
              <div className="space-y-3">
                {learnItems.map((item) => (
                  <TopicContentCard key={item.id} {...item} lane="learn" />
                ))}
              </div>
            </>
          )}

          {learnItems.length === 0 && practiceItems.length > 0 && (
            <div className="flex items-center justify-center h-full min-h-[80px] rounded-xl border border-dashed border-slate-200 text-sm text-slate-300">
              No learning materials
            </div>
          )}
        </div>

        {/* Practice column */}
        <div>
          {practiceItems.length > 0 && (
            <>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8e8268] mb-3 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5" />
                Practice
                {allPracticeDone && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-1" />}
              </h3>
              <div className="space-y-3">
                {practiceItems.map((item) => (
                  <TopicContentCard key={item.id} {...item} lane="practice" />
                ))}
              </div>
            </>
          )}

          {practiceItems.length === 0 && learnItems.length > 0 && (
            <div className="flex items-center justify-center h-full min-h-[80px] rounded-xl border border-dashed border-slate-200 text-sm text-slate-300">
              No practice items
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
