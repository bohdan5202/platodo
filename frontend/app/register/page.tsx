"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { CheckSquare, Mail, Lock, User, ArrowRight, Loader2, Sparkles, Send, BrainCircuit, BellRing } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await axios.post(`${apiUrl}/auth/register`, {
        email,
        name,
        password,
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detail || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F7F8FC]">
        <div className="max-w-2xl w-full bg-white rounded-[32px] p-8 md:p-12 shadow-xl shadow-[#6B5CE7]/5 border border-[#E4E6F0] overflow-hidden relative">
          {/* Background decorations */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[#C4BEFA]/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="text-center mb-10 relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6B5CE7] to-[#5a4cdb] rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#6B5CE7]/30">
              <Send className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold text-[#14142B] tracking-tight mb-4">Almost there!</h2>
            <p className="text-[#8888AA] text-lg font-medium max-w-md mx-auto">
              We've sent a secure verification link to <span className="text-[#14142B] font-bold border-b border-[#C4BEFA] pb-0.5">{email}</span>
            </p>
          </div>

          {/* Quick Onboarding Section */}
          <div className="bg-[#F7F8FC] rounded-[24px] p-6 md:p-8 mb-10 border border-[#E4E6F0] relative z-10">
            <h3 className="text-[#14142B] font-bold text-lg mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#6B5CE7]" />
              While you wait, here is how Platodo works:
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-[#E4E6F0] flex items-center justify-center flex-shrink-0 text-[#6B5CE7] font-bold">1</div>
                <div>
                  <h4 className="font-bold text-[#14142B] text-base mb-1">Type naturally</h4>
                  <p className="text-[#8888AA] text-sm font-medium leading-relaxed">
                    Don't waste time filling out forms. Just type something like <span className="italic font-semibold text-[#4A4A6A]">"Read history chapter 4 by Friday 5pm"</span> into the add task bar.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-[#E4E6F0] flex items-center justify-center flex-shrink-0 text-[#0EA5A0] font-bold">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#14142B] text-base mb-1">AI does the heavy lifting</h4>
                  <p className="text-[#8888AA] text-sm font-medium leading-relaxed">
                    Our AI instantly extracts the subject, deadline, and priority. It automatically groups your tasks by class and date.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-[#E4E6F0] flex items-center justify-center flex-shrink-0 text-[#F59E0B] font-bold">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#14142B] text-base mb-1">Never miss a deadline</h4>
                  <p className="text-[#8888AA] text-sm font-medium leading-relaxed">
                    Check your Planner and Alerts. We'll automatically warn you if you schedule too many things on the same day.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link
              href="/login"
              className="bg-[#6B5CE7] hover:bg-[#5a4cdb] text-white py-4 px-8 rounded-xl font-bold transition-all text-center flex-1 sm:flex-none shadow-lg shadow-[#6B5CE7]/25 hover:-translate-y-0.5"
            >
              I've verified my email
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#6B5CE7] via-[#8B7CF8] to-[#5a4cdb] p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C4BEFA]/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white p-2.5 rounded-xl shadow-lg">
            <CheckSquare className="w-8 h-8 text-[#6B5CE7]" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Platodo</h1>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-bold text-white leading-[1.1] mb-6">
            Join the future of <br />
            <span className="text-[#C4BEFA]">student planning.</span>
          </h2>
          <p className="text-lg text-white/80 leading-relaxed font-medium">
            Create an account to automatically organize your academic life with AI-powered task parsing and intelligent scheduling.
          </p>
          
          <div className="mt-12 flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
            <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-lg">AI Assistant</div>
              <div className="text-white/80 text-sm font-medium mt-0.5">Automatically parses subjects, priorities, and deadlines</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm font-medium">
          © {new Date().getFullYear()} Platodo Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-[#F7F8FC]">
        <div className="w-full max-w-md bg-white rounded-[24px] p-8 shadow-xl shadow-[#6B5CE7]/5 border border-[#E4E6F0]">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-[#14142B] mb-2 tracking-tight">Create an account</h2>
            <p className="text-[#8888AA]">Please fill in the details below to sign up.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#EF4444] px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] flex-shrink-0"></div>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#4A4A6A] ml-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[#8888AA]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#F7F8FC] border border-[#E4E6F0] rounded-xl text-[#14142B] placeholder-[#8888AA] focus:outline-none focus:border-[#6B5CE7] focus:ring-4 focus:ring-[#6B5CE7]/10 transition-all font-medium"
                    placeholder="student@university.edu"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#4A4A6A] ml-1">Your name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-[#8888AA]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#F7F8FC] border border-[#E4E6F0] rounded-xl text-[#14142B] placeholder-[#8888AA] focus:outline-none focus:border-[#6B5CE7] focus:ring-4 focus:ring-[#6B5CE7]/10 transition-all font-medium"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#4A4A6A] ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#8888AA]" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#F7F8FC] border border-[#E4E6F0] rounded-xl text-[#14142B] placeholder-[#8888AA] focus:outline-none focus:border-[#6B5CE7] focus:ring-4 focus:ring-[#6B5CE7]/10 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#4A4A6A] ml-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#8888AA]" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#F7F8FC] border border-[#E4E6F0] rounded-xl text-[#14142B] placeholder-[#8888AA] focus:outline-none focus:border-[#6B5CE7] focus:ring-4 focus:ring-[#6B5CE7]/10 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#6B5CE7] hover:bg-[#5a4cdb] text-white py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-[#6B5CE7]/25 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            <div className="pt-2">
              <p className="text-center text-sm font-medium text-[#8888AA]">
                Already have an account?{' '}
                <Link href="/login" className="text-[#6B5CE7] hover:text-[#5a4cdb] font-semibold transition-colors">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
