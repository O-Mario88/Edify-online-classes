import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Search, Filter, UploadCloud, FileText, 
  Video, FileVideo, Download, Share2, FolderOpen, AlertCircle, Library, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_LIBRARY = [
  {
    id: 1,
    title: "Intro to Calculus: Limits & Continuity",
    subject: "Mathematics",
    classTarget: "A-Level",
    topic: "Calculus",
    format: "pdf",
    visibility: "platform_shared",
    author: "Mr. Sekabira",
    downloads: 1240,
    rating: 4.8,
    tags: ["Revision", "Core Concept"],
    official: true
  },
  {
    id: 2,
    title: "Titration Practical Guide (NCDC Approved)",
    subject: "Chemistry",
    classTarget: "S4",
    topic: "Volumetric Analysis",
    format: "video",
    visibility: "institution_only",
    author: "Ms. Namuli",
    downloads: 312,
    rating: 4.5,
    tags: ["Practical", "UNEB Prep"],
    official: false
  },
  {
    id: 3,
    title: "History Question Bank 2015-2023",
    subject: "History",
    classTarget: "O-Level",
    topic: "East African History",
    format: "pdf",
    visibility: "platform_shared",
    author: "Edify Admin",
    downloads: 5040,
    rating: 4.9,
    tags: ["Past Papers", "Exams"],
    official: true
  }
];

export function AcademicLibraryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 md:py-0 mb-4 border-b border-slate-200 dark:border-slate-800 md:pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
             <Library className="w-8 h-8 text-indigo-600" /> Academic Resource Library
          </h1>
          <p className="text-slate-500 mt-1">Intelligent vault for textbooks, revision packs, and intervention media.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white dark:bg-slate-900 border-slate-200 shadow-sm">
             <FolderOpen className="w-4 h-4" /> My Uploads
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <UploadCloud className="w-4 h-4" /> Deposit Resource
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 top-0">
        
        {/* Left Sidebar: Filters */}
        <div className="space-y-6">
          <Card className="border border-slate-200 shadow-sm sticky top-6">
            <CardHeader className="pb-4 border-b bg-slate-50">
               <CardTitle className="flex items-center gap-2 text-md">
                 <Filter className="w-4 h-4 text-slate-500" /> Refine Resources
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subject Domain</label>
                 <Select>
                   <SelectTrigger className="w-full bg-white">
                     <SelectValue placeholder="All Subjects" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="math">Mathematics</SelectItem>
                     <SelectItem value="chem">Chemistry</SelectItem>
                     <SelectItem value="phys">Physics</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Target Class</label>
                 <Select>
                   <SelectTrigger className="w-full bg-white">
                     <SelectValue placeholder="Any Class" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="s1">S1</SelectItem>
                     <SelectItem value="s4">S4</SelectItem>
                     <SelectItem value="alevel">A-Level</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Resource Format</label>
                 <Select>
                   <SelectTrigger className="w-full bg-white">
                     <SelectValue placeholder="Any Format" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="pdf">PDF Docs & Worksheets</SelectItem>
                     <SelectItem value="video">Recorded Video Lessons</SelectItem>
                     <SelectItem value="interactive">Interactive Quizzes</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Official NCDC Only</span>
                  {/* Pseudo switch */}
                  <div className="w-10 h-5 bg-slate-200 rounded-full flex items-center p-1 cursor-pointer hover:bg-slate-300">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Pane */}
        <div className="lg:col-span-3 space-y-6">
           
           <Tabs defaultValue="explore" className="w-full">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <TabsList className="bg-slate-100/80 p-1">
                   <TabsTrigger value="explore" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Global Repository</TabsTrigger>
                   <TabsTrigger value="intervention" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Intervention Vault</TabsTrigger>
                   <TabsTrigger value="institution" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">School Vault</TabsTrigger>
                </TabsList>
                
                <div className="relative w-full md:w-72">
                   <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                   <Input 
                     className="pl-9 bg-white border-slate-200" 
                     placeholder="Search topics, authors, or files..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
              </div>

              <TabsContent value="explore" className="mt-0 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MOCK_LIBRARY.map((item) => (
                      <Card key={item.id} className="border-slate-200 hover:shadow-md transition-all group flex flex-col h-full overflow-hidden">
                        <div className="h-2 w-full bg-indigo-500"></div>
                        <CardHeader className="pb-3 pt-4 flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="bg-slate-50 text-xs">
                              {item.format === 'pdf' ? <FileText className="w-3 h-3 mr-1 text-red-500" /> : <Video className="w-3 h-3 mr-1 text-blue-500" />}
                              {item.format === 'pdf' ? 'PDF' : 'Video'}
                            </Badge>
                            {item.official && <Badge className="bg-amber-100 text-amber-800 border-none hover:bg-amber-100 shadow-none"><Zap className="w-3 h-3 mr-1"/> Official</Badge>}
                          </div>
                          <CardTitle className="text-md leading-tight group-hover:text-indigo-700 transition-colors cursor-pointer">
                            {item.title}
                          </CardTitle>
                          <CardDescription className="mt-1 flex items-center text-xs">
                            <BookOpen className="w-3 h-3 mr-1" /> {item.subject} • {item.classTarget}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                          <div className="flex flex-wrap gap-1 mt-2">
                             {item.tags.map(tag => (
                               <span key={tag} className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 py-1 px-2 rounded-sm">{tag}</span>
                             ))}
                          </div>
                          <div className="flex justify-between items-center mt-4 text-xs text-slate-500 border-t pt-3">
                             <div className="flex items-center gap-1">
                                <span className="font-medium text-slate-700">{item.author}</span>
                             </div>
                             <div className="flex items-center gap-3">
                               <span className="flex items-center"><Download className="w-3 h-3 mr-1" /> {item.downloads}</span>
                             </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="intervention" className="mt-0">
                 <Card className="border-indigo-200 bg-indigo-50/50 shadow-none">
                    <CardContent className="p-8 text-center space-y-4">
                       <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-indigo-100 mx-auto">
                         <AlertCircle className="w-8 h-8 text-indigo-500" />
                       </div>
                       <div>
                         <h3 className="text-xl font-bold text-indigo-900">Intervention Analysis Mode</h3>
                         <p className="text-slate-600 mt-2 max-w-lg mx-auto">
                           Select a class and topic that students are struggling in, and the engine will automatically surface the best resources and previous peer sessions proven to reverse the deficit.
                         </p>
                       </div>
                       <Button className="bg-indigo-600 hover:bg-indigo-700 text-white mt-4">
                         Scan Cohort Performance
                       </Button>
                    </CardContent>
                 </Card>
              </TabsContent>

           </Tabs>
        </div>

      </div>
    </div>
  );
}
