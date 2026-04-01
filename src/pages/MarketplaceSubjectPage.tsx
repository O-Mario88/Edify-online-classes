import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ArrowLeft, BookOpen, Clock, Users, FileText, Video, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Import our rigorous generated curriculum data
import ugandaMath from '../../public/data/uganda-math-curriculum.json';
import ugandaBiology from '../../public/data/uganda-biology-curriculum.json';
import ugandaPhysics from '../../public/data/uganda-physics-curriculum.json';
import ugandaChemistry from '../../public/data/uganda-chemistry-curriculum.json';
import ugandaGeography from '../../public/data/uganda-geography-curriculum.json';
import ugandaHistory from '../../public/data/uganda-history-curriculum.json';
import ugandaEnglish from '../../public/data/uganda-english-curriculum.json';
import ugandaGeneralPaper from '../../public/data/uganda-general-paper-curriculum.json';
import ugandaSubMath from '../../public/data/uganda-submath-curriculum.json';
import ugandaLiterature from '../../public/data/uganda-literature-curriculum.json';
import ugandaICT from '../../public/data/uganda-ict-curriculum.json';
import ugandaEconomics from '../../public/data/uganda-economics-curriculum.json';
import ugandaArtDesign from '../../public/data/uganda-art-design-curriculum.json';
import ugandaPerformingArts from '../../public/data/uganda-performing-arts-curriculum.json';
import ugandaTechDesign from '../../public/data/uganda-technology-design-curriculum.json';
import ugandaNutrition from '../../public/data/uganda-nutrition-curriculum.json';
import ugandaFrench from '../../public/data/uganda-french-curriculum.json';
import ugandaGerman from '../../public/data/uganda-german-curriculum.json';
import ugandaArabic from '../../public/data/uganda-arabic-curriculum.json';
import ugandaChinese from '../../public/data/uganda-chinese-curriculum.json';
import ugandaLatin from '../../public/data/uganda-latin-curriculum.json';

const ALL_SUBJECTS = [
  ...ugandaMath.subjects,
  ...ugandaBiology.subjects,
  ...ugandaPhysics.subjects,
  ...ugandaChemistry.subjects,
  ...ugandaGeography.subjects,
  ...ugandaHistory.subjects,
  ...ugandaEnglish.subjects,
  ...ugandaGeneralPaper.subjects,
  ...ugandaSubMath.subjects,
  ...ugandaLiterature.subjects,
  ...ugandaICT.subjects,
  ...ugandaEconomics.subjects,
  ...ugandaArtDesign.subjects,
  ...ugandaPerformingArts.subjects,
  ...ugandaTechDesign.subjects,
  ...ugandaNutrition.subjects,
  ...ugandaFrench.subjects,
  ...ugandaGerman.subjects,
  ...ugandaArabic.subjects,
  ...ugandaChinese.subjects,
  ...ugandaLatin.subjects
];

// Helper to generate a random number of resources since we don't have a real backend count yet
const getRandomCount = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

const MarketplaceSubjectPage: React.FC = () => {
  const { country, subjectId } = useParams<{ country: string; subjectId: string }>();
  const navigate = useNavigate();

  // Find the exact subject from the registry
  const rootSubject = useMemo(() => {
    return ALL_SUBJECTS.find(s => s.id === subjectId && s.country.toLowerCase() === country?.toLowerCase());
  }, [subjectId, country]);

  // If a user clicks an O-level subject, we want to also bundle any structurally related A-level version 
  // so that the Subject page actually shows *all* classes (S1-S6) for "Mathematics".
  const fullSubjectFamily = useMemo(() => {
    if (!rootSubject) return [];
    // e.g., if root is "ug-math-o-level" (Mathematics), we want "ug-math-a-level" too. 
    return ALL_SUBJECTS.filter(s => s.name === rootSubject.name && s.country.toLowerCase() === rootSubject.country.toLowerCase());
  }, [rootSubject]);

  // Extract all distinct class levels (e.g., "S1", "S2", "S5-S6 Paper 1")
  const classLevels = useMemo(() => {
    const levels = new Set<string>();
    fullSubjectFamily.forEach(s => {
      s.classLevels.forEach((cl: string) => levels.add(cl));
    });
    return Array.from(levels);
  }, [fullSubjectFamily]);

  const [activeTab, setActiveTab] = useState(classLevels[0] || '');

  if (!rootSubject) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Subject Not Found</h2>
        <p className="text-gray-500 mt-2">The academic registry does not contain the requested subject.</p>
        <Button variant="outline" className="mt-6" onClick={() => navigate('/marketplace')}>
          Return to Marketplace
        </Button>
      </div>
    );
  }

  // Get topics for the currently selected class tab
  const activeTopics = useMemo(() => {
    let topics: any[] = [];
    fullSubjectFamily.forEach(s => {
      const classTopics = s.topics.filter((t: any) => t.classLevel === activeTab);
      topics = [...topics, ...classTopics];
    });
    return topics.sort((a, b) => a.order - b.order);
  }, [activeTab, fullSubjectFamily]);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <span className="cursor-pointer hover:text-blue-600 transition" onClick={() => navigate('/marketplace')}>
           Marketplace
        </span>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="cursor-pointer hover:text-blue-600 transition capitalize">
           {country}
        </span>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="font-medium text-gray-900">{rootSubject.name}</span>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => navigate('/marketplace')} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
             {rootSubject.name} 
             <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-0">
                {rootSubject.category}
             </Badge>
          </h1>
          <p className="text-gray-600 mt-1">
            Browse verified topics, lesson materials, and test papers for {rootSubject.name}.
          </p>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-100/50 p-1 flex flex-wrap h-auto mb-6 gap-2">
          {classLevels.map(cl => (
            <TabsTrigger 
              key={cl} 
              value={cl}
              className="py-2 px-4 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:font-semibold text-gray-600"
            >
              Class: {cl}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="md:col-span-3 space-y-4">
              <div className="bg-white rounded-lg border p-4 mb-4 shadow-sm flex items-center justify-between">
                 <div>
                    <h3 className="text-lg font-semibold text-gray-800">Syllabus Topics ({activeTopics.length})</h3>
                    <p className="text-sm text-gray-500">Topics are mandated by the NCDC Competency-Based Curriculum.</p>
                 </div>
                 <Badge variant="outline" className="bg-blue-50 text-blue-700 font-medium">
                   {activeTab} Scope
                 </Badge>
              </div>

              {activeTopics.length === 0 ? (
                <div className="text-center py-12 border rounded-xl bg-gray-50 border-dashed">
                  <p className="text-gray-500">No topics mapped for this class level.</p>
                </div>
              ) : (
                activeTopics.map(topic => (
                  <Card 
                    key={topic.id} 
                    className="hover:shadow-md transition cursor-pointer border-gray-200 hover:border-blue-300 overflow-hidden"
                    onClick={() => navigate(`/marketplace/${country}/${subjectId}/${activeTab}/${topic.id}`)}
                  >
                    <div className="flex md:flex-row flex-col">
                      <div className="p-6 flex-1 flex flex-col justify-center">
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-lg font-bold shrink-0">
                            {topic.order}
                          </div>
                          <div>
                             <h4 className="text-xl font-bold text-gray-800 mb-1 leading-tight group-hover:text-blue-600">
                               {topic.name}
                             </h4>
                             <p className="text-sm text-gray-500 mb-4 line-clamp-1">
                               {topic.levelGroup} | Mandatory core topic strand mapping.
                             </p>
                             
                             <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600">
                                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                                   <Video className="w-4 h-4 text-red-500" /> {getRandomCount(2, 12)} Videos
                                </span>
                                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                                   <FileText className="w-4 h-4 text-blue-500" /> {getRandomCount(4, 25)} Notes
                                </span>
                                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                                   <HelpCircle className="w-4 h-4 text-green-500" /> {getRandomCount(1, 8)} Tests
                                </span>
                             </div>
                          </div>
                        </div>
                      </div>
                      <div className="md:w-32 bg-gray-50 flex items-center justify-center border-l md:border-t-0 border-t p-4 text-blue-600 group-hover:bg-blue-50 transition">
                         <span className="font-semibold text-sm">View Content</span>
                         <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Sidebar Context */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3 bg-gray-50/50">
                  <CardTitle className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Top Tutors for {rootSubject.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                   {/* Dummy Tutors for the subject */}
                   {[1,2,3].map(i => (
                     <div key={i} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 border border-gray-300"></div>
                        <div>
                           <p className="text-sm font-semibold text-gray-800">Teacher {i}</p>
                           <p className="text-xs text-yellow-600 flex items-center">
                              ★ 4.{9-i} <span className="text-gray-400 ml-1">({getRandomCount(20, 200)} reviews)</span>
                           </p>
                        </div>
                     </div>
                   ))}
                   <Button variant="outline" className="w-full text-sm mt-2">See All subject Tutors</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 bg-blue-50/30">
                  <CardTitle className="text-sm text-blue-800 font-semibold uppercase tracking-wider">Live Support</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                   <p className="text-sm text-gray-600 mb-4">
                     Struggling with {rootSubject.name}? Connect with our AI-powered Copilot for immediate doubt resolution.
                   </p>
                   <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm border-0">
                      Open Student Copilot
                   </Button>
                </CardContent>
              </Card>
            </div>

          </div>
        </TabsContent>
        
      </Tabs>
    </div>
  );
};

export default MarketplaceSubjectPage;
