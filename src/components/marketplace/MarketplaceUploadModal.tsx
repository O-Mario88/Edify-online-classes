import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Import our rigorous generated curriculum data
import ugandaMath from '../../../public/data/uganda-math-curriculum.json';
import ugandaBiology from '../../../public/data/uganda-biology-curriculum.json';
import ugandaPhysics from '../../../public/data/uganda-physics-curriculum.json';
import ugandaChemistry from '../../../public/data/uganda-chemistry-curriculum.json';
import ugandaGeography from '../../../public/data/uganda-geography-curriculum.json';
import ugandaHistory from '../../../public/data/uganda-history-curriculum.json';
import ugandaEnglish from '../../../public/data/uganda-english-curriculum.json';
import ugandaGeneralPaper from '../../../public/data/uganda-general-paper-curriculum.json';
import ugandaSubMath from '../../../public/data/uganda-submath-curriculum.json';
import ugandaLiterature from '../../../public/data/uganda-literature-curriculum.json';
import ugandaICT from '../../../public/data/uganda-ict-curriculum.json';
import ugandaEconomics from '../../../public/data/uganda-economics-curriculum.json';
import ugandaArtDesign from '../../../public/data/uganda-art-design-curriculum.json';
import ugandaPerformingArts from '../../../public/data/uganda-performing-arts-curriculum.json';
import ugandaTechDesign from '../../../public/data/uganda-technology-design-curriculum.json';
import ugandaNutrition from '../../../public/data/uganda-nutrition-curriculum.json';
import ugandaFrench from '../../../public/data/uganda-french-curriculum.json';
import ugandaGerman from '../../../public/data/uganda-german-curriculum.json';
import ugandaArabic from '../../../public/data/uganda-arabic-curriculum.json';
import ugandaChinese from '../../../public/data/uganda-chinese-curriculum.json';
import ugandaLatin from '../../../public/data/uganda-latin-curriculum.json';

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

interface MarketplaceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCountry?: string;
}

export const MarketplaceUploadModal: React.FC<MarketplaceUploadModalProps> = ({ isOpen, onClose, defaultCountry = 'uganda' }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [country, setCountry] = useState(defaultCountry);
  const [subjectName, setSubjectName] = useState<string>(''); // Group subjects by name (e.g. Mathematics) instead of ID (which splits OLevel/ALevel)
  const [classLevel, setClassLevel] = useState<string>('');
  const [topicId, setTopicId] = useState<string>('');
  const [resourceType, setResourceType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  // 1. Get unique subject names for the selected country
  const availableSubjects = useMemo(() => {
    const subjectsInCountry = ALL_SUBJECTS.filter(s => s.country.toLowerCase() === country.toLowerCase());
    const uniqueNames = new Set(subjectsInCountry.map(s => s.name));
    return Array.from(uniqueNames).sort();
  }, [country]);

  // 2. Get all distinct classes available for that subject name across all levels (O-Level and A-Level)
  const availableClasses = useMemo(() => {
    if (!subjectName) return [];
    const subjects = ALL_SUBJECTS.filter(s => s.country.toLowerCase() === country.toLowerCase() && s.name === subjectName);
    const classes = new Set<string>();
    subjects.forEach(s => s.classLevels.forEach(cl => classes.add(cl)));
    return Array.from(classes).sort();
  }, [subjectName, country]);

  // 3. Get all topics for the specific class level
  const availableTopics = useMemo(() => {
    if (!subjectName || !classLevel) return [];
    const subjects = ALL_SUBJECTS.filter(s => s.country.toLowerCase() === country.toLowerCase() && s.name === subjectName);
    
    let topics: any[] = [];
    subjects.forEach(s => {
       const classTopics = s.topics.filter((t: any) => t.classLevel === classLevel);
       topics = [...topics, ...classTopics];
    });
    return topics.sort((a, b) => a.order - b.order);
  }, [subjectName, classLevel, country]);

  const handleNext = () => setStep(step + 1 as 1 | 2 | 3);
  const handleBack = () => setStep(step - 1 as 1 | 2 | 3);

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate upload process to backend
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3); // Success step
    }, 1500);
  };

  const handleReset = () => {
    setStep(1);
    setSubjectName('');
    setClassLevel('');
    setTopicId('');
    setResourceType('');
    setTitle('');
    setDescription('');
    setPrice('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleReset()}>
      <DialogContent className="sm:max-w-[550px]">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Academic Tagging required</DialogTitle>
              <DialogDescription>
                To maintain marketplace quality, all resources must be strictly tagged to the official curriculum hierarchy. Loose uploads are no longer permitted.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Country/Region</Label>
                <Select value={country} onValueChange={(val) => { setCountry(val); setSubjectName(''); setClassLevel(''); setTopicId(''); }}>
                  <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uganda">Uganda</SelectItem>
                    <SelectItem value="kenya">Kenya</SelectItem>
                    <SelectItem value="rwanda">Rwanda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Subject</Label>
                <Select value={subjectName} onValueChange={(val) => { setSubjectName(val); setClassLevel(''); setTopicId(''); }} disabled={availableSubjects.length === 0}>
                  <SelectTrigger><SelectValue placeholder="e.g. Mathematics" /></SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map(sub => (
                       <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Class Level</Label>
                <Select value={classLevel} onValueChange={(val) => { setClassLevel(val); setTopicId(''); }} disabled={!subjectName || availableClasses.length === 0}>
                  <SelectTrigger><SelectValue placeholder="e.g. S1, S2" /></SelectTrigger>
                  <SelectContent>
                    {availableClasses.map(cls => (
                       <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  Topic Node
                  {topicId && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </Label>
                <Select value={topicId} onValueChange={setTopicId} disabled={!classLevel || availableTopics.length === 0}>
                  <SelectTrigger><SelectValue placeholder="Select the exact target topic" /></SelectTrigger>
                  <SelectContent>
                    {availableTopics.map(topic => (
                       <SelectItem key={topic.id} value={topic.id}>Topic {topic.order}: {topic.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {classLevel && availableTopics.length === 0 && (
                   <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                     <AlertCircle className="w-3 h-3"/> No topics found in registry for this class
                   </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleNext} disabled={!topicId}>Next: Details</Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Resource Details</DialogTitle>
              <DialogDescription>
                Provide the specifics for the marketplace listing.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Resource Type</Label>
                <Select value={resourceType} onValueChange={setResourceType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Lesson</SelectItem>
                    <SelectItem value="notes">Revision Notes / Handout</SelectItem>
                    <SelectItem value="assessment">Assessment / Exam Paper</SelectItem>
                    <SelectItem value="bundle">Full Topic Bundle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Quadratic Equations Mastery" />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what the student will learn..." className="h-20" />
              </div>
              <div className="grid gap-2">
                <Label>Price (UGX)</Label>
                <Input value={price} onChange={e => setPrice(e.target.value)} type="number" placeholder="Leave empty if free" />
              </div>
              <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
                <strong>Upload limits:</strong> Video (max 2GB), PDF (max 50MB). You will select the physical file on the next screen.
              </div>
            </div>
            <DialogFooter className="flex justify-between sm:justify-between w-full">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleSubmit} disabled={!resourceType || !title || isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Create Listing'}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 3 && (
          <>
            <div className="py-12 text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-2xl mb-2">Listing Drafted!</DialogTitle>
              <DialogDescription className="text-base max-w-sm mb-6">
                Your resource has been securely mapped to <strong>{subjectName} - {classLevel}</strong>. You can now attach your definitive payload files via the content manager.
              </DialogDescription>
              <Button onClick={handleReset} className="w-full">Return to Dashboard</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
