import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Search, Filter, Globe2 } from 'lucide-react';
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

// Consolidate the registries for the top-level marketplace discovery
// We use the first element (the lower-secondary base subject) to represent the card
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
].filter(s => s.level === 'O-Level' || s.category === 'Compulsory' || s.category === 'Subsidiary' || s.category === 'Principal'); // Ensure A-Level only subjects also appear in the main marketplace

const MarketplacePage: React.FC = () => {
  const { currentContext } = useAuth();
  const navigate = useNavigate();
  
  // By default, match the user's current context, but allow them to browse other regions
  const [selectedCountry, setSelectedCountry] = useState(currentContext || 'uganda');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredSubjects = ALL_SUBJECTS.filter(subject => {
    const matchesCountry = subject.country.toLowerCase() === selectedCountry.toLowerCase();
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  const handleSubjectClick = (subjectId: string) => {
    // Navigate strictly matching the new Subject -> Class hierarchy
    navigate(`/marketplace/${selectedCountry}/${subjectId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Academic Marketplace</h1>
        <p className="text-lg text-gray-600">
          Discover curriculum-aligned resources, lesson materials, and expert tutors.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-4 border-b border-gray-100">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-700">
              <Filter className="h-4 w-4" />
              Resource Discovery
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              
              <div className="relative">
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="pl-10 h-11">
                    <Globe2 className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uganda">Uganda (NCDC Curriculum)</SelectItem>
                    <SelectItem value="kenya">Kenya (CBC / 8-4-4)</SelectItem>
                    <SelectItem value="rwanda">Rwanda (CBC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex items-center justify-between">
         <h2 className="text-xl font-semibold text-gray-800">
            Subjects in {selectedCountry.charAt(0).toUpperCase() + selectedCountry.slice(1)}
         </h2>
         <Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100">
            {filteredSubjects.length} Subjects Available
         </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSubjects.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No subjects found</h3>
            <p className="text-gray-500">We couldn't find any subjects matching your current filters.</p>
          </div>
        ) : (
          filteredSubjects.map((subject) => (
            <Card 
              key={subject.id} 
              className="group cursor-pointer hover:shadow-lg transition-all border-gray-100 overflow-hidden hover:border-blue-200"
              onClick={() => handleSubjectClick(subject.id)}
            >
              <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden flex items-center justify-center">
                {/* Abstract pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                
                <h3 className="text-2xl font-bold text-white relative z-10 shadow-sm">{subject.name}</h3>
                
                <Badge className="absolute top-3 left-3 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                  {subject.category}
                </Badge>
              </div>
              
              <CardHeader className="pb-3 pt-4">
                 <div className="flex justify-between items-start mb-1">
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {subject.name} Resources
                    </CardTitle>
                 </div>
                 <CardDescription className="line-clamp-2">
                    Browse verified academic materials mapped strictly to the S1-S6 {subject.name} syllabus.
                 </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                 <div className="flex flex-wrap gap-2 text-xs text-gray-500 font-medium">
                    <span className="bg-gray-100 px-2 py-1 rounded-md">Topics</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-md">Video Lessons</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-md">Revision Papers</span>
                 </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;