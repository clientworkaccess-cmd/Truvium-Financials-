import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, User as UserIcon, ShieldCheck } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
        {/* Ambient Background - Matching Main App */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
            <div className="glass-panel rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/60 backdrop-blur-2xl">
                
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-violet-500/30 transform -rotate-3" aria-hidden="true">
                        T
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">TRUVIUM</h2>
                    <p className="text-xs text-violet-600 uppercase tracking-widest font-bold mt-2">Financial Connect</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50/80 border border-red-100 rounded-2xl text-red-600 text-sm text-center backdrop-blur-sm" role="alert">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5" aria-label={isSignUp ? 'Sign up form' : 'Sign in form'}>
                    
                    {isSignUp && (
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" aria-hidden="true">
                                <UserIcon className="h-5 w-5 text-slate-500 group-focus-within:text-violet-600 transition-colors" />
                            </div>
                            <input
                                type="text"
                                required={isSignUp}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full Name"
                                aria-label="Full Name"
                                className="w-full pl-11 pr-4 py-4 bg-white/60 border border-white/80 rounded-2xl outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-300 transition-all text-slate-800 placeholder-slate-500 font-medium hover:bg-white/80"
                            />
                        </div>
                    )}

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" aria-hidden="true">
                            <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-violet-600 transition-colors" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Corporate Email"
                            aria-label="Email Address"
                            className="w-full pl-11 pr-4 py-4 bg-white/60 border border-white/80 rounded-2xl outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-300 transition-all text-slate-800 placeholder-slate-500 font-medium hover:bg-white/80"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" aria-hidden="true">
                            <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-violet-600 transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            aria-label="Password"
                            className="w-full pl-11 pr-4 py-4 bg-white/60 border border-white/80 rounded-2xl outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-300 transition-all text-slate-800 placeholder-slate-500 font-medium hover:bg-white/80"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:to-violet-800 text-white rounded-2xl font-bold shadow-lg shadow-violet-500/30 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-4 focus:ring-violet-200"
                        aria-label={isSignUp ? 'Create Account' : 'Sign In'}
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                        ) : (
                            <>
                                {isSignUp ? 'Create Account' : 'Sign In'}
                                <ArrowRight size={20} aria-hidden="true" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Toggle */}
                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm font-medium">
                        {isSignUp ? 'Already have an account?' : 'Need access to the system?'}
                        <button 
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setEmail('');
                                setPassword('');
                                setName('');
                                setError(null);
                            }}
                            className="ml-2 font-bold text-violet-600 hover:text-violet-800 transition-colors focus:outline-none focus:underline"
                        >
                            {isSignUp ? 'Sign In' : 'Request Access'}
                        </button>
                    </p>
                </div>

                {/* Secure Badge */}
                <div className="mt-8 flex justify-center">
                     <div 
                       className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-white/50 backdrop-blur-sm"
                       role="status"
                       aria-label="Secure Environment"
                     >
                        <ShieldCheck size={14} className="text-emerald-600" aria-hidden="true" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Environment</span>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};