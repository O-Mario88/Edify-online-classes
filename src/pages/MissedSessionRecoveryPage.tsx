import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { VideoOff, PlayCircle, FileText, ChevronRight, AlertTriangle, CheckCircle, GraduationCap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { toast } from 'sonner';
import { apiClient } from '../lib/apiClient';

export const MissedSessionRecoveryPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecovery = async () => {
      try {
        const { data, error } = await apiClient.get(`/live-sessions/missed-recovery/?session=${sessionId}`);
        if (!error && data) {
          // If it returns an array, take the first one; else use the object directly
          const apiData = Array.isArray(data) && data.length > 0 ? data[0] : (Array.isArray(data) ? null : data);
          if (apiData && Object.keys(apiData).length > 0) {
            setSessionData(apiData);
          } else {
            console.warn('No recovery record found for this session');
            setSessionData(null);
          }
        } else {
            console.warn('Failed to fetch from backend', error);
            setSessionData(null);
        }
      } catch (err) {
        console.error('Failed to fetch session recovery', err);
        setSessionData(null);
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) fetchRecovery();
  }, [sessionId]);

  if (loading) return <div className="p-8 text-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div><p className="text-gray-600">Loading recovery module...</p></div>;

  if (!sessionData) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <GraduationCap className="w-16 h-16 text-indigo-300 mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">No Recovery Required</h2>
      <p className="text-gray-500 mb-6 max-w-md text-center">There are no mandatory recovery assignments for this session, or the session ID is invalid.</p>
      <Button onClick={() => navigate('/dashboard')} variant="outline">Return to Dashboard</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header (Red alert style for attention, transitioning to recovery) */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
           <div className="p-3 bg-red-100 rounded-lg text-red-600 shrink-0">
             <VideoOff className="w-8 h-8" />
           </div>
           <div>
             <h1 className="text-2xl font-bold text-red-900">Missed Session Recovery</h1>
             <p className="text-red-700 mt-1">You missed the live session for <strong>{sessionData.subject}: {sessionData.topic}</strong> with {sessionData.host_name}. Completion of this recovery module is required to maintain your readiness score.</p>
           </div>
        </div>

        {/* Action Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           
           {/* Summary & Recording */}
           <Card className="md:col-span-2 shadow-sm border-blue-100">
             <CardHeader className="border-b bg-blue-50/30 pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <PlayCircle className="w-5 h-5 text-blue-600" />
                  Step 1: Review Session Materials
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Teacher's Session Summary</h4>
                  <p className="text-gray-600 text-sm p-4 bg-gray-50 rounded-lg border italic">
                    "{sessionData.summary || 'Ensure you review the required notes below.'}"
                  </p>
                </div>
                
                {sessionData.recording_url ? (
                  <div onClick={() => {
                     // Simulate Broken Link Check
                     if (sessionData.recording_url.includes('drive.google.com') || sessionData.recording_url.includes('broken')) {
                        toast.error('External Media Blocked', { description: 'Google Drive Video Not Found or Permissions Restricted.' });
                        setSessionData({ ...sessionData, recording_url: null, drive_error: true });
                     } else {
                        window.open(sessionData.recording_url, '_blank');
                     }
                  }} className="bg-gray-900 rounded-xl aspect-video flex flex-col items-center justify-center border border-gray-800 shadow-inner group cursor-pointer hover:bg-black transition-colors">
                     <PlayCircle className="w-16 h-16 text-white/60 group-hover:text-white transition-colors mb-4" />
                     <p className="text-white font-medium">Verify & Play Session Recording</p>
                     <p className="text-gray-400 text-xs mt-1">Duration: 45m</p>
                  </div>
                ) : sessionData.drive_error ? (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <AlertTitle>No Access to Recording</AlertTitle>
                    <AlertDescription className="text-red-700 text-sm mb-3">
                      The recording link provided by the teacher is private or broken. You need access to proceed.
                    </AlertDescription>
                    <Button variant="outline" size="sm" onClick={() => toast.success('Pinged Teacher for Access', { description: 'An urgent reminder has been sent.' })}>
                       Ping Teacher for Access
                    </Button>
                  </Alert>
                ) : (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <AlertTitle>No Recording Available</AlertTitle>
                    <AlertDescription className="text-yellow-700 text-sm">
                      A recording for this session was not uploaded. Please review the attached notes below instead.
                    </AlertDescription>
                  </Alert>
                )}
             </CardContent>
           </Card>

           {/* Next Steps / Recovery Requirements */}
           <div className="space-y-6">
             <Card className="shadow-sm border-indigo-100">
               <CardHeader className="border-b bg-indigo-50/30 pb-4">
                  <CardTitle className="flex items-center gap-2 text-indigo-900 text-base">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Step 2: Required Work
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-4 space-y-4">
                  <p className="text-sm text-gray-600">To fully recover your attendance points for this module, complete the following:</p>
                  
                  <div className="space-y-3">
                    {sessionData.assignments && sessionData.assignments.length > 0 ? sessionData.assignments.map((assignment: any) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-3">
                           <FileText className="w-4 h-4 text-indigo-500" />
                           <span className="text-sm font-semibold text-gray-900">{assignment.title}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    )) : (
                      <div className="p-3 text-sm text-gray-500 border border-dashed rounded-lg text-center">No assignments listed.</div>
                    )}
                  </div>

                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Submit Recovery Work</Button>
               </CardContent>
             </Card>

             <Card className="shadow-sm bg-green-50/50 border-green-200">
               <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <h4 className="font-bold text-green-900">Done early?</h4>
                  <p className="text-xs text-green-800">Once you submit the required work, your learning trajectory will automatically adjust back to baseline.</p>
                  <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full mt-2 border-green-300 text-green-700 hover:bg-green-50">
                    Return to Dashboard
                  </Button>
               </CardContent>
             </Card>
           </div>
        </div>
      </div>
    </div>
  );
};
