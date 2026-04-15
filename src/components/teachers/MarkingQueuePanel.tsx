import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileDown, CheckCircle2, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { useAssignmentSubmissions } from '../../hooks/useAssignmentSubmissions';
import { Badge } from '../ui/badge';

export const MarkingQueuePanel: React.FC = () => {
  const { submissions, markAsGraded } = useAssignmentSubmissions();

  const pending = submissions.filter(s => s.status === 'pending_grading');

  return (
    <Card className="backdrop-blur-xl bg-white/90 border-slate-200/50 shadow-sm relative overflow-hidden group h-full flex flex-col">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <FileDown className="w-32 h-32" />
      </div>
      
      <CardHeader className="pb-4 shrink-0">
        <CardTitle className="text-xl font-bold flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          Pending Marking Queue
          {pending.length > 0 && (
            <Badge className="ml-auto bg-orange-100 text-orange-700 hover:bg-orange-200 border-none shrink-0">
              {pending.length} New
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1 overflow-y-auto">
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-700 h-full">
            <CheckCircle2 className="w-12 h-12 text-slate-200 mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">All caught up!</h3>
            <p className="text-xs mt-1">No pending student assignment submissions.</p>
          </div>
        ) : (
          pending.map(sub => (
            <div key={sub.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"></div>
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{sub.studentName}</h4>
                  <p className="text-xs text-slate-700 font-medium">{sub.resourceTitle} • {sub.subject}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-800 uppercase tracking-widest font-black block mb-1">Auto Score</span>
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-none px-2 py-0.5 text-xs font-bold">
                    {sub.mcqScore}/{sub.maxScore}
                  </Badge>
                </div>
              </div>
              
              {sub.fileUrl && (
                <div className="mt-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center shrink-0">
                    <FileDown className="w-3 h-3 text-indigo-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{sub.fileUrl}</p>
                    <p className="text-[9px] text-slate-800">Needs manual grading</p>
                  </div>
                  <button 
                    onClick={() => markAsGraded(sub.id)}
                    className="text-[10px] font-bold px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors shrink-0"
                  >
                    Grade Now
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
