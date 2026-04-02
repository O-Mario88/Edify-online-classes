import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Video, FileText, UploadCloud, PlusCircle, Clock, 
  CheckCircle, Paperclip, ChevronLeft, Calendar as CalendarIcon, MessageSquare
} from 'lucide-react';

export const TeacherLessonStudio: React.FC = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lessons');
  const [isUploading, setIsUploading] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Mock class context
  const targetClass = {
    id: classId,
    title: 'Senior 3 East Biology',
    institution: 'Kampala Model High School',
    studentCount: 42,
    completionRate: 68
  };

  const provisionWebinar = async () => {
    setIsProvisioning(true);
    try {
        // Normally we use apiClient, using fetch for the mock test to avoid import errors
        // const res = await apiClient.post('/live-sessions/provision-webinar/', { title: targetClass.title });
        alert("Simulating API Call to /api/v1/live-sessions/provision-webinar/...");
        setTimeout(() => {
          alert('Backend Proxy Success! Meeting Allocated: https://meet.google.com/abc-xzyq-pqr');
          setIsProvisioning(false);
        }, 1000);
    } catch(err) {
        setIsProvisioning(false);
        alert('Failed to provision: User must belong to active institution.');
    }
  };

  const lessonTimeline = [
    { id: 1, title: 'Introduction to Cell Structure', status: 'published', date: 'Oct 02', hasNotes: true, hasVideo: true, attachments: 2 },
    { id: 2, title: 'Plant vs Animal Cells', status: 'published', date: 'Oct 04', hasNotes: true, hasVideo: false, attachments: 1 },
    { id: 3, title: 'Cellular Respiration (Theory)', status: 'draft', date: 'Oct 09', hasNotes: false, hasVideo: false, attachments: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      
      {/* Top Navigation Strip */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/teacher')} className="text-gray-500 hover:text-gray-900">
               <ChevronLeft className="h-5 w-5" />
             </Button>
             <div>
               <h1 className="text-xl font-bold text-gray-900">{targetClass.title}</h1>
               <div className="text-xs text-gray-500 font-medium flex items-center mt-1">
                 <BookOpen className="w-3 h-3 mr-1" /> {targetClass.institution} <span className="mx-2">•</span> {targetClass.studentCount} active students
               </div>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100" onClick={provisionWebinar} disabled={isProvisioning}>
               <CalendarIcon className="w-4 h-4 mr-2" /> {isProvisioning ? 'Provisioning...' : 'Live Schedule'}
             </Button>
             <Button onClick={() => console.log('Create lesson dialog...')}>
               <PlusCircle className="w-4 h-4 mr-2" /> New Lesson
             </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="bg-gray-100/80 mb-6">
            <TabsTrigger value="timeline" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">Lesson Delivery Timeline</TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">Class Resource Vault</TabsTrigger>
            <TabsTrigger value="assessments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 text-green-700">Exam Engine</TabsTrigger>
            <TabsTrigger value="discussions" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">Class Forums</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-6">
            <Card className="shadow-sm border-t-4 border-t-blue-500">
              <CardHeader className="bg-blue-50/30 border-b pb-4">
                <CardTitle className="text-lg">Upcoming & Active Modules</CardTitle>
                <CardDescription>Drag and drop to reorder the curriculum flow for your students.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {lessonTimeline.map((lesson, idx) => (
                    <div key={lesson.id} className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center hover:bg-gray-50/50 transition-colors">
                      
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold">
                        {idx + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-gray-900">{lesson.title}</h3>
                          {lesson.status === 'published' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">Published</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">Draft</span>
                          )}
                        </div>
                        <div className="flex flex-wrap text-sm text-gray-500 gap-4 mt-2">
                           <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Scheduled: {lesson.date}</span>
                           {lesson.hasNotes && <span className="flex items-center text-blue-600"><FileText className="w-3.5 h-3.5 mr-1" /> Bound Notes</span>}
                           {lesson.hasVideo && <span className="flex items-center text-purple-600"><Video className="w-3.5 h-3.5 mr-1" /> Recording Embedded</span>}
                           {lesson.attachments > 0 && <span className="flex items-center text-orange-600"><Paperclip className="w-3.5 h-3.5 mr-1" /> {lesson.attachments} Attachments</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 md:mt-0">
                         <Button variant="outline" size="sm" className="hidden lg:flex">Edit Syllabus</Button>
                         <Button size="sm" className="bg-gray-900 text-white" disabled={lesson.status === 'published'}>
                           <UploadCloud className="w-4 h-4 mr-2" /> Publish Notes
                         </Button>
                      </div>

                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-6">
                <Button variant="outline" className="border-dashed border-2 px-8 py-8 h-auto flex flex-col items-center">
                    <PlusCircle className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="font-medium text-gray-600">Append New Lesson Module</span>
                </Button>
            </div>
          </TabsContent>

          <TabsContent value="resources">
             <Card className="shadow-sm py-16 text-center border-dashed border-2 bg-gray-50">
                <div className="max-w-sm mx-auto">
                   <div className="bg-white p-4 rounded-full shadow-sm w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Paperclip className="w-8 h-8 text-blue-500" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">Class Resource Vault</h3>
                   <p className="text-gray-500 mb-6 font-medium text-sm">
                     Upload syllabi, PDF handouts, and past papers explicitly partitioned to the Senior 3 East Biology roster.
                   </p>
                   <Button onClick={() => setIsUploading(true)}>
                     <UploadCloud className="w-4 h-4 mr-2" /> {isUploading ? 'Uploading...' : 'Select Files to Upload'}
                   </Button>
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="assessments">
             <Card className="shadow-sm py-16 text-center border-dashed border-2 bg-gray-50">
                <div className="max-w-sm mx-auto">
                   <div className="bg-white p-4 rounded-full shadow-sm w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">Assessment & Exams Engine</h3>
                   <p className="text-gray-500 mb-6 font-medium text-sm">
                     Create timed quizzes or standard assignments. The system will auto-grade objective MCQ questions and update the UNEB Readiness scores.
                   </p>
                   <Button onClick={() => console.log('Open Quiz Creator...')}>
                     <PlusCircle className="w-4 h-4 mr-2" /> Create New Assessment
                   </Button>
                </div>
             </Card>
          </TabsContent>
          
          <TabsContent value="discussions">
             <Card className="shadow-sm py-16 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Student Q&A Nexus</h3>
                <p className="text-gray-500">Coming later in MVP phase.</p>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
