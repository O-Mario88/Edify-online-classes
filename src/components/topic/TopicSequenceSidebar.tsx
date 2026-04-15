import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Menu, X } from 'lucide-react';

// ────────────────────────────────────────────
// Left sequence sidebar for topic navigation
// Shows all topics in the current subject
// ────────────────────────────────────────────

interface SequenceTopic {
  id: string;
  name: string;
  /** 0 = not started, 1-99 = in progress, 100 = complete */
  completionPercentage?: number;
}

interface TopicSequenceSidebarProps {
  /** List of all topics in this subject (ordered) */
  topics: SequenceTopic[];
  /** Currently active topic ID */
  activeTopicId: string;
  /** Navigation callback */
  onTopicSelect: (topicId: string) => void;
  /** Subject name for label */
  subjectName?: string;
}

export const TopicSequenceSidebar: React.FC<TopicSequenceSidebarProps> = ({
  topics,
  activeTopicId,
  onTopicSelect,
  subjectName,
}) => {
  const activeIndex = topics.findIndex(t => t.id === activeTopicId);

  return (
    <nav className="space-y-1" aria-label="Topic sequence">
      {/* Header */}
      <div className="px-3 pb-4 mb-2">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-0.5">
          Sequence Overview
        </h4>
        {subjectName && (
          <p className="text-[12px] font-medium text-slate-500 truncate">{subjectName}</p>
        )}
      </div>

      {/* Topic list */}
      <div className="space-y-0.5">
        {topics.map((topic, index) => {
          const isActive = topic.id === activeTopicId;
          const isCompleted = (topic.completionPercentage ?? 0) >= 100;
          const isInProgress = (topic.completionPercentage ?? 0) > 0 && !isCompleted;
          const isPast = index < activeIndex;

          return (
            <button
              key={topic.id}
              onClick={() => onTopicSelect(topic.id)}
              className={`
                w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl
                transition-all duration-200 group relative
                ${isActive
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/15'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/80 hover:shadow-sm'
                }
              `}
            >
              {/* Number / status indicator */}
              <div className={`
                flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold
                transition-colors duration-200
                ${isActive
                  ? 'bg-white/15 text-white'
                  : isCompleted
                    ? 'bg-emerald-50 text-emerald-600'
                    : isInProgress
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500'
                }
              `}>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Topic name */}
              <span className={`
                flex-1 min-w-0 text-[13px] font-medium leading-snug truncate
                ${isActive ? 'font-semibold' : ''}
              `}>
                {topic.name}
              </span>

              {/* Progress dot (only for in-progress, non-active) */}
              {isInProgress && !isActive && (
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}

              {/* Active indicator */}
              {isActive && (
                <ChevronRight className="flex-shrink-0 w-4 h-4 text-white/50" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// ────────────────────────────────────────────
// Mobile drawer wrapper for the sidebar
// ────────────────────────────────────────────

interface MobileSequenceDrawerProps {
  topics: SequenceTopic[];
  activeTopicId: string;
  onTopicSelect: (topicId: string) => void;
  subjectName?: string;
  activeTopicName: string;
  currentIndex: number;
  totalTopics: number;
}

export const MobileSequenceDrawer: React.FC<MobileSequenceDrawerProps> = ({
  topics,
  activeTopicId,
  onTopicSelect,
  subjectName,
  activeTopicName,
  currentIndex,
  totalTopics,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (topicId: string) => {
    onTopicSelect(topicId);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      {/* Trigger bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-xl px-4 py-3 shadow-sm mb-6"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[12px] font-bold">
            {currentIndex + 1}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              Topic {currentIndex + 1} of {totalTopics}
            </p>
            <p className="text-[14px] font-semibold text-slate-900 truncate">{activeTopicName}</p>
          </div>
        </div>
        <Menu className="w-5 h-5 text-slate-400 flex-shrink-0" />
      </button>

      {/* Drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div
            className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl p-5 pt-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-900">Topic Sequence</h3>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <TopicSequenceSidebar
              topics={topics}
              activeTopicId={activeTopicId}
              onTopicSelect={handleSelect}
              subjectName={subjectName}
            />
          </div>
        </div>
      )}
    </div>
  );
};
