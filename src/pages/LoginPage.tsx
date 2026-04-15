import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EditorialPanel } from '../components/ui/editorial/EditorialPanel';
import { EditorialPill } from '../components/ui/editorial/EditorialPill';
import { EditorialHeader } from '../components/ui/editorial/EditorialHeader';
import { Eye, EyeOff, KeyRound, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { ForgotPasswordFlow } from '../components/auth/ForgotPasswordFlow';

export const LoginPage: React.FC = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
    
    setIsLoading(false);
  };

  const demoAccounts = [
    { email: 'student1@edify.local', password: 'TestPass123!', role: 'Student', section: 'Secondary' },
    { email: 'teacher0@maplesch.com', password: 'MapleTest2026!', role: 'Teacher', section: 'Secondary' },
    { email: 'parent@email.com', password: 'demo123', role: 'Parent', section: 'Secondary' },
    
    { email: 'admin@institution.com', password: 'demo123', role: 'Institution Admin', section: 'Platform' },
    { email: 'admin@edify.local', password: 'AdminPass123!', role: 'Administrator', section: 'Platform' },
    
    { email: 'setup@institution.local', password: 'demo123', role: 'Inst. Onboarding', section: 'Commercial Sales Demo' },
    { email: 'trial@institution.local', password: 'demo123', role: 'Inst. Trial Period', section: 'Commercial Sales Demo' },
    { email: 'overdue@institution.local', password: 'demo123', role: 'Inst. Payment Due', section: 'Commercial Sales Demo' },
    { email: 'suspended@institution.local', password: 'demo123', role: 'Inst. Suspended', section: 'Commercial Sales Demo' },
    { email: 'active@institution.local', password: 'demo123', role: 'Inst. Premium Active', section: 'Commercial Sales Demo' },
    
    { email: 'primary.student@email.com', password: 'demo123', role: 'Primary Student', section: 'Primary' },
    { email: 'primary.teacher@maplesch.com', password: 'demo123', role: 'Primary Teacher', section: 'Primary' },
    { email: 'primary.admin@institution.com', password: 'demo123', role: 'Primary Admin', section: 'Primary' },
  ];

  return (
    <div className="min-h-screen bg-[#fafaeb] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Editorial aesthetic background layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.85]"
        style={{ backgroundImage: "url('/images/bg-editorial-sand.png')" }}
      />
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

      {/* Main Login Card - Refactored to match Pinterest reference */}
      <EditorialPanel 
        variant="frosted-rose" 
        radius="xl"
        className="max-w-[420px] w-full p-8 md:p-10 shadow-2xl shadow-rose-900/10 relative z-10"
      >
        <div className="flex justify-between items-center mb-10 w-full relative">
           <button onClick={() => navigate(-1)} className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-800 transition-colors flex items-center justify-center rounded-full hover:bg-white/50">
             <ArrowLeft className="w-5 h-5" />
           </button>
           <span className="text-slate-500 font-medium tracking-wide ml-8 sm:ml-6">Maple_</span>
           <Link to="/register" className="text-sm font-semibold text-slate-800 hover:text-slate-600 transition-colors">Sign up</Link>
        </div>

        <EditorialHeader level="h2" weight="light" className="mb-8">
          {isForgotPassword ? '' : 'Log in'}
        </EditorialHeader>

        {isForgotPassword ? (
          <ForgotPasswordFlow onBack={() => setIsForgotPassword(false)} />
        ) : (
          <>
            <form className="space-y-4" onSubmit={handleSubmit}>
          
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                 <Mail className="h-3.5 w-3.5 text-slate-400" />
               </div>
             </div>
             <input
               id="email"
               type="email"
               required
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="w-full bg-white/50 border border-white focus:border-slate-300 focus:bg-white rounded-full py-4 pl-14 pr-6 text-sm outline-none transition-all placeholder:text-slate-500"
               placeholder="e-mail address"
             />
          </div>

          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                 <KeyRound className="h-3.5 w-3.5 text-slate-400" />
               </div>
             </div>
             <input
               id="password"
               type={showPassword ? 'text' : 'password'}
               required
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="w-full bg-white/50 border border-white focus:border-slate-300 focus:bg-white rounded-full py-4 pl-14 pr-16 text-sm outline-none transition-all placeholder:text-slate-500"
               placeholder="password"
             />
             <button
               type="button"
               className="absolute inset-y-0 right-4 flex items-center"
               onClick={() => setShowPassword(!showPassword)}
               tabIndex={-1}
               >
                 <div className="px-2 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors tracking-wide uppercase bg-transparent rounded-full hover:bg-slate-200/50">
                   {showPassword ? 'Hide' : 'Show'}
                 </div>
              </button>
           </div>
           
           <div className="flex justify-end">
             <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors tracking-wide uppercase">
               Forgot password?
             </button>
           </div>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-4 py-3 rounded-2xl text-xs text-center font-medium">
              {error}
            </div>
          )}

          <div className="pt-6 flex justify-between items-center text-[10px] text-slate-500 font-medium">
             <div className="max-w-[200px] leading-relaxed">
               Secure access to Maple premium platform. Ensure you are on the official domain.
             </div>
             <button 
               type="submit" 
               disabled={isLoading}
               className="w-16 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50"
             >
               {isLoading ? <span className="animate-pulse flex gap-1"><span className="w-1 h-1 bg-white rounded-full"/><span className="w-1 h-1 bg-white rounded-full"/><span className="w-1 h-1 bg-white rounded-full"/></span> : <ArrowRight className="w-5 h-5" />}
             </button>
          </div>
        </form>

        {/* Demo Accounts (Refitted for editorial feel) */}
        <div className="mt-12 pt-6 border-t border-slate-300/30">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-4">Demo Access</p>
          {(['Commercial Sales Demo', 'Secondary', 'Primary', 'Platform'] as const).map((section) => {
            const accounts = demoAccounts.filter(a => a.section === section);
            if (accounts.length === 0) return null;
            return (
              <div key={section} className="mb-3">
                <p className="text-[9px] uppercase font-bold text-slate-400/70 tracking-widest mb-1.5 pl-1">{section}</p>
                <div className="space-y-1.5">
                  {accounts.map((account, index) => (
                    <button
                      key={index}
                      onClick={async () => {
                        setEmail(account.email);
                        setPassword(account.password);
                        setIsLoading(true);
                        setError('');
                        const success = await login(account.email, account.password);
                        if (success) {
                          navigate('/dashboard');
                        } else {
                          setError('Invalid email or password');
                        }
                        setIsLoading(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white/40 hover:bg-white/70 rounded-2xl transition-all text-left group"
                    >
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">{account.role}</span>
                      <span className="text-[10px] text-slate-500 truncate ml-2">{account.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        </>
        )}

      </EditorialPanel>
    </div>
  );
};
