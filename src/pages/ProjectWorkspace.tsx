import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Award, FileText, MessageCircle, MapPin, ArrowLeft, Users, CheckCircle, Upload } from 'lucide-react';
import { Progress } from '../components/ui/progress';

export const ProjectWorkspace: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [uploading, setUploading] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  // Mock project data based on the id
  const projectTitle = id === '1' ? 'Solar Power for Schools' : id === '2' ? 'Mobile Banking App Design' : 'Collaborative Project';
  const progressValue = id === '1' ? 65 : id === '2' ? 40 : 100;
  const isCompleted = progressValue === 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button 
            onClick={() => navigate('/projects')}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects Hub
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Active Workspace</Badge>
                {isCompleted && <Badge className="bg-emerald-100 text-emerald-700 border-none"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{projectTitle}</h1>
              <p className="text-slate-500 mt-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" /> Kampala Region Team
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[250px]">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-700">Project Completion</span>
                <span className="text-lg font-black text-blue-600">{progressValue}%</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-white border p-1 rounded-xl shadow-sm inline-flex h-auto">
               <TabsTrigger value="overview" className="py-2.5 px-6 rounded-lg text-sm font-semibold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Workspace Details</TabsTrigger>
               <TabsTrigger value="chat" className="py-2.5 px-6 rounded-lg text-sm font-semibold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Team Chat</TabsTrigger>
               <TabsTrigger value="docs" className="py-2.5 px-6 rounded-lg text-sm font-semibold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border shadow-sm">
                      <h2 className="text-xl font-bold mb-4">Project Brief</h2>
                      <p className="text-slate-600 leading-relaxed max-w-3xl">
                        This is an active collaborative learning space. Your team is tasked with assessing the feasibility of implementing solar resources in off-grid educational contexts. Coordinate below, upload research documents, and utilize the team chat to prepare your final submission.
                      </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border shadow-sm">
                       <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
                         Deliverables
                         <Button variant="outline" size="sm" onClick={() => setUploading(true)}>
                           <Upload className="w-4 h-4 mr-2" /> {uploading ? 'Uploading...' : 'Upload File'}
                         </Button>
                       </h2>
                       <div className="space-y-4">
                         {/* Mock Deliverable Items */}
                         <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50">
                            <div className="flex items-center gap-3">
                               <FileText className="w-8 h-8 text-rose-500" />
                               <div>
                                 <h4 className="font-bold text-slate-800">Initial Research Outline.pdf</h4>
                                 <p className="text-xs text-slate-500">Uploaded by Grace Nakato • 2 days ago</p>
                               </div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 border-none">Approved</Badge>
                         </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border shadow-sm">
                       <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                         <Users className="w-4 h-4 text-blue-600" /> Team Members
                       </h3>
                       <ul className="space-y-4">
                         <li className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">You</div>
                           <span className="font-semibold text-slate-700 text-sm">You (Lead)</span>
                         </li>
                         {['Grace Nakato', 'David Musoke', 'Teacher Kaggwa (Mentor)'].map(name => (
                            <li key={name} className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">{name[0]}</div>
                               <span className="font-medium text-slate-700 text-sm">{name}</span>
                            </li>
                         ))}
                       </ul>
                    </div>

                    {isCompleted && (
                       <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl shadow-sm text-center">
                          <Award className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                          <h3 className="font-bold text-emerald-900 mb-2">Project Completed</h3>
                          <p className="text-sm text-emerald-700 mb-4">Your team achieved an outstanding mark of 92% on this real-world application.</p>
                          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowCertModal(true)}>
                            View Certificate
                          </Button>
                       </div>
                    )}
                 </div>
               </div>
            </TabsContent>

            <TabsContent value="chat">
               <div className="bg-white border rounded-3xl flex flex-col h-[600px] shadow-sm overflow-hidden">
                  <div className="p-4 border-b bg-slate-50 font-bold text-slate-800 flex items-center gap-2">
                     <MessageCircle className="w-5 h-5 text-blue-600" /> Team Discussion Board
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto space-y-6">
                     <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
                        <div>
                           <div className="flex items-baseline gap-2">
                              <span className="font-bold text-sm text-slate-900">David Musoke</span>
                              <span className="text-xs text-slate-400">10:45 AM</span>
                           </div>
                           <p className="p-3 bg-slate-100 rounded-2xl rounded-tl-none mt-1 text-sm text-slate-700">Has anyone found the localized cost data for the panel units yet?</p>
                        </div>
                     </div>
                  </div>
                  <div className="p-4 border-t bg-slate-50">
                     <div className="flex gap-2">
                        <input className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Message your team..." />
                        <Button className="rounded-full px-6">Send</Button>
                     </div>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="docs">
               <div className="bg-white p-8 rounded-3xl border shadow-sm text-center">
                   <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                   <h2 className="text-xl font-bold text-slate-800 mb-2">Document Repository</h2>
                   <p className="text-slate-500 max-w-md mx-auto mb-6">Centralized storage for all project files, drafts, references, and final submission artifacts.</p>
                   <Button variant="outline" onClick={() => setUploading(true)}><Upload className="w-4 h-4 mr-2"/> Upload New File</Button>
               </div>
            </TabsContent>
         </Tabs>
      </div>

      {showCertModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl p-10 text-center shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-emerald-400 to-teal-500" />
               <button onClick={() => setShowCertModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 text-xl font-black">&times;</button>
               
               <Award className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
               <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Certificate of Completion</h2>
               <h1 className="text-4xl font-bold text-slate-900 mb-6 font-serif tracking-tight">Real-World Application</h1>
               <p className="text-lg text-slate-600 mb-8">
                  This certifies that <strong className="text-slate-900">{user?.name || 'Student'}</strong> has successfully completed the collaborative project <strong>{projectTitle}</strong>.
               </p>
               <div className="pt-8 border-t border-slate-100 flex justify-between items-end px-12">
                  <div className="text-left">
                     <div className="w-32 border-b-2 border-slate-900 mb-2" />
                     <p className="text-xs font-bold uppercase text-slate-500">Program Director</p>
                  </div>
                  <div className="text-right">
                     <p className="font-bold text-slate-900">Maple Online School</p>
                     <p className="text-xs text-slate-500">Issued Verification</p>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default ProjectWorkspace;
