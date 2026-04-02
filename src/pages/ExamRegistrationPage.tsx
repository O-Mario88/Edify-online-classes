import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  School, 
  MapPin, 
  DollarSign, 
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
  FileText,
  Upload,
  Star,
  Users,
  Clock,
  Award,
  Info,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
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
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
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
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading exam centers...</div>
      </div>
    );
  }

  if (user?.role !== 'universal_student') {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-gray-600">Only students can access exam registration.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (countryCode !== 'uganda') {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto shadow-sm">
          <CardContent className="text-center py-12">
            <Globe className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">National Exam Registration</h2>
            <p className="text-gray-600 mb-6">
              Digital examination registration for {countryCode.charAt(0).toUpperCase() + countryCode.slice(1)} is currently under development. 
              Our integration with the national examination board will be available soon.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">UNEB Exam Registration</h1>
        <p className="text-lg text-gray-600">
          Register for Uganda Certificate of Education (UCE) or Uganda Advanced Certificate of Education (UACE) examinations
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep >= step 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-600"
              )}>
                {isStepComplete(step) ? <CheckCircle className="h-4 w-4" /> : step}
              </div>
              {step < 4 && (
                <div className={cn(
                  "w-24 h-1 mx-2",
                  currentStep > step ? "bg-blue-600" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-600">Select Center</span>
          <span className="text-xs text-gray-600">Choose Subjects</span>
          <span className="text-xs text-gray-600">Upload Documents</span>
          <span className="text-xs text-gray-600">Payment & Submit</span>
        </div>
      </div>

      <Tabs value={currentStep.toString()} className="w-full">
        <TabsList className="hidden" />

        {/* Step 1: Select Exam Center */}
        <TabsContent value="1" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Select Exam Center
              </CardTitle>
              <CardDescription>
                Choose an approved UNEB examination center near you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="exam-type">Examination Type</Label>
                    <RadioGroup
                      value={registration.exam_type}
                      onValueChange={(value) => setRegistration(prev => ({ ...prev, exam_type: value as 'UCE' | 'UACE', subjects: [] }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="UCE" id="uce" />
                        <label htmlFor="uce">Uganda Certificate of Education (UCE)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="UACE" id="uace" />
                        <label htmlFor="uace">Uganda Advanced Certificate of Education (UACE)</label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {examCenters.map((center) => (
                  <Card 
                    key={center.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-lg",
                      selectedCenter?.id === center.id 
                        ? "ring-2 ring-blue-500 bg-blue-50" 
                        : "hover:shadow-md"
                    )}
                    onClick={() => handleCenterSelect(center)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{center.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {center.uneb_center_code}
                          </Badge>
                        </div>
                        {selectedCenter?.id === center.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{center.location.district}, {center.location.region}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4" />
                          <span>{center.capacity.available_seats}/{center.capacity.total_seats} seats available</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            {formatCurrency(registration.exam_type === 'UCE' ? center.fees.uce : center.fees.uace)}
                            <span className="text-gray-500 ml-1">+ {formatCurrency(center.fees.registration_fee)} reg. fee</span>
                          </span>
                        </div>

                        {center.performance_history.length > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>
                              {center.performance_history[0].pass_rate}% pass rate (2024)
                            </span>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Facilities:</span> {center.facilities.slice(0, 2).join(', ')}
                          {center.facilities.length > 2 && ` +${center.facilities.length - 2} more`}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedCenter}
                >
                  Next: Choose Subjects
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Select Subjects */}
        <TabsContent value="2" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Select Examination Subjects
              </CardTitle>
              <CardDescription>
                Choose the subjects you want to register for in {registration.exam_type} {registration.academic_year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCenter && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Selected Center:</h3>
                  <p className="text-blue-800">{selectedCenter.name} ({selectedCenter.uneb_center_code})</p>
                </div>
              )}

              <div className="space-y-6">
                
                {registration.exam_type === 'UCE' ? (
                  <>
                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                       <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" /> Compulsory Core Subjects (7)
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                         {UNEB_OLEVEL_CORE.map((subject) => (
                           <div key={subject.id} className="flex items-center space-x-2 bg-white p-2 rounded-md border text-sm opacity-80">
                             <Checkbox id={subject.id} checked={true} disabled />
                             <label htmlFor={subject.id} className="font-medium">{subject.name} ({subject.code})</label>
                           </div>
                         ))}
                       </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                       <h4 className="font-semibold text-gray-900 mb-3">Elective Subjects (Choose 1 or 2)</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                         {UNEB_OLEVEL_ELECTIVES.map((subject) => (
                           <div key={subject.id} className="flex items-center space-x-2">
                             <Checkbox
                               id={subject.id}
                               checked={registration.subjects.includes(subject.id)}
                               onCheckedChange={() => handleSubjectToggle(subject.id)}
                             />
                             <label htmlFor={subject.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                               {subject.name}
                             </label>
                           </div>
                         ))}
                       </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                       <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" /> Compulsory
                       </h4>
                       <div className="grid grid-cols-1 gap-3">
                         {UNEB_ALEVEL_COMPULSORY.map((subject) => (
                           <div key={subject.id} className="flex items-center space-x-2 bg-white p-2 rounded-md border text-sm">
                             <Checkbox id={subject.id} checked={registration.subjects.includes(subject.id)} onCheckedChange={() => handleSubjectToggle(subject.id)} />
                             <label htmlFor={subject.id} className="font-medium">{subject.name} ({subject.code})</label>
                           </div>
                         ))}
                       </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border mt-4">
                       <h4 className="font-semibold text-gray-900 mb-3">Principal Subjects (Choose 3)</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                         {UNEB_ALEVEL_PRINCIPAL.map((subject) => (
                           <div key={subject.id} className="flex items-center space-x-2">
                             <Checkbox
                               id={subject.id}
                               checked={registration.subjects.includes(subject.id)}
                               onCheckedChange={() => handleSubjectToggle(subject.id)}
                             />
                             <label htmlFor={subject.id} className="text-sm font-medium leading-none">
                               {subject.name}
                             </label>
                           </div>
                         ))}
                       </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border mt-4">
                       <h4 className="font-semibold text-gray-900 mb-3">Subsidiary Subject (Choose 1)</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                         {UNEB_ALEVEL_SUBSIDIARY.map((subject) => (
                           <div key={subject.id} className="flex items-center space-x-2">
                             <Checkbox
                               id={subject.id}
                               checked={registration.subjects.includes(subject.id)}
                               onCheckedChange={() => handleSubjectToggle(subject.id)}
                             />
                             <label htmlFor={subject.id} className="text-sm font-medium leading-none">
                               {subject.name}
                             </label>
                           </div>
                         ))}
                       </div>
                    </div>
                  </>
                )}

                {!validationResult.isValid && validationResult.errors.length > 0 && (
                   <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2 text-red-700">
                         <AlertCircle className="h-5 w-5 mt-0.5" />
                         <div>
                            <h4 className="font-semibold">Validation Errors</h4>
                            <ul className="text-sm list-disc pl-5 mt-1 space-y-1">
                               {validationResult.errors.map((err, i) => (
                                 <li key={i}>{err}</li>
                               ))}
                            </ul>
                         </div>
                      </div>
                   </div>
                )}
              </div>

              <div className="mt-6 flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back: Select Center
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  disabled={!validationResult.isValid}
                >
                  Next: Upload Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Upload Documents */}
        <TabsContent value="3" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Required Documents
              </CardTitle>
              <CardDescription>
                Upload the required documents for your exam registration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* ID Copy */}
                <div>
                  <Label htmlFor="id-copy" className="text-base font-medium">
                    National ID or Birth Certificate *
                  </Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Clear scan or photo of your identification document
                  </p>
                  <Input
                    id="id-copy"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('id_copy', file);
                    }}
                  />
                  {registration.documents.id_copy && (
                    <div className="flex items-center gap-2 mt-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">{registration.documents.id_copy.name}</span>
                    </div>
                  )}
                </div>

                {/* Academic Records */}
                <div>
                  <Label htmlFor="academic-records" className="text-base font-medium">
                    {registration.exam_type === 'UCE' ? 'PLE Certificate' : 'UCE Results'} *
                  </Label>
                  <p className="text-sm text-gray-600 mb-2">
                    {registration.exam_type === 'UCE' 
                      ? 'Primary Leaving Examination certificate'
                      : 'Uganda Certificate of Education results slip'
                    }
                  </p>
                  <Input
                    id="academic-records"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('academic_records', file);
                    }}
                  />
                  {registration.documents.academic_records && (
                    <div className="flex items-center gap-2 mt-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">{registration.documents.academic_records.name}</span>
                    </div>
                  )}
                </div>

                {/* Passport Photo */}
                <div>
                  <Label htmlFor="passport-photo" className="text-base font-medium">
                    Passport Size Photograph *
                  </Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Recent passport-size photograph (white background recommended)
                  </p>
                  <Input
                    id="passport-photo"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('passport_photo', file);
                    }}
                  />
                  {registration.documents.passport_photo && (
                    <div className="flex items-center gap-2 mt-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">{registration.documents.passport_photo.name}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Document Requirements:</h4>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        <li>• All documents must be clear and legible</li>
                        <li>• Accepted formats: PDF, JPG, JPEG, PNG</li>
                        <li>• Maximum file size: 5MB per document</li>
                        <li>• Ensure all text is clearly visible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back: Select Subjects
                </Button>
                <Button 
                  onClick={() => setCurrentStep(4)}
                  disabled={Object.keys(registration.documents).length < 3}
                >
                  Next: Review & Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Review and Payment */}
        <TabsContent value="4" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Review Registration & Payment
              </CardTitle>
              <CardDescription>
                Review your registration details and proceed with payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Registration Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Registration Summary</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Examination Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600">Type:</span> {registration.exam_type}</p>
                        <p><span className="text-gray-600">Year:</span> {registration.academic_year}</p>
                        <p><span className="text-gray-600">Subjects:</span> {registration.subjects.length}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Exam Center</h4>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{selectedCenter?.name}</p>
                        <p className="text-gray-600">{selectedCenter?.uneb_center_code}</p>
                        <p className="text-gray-600">{selectedCenter?.location.address}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Selected Subjects</h4>
                    <div className="flex flex-wrap gap-2">
                      {registration.subjects.map((subjectId) => (
                        <Badge key={subjectId} variant="outline">
                          {getSubjectName(subjectId)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fee Breakdown */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Fee Breakdown</h3>
                  
                  {selectedCenter && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Examination Fee ({registration.exam_type})</span>
                        <span>{formatCurrency(registration.exam_type === 'UCE' ? selectedCenter.fees.uce : selectedCenter.fees.uace)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Registration Fee</span>
                        <span>{formatCurrency(selectedCenter.fees.registration_fee)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                        <span>Total Amount</span>
                        <span>{formatCurrency(calculateTotalFee())}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                  
                  <RadioGroup defaultValue="mobile-money">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mobile-money" id="mobile-money" />
                      <label htmlFor="mobile-money">Mobile Money (MTN/Airtel)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                      <label htmlFor="bank-transfer">Bank Transfer</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="visa-card" id="visa-card" />
                      <label htmlFor="visa-card">Visa/Mastercard</label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800">Important Notice:</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        After payment, you will receive a confirmation email with your registration details. 
                        Please keep this for your records. Registration closes on September 30, 2025.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Back: Upload Documents
                </Button>
                <Button 
                  onClick={handleSubmitRegistration}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Pay {formatCurrency(calculateTotalFee())} & Submit</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamRegistrationPage;