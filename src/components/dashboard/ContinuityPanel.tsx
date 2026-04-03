import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { FileText, Video, Play, BookOpen, Clock } from 'lucide-react';
import { useStudentContinuity } from '../../hooks/useStudentContinuity';
import { useNavigate } from 'react-router-dom';

export const ContinuityPanel: React.FC = () => {
  const { continuityState } = useStudentContinuity();
  const navigate = useNavigate();

  const { lastReadingResource, lastVideoResource } = continuityState;

  if (!lastReadingResource && !lastVideoResource) return null;

  const navigateToResource = (resourceId: string) => {
    // Navigate to a generic resource viewer or topic page
    // For demo purposes, we alert or route to library, since actual resource viewer is a modal or param
    navigate(`/dashboard/library?resource=${resourceId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {lastReadingResource && (
        <Card className="border border-indigo-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-white group">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-3 relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-0.5">{lastReadingResource.subject}</p>
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{lastReadingResource.title}</h4>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
               <div className="flex justify-between text-xs text-gray-500 font-medium">
                 <span>Progress</span>
                 <span>{Math.round(lastReadingResource.progressPercentage)}%</span>
               </div>
               <Progress value={lastReadingResource.progressPercentage} className="h-1.5" />
               <p className="text-[10px] text-gray-400 mt-1 flex items-center"><Clock className="w-3 h-3 mr-1" /> Last active: {new Date(lastReadingResource.lastActiveAt).toLocaleDateString()}</p>
            </div>

            <Button onClick={() => navigateToResource(lastReadingResource.id)} className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 shadow-none border border-indigo-200">
              <BookOpen className="w-4 h-4 mr-2" /> Continue Reading
            </Button>
          </CardContent>
        </Card>
      )}

      {lastVideoResource && (
        <Card className="border border-blue-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-white group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-3 relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">{lastVideoResource.subject}</p>
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{lastVideoResource.title}</h4>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
               <div className="flex justify-between text-xs text-gray-500 font-medium">
                 <span>Completion</span>
                 <span>{Math.round(lastVideoResource.progressPercentage)}%</span>
               </div>
               <Progress value={lastVideoResource.progressPercentage} className="h-1.5 indicator-blue-500" />
               <p className="text-[10px] text-gray-400 mt-1 flex items-center"><Clock className="w-3 h-3 mr-1" /> Last active: {new Date(lastVideoResource.lastActiveAt).toLocaleDateString()}</p>
            </div>

            <Button onClick={() => navigateToResource(lastVideoResource.id)} className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 shadow-none border border-blue-200">
              <Play className="w-4 h-4 mr-2" /> Continue Watching
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
