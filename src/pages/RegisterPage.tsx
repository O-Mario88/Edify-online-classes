import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EditorialPanel } from '../components/ui/editorial/EditorialPanel';
import { EditorialPill } from '../components/ui/editorial/EditorialPill';
import { EditorialHeader } from '../components/ui/editorial/EditorialHeader';
import { KeyRound, Mail, ArrowRight, User, Globe, Briefcase } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('uganda');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryCode || !role) {
       setError("Please select your country and role before registering.");
       return;
    }
    setError('');
    setIsLoading(true);

    const success = await register(email, fullName, countryCode, password, role);
    
    if (success) {
      navigate('/');
    } else {
      setError('Failed to create an account. Email may already be in use.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fafaeb] flex items-center justify-center p-4 relative overflow-hidden font-sans py-12">
      
      {/* Editorial aesthetic background layer */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-[0.85]"
        style={{ backgroundImage: "url('/images/bg-editorial-sand.png')" }}
      />
      <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px]" />

      {/* Main Register Card */}
      <EditorialPanel 
        variant="frosted-rose" 
        radius="xl"
        className="max-w-[460px] w-full p-8 md:p-10 shadow-2xl shadow-rose-900/10 relative z-10"
      >
        <div className="flex justify-between items-center mb-8">
           <span className="text-slate-500 font-medium tracking-wide">Edify_</span>
           <Link to="/login" className="text-sm font-semibold text-slate-800 hover:text-slate-600 transition-colors">Log in</Link>
        </div>

        <EditorialHeader level="h3" weight="light" className="mb-2">
          Create account
        </EditorialHeader>
        <p className="text-sm text-slate-500 font-medium mb-8">Join the premier learning platform.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                 <User className="h-3.5 w-3.5 text-slate-400" />
               </div>
             </div>
             <input
               id="fullName"
               type="text"
               required
               value={fullName}
               onChange={(e) => setFullName(e.target.value)}
               className="w-full bg-white/50 border border-white focus:border-slate-300 focus:bg-white rounded-full py-3.5 pl-14 pr-6 text-sm outline-none transition-all placeholder:text-slate-400"
               placeholder="full name"
             />
          </div>

          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
               <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                 <Globe className="h-3.5 w-3.5 text-slate-400" />
               </div>
             </div>
             <select
               value={countryCode}
               onChange={(e) => setCountryCode(e.target.value)}
               required
               className="w-full bg-white/50 border border-white focus:border-slate-300 focus:bg-white rounded-full py-3.5 pl-14 pr-6 text-sm outline-none transition-all text-slate-700 appearance-none cursor-pointer"
             >
               <option value="uganda">Uganda</option>
               <option value="kenya">Kenya</option>
               <option value="rwanda">Rwanda</option>
             </select>
          </div>

          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
               <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                 <Briefcase className="h-3.5 w-3.5 text-slate-400" />
               </div>
             </div>
             <select
               value={role}
               onChange={(e) => setRole(e.target.value)}
               required
               className="w-full bg-white/50 border border-white focus:border-slate-300 focus:bg-white rounded-full py-3.5 pl-14 pr-6 text-sm outline-none transition-all text-slate-700 appearance-none cursor-pointer"
             >
               <option value="student">Student</option>
               <option value="teacher">Teacher</option>
               <option value="admin">Administrator</option>
               <option value="institution">Institution / School</option>
             </select>
          </div>

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
               className="w-full bg-white/50 border border-white focus:border-slate-300 focus:bg-white rounded-full py-3.5 pl-14 pr-6 text-sm outline-none transition-all placeholder:text-slate-400"
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
               className="w-full bg-white/50 border border-white focus:border-slate-300 focus:bg-white rounded-full py-3.5 pl-14 pr-16 text-sm outline-none transition-all placeholder:text-slate-400"
               placeholder="create a password"
             />
             <button
               type="button"
               className="absolute inset-y-0 right-4 flex items-center"
               onClick={() => setShowPassword(!showPassword)}
               tabIndex={-1}
             >
                <div className="bg-white px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors tracking-wide uppercase">
                  {showPassword ? 'Hide' : 'Show'}
                </div>
             </button>
          </div>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-4 py-3 rounded-2xl text-xs text-center font-medium my-2">
              {error}
            </div>
          )}

          <div className="pt-6 flex justify-between items-center text-[10px] text-slate-500 font-medium">
             <div className="max-w-[200px] leading-relaxed">
               By continuing, you agree to our Terms of Service and Privacy Policy.
             </div>
             <button 
               type="submit" 
               disabled={isLoading || !countryCode || !role}
               className="w-16 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50"
             >
               {isLoading ? <span className="animate-pulse flex gap-1"><span className="w-1 h-1 bg-white rounded-full"/><span className="w-1 h-1 bg-white rounded-full"/><span className="w-1 h-1 bg-white rounded-full"/></span> : <ArrowRight className="w-5 h-5" />}
             </button>
          </div>
        </form>

      </EditorialPanel>
    </div>
  );
};
