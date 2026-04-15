import React, { useState } from 'react';
import { ArrowLeft, Mail, KeyRound, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface ForgotPasswordFlowProps {
  onBack: () => void;
}

export const ForgotPasswordFlow: React.FC<ForgotPasswordFlowProps> = ({ onBack }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setStep(2);
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) return;
    setLoading(true);
    setError('');
    // Simulate token verification
    await new Promise(resolve => setTimeout(resolve, 800));
    if (resetToken === '12345') {
       setError('Invalid or expired token.');
       setLoading(false);
       return;
    }
    setLoading(false);
    setStep(3);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setLoading(true);
    setError('');
    // Simulate password change
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    // Complete - show success briefly then go back
    setStep(1);
    onBack();
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-300">
      <button 
        onClick={onBack} 
        className="self-start mb-6 p-2 text-slate-400 hover:text-slate-800 transition-colors flex items-center gap-2 rounded-full hover:bg-white/50 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Login
      </button>

      <h2 className="text-2xl font-light text-slate-800 tracking-tight mb-2">
        {step === 1 && "Reset your password"}
        {step === 2 && "Enter reset token"}
        {step === 3 && "Create new password"}
      </h2>
      <p className="text-sm text-slate-500 mb-8 max-w-[280px]">
        {step === 1 && "We'll send a secure token to your email to verify your identity."}
        {step === 2 && `We've sent a code to ${email}. Check your inbox or spam folder.`}
        {step === 3 && "Ensure your new password is at least 8 characters with numbers and symbols."}
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 text-xs font-semibold px-4 py-3 rounded-2xl mb-6 border border-red-100">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleRequestToken} className="space-y-4">
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                 <Mail className="h-3.5 w-3.5 text-slate-400" />
               </div>
             </div>
             <input
               type="email"
               required
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="w-full bg-white/50 border border-white focus:border-slate-300 focus:bg-white rounded-full py-4 pl-14 pr-6 text-sm outline-none transition-all placeholder:text-slate-500"
               placeholder="account e-mail address"
             />
          </div>
          <Button 
            type="submit" 
            disabled={loading || !email}
            className="w-full bg-slate-900 text-white rounded-full h-12 mt-2 font-bold tracking-wide"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyToken} className="space-y-4">
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                 <KeyRound className="h-3.5 w-3.5 text-slate-400" />
               </div>
             </div>
             <input
               type="text"
               required
               value={resetToken}
               onChange={(e) => setResetToken(e.target.value)}
               className="w-full bg-white/50 border border-white focus:border-slate-300 focus:bg-white rounded-full py-4 pl-14 pr-6 text-sm outline-none transition-all placeholder:text-slate-500 tracking-widest font-mono"
               placeholder="••••••"
               maxLength={6}
             />
          </div>
          <Button 
            type="submit" 
            disabled={loading || !resetToken}
            className="w-full bg-slate-900 text-white rounded-full h-12 mt-2 font-bold tracking-wide"
          >
            {loading ? 'Verifying...' : 'Verify Token'}
          </Button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                 <KeyRound className="h-3.5 w-3.5 text-slate-400" />
               </div>
             </div>
             <input
               type="password"
               required
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
               className="w-full bg-white/50 border border-white focus:border-slate-300 focus:bg-white rounded-full py-4 pl-14 pr-6 text-sm outline-none transition-all placeholder:text-slate-500"
               placeholder="new password"
               minLength={8}
             />
          </div>
          <Button 
            type="submit" 
            disabled={loading || newPassword.length < 8}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-12 mt-2 font-bold tracking-wide"
          >
            {loading ? 'Saving...' : 'Update & Login'}
          </Button>
        </form>
      )}
    </div>
  );
};
