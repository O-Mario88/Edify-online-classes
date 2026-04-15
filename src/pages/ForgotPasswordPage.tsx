import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await apiClient.post('/auth/forgot-password/', { email });
      if (error) throw new Error(error.message || 'Failed to request reset');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70" />
        <div className="absolute top-40 -left-60 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md hidden sm:block mb-8 text-center">
         <div className="flex justify-center items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
               <span className="text-white font-bold text-xl leading-none">M</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Maple</span>
         </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/90">
          <CardHeader className="space-y-1 pb-6 px-8 pt-8">
            <CardTitle className="text-2xl font-bold text-center text-slate-900">
              Reset Password
            </CardTitle>
            <CardDescription className="text-center text-slate-500">
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {success ? (
              <div className="text-center space-y-4">
                <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Check your inbox</h3>
                <p className="text-sm text-slate-500 pb-4">
                  We've sent a password reset link to <span className="font-medium text-slate-900">{email}</span>. 
                  Please check your spam folder if you don't see it.
                </p>
                <Link to="/login">
                  <Button className="w-full">Return to Login</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 h-11 bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-medium text-white transition-all shadow-md shadow-blue-600/20" 
                  disabled={loading || !email}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending link...</>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
