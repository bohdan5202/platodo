"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { CheckSquare, Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { setToken } from '../../utils/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleResendVerification = async () => {
    setResendStatus('loading');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await axios.post(`${apiUrl}/auth/resend-verification`, { email });
      setResendStatus('success');
    } catch (err: any) {
      setResendStatus('error');
      setError(err.response?.data?.message || 'Failed to resend. Please try again.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      // Adjust endpoint according to your backend
      const response = await axios.post(`${apiUrl}/auth/login`, {
        email,
        password,
      });

      const token = response.data.access_token || response.data.token;
      if (token) {
        setToken(token);
        router.push('/dashboard');
      } else {
        throw new Error('No token received');
      }
    } catch (err: any) {
      if (err.response?.data?.error === 'unverified_email') {
        setIsUnverified(true);
        setError(err.response?.data?.message);
      } else {
        setIsUnverified(false);
        setError(err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

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
            Master your tasks. <br />
            <span className="text-[#C4BEFA]">Expand your mind.</span>
          </h2>
          <p className="text-lg text-white/80 leading-relaxed font-medium">
            Join thousands of students organizing their academic life with AI-powered task parsing and intelligent scheduling.
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
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-[#14142B] mb-2 tracking-tight">Welcome back</h2>
            <p className="text-[#8888AA]">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#EF4444] px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] flex-shrink-0"></div>
                  {error}
                </div>
                {isUnverified && resendStatus !== 'success' && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendStatus === 'loading'}
                    className="mt-1 self-start px-3 py-1.5 bg-[#EF4444] text-white text-xs font-bold rounded-lg hover:bg-[#dc2626] transition-colors flex items-center gap-2"
                  >
                    {resendStatus === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Resend Verification Email
                  </button>
                )}
                {isUnverified && resendStatus === 'success' && (
                  <span className="text-[#10B981] text-xs font-bold mt-1">Verification email sent! Please check your inbox.</span>
                )}
              </div>
            )}

            <div className="space-y-5">
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
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F7F8FC] border border-[#E4E6F0] rounded-xl text-[#14142B] placeholder-[#8888AA] focus:outline-none focus:border-[#6B5CE7] focus:ring-4 focus:ring-[#6B5CE7]/10 transition-all font-medium"
                    placeholder="student@university.edu"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-semibold text-[#4A4A6A]">Password</label>
                  <a href="/forgot-password" className="text-xs font-semibold text-[#6B5CE7] hover:text-[#5a4cdb] transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#8888AA]" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F7F8FC] border border-[#E4E6F0] rounded-xl text-[#14142B] placeholder-[#8888AA] focus:outline-none focus:border-[#6B5CE7] focus:ring-4 focus:ring-[#6B5CE7]/10 transition-all font-medium"
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
                  Sign in
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="pt-2">
              <p className="text-center text-sm font-medium text-[#8888AA]">
                Don't have an account?{' '}
                <a href="/register" className="text-[#6B5CE7] hover:text-[#5a4cdb] font-semibold transition-colors">
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
