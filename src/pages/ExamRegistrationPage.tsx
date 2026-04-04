import React, { useState, useEffect } from 'react';
import { EditorialPanel } from '@/components/ui/editorial/EditorialPanel';
import { EditorialPill } from '@/components/ui/editorial/EditorialPill';
import { EditorialHeader } from '@/components/ui/editorial/EditorialHeader';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  School, 
  MapPin, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  FileText,
  Upload,
  Star,
  Users,
  Info,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  SubjectValidation, 
  UNEB_OLEVEL_CORE, 
  UNEB_OLEVEL_ELECTIVES,
  UNEB_ALEVEL_COMPULSORY,
  UNEB_ALEVEL_PRINCIPAL,
  UNEB_ALEVEL_SUBSIDIARY
} from '@/lib/subjectConfig';
import { apiClient } from '@/lib/api';

interface ExamCenter {
  id: string;
  institution_id: string;
  uneb_center_code: string;
  name: string;
  location: {
    district: string;
    region: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  capacity: {
    total_seats: number;
    available_seats: number;
  };
  fees: {
    uce: number;
    uace: number;
    registration_fee: number;
  };
  facilities: string[];
  performance_history: Array<{
    year: string;
    exam_type: string;
    total_candidates: number;
    pass_rate: number;
    distinction_rate: number;
  }>;
}

interface ExamRegistration {
  exam_center_id: string;
  exam_type: 'UCE' | 'UACE';
  academic_year: string;
  subjects: string[];
  documents: {
    id_copy?: File;
    academic_records?: File;
    passport_photo?: File;
  };
}

const ALL_SUBJECTS = [
  ...UNEB_OLEVEL_CORE,
  ...UNEB_OLEVEL_ELECTIVES,
  ...UNEB_ALEVEL_COMPULSORY,
  ...UNEB_ALEVEL_PRINCIPAL,
  ...UNEB_ALEVEL_SUBSIDIARY
];

const getSubjectName = (id: string) => {
  const subj = ALL_SUBJECTS.find(s => s.id === id);
  return subj ? `${subj.name} (${subj.code})` : id;
};

const ExamRegistrationPage: React.FC = () => {
  const { user } = useAuth();
  const [examCenters, setExamCenters] = useState<ExamCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<ExamCenter | null>(null);
  const [registration, setRegistration] = useState<ExamRegistration>({
    exam_center_id: '',
    exam_type: 'UCE',
    academic_year: '2025',
    subjects: [],
    documents: {}
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<{isValid: boolean; errors: string[]}>({ isValid: false, errors: []});
  const { countryCode } = useAuth();

  useEffect(() => {
    // Run validation whenever subjects change
    if (registration.exam_type === 'UCE') {
      setValidationResult(SubjectValidation.validateOLevelSelection(registration.subjects));
    } else {
      setValidationResult(SubjectValidation.validateALevelSelection(registration.subjects));
    }
  }, [registration.subjects, registration.exam_type]);

  useEffect(() => {
    fetchExamCenters();
  }, []);

  const fetchExamCenters = async () => {
    try {
      const response = await apiClient.get('/exams/exam-center/');
      setExamCenters(response.data.results || response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exam centers:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  };

  const handleCenterSelect = (center: ExamCenter) => {
    setSelectedCenter(center);
    setRegistration(prev => ({
      ...prev,
      exam_center_id: center.id
    }));
  };

  const handleSubjectToggle = (subject: string) => {
    setRegistration(prev => {
      const subjects = prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject];
      return { ...prev, subjects };
    });
  };

  const handleFileUpload = (type: keyof ExamRegistration['documents'], file: File) => {
    setRegistration(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [type]: file
      }
    }));
  };

  const calculateTotalFee = () => {
    if (!selectedCenter) return 0;
    const examFee = registration.exam_type === 'UCE' 
      ? selectedCenter.fees.uce 
      : selectedCenter.fees.uace;
    return examFee + selectedCenter.fees.registration_fee;
  };

  const handleSubmitRegistration = async () => {
    setIsSubmitting(true);
    try {
      const mockDocuments = {
        id_copy: registration.documents.id_copy?.name,
        academic_records: registration.documents.academic_records?.name,
        passport_photo: registration.documents.passport_photo?.name
      };
      
      await apiClient.post('/exams/candidate-registration/', {
        exam_center: registration.exam_center_id,
        exam_type: registration.exam_type,
        registration_year: registration.academic_year,
        documents: mockDocuments
      });
      
      // Show success message
      alert('Registration submitted successfully! You will receive confirmation within 24 hours.');
      
      // Reset form
      setRegistration({
        exam_center_id: '',
        exam_type: 'UCE',
        academic_year: '2025',
        subjects: [],
        documents: {}
      });
      setSelectedCenter(null);
      setCurrentStep(1);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: return selectedCenter !== null;
      case 2: return registration.subjects.length > 0;
      case 3: return Object.keys(registration.documents).length >= 3;
      default: return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-[#f4efe2]"></div>
      </div>
    );
  }

  if (user?.role !== 'universal_student') {
    return (
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
        <EditorialPanel className="text-center py-20 max-w-lg">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-6 opacity-80" />
          <EditorialHeader level="h2" className="text-slate-800 mb-2">Access Restricted</EditorialHeader>
          <p className="text-slate-500 font-light">Only student accounts can access candidate examination registration.</p>
        </EditorialPanel>
      </div>
    );
  }

  if (countryCode !== 'uganda') {
    return (
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
        <EditorialPanel className="text-center py-20 max-w-xl">
          <Globe className="h-12 w-12 text-blue-500 mx-auto mb-6 opacity-80" />
          <EditorialHeader level="h2" className="text-slate-800 mb-4">National Exam Integration</EditorialHeader>
          <p className="text-slate-500 font-light leading-relaxed mb-8">
            Digital examination registration for {countryCode.charAt(0).toUpperCase() + countryCode.slice(1)} is currently under development. 
            Our integration with the national examination board will be available soon.
          </p>
          <EditorialPill variant="outline" className="mx-auto" onClick={() => window.history.back()}>
            Return to Dashboard
          </EditorialPill>
        </EditorialPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf8] font-sans pb-24 relative">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-[0.35] pointer-events-none"
        style={{ backgroundImage: "url('/images/bg-editorial-sand.png')" }}
      />
      <div className="fixed inset-0 bg-white/40 pointer-events-none" />

      {/* Header Area */}
      <div className="relative z-10 pt-16 pb-8 border-b border-white mix-blend-multiply">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between items-start gap-4 mb-4">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur px-4 py-2 rounded-full border border-white">
              <School className="h-4 w-4 text-emerald-700" />
              <span className="text-xs font-bold tracking-widest text-emerald-800 uppercase">UNEB Registration</span>
            </div>
            
            <EditorialHeader level="h1" className="text-slate-800">
               National Candidate Registration_
            </EditorialHeader>
            <p className="text-lg text-slate-500 font-light max-w-2xl leading-relaxed">
               Register for Uganda Certificate of Education (UCE) or Uganda Advanced Certificate of Education (UACE) examinations.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        
        {/* Progress Tracker */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                    currentStep === step ? "bg-slate-900 text-white shadow-lg ring-4 ring-slate-900/10" :
                    currentStep > step ? "bg-emerald-500 text-white" :
                    "bg-white border-2 border-slate-200 text-slate-400"
                  )}>
                    {isStepComplete(step) && currentStep !== step ? <CheckCircle className="h-5 w-5" /> : step}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest absolute top-12 whitespace-nowrap",
                     currentStep === step ? "text-slate-900" : "text-slate-400"
                  )}>
                    {step === 1 ? 'Exam Center' : step === 2 ? 'Subjects' : step === 3 ? 'Documents' : 'Payment'}
                  </span>
                </div>
                {step < 4 && (
                  <div className="flex-1 h-px mx-4 relative top-[-10px]">
                     <div className={cn(
                       "absolute inset-0 transition-all duration-500",
                       currentStep > step ? "bg-emerald-500" : "bg-slate-200"
                     )} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Tabs value={currentStep.toString()} className="w-full mt-20">
          <TabsList className="hidden" />

          {/* Step 1: Select Exam Center */}
          <TabsContent value="1" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EditorialPanel variant="glass" radius="xl" className="border border-white shadow-sm overflow-hidden p-0">
              <div className="bg-white/60 backdrop-blur border-b border-white p-8 sm:px-10">
                <EditorialHeader level="h3" className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#f4efe2] flex items-center justify-center shadow-inner">
                    <School className="h-5 w-5 text-[#8e8268]" />
                  </span>
                  Examination Modality
                </EditorialHeader>
                <p className="text-slate-500 font-light mt-2 ml-14">Select your level and choose an approved sitting center</p>
              </div>

              <div className="p-8 sm:p-10 bg-[#fbfaf8]">
                <div className="mb-10">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">1. Select Academic Level</h4>
                  <RadioGroup
                    value={registration.exam_type}
                    onValueChange={(value) => setRegistration(prev => ({ ...prev, exam_type: value as 'UCE' | 'UACE', subjects: [] }))}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <label 
                      htmlFor="uce" 
                      className={cn(
                        "flex items-center space-x-3 bg-white p-4 rounded-2xl border cursor-pointer transition-all flex-1",
                        registration.exam_type === 'UCE' ? "border-slate-900 shadow-md ring-1 ring-slate-900" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <RadioGroupItem value="UCE" id="uce" className="border-slate-300 text-slate-900" />
                      <div className="flex flex-col">
                         <span className="font-bold text-slate-900">O'Level (UCE)</span>
                         <span className="text-xs text-slate-500">Uganda Certificate of Education</span>
                      </div>
                    </label>

                    <label 
                      htmlFor="uace" 
                      className={cn(
                        "flex items-center space-x-3 bg-white p-4 rounded-2xl border cursor-pointer transition-all flex-1",
                        registration.exam_type === 'UACE' ? "border-slate-900 shadow-md ring-1 ring-slate-900" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <RadioGroupItem value="UACE" id="uace" className="border-slate-300 text-slate-900" />
                      <div className="flex flex-col">
                         <span className="font-bold text-slate-900">A'Level (UACE)</span>
                         <span className="text-xs text-slate-500">Uganda Advanced Certificate of Education</span>
                      </div>
                    </label>
                  </RadioGroup>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">2. Select Approved Center</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {examCenters.map((center) => {
                      const isSelected = selectedCenter?.id === center.id;
                      return (
                        <div 
                          key={center.id}
                          className={cn(
                            "cursor-pointer transition-all duration-300 bg-white rounded-3xl p-6 border relative overflow-hidden group",
                            isSelected 
                              ? "border-amber-400 shadow-lg ring-1 ring-amber-400 bg-amber-50/10" 
                              : "border-slate-100 hover:border-slate-300 hover:shadow-md"
                          )}
                          onClick={() => handleCenterSelect(center)}
                        >
                          {/* Accent */}
                          <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-slate-50 -z-10 transition-colors", isSelected && "bg-amber-100/50")} />

                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 pr-6">{center.name}</h3>
                              <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full text-slate-500">
                                {center.uneb_center_code}
                              </span>
                            </div>
                            <div className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors empty:bg-transparent",
                              isSelected ? "border-amber-500 bg-amber-500" : "border-slate-200 group-hover:border-slate-300"
                            )}>
                               {isSelected && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                            </div>
                          </div>
                          
                          <div className="space-y-3 mt-6 border-t border-slate-50 pt-4 mix-blend-multiply">
                            <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span>{center.location.district}, {center.location.region}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm">
                              <Users className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-600 font-medium">
                                <strong className="text-slate-900">{center.capacity.available_seats}</strong> seats available out of {center.capacity.total_seats}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm">
                              <DollarSign className="h-4 w-4 text-slate-400" />
                              <div className="font-bold text-slate-700">
                                {formatCurrency(registration.exam_type === 'UCE' ? center.fees.uce : center.fees.uace)}
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 bg-slate-100 px-2 py-0.5 rounded-sm">+ {formatCurrency(center.fees.registration_fee)} reg fee</span>
                              </div>
                            </div>

                            {center.performance_history.length > 0 && (
                              <div className="flex items-center gap-3 text-sm">
                                <Star className="h-4 w-4 text-amber-500" />
                                <span className="font-medium text-slate-600">
                                  {center.performance_history[0].pass_rate}% past pass rate <span className="text-slate-400 opacity-50 ml-1">(2024)</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-200 flex justify-end">
                  <EditorialPill 
                    variant="primary"
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedCenter}
                    className="px-8"
                  >
                    Proceed to Subject Selection
                  </EditorialPill>
                </div>
              </div>
            </EditorialPanel>
          </TabsContent>

          {/* Step 2: Select Subjects */}
          <TabsContent value="2" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EditorialPanel variant="glass" radius="xl" className="border border-white shadow-sm overflow-hidden p-0">
               <div className="bg-white/60 backdrop-blur border-b border-white p-8 sm:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <EditorialHeader level="h3" className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shadow-inner border border-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </span>
                      Subject Selection
                    </EditorialHeader>
                    <p className="text-slate-500 font-light mt-2 ml-14">Choose your subjects for {registration.exam_type} 2025</p>
                  </div>
                  {selectedCenter && (
                    <div className="bg-[#fbfaf8] border border-white px-4 py-2 rounded-xl text-right">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Target Center</span>
                       <span className="text-sm font-bold text-slate-900">{selectedCenter.name}</span>
                    </div>
                  )}
               </div>

               <div className="p-8 sm:p-10 bg-[#fbfaf8]">
                 <div className="space-y-8">
                  
                  {registration.exam_type === 'UCE' ? (
                    <>
                      <div className="bg-blue-50/40 p-6 rounded-3xl border border-blue-100/50">
                         <h4 className="font-bold text-blue-900 mb-6 flex items-center gap-2 text-lg">
                            <CheckCircle className="h-5 w-5 text-blue-600" /> Compulsory Core Subjects (7)
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {UNEB_OLEVEL_CORE.map((subject) => (
                             <div key={subject.id} className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-blue-50 shadow-sm opacity-70">
                               <Checkbox id={subject.id} checked={true} disabled className="border-blue-300 data-[state=checked]:bg-blue-600" />
                               <label htmlFor={subject.id} className="font-semibold text-sm text-slate-700">{subject.name} <span className="text-slate-400 font-normal ml-1">({subject.code})</span></label>
                             </div>
                           ))}
                         </div>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                         <h4 className="font-bold text-slate-900 mb-6 text-lg">Elective Subjects <span className="text-slate-400 font-normal text-base ml-2">(Choose 1 or 2)</span></h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {UNEB_OLEVEL_ELECTIVES.map((subject) => (
                             <label key={subject.id} htmlFor={subject.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors cursor-pointer">
                               <Checkbox
                                 id={subject.id}
                                 checked={registration.subjects.includes(subject.id)}
                                 onCheckedChange={() => handleSubjectToggle(subject.id)}
                               />
                               <span className="text-sm font-medium text-slate-700">
                                 {subject.name}
                               </span>
                             </label>
                           ))}
                         </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-emerald-50/40 p-6 rounded-3xl border border-emerald-100/50">
                         <h4 className="font-bold text-emerald-900 mb-6 flex items-center gap-2 text-lg">
                            <CheckCircle className="h-5 w-5 text-emerald-600" /> Compulsory Paper
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {UNEB_ALEVEL_COMPULSORY.map((subject) => (
                             <label key={subject.id} htmlFor={subject.id} className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-emerald-100 shadow-sm cursor-pointer">
                               <Checkbox 
                                  id={subject.id} 
                                  checked={registration.subjects.includes(subject.id)} 
                                  onCheckedChange={() => handleSubjectToggle(subject.id)} 
                                  className="data-[state=checked]:bg-emerald-600 border-emerald-300"
                               />
                               <span className="font-semibold text-sm text-slate-700">{subject.name} <span className="text-slate-400 font-normal ml-1">({subject.code})</span></span>
                             </label>
                           ))}
                         </div>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                         <h4 className="font-bold text-slate-900 mb-6 text-lg">Principal Subjects <span className="text-slate-400 font-normal text-base ml-2">(Choose 3)</span></h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {UNEB_ALEVEL_PRINCIPAL.map((subject) => (
                             <label key={subject.id} htmlFor={subject.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors cursor-pointer">
                               <Checkbox
                                 id={subject.id}
                                 checked={registration.subjects.includes(subject.id)}
                                 onCheckedChange={() => handleSubjectToggle(subject.id)}
                               />
                               <span className="text-sm font-medium text-slate-700">
                                 {subject.name}
                               </span>
                             </label>
                           ))}
                         </div>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                         <h4 className="font-bold text-slate-900 mb-6 text-lg">Subsidiary Subject <span className="text-slate-400 font-normal text-base ml-2">(Choose 1)</span></h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {UNEB_ALEVEL_SUBSIDIARY.map((subject) => (
                             <label key={subject.id} htmlFor={subject.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors cursor-pointer">
                               <Checkbox
                                 id={subject.id}
                                 checked={registration.subjects.includes(subject.id)}
                                 onCheckedChange={() => handleSubjectToggle(subject.id)}
                               />
                               <span className="text-sm font-medium text-slate-700">
                                 {subject.name}
                               </span>
                             </label>
                           ))}
                         </div>
                      </div>
                    </>
                  )}

                  {!validationResult.isValid && validationResult.errors.length > 0 && (
                     <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="h-6 w-6 text-rose-500 flex-shrink-0" />
                        <div>
                           <h4 className="font-bold text-rose-900 mb-2">Subject Validation Failed</h4>
                           <ul className="text-sm text-rose-800 space-y-1.5 font-medium">
                              {validationResult.errors.map((err, i) => (
                                <li key={i}>• {err}</li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  )}
                 </div>

                 <div className="mt-10 pt-8 border-t border-slate-200 flex justify-between items-center">
                   <button onClick={() => setCurrentStep(1)} className="text-sm font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors">
                     ← Return
                   </button>
                   <EditorialPill 
                     variant="primary"
                     onClick={() => setCurrentStep(3)}
                     disabled={!validationResult.isValid}
                     className="px-8"
                   >
                     Confirm Subjects
                   </EditorialPill>
                 </div>
               </div>
            </EditorialPanel>
          </TabsContent>

          {/* Step 3: Upload Documents */}
          <TabsContent value="3" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EditorialPanel variant="glass" radius="xl" className="border border-white shadow-sm overflow-hidden p-0">
               <div className="bg-white/60 backdrop-blur border-b border-white p-8 sm:px-10">
                  <EditorialHeader level="h3" className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shadow-inner border border-white">
                      <Upload className="h-5 w-5 text-slate-600" />
                    </span>
                    Digital Portfolio
                  </EditorialHeader>
                  <p className="text-slate-500 font-light mt-2 ml-14">Upload verification documents securely</p>
               </div>
               
               <div className="p-8 sm:p-10 bg-[#fbfaf8]">
                 <div className="space-y-6">
                    {/* Document Dropzones */}
                    {[
                      {
                        id: 'id_copy',
                        title: 'National Identity Verification *',
                        description: 'Clear scan or photo of your National ID or Birth Certificate',
                        file: registration.documents.id_copy
                      },
                      {
                        id: 'academic_records',
                        title: `${registration.exam_type === 'UCE' ? 'PLE Certificate' : 'UCE Result Slip'} *`,
                        description: 'Official academic transcript establishing eligibility',
                        file: registration.documents.academic_records
                      },
                      {
                        id: 'passport_photo',
                        title: 'Passport Photograph *',
                        description: 'Recent professional photo with white background',
                        file: registration.documents.passport_photo
                      }
                    ].map((doc) => (
                      <div key={doc.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                         <div>
                            <h4 className="font-bold text-slate-900 mb-1">{doc.title}</h4>
                            <p className="text-sm font-light text-slate-500">{doc.description}</p>
                         </div>
                         
                         <div className="flex-shrink-0">
                            {doc.file ? (
                               <div className="bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl flex items-center gap-3">
                                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                                  <span className="text-sm font-medium text-emerald-800 truncate max-w-[150px]">{doc.file.name}</span>
                                  <button 
                                    onClick={() => handleFileUpload(doc.id as keyof ExamRegistration['documents'], undefined as any)}
                                    className="ml-2 text-emerald-500 hover:text-emerald-700 text-xs font-bold uppercase tracking-widest"
                                  >
                                    Reset
                                  </button>
                               </div>
                            ) : (
                               <label className="cursor-pointer bg-slate-50 border border-slate-200 border-dashed hover:border-slate-400 hover:bg-slate-100 transition-colors px-6 py-4 rounded-xl flex flex-col items-center justify-center min-w-[200px]">
                                  <Upload className="h-5 w-5 text-slate-400 mb-2" />
                                  <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Select File</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(doc.id as keyof ExamRegistration['documents'], file);
                                    }}
                                  />
                               </label>
                            )}
                         </div>
                      </div>
                    ))}

                    <div className="p-6 bg-slate-100 rounded-3xl mt-8">
                      <div className="flex items-start gap-4">
                        <Info className="h-6 w-6 text-slate-500 mt-1" />
                        <div>
                          <h4 className="font-bold text-slate-700">Digital Standards</h4>
                          <ul className="text-sm font-light text-slate-600 mt-2 space-y-1.5">
                            <li>• Formats: PDF, JPG, PNG accepted</li>
                            <li>• Maximum size: 5MB per upload</li>
                            <li>• Documents must be undistorted and legible</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                 </div>

                 <div className="mt-10 pt-8 border-t border-slate-200 flex justify-between items-center">
                   <button onClick={() => setCurrentStep(2)} className="text-sm font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors">
                     ← Return
                   </button>
                   <EditorialPill 
                     variant="primary"
                     onClick={() => setCurrentStep(4)}
                     disabled={Object.keys(registration.documents).length < 3}
                     className="px-8"
                   >
                     Proceed to Invoice
                   </EditorialPill>
                 </div>
               </div>
            </EditorialPanel>
          </TabsContent>

          {/* Step 4: Review and Payment */}
          <TabsContent value="4" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EditorialPanel variant="glass" radius="xl" className="border border-white shadow-sm overflow-hidden p-0">
               <div className="bg-white/60 backdrop-blur border-b border-white p-8 sm:px-10">
                  <EditorialHeader level="h3" className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shadow-inner border border-emerald-100">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </span>
                    Manifest & Settlement
                  </EditorialHeader>
                  <p className="text-slate-500 font-light mt-2 ml-14">Review your curriculum choices and process payment</p>
               </div>

               <div className="p-8 sm:p-10 bg-[#fbfaf8]">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* Invoice Summary */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 block">Registration Manifest</h4>
                      
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6">
                         <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-6 mb-6">
                            <div>
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Candidature</span>
                               <span className="font-bold text-slate-900">{registration.exam_type} ({registration.academic_year})</span>
                            </div>
                            <div>
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Center</span>
                               <span className="font-bold text-slate-900">{selectedCenter?.name}</span>
                            </div>
                         </div>
                         <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Syllabus Papers ({registration.subjects.length})</span>
                            <div className="flex flex-wrap gap-2">
                               {registration.subjects.map((subjectId) => (
                                 <span key={subjectId} className="bg-slate-50 border border-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                                   {getSubjectName(subjectId)}
                                 </span>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 block">Ledger</h4>
                         
                         {selectedCenter && (
                           <div className="space-y-4">
                             <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                               <span>Examination Toll ({registration.exam_type})</span>
                               <span className="text-slate-900">{formatCurrency(registration.exam_type === 'UCE' ? selectedCenter.fees.uce : selectedCenter.fees.uace)}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm font-medium text-slate-600 border-b border-slate-100 pb-4">
                               <span>Administrative Toll</span>
                               <span className="text-slate-900">{formatCurrency(selectedCenter.fees.registration_fee)}</span>
                             </div>
                             <div className="flex justify-between items-end pt-2">
                               <span className="font-bold text-slate-900">Total Settlement</span>
                               <span className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(calculateTotalFee())}</span>
                             </div>
                           </div>
                         )}
                      </div>
                    </div>

                    {/* Payment Form */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 block">Settlement Method</h4>
                      
                      <RadioGroup defaultValue="mobile-money" className="space-y-3 mb-8">
                        {[
                           { id: 'mobile-money', label: 'Mobile Money Gateway', desc: 'MTN MoMo or Airtel Money' },
                           { id: 'bank-transfer', label: 'EFT Transfer', desc: 'Direct wire to UNEB Accounts' },
                           { id: 'visa-card', label: 'Credit Facility', desc: 'Visa, Mastercard processed securely' }
                        ].map((method) => (
                           <label key={method.id} htmlFor={method.id} className="flex items-center p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-slate-300 transition-all shadow-sm">
                             <RadioGroupItem value={method.id} id={method.id} className="mr-4 text-slate-900 border-slate-300" />
                             <div className="flex flex-col">
                               <span className="font-bold text-slate-800">{method.label}</span>
                               <span className="text-xs text-slate-500">{method.desc}</span>
                             </div>
                           </label>
                        ))}
                      </RadioGroup>

                      <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-3xl mb-8">
                        <div className="flex items-start gap-4">
                          <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-900 font-light leading-relaxed">
                            Upon submission, records are securely transmitted to the national database.
                            You will receive an official manifest to your inbox. Modifications post-settlement require a formal petition.
                          </p>
                        </div>
                      </div>

                      <EditorialPill 
                        variant="primary"
                        onClick={handleSubmitRegistration}
                        disabled={isSubmitting}
                        className="w-full justify-center !py-6 text-lg border-2 border-slate-900 hover:bg-slate-800"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-3">
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             Processing Ledger...
                          </div>
                        ) : (
                          "Authorize Setup & Settle"
                        )}
                      </EditorialPill>
                    </div>

                 </div>
               </div>
            </EditorialPanel>
          </TabsContent>
        </Tabs>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ExamRegistrationPage;