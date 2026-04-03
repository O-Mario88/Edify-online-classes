import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { BookOpen, Play, CheckCircle2, FileText, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_ASSIGNED_RESOURCES = [
  {
    id: 'res-1',
    title: 'Calculus: Limits summary',
    type: 'notes',
    subject: 'Mathematics',
    completionPercentage: 45,
    dueDate: '2026-04-10'
  },
  {
    id: 'vid-2',
    title: 'Biology Practical: Dissection',
    type: 'video',
    subject: 'Biology',
    completionPercentage: 10,
    dueDate: '2026-04-12'
  }
];

export const StudentResourceEngagementPanel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="mb-8 border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-50 to-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Continue Learning
        </CardTitle>
        <p className="text-sm text-slate-500">Pick up where you left off on your assigned reading and video materials.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_ASSIGNED_RESOURCES.map((resource, idx) => (
            <div key={idx} className="bg-white border rounded-xl p-4 shadow-sm hover:border-indigo-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg shrink-0 ${resource.type === 'video' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    {resource.type === 'video' ? <PlayCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{resource.subject}</span>
                </div>
                <h4 className="font-bold text-slate-900 leading-tight mb-1">{resource.title}</h4>
                <p className="text-xs text-slate-500 mb-4">Assigned • Due {resource.dueDate}</p>
                
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>Progress</span>
                    <span>{resource.completionPercentage}%</span>
                  </div>
                  <Progress value={resource.completionPercentage} className={`h-1.5 ${resource.type === 'video' ? '[&>div]:bg-red-500' : '[&>div]:bg-blue-500'}`} />
                </div>
              </div>
              
              <Button 
                onClick={() => navigate('/library')} 
                className={`w-full gap-2 ${resource.type === 'video' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {resource.type === 'video' ? 'Continue Watching' : 'Continue Reading'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
