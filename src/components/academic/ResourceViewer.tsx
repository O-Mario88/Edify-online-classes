import React, { useRef, useEffect, useState } from 'react';
import { X, Maximize, Minimize, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { Resource } from '../../types';
import { useResourceEngagement } from '../../hooks/useResourceEngagement';

interface ResourceViewerProps {
  resource: Resource;
  studentId: string;
  onClose: (engagementSnapshot: any) => void;
}

export const ResourceViewer: React.FC<ResourceViewerProps> = ({ resource, studentId, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    activeTimeMinutes,
    completionPercentage,
    isCompleted,
    reportProgress,
    getEngagementSnapshot
  } = useResourceEngagement({
    studentId,
    resourceId: resource.id,
    assignedBy: 'system', // Default mock assignment state
  });

  // Handle PDF / Text Scroll Progress
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (resource.type === 'video') return;
    
    const target = e.target as HTMLDivElement;
    const scrollHeight = target.scrollHeight - target.clientHeight;
    if (scrollHeight <= 0) return;
    
    const scrolled = (target.scrollTop / scrollHeight) * 100;
    reportProgress(scrolled, target.scrollTop);
  };

  // Mock Video Progress (Simulation since we don't have real valid video URLs)
  useEffect(() => {
    if (resource.type === 'video') {
      const interval = setInterval(() => {
        // Simulate video progress: 5% per minute mocked for demo
        const next = activeTimeMinutes * 5; 
        reportProgress(next > 100 ? 100 : next, activeTimeMinutes * 60);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [resource.type, activeTimeMinutes, reportProgress]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleClose = () => {
    onClose(getEngagementSnapshot());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col pt-safe backdrop-blur-sm">
      {/* Header Bar */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-4 text-white min-w-0">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
            {resource.type === 'video' ? <PlayCircle className="text-indigo-400" /> : <div className="text-indigo-400 font-bold">{resource.format?.toUpperCase() || 'PDF'}</div>}
          </div>
          <div className="truncate">
            <h2 className="font-bold text-lg truncate pr-4">{resource.title}</h2>
            <p className="text-xs text-slate-400 truncate">{resource.authorName} • Internal Platform Viewer</p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Live Engagement Stats */}
          <div className="hidden sm:flex items-center gap-4 mr-4 text-xs font-medium bg-slate-800/50 py-1.5 px-3 rounded-full border border-slate-700">
            <div className="flex items-center text-slate-300">
              <Clock className="w-4 h-4 mr-1.5 text-indigo-400" />
              {activeTimeMinutes}m active
            </div>
            <div className="w-px h-4 bg-slate-700"></div>
            <div className={`flex items-center ${isCompleted ? 'text-green-400' : 'text-slate-300'}`}>
              <CheckCircle2 className={`w-4 h-4 mr-1.5 ${isCompleted ? 'text-green-400' : 'text-slate-500'}`} />
              {Math.round(completionPercentage)}% read
            </div>
          </div>

          <button onClick={toggleFullscreen} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          
          <div className="w-px h-6 bg-slate-800"></div>
          
          <button onClick={handleClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2 font-medium">
            Close <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        ref={containerRef}
        className="flex-1 bg-slate-950 overflow-hidden relative flex flex-col items-center justify-center"
      >
        {/* Progress Bar Top Edge */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 z-10">
          <div 
            className={`h-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-indigo-500'}`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {resource.type === 'video' ? (
          <div className="w-full h-full max-w-6xl mx-auto flex flex-col items-center justify-center p-4">
             {/* Mock Video Player container */}
             <div className="w-full aspect-video bg-black rounded-xl border border-slate-800 shadow-2xl flex items-center justify-center relative group overflow-hidden">
                {/* Simulated Content */}
                <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center">
                   <PlayCircle className="w-20 h-20 text-white/50 mb-4" />
                   <h3 className="text-white font-bold text-xl">{resource.title}</h3>
                   <p className="text-slate-400 mt-2 text-sm">Interactive Video Player Mock</p>
                </div>
                {/* Mock Controls */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                   <div className="w-full h-1.5 bg-white/20 rounded-full mb-4 overflow-hidden relative">
                      <div className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
                   </div>
                   <div className="flex justify-between text-xs text-white/70">
                      <span>{activeTimeMinutes}:00</span>
                      <span>Total Time Logged: {activeTimeMinutes}m</span>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div 
            ref={contentRef}
            onScroll={handleScroll}
            className="w-full h-full overflow-y-auto custom-scrollbar"
          >
            <div className="max-w-4xl mx-auto my-8 bg-white dark:bg-slate-900 shadow-2xl rounded-xl min-h-[150vh] p-8 sm:p-12 border border-slate-200 dark:border-slate-800 pb-24 relative overflow-hidden">
               {/* Binder rings visual */}
               <div className="absolute left-4 top-0 bottom-0 w-8 border-r border-dashed border-slate-200 dark:border-slate-700 opacity-50 flex items-center flex-col gap-32 py-12">
                 {[1,2,3,4,5,6].map(i => <div key={i} className="w-3 h-3 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-inner"></div>)}
               </div>

               <div className="pl-12">
                 <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-800 pb-6">{resource.title}</h1>
                 
                 <div className="prose prose-slate dark:prose-invert max-w-none prose-indigo">
                    <p className="lead text-lg text-slate-600 dark:text-slate-400">
                      This document is rendered securely within the Edify learning platform. Your reading time and progress are automatically synchronized with your learning profile.
                    </p>

                    <h3>Learning Objectives</h3>
                    <ul>
                      <li>Understand the core principles presented in this material.</li>
                      <li>Apply the concepts through interactive assessment components.</li>
                      <li>Review reference points accurately for exam preparation.</li>
                    </ul>

                    <h3>Content Section 1</h3>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p>
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>

                    {/* Spacer for scroll simulation */}
                    <div className="h-64 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-center my-8 border border-slate-100 dark:border-slate-800">
                       <span className="text-slate-400 font-medium">Chart or Diagram Here</span>
                    </div>

                    <h3>Content Section 2</h3>
                    <p>
                      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. 
                    </p>
                    <p>
                      Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
                    </p>
                 </div>

                 {isCompleted && (
                   <div className="mt-16 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                     <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                     <h3 className="text-lg font-bold text-green-800 dark:text-green-400">Section Completed</h3>
                     <p className="text-green-600 dark:text-green-500 text-sm mt-1">Your completion data has been synced to your learning profile.</p>
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
