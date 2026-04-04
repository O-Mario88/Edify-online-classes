import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EditorialPanel } from '../components/ui/editorial/EditorialPanel';
import { EditorialPill } from '../components/ui/editorial/EditorialPill';
import { EditorialHeader } from '../components/ui/editorial/EditorialHeader';
import { Eye, EyeOff, KeyRound, Mail, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
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
    { email: 'grace.nakato@email.com', role: 'Student' },
    { email: 'sarah.nakamya@maplesch.com', role: 'Teacher' },
    { email: 'christine.namaganda@maplesch.com', role: 'Administrator' },
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
        <div className="flex justify-between items-center mb-10">
           <span className="text-slate-500 font-medium tracking-wide">Edify_</span>
           <Link to="/register" className="text-sm font-semibold text-slate-800 hover:text-slate-600 transition-colors">Sign up</Link>
        </div>

        <EditorialHeader level="h2" weight="light" className="mb-8">
          Log in
        </EditorialHeader>

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
                <div className="bg-white px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors tracking-wide uppercase">
                  {showPassword ? 'Hide' : 'Forgot?'}
                </div>
             </button>
          </div>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-4 py-3 rounded-2xl text-xs text-center font-medium">
              {error}
            </div>
          )}

          <div className="pt-6 flex justify-between items-center text-[10px] text-slate-500 font-medium">
             <div className="max-w-[200px] leading-relaxed">
               Secure access to Edify premium platform. Ensure you are on the official domain.
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
          <div className="space-y-2">
            {demoAccounts.map((account, index) => (
              <button
                key={index}
                onClick={() => {
                  setEmail(account.email);
                  setPassword('demo123');
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/40 hover:bg-white/70 rounded-2xl transition-all text-left group"
              >
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">{account.role}</span>
                <span className="text-[10px] text-slate-500 truncate ml-2">{account.email}</span>
              </button>
            ))}
          </div>
        </div>

      </EditorialPanel>
    </div>
  );
};
