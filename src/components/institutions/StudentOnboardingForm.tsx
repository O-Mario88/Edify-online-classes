import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, CheckCircle2, UserPlus, Phone, Lock, FileText, 
  Shield, Users, CreditCard, Smartphone, AlertCircle, ArrowLeft,
  Star, Clock, ChevronRight, UserCheck, Banknote, RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_ugx: string;
  price_usd: string;
  duration_days: number;
  access_scope: string;
}

interface PaymentResult {
  transaction_id?: string;
  status: string;
  message?: string;
  redirect_url?: string;
}

export function StudentOnboardingForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  // Plans from backend
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  // Step 1: Student Details
  const [formData, setFormData] = useState({
    fullName: '',
    classLevel: '',
    streamSection: '',
    learnerId: '',
    gender: '',
  });

  // Step 2: Parent Details
  const [parentData, setParentData] = useState({
    parentName: '',
    parentPhone: '',
    parentPhoneSecondary: '',
    parentRelationship: '',
    parentEmail: '',
    parentAddress: '',
    parentConsent: false,
  });

  // Step 3: Parent link result
  const [parentLinkResult, setParentLinkResult] = useState<{
    isNewParent: boolean;
    parentName: string;
  } | null>(null);

  // Step 4: Subscription
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // Step 5: Payment
  const [paymentMethod, setPaymentMethod] = useState('');
  const [payerPhone, setPayerPhone] = useState('');

  // Step 6: Payment processing state
  const [paymentState, setPaymentState] = useState<'idle' | 'initiating' | 'awaiting' | 'polling' | 'success' | 'failed'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');

  // Registration tracking
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Step 7: Outputs
  const [outputs, setOutputs] = useState({ studentId: '', username: '', fullName: '' });
  const [pin, setPin] = useState('');

  // Fetch subscription plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await apiClient.get('/institutions/learner-registrations/subscription_plans/');
        if (data && Array.isArray(data)) {
          setPlans(data as SubscriptionPlan[]);
        }
      } catch (err) {
        // Fallback with mock plans if API isn't available
        setPlans([
          { id: 1, name: 'Monthly Plan', slug: 'monthly', description: 'Month-to-month access. Flexible billing.', price_ugx: '150000', price_usd: '40', duration_days: 30, access_scope: 'full' },
          { id: 2, name: 'Term Plan', slug: 'termly', description: 'Full academic term (3 months). Most popular.', price_ugx: '400000', price_usd: '110', duration_days: 90, access_scope: 'full' },
          { id: 3, name: 'Annual Plan', slug: 'yearly', description: 'Full year access. Maximum savings.', price_ugx: '1200000', price_usd: '330', duration_days: 365, access_scope: 'premium' },
        ]);
      }
    };
    fetchPlans();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pollInterval]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  // ── Step Handlers ────────────────────────────────────────────────────

  const handleStep1Next = () => {
    if (!formData.fullName || !formData.classLevel) {
      toast({ title: 'Missing fields', description: 'Full name and class level are required.', variant: 'destructive' });
      return;
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!parentData.parentName || !parentData.parentPhone) {
      toast({ title: 'Missing fields', description: 'Parent name and phone number are required.', variant: 'destructive' });
      return;
    }
    if (!parentData.parentConsent) {
      toast({ title: 'Consent required', description: 'Parent/guardian consent is required to proceed.', variant: 'destructive' });
      return;
    }
    
    // Submit to backend (Steps 1+2 combined)
    handleStartRegistration();
  };

  const handleStartRegistration = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await apiClient.post('/institutions/learner-registrations/start_registration/', {
        institution_id: (user as any)?.institution_id || 1,
        full_name: formData.fullName,
        learner_id_number: formData.learnerId,
        gender: formData.gender,
        stream_section: formData.streamSection,
        parent_name: parentData.parentName,
        parent_phone: parentData.parentPhone,
        parent_phone_secondary: parentData.parentPhoneSecondary,
        parent_relationship: parentData.parentRelationship,
        parent_email: parentData.parentEmail,
        parent_address: parentData.parentAddress,
        parent_consent: parentData.parentConsent,
      });

      const result = data as any;
      setRegistrationId(result.registration_id);
      setParentLinkResult({
        isNewParent: result.is_new_parent,
        parentName: result.parent_name || parentData.parentName,
      });
      
      // Pre-fill payer phone from parent phone
      setPayerPhone(parentData.parentPhone);
      
      setStep(3);
      toast({ title: 'Parent Linked', description: result.is_new_parent ? 'New parent account created.' : 'Linked to existing parent account.' });
    } catch (error: any) {
      toast({ title: 'Registration Failed', description: error?.response?.data?.detail || 'Could not begin registration.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectSubscription = async () => {
    if (!selectedPlanId || !registrationId) return;
    
    setIsProcessing(true);
    try {
      const { data } = await apiClient.post(`/institutions/learner-registrations/${registrationId}/select_subscription/`, {
        plan_id: selectedPlanId,
      });
      setStep(5);
      toast({ title: 'Plan Selected', description: `${selectedPlan?.name} attached to registration.` });
    } catch (error: any) {
      toast({ title: 'Selection Failed', description: error?.response?.data?.detail || 'Could not select plan.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitiatePayment = async () => {
    if (!paymentMethod || !registrationId) return;
    
    if ((paymentMethod === 'mtn_momo' || paymentMethod === 'airtel_money') && !payerPhone) {
      toast({ title: 'Missing phone', description: 'Please enter the paying phone number.', variant: 'destructive' });
      return;
    }

    setStep(6);
    setPaymentState('initiating');
    setPaymentMessage('Connecting to payment gateway...');
    
    try {
      const { data, error } = await apiClient.post(`/institutions/learner-registrations/${registrationId}/initiate_payment/`, {
        payment_method: paymentMethod,
        payer_phone: payerPhone,
      });

      if (error) throw new Error((error as any).message || 'Payment initiation failed');

      const result = data as any;
      setTransactionId(result.transaction_id);

      if (result.status === 'redirect' && result.redirect_url) {
        // Pesapal redirect flow
        setPaymentMessage('Redirecting to Pesapal secure checkout...');
        setTimeout(() => {
          window.location.href = result.redirect_url;
        }, 1500);
        return;
      }

      // MoMo/Airtel flow — start polling
      setPaymentState('awaiting');
      setPaymentMessage(result.message || 'Payment prompt sent. Please approve on your phone.');
      startPaymentPolling();
      
    } catch (err: any) {
      setPaymentState('failed');
      setPaymentMessage(err?.message || 'Payment initiation failed. Please retry.');
    }
  };

  const startPaymentPolling = () => {
    if (!registrationId) return;
    
    setPaymentState('polling');
    let attempts = 0;
    const maxAttempts = 40; // ~60 seconds at 1.5s intervals
    
    const interval = setInterval(async () => {
      attempts++;
      try {
        const { data } = await apiClient.get(`/institutions/learner-registrations/${registrationId}/check_payment_status/`);
        const result = data as any;
        
        if (result.payment_status === 'successful') {
          clearInterval(interval);
          setPollInterval(null);
          setPaymentState('success');
          setPaymentMessage('Payment confirmed! Ready to create student account.');
        } else if (result.payment_status === 'failed') {
          clearInterval(interval);
          setPollInterval(null);
          setPaymentState('failed');
          setPaymentMessage('Payment failed or was declined. Please retry.');
        }
      } catch (err) {
        // Continue polling on network errors
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setPollInterval(null);
        setPaymentState('failed');
        setPaymentMessage('Payment verification timed out. You can simulate or retry.');
      }
    }, 1500);
    
    setPollInterval(interval);
  };

  const handleSimulateSuccess = async () => {
    if (!registrationId) return;
    setIsProcessing(true);
    try {
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
      await apiClient.post(`/institutions/learner-registrations/${registrationId}/simulate_payment_success/`);
      setPaymentState('success');
      setPaymentMessage('Payment confirmed! Ready to create student account.');
      toast({ title: 'Payment Simulated', description: 'Sandbox payment marked as successful.' });
    } catch (err) {
      toast({ title: 'Simulation Failed', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivateAccount = async () => {
    if (pin.length !== 4) {
      toast({ title: 'Invalid PIN', description: 'PIN must be exactly 4 digits.', variant: 'destructive' });
      return;
    }
    if (!registrationId) return;
    
    setIsProcessing(true);
    try {
      const { data } = await apiClient.post(`/institutions/learner-registrations/${registrationId}/activate_account/`, { pin });
      const result = data as any;
      setOutputs({
        studentId: result.student_id,
        username: result.username,
        fullName: result.full_name,
      });
      setStep(7);
      toast({ title: 'Account Active', description: 'Student successfully onboarded!' });
    } catch (error: any) {
      toast({ title: 'Activation Failed', description: error?.response?.data?.detail || 'Could not activate account.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryPayment = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    setPaymentState('idle');
    setPaymentMessage('');
    setStep(5); // Go back to payment method selection
  };

  const handleOnboardAnother = () => {
    setStep(1);
    setFormData({ fullName: '', classLevel: '', streamSection: '', learnerId: '', gender: '' });
    setParentData({ parentName: '', parentPhone: '', parentPhoneSecondary: '', parentRelationship: '', parentEmail: '', parentAddress: '', parentConsent: false });
    setParentLinkResult(null);
    setSelectedPlanId(null);
    setPaymentMethod('');
    setPayerPhone('');
    setPaymentState('idle');
    setPaymentMessage('');
    setRegistrationId(null);
    setTransactionId(null);
    setOutputs({ studentId: '', username: '', fullName: '' });
    setPin('');
  };

  // ── Step Labels ──────────────────────────────────────────────────────

  const steps = [
    { num: 1, label: 'Student' },
    { num: 2, label: 'Parent' },
    { num: 3, label: 'Link' },
    { num: 4, label: 'Plan' },
    { num: 5, label: 'Method' },
    { num: 6, label: 'Pay' },
    { num: 7, label: 'Done' },
  ];

  return (
    <Card className="max-w-3xl mx-auto shadow-2xl border-0 overflow-hidden bg-white dark:bg-slate-900">
      {/* Premium Header with Gradient */}
      <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white pb-8 pt-6 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTIwIDBMMCA0MGg0MEwyMCAweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="relative z-10">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <UserPlus className="w-5 h-5" /> Student Onboarding
          </CardTitle>
          <CardDescription className="text-indigo-100 mt-1">
            Payment-gated activation • Parent auto-onboarding • Secure credentials
          </CardDescription>
        </div>
        
        {/* Step Progress Bar */}
        <div className="relative z-10 mt-6 flex items-center justify-between px-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step > s.num ? 'bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-400/30' :
                  step === s.num ? 'bg-white text-indigo-700 shadow-lg shadow-white/30 ring-2 ring-white/50' :
                  'bg-white/20 text-white/60'
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-[10px] mt-1.5 font-medium transition-all ${
                  step >= s.num ? 'text-white' : 'text-white/40'
                }`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded transition-all duration-500 ${
                  step > s.num ? 'bg-emerald-400' : 'bg-white/20'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        
        {/* ────────────── STEP 1: Student Details ────────────── */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Student Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                <Input 
                  value={formData.fullName} 
                  onChange={e => setFormData({...formData, fullName: e.target.value})} 
                  placeholder="e.g. John Doe Nakamya" 
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Class Level <span className="text-red-500">*</span></label>
                <Select onValueChange={(val) => setFormData({...formData, classLevel: val})}>
                  <SelectTrigger className="h-11 bg-slate-50"><SelectValue placeholder="Select Class" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="p4">Primary 4</SelectItem>
                    <SelectItem value="p5">Primary 5</SelectItem>
                    <SelectItem value="p6">Primary 6</SelectItem>
                    <SelectItem value="p7">Primary 7</SelectItem>
                    <SelectItem value="s1">Senior 1</SelectItem>
                    <SelectItem value="s2">Senior 2</SelectItem>
                    <SelectItem value="s3">Senior 3</SelectItem>
                    <SelectItem value="s4">Senior 4</SelectItem>
                    <SelectItem value="s5">Senior 5</SelectItem>
                    <SelectItem value="s6">Senior 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Gender</label>
                <Select onValueChange={(val) => setFormData({...formData, gender: val})}>
                  <SelectTrigger className="h-11 bg-slate-50"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Stream / Section</label>
                <Input value={formData.streamSection} onChange={e => setFormData({...formData, streamSection: e.target.value})} placeholder="e.g. East, Stream A" className="h-11 bg-slate-50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Learner ID (LIN) <span className="text-xs text-slate-400">(optional)</span></label>
                <Input value={formData.learnerId} onChange={e => setFormData({...formData, learnerId: e.target.value})} placeholder="National ID or school admin no." className="h-11 bg-slate-50" />
              </div>
            </div>
            <Button onClick={handleStep1Next} className="w-full mt-4 h-12 bg-indigo-600 hover:bg-indigo-700 font-semibold text-base shadow-lg shadow-indigo-200/50 transition-all hover:shadow-xl hover:shadow-indigo-300/50">
              Continue to Parent Details <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* ────────────── STEP 2: Parent / Guardian Details ────────────── */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Parent / Guardian</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                <Input value={parentData.parentName} onChange={e => setParentData({...parentData, parentName: e.target.value})} placeholder="e.g. Mary Doe Nakamya" className="h-11 bg-slate-50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Primary Phone <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <Input className="pl-9 h-11 bg-slate-50" value={parentData.parentPhone} onChange={e => setParentData({...parentData, parentPhone: e.target.value})} placeholder="07XX XXX XXX" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Secondary Phone</label>
                <Input value={parentData.parentPhoneSecondary} onChange={e => setParentData({...parentData, parentPhoneSecondary: e.target.value})} placeholder="Optional" className="h-11 bg-slate-50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Relationship</label>
                <Select onValueChange={(val) => setParentData({...parentData, parentRelationship: val})}>
                  <SelectTrigger className="h-11 bg-slate-50"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="guardian">Guardian</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email <span className="text-xs text-slate-400">(optional)</span></label>
                <Input type="email" value={parentData.parentEmail} onChange={e => setParentData({...parentData, parentEmail: e.target.value})} placeholder="parent@email.com" className="h-11 bg-slate-50" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-semibold text-slate-700">Address</label>
                <Input value={parentData.parentAddress} onChange={e => setParentData({...parentData, parentAddress: e.target.value})} placeholder="Kampala, Uganda" className="h-11 bg-slate-50" />
              </div>
            </div>
            
            {/* Consent Checkbox */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <input 
                type="checkbox" 
                checked={parentData.parentConsent} 
                onChange={e => setParentData({...parentData, parentConsent: e.target.checked})}
                className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <p className="text-sm font-semibold text-amber-900">Parent/Guardian Consent</p>
                <p className="text-xs text-amber-700 mt-0.5">I confirm that the parent/guardian has authorized the creation of this student account and associated payment processing.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="h-12 px-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleStep2Next} disabled={isProcessing} className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 font-semibold text-base shadow-lg">
                {isProcessing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating Parent Link...</> : <>Link Parent & Continue <ChevronRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </div>
          </div>
        )}

        {/* ────────────── STEP 3: Parent Account Confirmation ────────────── */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100/50">
                <UserCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-1">
                {parentLinkResult?.isNewParent ? 'New Parent Account Created!' : 'Parent Account Linked!'}
              </h3>
              <p className="text-emerald-700 text-sm">
                {parentLinkResult?.isNewParent 
                  ? `A new parent portal account has been created for ${parentLinkResult?.parentName}. Default login PIN: last 4 digits of their phone number.`
                  : `${parentLinkResult?.parentName} was found in the system. ${formData.fullName} has been automatically linked as a child under their account.`}
              </p>
            </div>
            
            <div className="bg-slate-50 border rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Student</span><span className="font-semibold text-slate-900">{formData.fullName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Parent</span><span className="font-semibold text-slate-900">{parentData.parentName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-mono text-slate-900">{parentData.parentPhone}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Relationship</span><span className="text-slate-900 capitalize">{parentData.parentRelationship || '—'}</span></div>
            </div>

            <Button onClick={() => setStep(4)} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-semibold text-base shadow-lg">
              Choose Subscription Plan <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* ────────────── STEP 4: Subscription Selection ────────────── */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Select Subscription</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
                    selectedPlanId === plan.id
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-200'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md bg-white'
                  }`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{plan.name}</h4>
                        {plan.slug === 'termly' && (
                          <Badge className="bg-indigo-100 text-indigo-700 border-none text-[10px]">
                            <Star className="w-3 h-3 mr-0.5" /> Popular
                          </Badge>
                        )}
                        {plan.slug === 'yearly' && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px]">Best Value</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {plan.duration_days} days</span>
                        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {plan.access_scope}</span>
                      </div>
                    </div>
                    <div className="text-right pl-4">
                      <div className="text-2xl font-black text-slate-900">UGX {parseInt(plan.price_ugx).toLocaleString()}</div>
                      <div className="text-xs text-slate-400">≈ USD {parseInt(plan.price_usd).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)} className="h-12 px-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleSelectSubscription} disabled={!selectedPlanId || isProcessing} className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-base shadow-lg">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue to Payment <ChevronRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </div>
          </div>
        )}

        {/* ────────────── STEP 5: Payment Method ────────────── */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Payment Method</h3>
            </div>
            
            {/* Order Summary */}
            <div className="bg-slate-50 border rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Student</span><span className="font-semibold">{formData.fullName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Plan</span><span className="font-semibold">{selectedPlan?.name}</span></div>
              <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold text-slate-900">Total Due</span><span className="font-black text-lg text-indigo-700">UGX {selectedPlan ? parseInt(selectedPlan.price_ugx).toLocaleString() : '—'}</span></div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              {[
                { id: 'mtn_momo', name: 'MTN Mobile Money', icon: <Smartphone className="h-5 w-5 text-yellow-600" />, desc: 'Pay via MTN MoMo. Prompt sent to phone.', popular: true, color: 'yellow' },
                { id: 'airtel_money', name: 'Airtel Money', icon: <Smartphone className="h-5 w-5 text-red-500" />, desc: 'Pay via Airtel Money. Prompt sent to phone.', color: 'red' },
                { id: 'visa_pesapal', name: 'Visa / Mastercard (Pesapal)', icon: <CreditCard className="h-5 w-5 text-purple-600" />, desc: 'Card payment via Pesapal secure checkout.', color: 'purple' },
              ].map((method) => (
                <div
                  key={method.id}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    paymentMethod === method.id
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center shadow-sm">{method.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{method.name}</span>
                        {method.popular && <Badge className="bg-yellow-100 text-yellow-800 border-none text-[10px]">Popular</Badge>}
                      </div>
                      <p className="text-xs text-slate-500">{method.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === method.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                    }`}>
                      {paymentMethod === method.id && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Phone Number for MoMo/Airtel */}
            {(paymentMethod === 'mtn_momo' || paymentMethod === 'airtel_money') && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <label className="text-sm font-semibold text-slate-700">Paying Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <Input className="pl-9 h-11 bg-slate-50" value={payerPhone} onChange={e => setPayerPhone(e.target.value)} placeholder="07XX XXX XXX" />
                </div>
                <p className="text-xs text-slate-400">A payment approval prompt will be sent to this number.</p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2 text-xs text-blue-700">
              <Shield className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Payment is processed securely through authorized financial service providers. Maple Online School does not store your financial credentials. By proceeding, you agree to the <span className="font-semibold underline cursor-pointer">Terms of Service</span>.</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(4)} className="h-12 px-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleInitiatePayment} disabled={!paymentMethod} className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-200/50">
                Pay UGX {selectedPlan ? parseInt(selectedPlan.price_ugx).toLocaleString() : '—'} <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ────────────── STEP 6: Payment Processing ────────────── */}
        {step === 6 && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
            {paymentState === 'initiating' && (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Initializing Payment</h3>
                <p className="text-slate-500 text-sm mt-1">{paymentMessage}</p>
              </div>
            )}

            {(paymentState === 'awaiting' || paymentState === 'polling') && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-amber-50 border-4 border-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Smartphone className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-amber-900">Awaiting Phone Authorization</h3>
                <p className="text-amber-700 text-sm mt-1">{paymentMessage}</p>
                <p className="text-xs text-slate-400 mt-3">Please check your phone and approve the payment prompt.</p>
                
                <div className="mt-6 bg-slate-50 border rounded-xl p-4 space-y-3 max-w-sm mx-auto">
                  <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-500"></div>
                    Polling for confirmation...
                  </div>
                  
                  <Button size="sm" onClick={handleSimulateSuccess} disabled={isProcessing} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Simulate Payment Success
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleRetryPayment} className="w-full text-slate-600">
                    <RefreshCw className="w-4 h-4 mr-2" /> Change Payment Method
                  </Button>
                </div>
              </div>
            )}

            {paymentState === 'success' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-50 border-4 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">Payment Confirmed!</h3>
                <p className="text-emerald-700 text-sm mt-1">Now set a 4-digit login PIN for the student.</p>
                
                <div className="mt-6 max-w-xs mx-auto space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 text-left block">Student Login PIN</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <Input 
                        type="password" 
                        maxLength={4} 
                        className="pl-10 text-center tracking-[0.8em] font-black text-2xl bg-slate-50 border-slate-300 h-14" 
                        value={pin} 
                        onChange={e => setPin(e.target.value.replace(/\D/g, ''))} 
                        placeholder="• • • •" 
                      />
                    </div>
                  </div>
                  
                  <Button onClick={handleActivateAccount} disabled={isProcessing || pin.length !== 4} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-bold text-base shadow-lg">
                    {isProcessing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Activating...</> : 'Activate Student Account'}
                  </Button>
                </div>
              </div>
            )}

            {paymentState === 'failed' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-red-50 border-4 border-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-red-900">Payment Failed</h3>
                <p className="text-red-600 text-sm mt-1">{paymentMessage}</p>
                <p className="text-xs text-slate-400 mt-2">Your student and parent information have been saved. You can retry without re-entering details.</p>
                
                <div className="mt-6 space-y-3 max-w-sm mx-auto">
                  <Button onClick={handleRetryPayment} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-lg">
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry Payment
                  </Button>
                  <Button onClick={handleSimulateSuccess} variant="outline" className="w-full text-emerald-700 border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Simulate Success (Dev)
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ────────────── STEP 7: Success ────────────── */}
        {step === 7 && (
          <div className="text-center py-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-200/50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">Student Activated!</h2>
            <p className="text-slate-500 mb-6">The profile is active and securely mapped to the parent portal.</p>
            
            {/* Credentials Slip */}
            <div className="bg-gradient-to-b from-slate-50 to-white border-2 border-slate-200 rounded-2xl p-6 max-w-sm mx-auto text-left relative overflow-hidden shadow-lg">
              <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 left-0"></div>
              <p className="font-bold text-slate-500 uppercase text-[10px] tracking-[0.2em] mb-4 border-b border-dashed pb-2">Login Credentials Slip</p>
              
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Student Name</span>
                  <strong className="text-slate-900 text-base">{outputs.fullName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Student ID</span>
                  <strong className="text-indigo-700 font-mono text-sm">{outputs.studentId}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Login Username</span>
                  <strong className="text-slate-900 font-mono text-lg bg-indigo-50 px-3 py-1.5 rounded-lg inline-block border border-indigo-100 shadow-sm">{outputs.username}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">PIN</span>
                  <strong className="text-slate-900 text-lg">• • • •</strong>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-3 mt-8">
              <Button variant="outline" className="shadow-sm">
                <FileText className="w-4 h-4 mr-2" /> Print Slip
              </Button>
              <Button onClick={handleOnboardAnother} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50">
                <UserPlus className="w-4 h-4 mr-2" /> Onboard Another
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
