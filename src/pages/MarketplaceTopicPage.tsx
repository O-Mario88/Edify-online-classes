import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, ArrowLeft, PlayCircle, FileText, HelpCircle, Star, Users, Clock, Download, Video } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Import curriculum data
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

// Helper to generate fake MarketplaceItems strictly tied to a Topic
const mockMarketplaceItems = (topicId: string, count: number, type: 'video' | 'notes' | 'assessment') => {
   return Array.from({ length: count }).map((_, i) => ({
      id: `resource-${topicId}-${type}-${i}`,
      title: `${type === 'video' ? 'Video Lesson' : type === 'notes' ? 'Revision Notes' : 'Practice Test'}: ${topicId.split('-').pop()} Part ${i + 1}`,
      teacherName: `Expert Teacher ${i + 1}`,
      type,
      price: type === 'video' ? 15000 : type === 'notes' ? 5000 : 10000,
      currency: 'UGX',
      rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1),
      reviews: Math.floor(Math.random() * 200) + 10,
      students: Math.floor(Math.random() * 1000) + 50
   }));
};

const MarketplaceTopicPage: React.FC = () => {
  const { country, subjectId, classId, topicId } = useParams<{ country: string; subjectId: string; classId: string; topicId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { rootSubject, topic } = useMemo(() => {
    const sList = ALL_SUBJECTS.filter(s => s.country.toLowerCase() === country?.toLowerCase() && s.name === ALL_SUBJECTS.find(sub => sub.id === subjectId)?.name);
    
    let resolvedTopic = null;
    let resolvedSubject = null;
    
    for (const s of sList) {
       const found = s.topics.find((t: any) => t.id === topicId && t.classLevel === classId);
       if (found) {
          resolvedTopic = found;
          resolvedSubject = s;
          break;
       }
    }
    
    return { rootSubject: resolvedSubject, topic: resolvedTopic };
  }, [country, subjectId, classId, topicId]);

  const resources = useMemo(() => {
     if (!topic) return { videos: [], notes: [], tests: [] };
     return {
        videos: mockMarketplaceItems(topic.id, 6, 'video'),
        notes: mockMarketplaceItems(topic.id, 4, 'notes'),
        tests: mockMarketplaceItems(topic.id, 3, 'assessment')
     };
  }, [topic]);

  if (!rootSubject || !topic) {
    return (
      <div className="container mx-auto py-12 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800">Resource Registry Missing</h2>
        <p className="text-gray-500 mt-2">The topic you requested does not map to any loaded curriculum standard.</p>
        <Button variant="outline" className="mt-6" onClick={() => navigate('/marketplace')}>Return to Hub</Button>
      </div>
    );
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(price);

  const renderResourceCard = (item: any) => (
     <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-100 group">
       <div className={`aspect-video relative flex items-center justify-center ${
          item.type === 'video' ? 'bg-gradient-to-r from-red-400 to-rose-600' : 
          item.type === 'notes' ? 'bg-gradient-to-r from-blue-400 to-indigo-600' :
          'bg-gradient-to-r from-emerald-400 to-teal-600'
       }`}>
          <div className="absolute inset-0 flex items-center justify-center">
             {item.type === 'video' && <PlayCircle className="h-12 w-12 text-white opacity-80 group-hover:scale-110 transition-transform" />}
             {item.type === 'notes' && <FileText className="h-12 w-12 text-white opacity-80 group-hover:scale-110 transition-transform" />}
             {item.type === 'assessment' && <HelpCircle className="h-12 w-12 text-white opacity-80 group-hover:scale-110 transition-transform" />}
          </div>
          <Badge className="absolute top-2 right-2 bg-yellow-500 text-white shadow-sm border-0">
            {formatPrice(item.price)}
          </Badge>
       </div>
       <CardHeader className="pb-2 pt-4">
          <div className="text-sm text-gray-500 mb-1">{item.teacherName}</div>
          <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-blue-600">{item.title}</CardTitle>
       </CardHeader>
       <CardContent className="py-2 border-t border-gray-50 bg-gray-50/50">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
             <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                <span className="text-gray-700">{item.rating}</span> ({item.reviews})
             </div>
             <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {item.students} Students
             </div>
          </div>
       </CardContent>
       <CardFooter className="p-4 pt-4 border-t border-gray-100">
          <Button className="w-full text-white bg-gray-900 shadow-sm" variant="default" disabled={user?.role !== 'universal_student'}>
             {user?.role === 'universal_student' ? 'Unlock Lesson' : 'Student Account Required'}
          </Button>
       </CardFooter>
     </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-6 flex-wrap leading-loose">
        <span className="cursor-pointer hover:text-blue-600 transition" onClick={() => navigate('/marketplace')}>Marketplace</span>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="capitalize">{country}</span>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="cursor-pointer hover:text-blue-600 transition" onClick={() => navigate(`/marketplace/${country}/${subjectId}`)}>{rootSubject.name}</span>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="cursor-pointer hover:text-blue-600 transition" onClick={() => navigate(`/marketplace/${country}/${subjectId}`)}>{classId}</span>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="font-medium text-gray-900 bg-gray-100 px-2 rounded-md">{topic.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8 bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <Button variant="outline" size="icon" onClick={() => navigate(`/marketplace/${country}/${subjectId}`)} className="shrink-0 mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{topic.name}</h1>
          <p className="text-gray-600 mb-4 max-w-3xl">
            Complete resource tree mapping directly to the {topic.levelGroup} syllabus for {topic.name}. Learn from vetted institutional educators through rigorous video guides, printable notes, and diagnostic assessments.
          </p>
          <div className="flex flex-wrap items-center gap-3">
             <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 py-1 px-3">Topic {topic.order}</Badge>
             <Badge variant="outline" className="border-gray-200 text-gray-600 py-1 px-3 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> ~4 Lesson Periods</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="mb-6 h-auto p-1 bg-gray-100/70 inline-flex flex-wrap">
          <TabsTrigger value="videos" className="px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-medium text-gray-600">
             <Video className="w-4 h-4 mr-2 inline-block text-red-500" /> Lesson Videos ({resources.videos.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-medium text-gray-600">
             <FileText className="w-4 h-4 mr-2 inline-block text-blue-500" /> Handouts & Notes ({resources.notes.length})
          </TabsTrigger>
          <TabsTrigger value="tests" className="px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md font-medium text-gray-600">
             <HelpCircle className="w-4 h-4 mr-2 inline-block text-green-500" /> Assessments ({resources.tests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {resources.videos.map(renderResourceCard)}
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {resources.notes.map(renderResourceCard)}
          </div>
        </TabsContent>

        <TabsContent value="tests">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {resources.tests.map(renderResourceCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketplaceTopicPage;
