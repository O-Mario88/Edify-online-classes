import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { FileText, Video, AlertCircle, Clock, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { ResourceAnalyticsSummary } from '../../types';

// Mock Data
const MOCK_RESOURCE_ANALYTICS = [
  {
    resourceId: 'res-1',
    title: 'Comprehensive Topic Summary Notes',
    type: 'notes',
    assignedStudentsCount: 42,
    openedByCount: 38,
    completedByCount: 25,
    averageActiveTimeMins: 45,
    averageCompletionPercentage: 78,
    missingStudents: ['Sarah Nakato', 'David Musoke', 'John Opio', 'Mary Akello']
  },
  {
    resourceId: 'vid-2',
    title: 'Video Lesson: Number Bases Part 1',
    type: 'video',
    assignedStudentsCount: 42,
    openedByCount: 42,
    completedByCount: 40,
    averageActiveTimeMins: 22, // It's a 20 min video
    averageCompletionPercentage: 96,
    missingStudents: []
  }
];

export const TeacherResourceEngagementPanel: React.FC = () => {
  return (
    <Card className="mb-8 border-indigo-100 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Assigned Resource Engagement
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">Track how long students are actively reading or watching assigned materials.</p>
          </div>
          <Button variant="outline" size="sm">View Full Analytics</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {MOCK_RESOURCE_ANALYTICS.map((analytics, idx) => (
            <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
               <div className="flex flex-col md:flex-row gap-6">
                 {/* Resource Info */}
                 <div className="md:w-1/3 space-y-2">
                   <div className="flex items-start gap-3">
                     <div className={`p-2 rounded-lg shrink-0 ${analytics.type === 'video' ? 'bg-red-50' : 'bg-blue-50'}`}>
                       {analytics.type === 'video' ? <Video className="w-5 h-5 text-red-600" /> : <FileText className="w-5 h-5 text-blue-600" />}
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-900">{analytics.title}</h4>
                       <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs bg-white text-slate-600 border-slate-200">
                            Assigned to S1 Math
                          </Badge>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Engagement Metrics */}
                 <div className="md:w-1/3 grid grid-cols-2 gap-4">
                    <div className="bg-white border rounded-lg p-3 text-center">
                       <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Opened By</p>
                       <p className="text-2xl font-black text-slate-800">{analytics.openedByCount}<span className="text-sm font-medium text-slate-400">/{analytics.assignedStudentsCount}</span></p>
                    </div>
                    <div className="bg-white border rounded-lg p-3 text-center">
                       <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Avg Active Time</p>
                       <p className="text-2xl font-black text-slate-800">{analytics.averageActiveTimeMins}<span className="text-sm font-medium text-slate-400">m</span></p>
                    </div>
                 </div>

                 {/* Completion & Issues */}
                 <div className="md:w-1/3 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">Completion</span>
                        <span className="font-bold text-slate-900">{analytics.averageCompletionPercentage}%</span>
                      </div>
                      <Progress value={analytics.averageCompletionPercentage} className="h-2 bg-slate-100" />
                    </div>

                    {analytics.missingStudents.length > 0 ? (
                      <div className="bg-orange-50 text-orange-800 p-2 text-xs rounded border border-orange-100 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" />
                        <div>
                          <span className="font-bold">{analytics.missingStudents.length} students</span> have not opened this yet (e.g. {analytics.missingStudents[0]}).
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-50 text-green-800 p-2 text-xs rounded border border-green-100 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                        <div>All students have accessed this resource!</div>
                      </div>
                    )}
                 </div>
               </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
