import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Building2, Palette, BookOpen, Users2, Users, GraduationCap, Heart, CreditCard, Settings, Rocket, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/apiClient';
import { toast } from 'sonner';
const steps = [
  { id: 1, title: 'Institution profile', icon: Building2 },
  { id: 2, title: 'Identity & Brand', icon: Palette },
  { id: 3, title: 'Academic structure', icon: BookOpen }
];

export const InstitutionWizard: React.FC = () => {
  const navigate = useNavigate();
  const { currentContext } = useAuth();
  
  // Overall Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phase 1 Data
  const [accountData, setAccountData] = useState({
    name: '', type: 'secondary', country: 'uganda', email: '', phone: '', location: '', adminName: '', password: ''
  });

  // Phase 2 Data
  const [brandData, setBrandData] = useState({
    motto: '', primaryColor: '#1b64f2', secondaryColor: '#ffffff', shortDesc: '', levels: 'both'
  });

  // Phase 3 Data
  const [academicData, setAcademicData] = useState({
    preloadNCDC: true, enableTimetable: true, enableOnlineSessions: false
  });

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleMilestone1Submit = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/institutions/onboard-basic/', {
         account: accountData,
         brand: brandData,
         academic: academicData
      });
      toast.success('Institution base infrastructure created successfully.');
      // Directs the school admin right into their fresh pilot-ready dashboard
      navigate('/dashboard/institution');
    } catch (error: any) {
      toast.error('Onboarding failed: ' + (error?.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* LEFT NAVIGATION WIZARD PANE */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-sm z-10">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg text-slate-900 tracking-tight">School OS Launch</h2>
              <p className="text-xs text-slate-500 mt-1">Free Setup Mode</p>
            </div>
            {/* Progress Circular Indicator */}
            <div className="w-10 h-10 rounded-full border-4 border-blue-100 flex items-center justify-center relative">
               <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="42" className="stroke-blue-600" strokeWidth="8" fill="none" pathLength="100" strokeDasharray={`${(currentStep/3) * 100} 100`} strokeLinecap="round" />
               </svg>
               <span className="text-[10px] font-bold text-blue-700">{currentStep}/3</span>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div 
                key={step.id} 
                className={`flex items-center gap-3 p-3 text-sm rounded-xl transition-all ${
                  isCurrent ? 'bg-blue-50/70 border border-blue-100 shadow-sm text-blue-700 font-semibold' : 
                  isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' : isCurrent ? 'bg-blue-100 text-blue-600' : 'bg-slate-100'}`}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className="flex-1">{step.title}</span>
              </div>
            );
          })}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200">
           <button onClick={() => navigate('/')} className="text-xs text-slate-500 font-medium hover:text-slate-800 transition-colors flex items-center gap-1">
             <ArrowLeft className="w-3.5 h-3.5" /> Save & Exit to Dashboard
           </button>
        </div>
      </div>

      {/* RIGHT CONTENT PANE */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 relative">
        <div className="max-w-3xl mx-auto py-12 px-8 pb-32">
          
          {/* Phase 1: Institution Account */}
          {currentStep === 1 && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                   <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Institution Account</h1>
                   <p className="text-slate-500 text-sm">Welcome! Let's start by establishing your school's unique identity on the Maple OS.</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2">
                         <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">School Name</label>
                         <Input value={accountData.name} onChange={e => setAccountData({...accountData, name: e.target.value})} placeholder="e.g. Hillside High School" />
                      </div>
                      <div>
                         <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Institution Type</label>
                         <select className="w-full h-11 px-3 border border-slate-300 rounded-[4px] text-sm focus:border-blue-500 outline-none" value={accountData.type} onChange={e => setAccountData({...accountData, type: e.target.value})}>
                            <option value="primary">Primary School</option>
                            <option value="secondary">Secondary School</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Primary Location / District</label>
                         <Input value={accountData.location} onChange={e => setAccountData({...accountData, location: e.target.value})} placeholder="e.g. Kampala" />
                      </div>
                      <div>
                         <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Official Contact Email</label>
                         <Input type="email" value={accountData.email} onChange={e => setAccountData({...accountData, email: e.target.value})} placeholder="admin@hillside.edu.ug" />
                      </div>
                      <div>
                         <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Official Phone Number</label>
                         <Input type="tel" value={accountData.phone} onChange={e => setAccountData({...accountData, phone: e.target.value})} placeholder="+256 700 000000" />
                      </div>
                   </div>

                   <div className="border-t border-slate-100 pt-6 mt-6">
                      <h3 className="text-sm font-semibold text-slate-800 mb-4">Primary Admin Setup</h3>
                      <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Admin Full Name</label>
                            <Input value={accountData.adminName} onChange={e => setAccountData({...accountData, adminName: e.target.value})} placeholder="e.g. Jane Doe" />
                         </div>
                         <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Setup Initial Password</label>
                            <Input type="password" value={accountData.password} onChange={e => setAccountData({...accountData, password: e.target.value})} placeholder="********" />
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* Phase 2: Branding */}
          {currentStep === 2 && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                   <h1 className="text-3xl font-bold text-slate-900 mb-2">Make your school yours</h1>
                   <p className="text-slate-500 text-sm">Personalize the workspace so your staff and students feel ownership early.</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
                   {/* Logo Upload Placeholder */}
                   <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                         <Palette className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                         <p className="text-sm font-semibold text-slate-800">School Logo or Badge</p>
                         <p className="text-xs text-slate-500 mt-1 mb-3">Upload your crest in PNG or SVG format (Max 2MB).</p>
                         <Button variant="outline" className="h-8 text-xs">Upload Image</Button>
                      </div>
                   </div>

                   <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">School Motto / Tagline</label>
                      <Input value={brandData.motto} onChange={e => setBrandData({...brandData, motto: e.target.value})} placeholder="e.g. Education for a brighter future" />
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Primary Accent Color</label>
                         <div className="flex items-center gap-3">
                           <input type="color" className="w-11 h-11 rounded cursor-pointer border-0 p-0" value={brandData.primaryColor} onChange={e => setBrandData({...brandData, primaryColor: e.target.value})}/>
                           <Input value={brandData.primaryColor} onChange={e => setBrandData({...brandData, primaryColor: e.target.value})} className="font-mono text-sm" />
                         </div>
                      </div>
                      <div>
                         <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Short Description</label>
                         <textarea className="w-full h-24 p-3 border border-slate-300 rounded-[4px] text-sm focus:border-blue-500 outline-none resize-none" placeholder="A brief description of your institution..."></textarea>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* Phase 3: Academic Setup */}
          {currentStep === 3 && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                   <h1 className="text-3xl font-bold text-slate-900 mb-2">Academic Structure</h1>
                   <p className="text-slate-500 text-sm">Define how your classes and subjects are organized.</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
                   <div>
                       <h3 className="text-sm font-semibold text-slate-800 mb-3">Offered Levels</h3>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(accountData.type === 'primary' ? ['Upper Primary (P4-P7)', 'Full Primary', 'Lower Primary Only'] :
                            ['O-Level Only', 'A-Level Only', 'Both O & A Level']).map(level => (
                            <div key={level} onClick={() => setBrandData({...brandData, levels: level})} className={`p-4 rounded-xl border cursor-pointer transition-all ${brandData.levels === level ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                               <div className="flex items-center justify-between pointer-events-none">
                                  <span className="font-medium text-sm text-slate-800">{level}</span>
                                  <div className={`w-4 h-4 rounded-full border flex flex-shrink-0 items-center justify-center ${brandData.levels === level ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                                     {brandData.levels === level && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                   </div>

                   <div className="p-5 bg-yellow-50/50 border border-yellow-200 rounded-xl">
                      <h4 className="text-sm font-semibold text-yellow-800 mb-2">Automated Scaffolding</h4>
                      <div className="space-y-3 mt-3">
                         <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={academicData.preloadNCDC} onChange={e => setAcademicData({...academicData, preloadNCDC: e.target.checked})} className="mt-1 w-4 h-4 rounded text-blue-600" />
                            <span className="text-sm text-slate-700">Preload default NCDC subject/topic structures globally</span>
                         </label>
                         <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={academicData.enableTimetable} onChange={e => setAcademicData({...academicData, enableTimetable: e.target.checked})} className="mt-1 w-4 h-4 rounded text-blue-600" />
                            <span className="text-sm text-slate-700">Enable advanced automated timetable generation immediately</span>
                         </label>
                      </div>
                   </div>
                </div>
             </div>
          )}



        </div>
        
        {/* Fixed Footer Actions */}
        <div className="fixed bottom-0 left-72 right-0 p-5 bg-white border-t border-slate-200 flex items-center justify-between z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
           <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="h-11 px-6 border-slate-300">Back</Button>
           
           {currentStep === 3 ? (
             <Button onClick={handleMilestone1Submit} disabled={isSubmitting} className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[4px] shadow-sm flex items-center gap-2">
                {isSubmitting ? 'Committing Architecture...' : 'Complete & Launch Dashboard'} <ArrowRight className="w-4 h-4" />
             </Button>
           ) : (
             <Button onClick={nextStep} disabled={currentStep === 3} className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-[4px] shadow-sm flex items-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
             </Button>
           )}
        </div>

      </div>

    </div>
  );
};
