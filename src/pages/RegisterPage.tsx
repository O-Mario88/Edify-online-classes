import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EditorialPanel } from '../components/ui/editorial/EditorialPanel';
import { EditorialHeader } from '../components/ui/editorial/EditorialHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ChevronRight, ArrowLeft, ArrowRight, CheckCircle, Smartphone, Building2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // ?intent=diagnostic sends learners straight into the diagnostic after
  // signup; any other role falls through to the default redirect.
  const intent = searchParams.get('intent');
  const { register, onboardStudent } = useAuth();
  
  // Selection Screen State
  const [roleMode, setRoleMode] = useState<'selection' | 'learner' | 'teacher' | 'institution'>('selection');
  
  // Learner Wizard State
  const [learnerStep, setLearnerStep] = useState(1);
  
  // Student Details (Step 1)
  const [studentData, setStudentData] = useState({
    full_name: '',
    email: '',
    country_code: 'uganda',
    password: ''
  });

  // Parent Details (Step 2)
  const [parentData, setParentData] = useState({
    full_name: '',
    phone: '',
    relationship: 'guardian',
    email: ''
  });

  // Payment Details (Step 3)
  const [paymentData, setPaymentData] = useState({
    network: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Diagnostic intent jumps straight into the learner wizard.
  useEffect(() => {
    if (intent === 'diagnostic' && roleMode === 'selection') {
      setRoleMode('learner');
      setLearnerStep(1);
    }
  }, [intent, roleMode]);

  const handleRoleSelection = (role: 'learner' | 'teacher' | 'institution') => {
    setRoleMode(role);
    if (role === 'learner') setLearnerStep(1);
  };

  const handleLearnerSubmit = async () => {
    setError('');
    setIsLoading(true);
    
    const result = await onboardStudent(studentData, parentData, paymentData);
    if (result.success) {
      if (intent === 'diagnostic') {
        navigate('/diagnostic');
      } else if (result.redirect_url) {
        navigate(result.redirect_url);
      } else {
        navigate('/dashboard/student');
      }
    } else {
      setError(result.error || 'Failed to onboard student. Please verify the parent phone number.');
    }
    
    setIsLoading(false);
  };

  const handleStandardRegister = async (e: React.FormEvent, role: string) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await register(studentData.email || 'test@edify.local', studentData.full_name || role, 'uganda', studentData.password || 'password123', role);
    if (success) {
      if (role === 'institution') {
        navigate('/institution-onboarding');
      } else {
        navigate('/');
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row p-0 m-0 w-full relative overflow-hidden font-sans">
      
      {/* LEFT COLUMN: Editorial Splash */}
      <div className="hidden md:flex md:w-[55%] lg:w-[55%] xl:w-[55%] px-10 py-10 bg-[#F9F7F3] flex-col justify-center relative">
        <div className="max-w-md mx-auto w-full">
          <EditorialHeader level="h1" className="mb-4 text-slate-900 leading-snug text-2xl lg:text-3xl">
            Maple Online School<br/>— learning from anywhere!
          </EditorialHeader>
          <p className="text-slate-500 font-normal leading-relaxed mb-7 text-sm">
            Expert teachers, focused NCDC-aligned materials, and AI-powered academic support — all in one place.
          </p>
          
          <div className="relative w-full aspect-[4/3] max-w-[420px] mx-auto overflow-hidden rounded-2xl shadow-lg border border-slate-200">
             <div className="absolute inset-0 bg-gradient-to-tr from-[#98d8c6] to-[#fcb97d] opacity-40 mix-blend-multiply rounded-2xl" />
             <img src="/images/teenager_studying_at_home.png" alt="African teenager studying at home" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop' }} />
          </div>

          <div className="mt-8 space-y-2.5">
            {['NCDC-aligned curriculum', 'Live & recorded lessons', 'Parent progress tracking'].map(feat => (
              <div key={feat} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="text-xs text-slate-600">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Form Area */}
      <div className="w-full md:w-[45%] lg:w-[45%] xl:w-[45%] flex items-center justify-center p-6 md:px-10 md:py-12 relative bg-white">
        
        {/* Selection State */}
        {roleMode === 'selection' && (
          <div className="max-w-md w-full space-y-6 relative mt-8 md:mt-0">
            <button 
              onClick={() => navigate(-1)} 
              className="absolute -top-10 -left-2 text-slate-400 hover:text-slate-800 font-medium text-sm flex items-center gap-1 hover:underline transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-8 tracking-tight mt-4">Start learning today by signing up!</h2>
            
            <div className="space-y-4">
              <button onClick={() => handleRoleSelection('learner')} className="w-full bg-[#f8f9fa] hover:bg-[#edf2f7] border border-blue-100/50 rounded-xl p-5 flex items-center justify-between transition-colors group">
                <span className="font-semibold text-slate-700 group-hover:text-blue-700">I'm a learner</span>
                <ChevronRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button onClick={() => handleRoleSelection('teacher')} className="w-full bg-[#f8f9fa] hover:bg-[#edf2f7] border border-blue-100/50 rounded-xl p-5 flex items-center justify-between transition-colors group">
                <span className="font-semibold text-slate-700 group-hover:text-blue-700">I'm a teacher</span>
                <ChevronRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button onClick={() => handleRoleSelection('institution')} className="w-full bg-[#f8f9fa] hover:bg-[#edf2f7] border border-blue-100/50 rounded-xl p-5 flex items-center justify-between transition-colors group">
                <span className="font-semibold text-slate-700 group-hover:text-blue-700">I'm an institution</span>
                <ChevronRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <p className="mt-8 text-sm text-slate-500 font-medium">
              Already have a Maple account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
            </p>
          </div>
        )}

        {/* Learner Wizard */}
        {roleMode === 'learner' && (
          <div className="max-w-md w-full space-y-6 animate-in slide-in-from-right-4 fade-in duration-300 relative">
            <button 
              onClick={() => learnerStep === 1 ? setRoleMode('selection') : setLearnerStep(learnerStep - 1)} 
              className="absolute -top-12 -left-2 text-blue-600 font-medium text-sm flex items-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> {learnerStep === 1 ? 'Choose a different role' : 'Back'}
            </button>

            <h2 className="text-2xl font-bold text-slate-900">Sign up as a learner today!</h2>
            
            {/* Step Indicators */}
            <div className="flex items-center gap-2 mb-8">
               <div className={`h-1.5 flex-1 rounded-full ${learnerStep >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
               <div className={`h-1.5 flex-1 rounded-full ${learnerStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
               <div className={`h-1.5 flex-1 rounded-full ${learnerStep >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            {/* Step 1: Learner Basics */}
            {learnerStep === 1 && (
              <div className="space-y-5">
                <p className="text-sm text-slate-600 mb-2">First, let's setup your student profile.</p>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
                   <Input value={studentData.full_name} onChange={e => setStudentData({...studentData, full_name: e.target.value})} placeholder="e.g. John Doe" autoFocus />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
                   <Input type="email" value={studentData.email} onChange={e => setStudentData({...studentData, email: e.target.value})} placeholder="john@example.com" />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Create a Password</label>
                   <Input type="password" value={studentData.password} onChange={e => setStudentData({...studentData, password: e.target.value})} placeholder="At least 8 characters" />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Country / Curriculum</label>
                   <select className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-900 focus:border-blue-500 outline-none" value={studentData.country_code} onChange={e => setStudentData({...studentData, country_code: e.target.value})}>
                     <option value="uganda">Uganda (NCDC Core)</option>
                     <option value="kenya">Kenya (CBC)</option>
                   </select>
                </div>
              </div>
            )}

            {/* Step 1 Next Button - below card */}
            {learnerStep === 1 && (
              <div className="flex justify-center mt-6">
                <Button className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6" onClick={() => setLearnerStep(2)} disabled={!studentData.full_name || !studentData.email || !studentData.password}>Next</Button>
              </div>
            )}

            {/* Step 2: Parent/Guardian Details */}
            {learnerStep === 2 && (
              <div className="space-y-5">
                <p className="text-sm text-slate-600 mb-2 font-medium">To protect your account and unlock your dashboard, we need your Parent or Guardian's details.</p>
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 text-sm text-slate-700 mb-4">
                  These details will be used to automatically link your Parent to the system so they can track your progress.
                </div>

                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Parent / Guardian Full Name</label>
                   <Input value={parentData.full_name} onChange={e => setParentData({...parentData, full_name: e.target.value})} placeholder="e.g. Jane Doe" />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Parent Phone Number</label>
                   <Input type="tel" value={parentData.phone} onChange={e => setParentData({...parentData, phone: e.target.value})} placeholder="e.g. +256 750 000000" />
                   <p className="text-[11px] text-slate-500 mt-1.5">This number will be used for platform payment initiation via Mobile Money.</p>
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Relationship</label>
                   <select className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-900 outline-none" value={parentData.relationship} onChange={e => setParentData({...parentData, relationship: e.target.value})}>
                     <option value="mother">Mother</option>
                     <option value="father">Father</option>
                     <option value="guardian">Guardian</option>
                     <option value="other">Other</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Parent Email (Optional)</label>
                   <Input type="email" value={parentData.email} onChange={e => setParentData({...parentData, email: e.target.value})} placeholder="If available" />
                </div>
              </div>
            )}

            {/* Step 2 Next Button - below card */}
            {learnerStep === 2 && (
              <div className="flex justify-center mt-6">
                <Button className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6" onClick={() => setLearnerStep(3)} disabled={!parentData.full_name || !parentData.phone}>Next</Button>
              </div>
            )}

            {/* Step 3: Payment Anchor */}
            {learnerStep === 3 && (
              <div className="space-y-5">
                <p className="text-sm text-slate-600 font-medium mb-4">Complete your registration. Link payment via Parent Phone.</p>
                
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Target Phone Number</p>
                  <p className="font-medium text-slate-900 border-b border-slate-200 pb-3 mb-3">{parentData.phone}</p>
                  
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Select Network</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                     <div 
                       onClick={() => setPaymentData({network: 'mtn_momo'})} 
                       className={`border rounded-xl flex items-center gap-3 p-3 cursor-pointer ${paymentData.network === 'mtn_momo' ? 'bg-yellow-50 border-yellow-500 ring-1 ring-yellow-500' : 'bg-white hover:bg-slate-50 border-slate-200'}`}
                     >
                        <Smartphone className={`w-5 h-5 ${paymentData.network === 'mtn_momo' ? 'text-yellow-600' : 'text-slate-400'}`} />
                        <span className="font-semibold text-sm">MTN MoMo</span>
                     </div>
                     <div 
                       onClick={() => setPaymentData({network: 'airtel_money'})} 
                       className={`border rounded-xl flex items-center gap-3 p-3 cursor-pointer ${paymentData.network === 'airtel_money' ? 'bg-red-50 border-red-500 ring-1 ring-red-500' : 'bg-white hover:bg-slate-50 border-slate-200'}`}
                     >
                        <Smartphone className={`w-5 h-5 ${paymentData.network === 'airtel_money' ? 'text-red-600' : 'text-slate-400'}`} />
                        <span className="font-semibold text-sm">Airtel Money</span>
                     </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">By clicking finish, your parent will automatically be registered for the Parent Dashboard, and a payment prompt will be initiated directly to their phone.</p>
                </div>

              </div>
            )}

            {/* Step 3 Finish Button - below card */}
            {learnerStep === 3 && (
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={handleLearnerSubmit} 
                  className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 flex items-center justify-center gap-2" 
                  disabled={isLoading || !paymentData.network}
                >
                  {isLoading ? 'Processing Setup...' : 'Finish & Setup Account'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Teacher Validation Branch UI */}
        {roleMode === 'teacher' && (
          <div className="max-w-md w-full space-y-6 animate-in slide-in-from-right-4 fade-in duration-300 relative">
            <button 
              onClick={() => setRoleMode('selection')} 
              className="absolute -top-12 -left-2 text-blue-600 font-medium text-sm flex items-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Choose a different role
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">How are you joining Maple?</h2>
            <p className="text-sm text-slate-500 mb-6">Are you joining your school's official platform or setting up as an independent educator?</p>
            
            <div className="space-y-4">
               <button onClick={() => navigate('/independent-teacher-onboarding')} className="w-full text-left bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl p-5 transition-all group">
                  <div className="flex items-start justify-between">
                     <div>
                        <h3 className="font-semibold text-slate-800 text-lg group-hover:text-blue-700">I'm an independent educator</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-[280px]">Create an independent profile, publish lessons, offer live tutoring, and earn directly.</p>
                     </div>
                     <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
               </button>

               <div className="w-full text-left bg-white border border-slate-200 rounded-xl p-5 transition-all">
                  <div className="flex items-start justify-between mb-4">
                     <div>
                        <h3 className="font-semibold text-slate-800 text-lg">I'm joining my school's staff</h3>
                        <p className="text-xs text-slate-500 mt-1">Enter your school's invite code to securely link your profile and class schedule.</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <Input type="text" placeholder="e.g. EDF-9988-XY" className="flex-1 font-mono uppercase bg-slate-50" />
                     <Button className="bg-slate-800 hover:bg-slate-900 text-white">Verify Code</Button>
                  </div>
               </div>
            </div>
            
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg mt-6">
               <p className="text-xs text-orange-800 leading-relaxed font-medium">Institution staff onboarding requires an invite from your Headteacher or DOS. If your school has not yet onboarded to Maple, <a onClick={() => navigate('/institution-onboarding')} className="text-blue-600 hover:underline cursor-pointer">register your institution here</a>.</p>
            </div>
          </div>
        )}

        {/* Institution Registration UI */}
        {roleMode === 'institution' && (
          <div className="max-w-md w-full space-y-6 animate-in slide-in-from-right-4 fade-in duration-300 relative">
            <button 
              onClick={() => setRoleMode('selection')} 
              className="absolute -top-12 -left-2 text-blue-600 font-medium text-sm flex items-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Choose a different role
            </button>
            <h2 className="text-2xl font-bold text-slate-900">
              Sign up as an institution today!
            </h2>
            <form id="institution-form" onSubmit={(e) => handleStandardRegister(e, 'institution')} className="space-y-4">
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Institution Name</label>
                   <Input type="text" value={studentData.full_name} onChange={e => setStudentData({...studentData, full_name: e.target.value})} placeholder="e.g. Greenhill Academy" required/>
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Admin Email Address</label>
                   <Input type="email" value={studentData.email} onChange={e => setStudentData({...studentData, email: e.target.value})} placeholder="admin@school.com" required/>
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
                   <Input type="password" value={studentData.password} onChange={e => setStudentData({...studentData, password: e.target.value})} placeholder="At least 8 characters" required/>
                </div>
            </form>
            <div className="flex justify-center mt-6">
              <Button type="submit" form="institution-form" disabled={isLoading} className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 flex items-center justify-center gap-2">
                {isLoading ? 'Creating Account...' : 'Continue Setup'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
