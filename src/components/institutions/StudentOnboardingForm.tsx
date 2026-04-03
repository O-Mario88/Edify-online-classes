import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, UserPlus, Phone, Lock, Save, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function StudentOnboardingForm() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parentWarning, setParentWarning] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    classLevel: '',
    learnerId: '',
    parentName: '',
    parentPhone: '',
    parentRelationship: '',
    pin: ''
  });

  // Generated Outputs
  const [outputs, setOutputs] = useState({
    studentId: '',
    username: ''
  });

  const handleNext = () => {
    // Step 1 -> 2
    if (step === 1) {
      if (!formData.fullName || !formData.classLevel) {
        toast({ title: 'Missing fields', description: 'Name and Class are required.', variant: 'destructive' });
        return;
      }
      setStep(2);
    }
    // Step 2 -> 3 (Payment Emulation)
    else if (step === 2) {
      if (!formData.parentName || !formData.parentPhone) {
        toast({ title: 'Missing fields', description: 'Parent details are required.', variant: 'destructive' });
        return;
      }

      // Mock duplicate check (Siblings rule)
      if (formData.parentPhone === '0770000000' && !parentWarning) {
         setParentWarning(true);
         return;
      }

      setIsProcessing(true);
      
      // Simulating Payment dispatch loop
      setTimeout(() => {
        setIsProcessing(false);
        setStep(3);
        toast({ title: "Payment Verified", description: "MTN Mobile Money secured." });
      }, 3000);
    }
  };

  const handleFinalize = () => {
    if (formData.pin.length !== 4) {
      toast({ title: 'Invalid PIN', description: 'PIN must be exactly 4 digits.', variant: 'destructive' });
      return;
    }
    
    setIsProcessing(true);
    setTimeout(() => {
      setOutputs({
        studentId: `EDU-UG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        username: `${formData.fullName.split(' ')[0].toLowerCase()}${Math.floor(100 + Math.random() * 900)}`
      });
      setIsProcessing(false);
      setStep(4);
      toast({ title: "Account Active", description: "Student successfully onboarded to the institution." });
    }, 1500);
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-t-4 border-t-indigo-600">
      <CardHeader className="border-b bg-slate-50/50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <UserPlus className="w-5 h-5 text-indigo-600" /> Institution Learner Onboarding
        </CardTitle>
        <CardDescription>
          Provision a single learner. Payment through parent Mobile Money acts as activation gate.
        </CardDescription>
        
        {/* Stepper UI */}
        <div className="flex justify-between items-center mt-6 relative px-4">
           {/* Step 1 */}
           <div className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
              <span className="text-xs font-semibold mt-2 text-slate-600">Profile</span>
           </div>
           <div className={`absolute top-4 left-8 right-1/2 h-1 -z-0 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
           
           {/* Step 2 */}
           <div className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
              <span className="text-xs font-semibold mt-2 text-slate-600">Parent & Pay</span>
           </div>
           <div className={`absolute top-4 left-1/2 right-8 h-1 -z-0 ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
           
           {/* Step 3 */}
           <div className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
              <span className="text-xs font-semibold mt-2 text-slate-600">Account</span>
           </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <h3 className="font-bold text-slate-900 border-b pb-2">Learner Demographics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-semibold">Full Name *</label>
                <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Class Level *</label>
                <Select onValueChange={(val) => setFormData({...formData, classLevel: val})}>
                  <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="s1">Senior 1</SelectItem>
                    <SelectItem value="s2">Senior 2</SelectItem>
                    <SelectItem value="s3">Senior 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Learner ID (LIN) <span className="text-slate-400 font-normal">(Optional)</span></label>
                <Input value={formData.learnerId} onChange={e => setFormData({...formData, learnerId: e.target.value})} placeholder="National ID or school admin no." />
              </div>
            </div>
            <Button onClick={handleNext} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700">Continue to Payment Context</Button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h3 className="font-bold text-slate-900 border-b pb-2">Parent / Payment Guardian</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-semibold">Parent / Guardian Full Name *</label>
                <Input value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} placeholder="e.g. Mary Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Mobile Money Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input className="pl-9" value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} placeholder="07XX XXX XXX" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Relationship</label>
                <Select onValueChange={(val) => setFormData({...formData, parentRelationship: val})}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="guardian">Guardian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {parentWarning && (
               <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm mt-4">
                  <strong>Sibling Found:</strong> A parent profile already exists for this phone number. Pressing 'Send Payment Request' will safely link this new learner to the existing parent wallet without duplicating records.
               </div>
            )}

            <Button onClick={handleNext} disabled={isProcessing} className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold h-12">
              {isProcessing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying Transaction...</> : "Send Mobile Money Request"}
            </Button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-emerald-50 text-emerald-800 p-4 border border-emerald-200 rounded flex gap-3 font-semibold mb-6">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                 Payment Confirmed. <br/>
                 <span className="text-sm font-normal text-emerald-600">You may now generate the login credentials for {formData.fullName}.</span>
              </div>
            </div>

            <h3 className="font-bold text-slate-900 border-b pb-2">Student Computer Lab Login</h3>
            <p className="text-sm text-slate-500">Since no email was provided, the system will generate a username. You only need to set a secure 4-digit PIN for the student.</p>
            
            <div className="space-y-2 mt-4">
              <label className="text-sm font-semibold">Create 4-Digit Login PIN</label>
              <div className="relative max-w-[200px]">
                 <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                 <Input 
                   type="password" 
                   maxLength={4} 
                   className="pl-10 text-center tracking-[1em] font-black text-xl bg-slate-50 border-slate-300" 
                   value={formData.pin} 
                   onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})} 
                   placeholder="0000" 
                 />
              </div>
            </div>

            <Button onClick={handleFinalize} disabled={isProcessing || formData.pin.length !== 4} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 font-bold text-white h-12">
              {isProcessing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Provisioning Credentials...</> : "Complete Activation"}
            </Button>
          </div>
        )}

        {/* DONE / STEP 4 */}
        {step === 4 && (
          <div className="text-center py-6 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Student Ready!</h2>
            <p className="text-slate-500 mb-6">The profile is active and securely mapped to the parent wallet.</p>
            
            <div className="bg-slate-100 border border-slate-200 rounded p-6 max-w-sm mx-auto text-left relative overflow-hidden">
               <div className="absolute top-0 w-full h-1 bg-indigo-600 left-0"></div>
               <p className="font-bold text-slate-600 uppercase text-xs tracking-wider mb-4 border-b pb-2">Login Credentials Slip</p>
               
               <div className="space-y-3">
                 <div>
                   <span className="text-xs text-slate-400 block">Name:</span>
                   <strong className="text-slate-900">{formData.fullName}</strong>
                 </div>
                 <div>
                   <span className="text-xs text-slate-400 block">Student ID (Internal):</span>
                   <strong className="text-indigo-600 font-mono text-sm">{outputs.studentId}</strong>
                 </div>
                 <div>
                   <span className="text-xs text-slate-400 block">Login Username:</span>
                   <strong className="text-slate-900 font-mono text-lg bg-white px-2 py-1 rounded inline-block border shadow-sm">{outputs.username}</strong>
                 </div>
                 <div>
                   <span className="text-xs text-slate-400 block">PIN:</span>
                   <strong className="text-slate-900 text-lg">****</strong>
                 </div>
               </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-8">
               <Button variant="outline"><FileText className="w-4 h-4 mr-2" /> Print Slip</Button>
               <Button onClick={() => { setStep(1); setFormData({...formData, fullName:'', learnerId:'', pin:''}); }} className="bg-indigo-600 hover:bg-indigo-700">Onboard Another</Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
