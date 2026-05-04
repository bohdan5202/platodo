"use client";

import { useState } from 'react';
import axios from 'axios';
import { Mail, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await axios.post(`${apiUrl}/auth/forgot-password`, { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#6B5CE7] via-[#8B7CF8] to-[#5a4cdb] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C4BEFA]/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-[#6B5CE7] p-2 rounded-full border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Platodo</h1>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-bold text-white leading-[1.1] mb-6">
            Secure your account. <br />
            <span className="text-[#C4BEFA]">Never lose access.</span>
          </h2>
          <p className="text-lg text-white/80 leading-relaxed font-medium">
            Enter your email and we'll send you a secure link to reset your password instantly.
          </p>

          <div className="mt-12 flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
            <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-lg">AI Assistant</div>
              <div className="text-white/80 text-sm font-medium mt-0.5">Your tasks and schedules are safe with us</div>
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
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8888AA] hover:text-[#6B5CE7] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>

          {success ? (
            <div className="text-center py-6">
              <div className="bg-[#EEF0FF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-[#6B5CE7]" />
              </div>
              <h2 className="text-2xl font-bold text-[#14142B] mb-2 tracking-tight">Check your email</h2>
              <p className="text-[#4A4A6A] leading-relaxed">
                We've sent a password reset link to <br/>
                <span className="font-semibold text-[#14142B]">{email}</span>
              </p>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-[#14142B] mb-2 tracking-tight">Forgot Password</h2>
                <p className="text-[#8888AA]">Enter your email to receive a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#EF4444] px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] flex-shrink-0"></div>
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#4A4A6A] ml-1">Email address</label>
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#6B5CE7] hover:bg-[#5a4cdb] text-white py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-[#6B5CE7]/25 mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
