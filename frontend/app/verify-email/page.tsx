"use client";

import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    const verifyToken = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await axios.post(`${apiUrl}/auth/verify-email`, { token });
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error || err.response?.data?.detail || 'Failed to verify email. The link may be invalid or expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F7F8FC]">
      <div className="max-w-md w-full bg-white rounded-[24px] p-8 shadow-xl shadow-[#6B5CE7]/5 border border-[#E4E6F0] text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-[#F7F8FC] rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-[#6B5CE7] animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-[#14142B] mb-3">Verifying Email</h2>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-[#E0F7F6] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#0EA5A0]" />
            </div>
            <h2 className="text-2xl font-bold text-[#14142B] mb-3">Email Verified</h2>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-[#EF4444]" />
            </div>
            <h2 className="text-2xl font-bold text-[#14142B] mb-3">Verification Failed</h2>
          </>
        )}

        <p className="text-[#8888AA] mb-8 font-medium">
          {message}
        </p>

        <Link
          href="/login"
          className="block w-full bg-[#6B5CE7] hover:bg-[#5a4cdb] text-white py-3.5 px-4 rounded-xl font-bold transition-all"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC]">
        <Loader2 className="w-8 h-8 text-[#6B5CE7] animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
