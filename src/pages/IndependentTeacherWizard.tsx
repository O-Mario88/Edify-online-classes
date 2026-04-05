import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, GraduationCap, DollarSign, Wallet, FileText, CheckCircle, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const steps = [
  { id: 1, title: 'Account setup', icon: UserCircle },
  { id: 2, title: 'Credibility', icon: GraduationCap },
  { id: 3, title: 'Monetization disclosure', icon: HelpCircle },
  { id: 4, title: 'Payout setup', icon: Wallet },
];

export const IndependentTeacherWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    full_name: '', phone: '', email: '', password: '', country: 'uganda', bio: '',
    experience_years: '', specialization: '',
    payout_network: 'mtn_momo', account_name: '', payout_phone: ''
  });

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev > 1 ? prev - 1 : prev);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Real implementation would post to /api/marketplace/onboard-teacher/
    await new Promise(res => setTimeout(res, 1500));
    setIsSubmitting(false);
    navigate('/'); // Mock redirect for now
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* LEFT NAVIGATION WIZARD PANE */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-sm z-10">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg text-slate-900 tracking-tight">Creator Setup</h2>
              <p className="text-xs text-slate-500 mt-1">Independent Educator</p>
            </div>
            {/* Progress Circular Indicator */}
            <div className="w-10 h-10 rounded-full border-4 border-emerald-100 flex items-center justify-center relative">
               <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle cx="50%" cy="50%" r="42%" className="stroke-emerald-600" strokeWidth="3" fill="none" strokeDasharray={`${(currentStep/8) * 100} 100`} />
               </svg>
               <span className="text-[10px] font-bold text-emerald-700">{currentStep}/8</span>
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
                  isCurrent ? 'bg-emerald-50/70 border border-emerald-100 shadow-sm text-emerald-700 font-semibold' : 
                  isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' : isCurrent ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100'}`}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className="flex-1">{step.title}</span>
              </div>
            );
          })}
          
          {/* Faded future steps */}
          {['Content Offers', 'First Lesson', 'Public Profile', 'Launch Dashboard'].map((title, idx) => (
             <div key={idx} className="flex items-center gap-3 p-3 text-sm rounded-xl text-slate-300">
                <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold">{idx + 5}</span>
                </div>
                <span className="flex-1">{title}</span>
             </div>
          ))}
        </div>
      </div>

      {/* RIGHT CONTENT PANE */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 relative">
        <div className="max-w-2xl mx-auto py-12 px-8 pb-32">
          
          {/* Step 1: Base Account */}
          {currentStep === 1 && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                   <h1 className="text-3xl font-bold text-slate-900 mb-2">Create your educator account</h1>
                   <p className="text-slate-500 text-sm">Become part of the marketplace. Thousands of students are looking for your expertise.</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
                    <div>
                       <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
                       <Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="e.g. Samuel Kimbugwe" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
                          <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="you@example.com" />
                       </div>
                       <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phone Number</label>
                          <Input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+256..." />
                       </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Short Bio</label>
                        <textarea className="w-full h-24 p-3 border border-slate-300 rounded-[4px] text-sm focus:border-blue-500 outline-none resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="I am an experienced mathematics teacher specializing in A-Level pure math..."></textarea>
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Platform Password</label>
                       <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="********" />
                    </div>
                </div>
             </div>
          )}

          {/* Step 2: Credibility */}
          {currentStep === 2 && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                   <h1 className="text-3xl font-bold text-slate-900 mb-2">Establish your credibility</h1>
                   <p className="text-slate-500 text-sm">Parents and students buy from teachers they can trust. Tell us about your background.</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
                    <div>
                       <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Years of Experience</label>
                       <select className="w-full h-11 px-3 border border-slate-300 rounded-[4px] text-sm outline-none" value={formData.experience_years} onChange={e => setFormData({...formData, experience_years: e.target.value})}>
                          <option value="">Select years</option>
                          <option value="1-3">1 - 3 years</option>
                          <option value="4-7">4 - 7 years</option>
                          <option value="8+">8+ years</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Top Area of Specialization</label>
                       <Input value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} placeholder="e.g. O-Level Chemistry practicals" />
                    </div>
                    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                       <p className="text-sm font-semibold text-slate-800 mb-1">Verify Your Teaching License</p>
                       <p className="text-xs text-slate-500 mb-3">Optional but highly recommended. Verified teachers receive a blue badge and get 3x more marketplace traction.</p>
                       <Button variant="outline" className="text-xs h-8">Upload Supporting Document</Button>
                    </div>
                </div>
             </div>
          )}

          {/* Step 3: Monetization Disclosure */}
          {currentStep === 3 && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                   <h1 className="text-3xl font-bold text-slate-900 mb-2">How you get paid on Edify</h1>
                   <p className="text-slate-500 text-sm">We believe in transparent monetization before you publish your first lesson.</p>
                </div>
                
                <div className="space-y-4">
                   <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6 flex gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                         <DollarSign className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-800 text-lg">Earnings per Qualified Lesson</h3>
                         <p className="text-sm text-slate-600 mt-1">You will earn **UGX 20,000** for every qualified lesson you publish and conduct with at least 5 registered learners attending meaningfully.</p>
                      </div>
                   </div>

                   <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                         <FileText className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-800 text-lg">Annual Access Fee</h3>
                         <p className="text-sm text-slate-600 mt-1">The marketplace fee is **UGX 300,000** annually. <span className="font-semibold text-emerald-700">You do not pay this upfront!</span> It is automatically recovered in 5 small deductions from your first payouts.</p>
                      </div>
                   </div>

                   <div className="mt-8 pt-6 border-t border-slate-200">
                      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200">
                         <input type="checkbox" checked={hasAcceptedTerms} onChange={(e) => setHasAcceptedTerms(e.target.checked)} className="mt-1 w-5 h-5 rounded text-emerald-600" />
                         <div>
                            <p className="font-semibold text-slate-800 text-sm">I accept the Monetization Agreement</p>
                            <p className="text-xs text-slate-500 mt-0.5">I understand that I am setting up as an independent educator responsible for creating qualified content, and I agree to the fee deduction model.</p>
                         </div>
                      </label>
                   </div>
                </div>
             </div>
          )}

          {/* Step 4: Payout Setup */}
          {currentStep === 4 && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                   <h1 className="text-3xl font-bold text-slate-900 mb-2">Connect your payout method</h1>
                   <p className="text-slate-500 text-sm">Where should we send your earnings when you request a payout?</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
                    <div>
                       <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Preferred Mobile Network</label>
                       <div className="grid grid-cols-2 gap-4">
                          <div 
                            onClick={() => setFormData({...formData, payout_network: 'mtn_momo'})} 
                            className={`border rounded-xl flex items-center justify-between p-4 cursor-pointer ${formData.payout_network === 'mtn_momo' ? 'bg-yellow-50 border-yellow-500 ring-1 ring-yellow-500' : 'bg-white hover:bg-slate-50'}`}
                          >
                             <span className="font-semibold text-sm text-slate-800">MTN MoMo</span>
                             {formData.payout_network === 'mtn_momo' && <CheckCircle className="w-5 h-5 text-yellow-600" />}
                          </div>
                          <div 
                            onClick={() => setFormData({...formData, payout_network: 'airtel_money'})} 
                            className={`border rounded-xl flex items-center justify-between p-4 cursor-pointer ${formData.payout_network === 'airtel_money' ? 'bg-red-50 border-red-500 ring-1 ring-red-500' : 'bg-white hover:bg-slate-50'}`}
                          >
                             <span className="font-semibold text-sm text-slate-800">Airtel Money</span>
                             {formData.payout_network === 'airtel_money' && <CheckCircle className="w-5 h-5 text-red-600" />}
                          </div>
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Registered Account Name</label>
                       <Input value={formData.account_name} onChange={e => setFormData({...formData, account_name: e.target.value})} placeholder="Name matching the mobile money account" />
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Mobile Money Number</label>
                       <Input type="tel" value={formData.payout_phone} onChange={e => setFormData({...formData, payout_phone: e.target.value})} placeholder="+256..." />
                    </div>
                </div>
             </div>
          )}

        </div>
        
        {/* Fixed Footer */}
        <div className="fixed bottom-0 left-72 right-0 p-5 bg-white border-t border-slate-200 flex items-center justify-between z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
           <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="h-11 px-6 border-slate-300">Back</Button>
           
           {currentStep === 3 && !hasAcceptedTerms ? (
             <Button disabled className="h-11 px-8 bg-slate-300 text-white rounded-[4px]">Accept Terms to Continue</Button>
           ) : currentStep === 4 ? (
             <Button onClick={handleSubmit} disabled={isSubmitting || !formData.payout_phone || !formData.account_name} className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[4px] shadow-sm flex items-center gap-2">
                {isSubmitting ? 'Saving Profile...' : 'Save Payout & Continue'} <ArrowRight className="w-4 h-4" />
             </Button>
           ) : (
             <Button onClick={nextStep} className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-[4px] shadow-sm flex items-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
             </Button>
           )}
        </div>

      </div>
    </div>
  );
};
