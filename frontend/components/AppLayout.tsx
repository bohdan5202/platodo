"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { getToken } from '../utils/auth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/forgot-password') || pathname?.startsWith('/reset-password');

  useEffect(() => {
    setIsMounted(true);
    const token = getToken();

    // Not logged in → redirect to /login
    if (!token && !isAuthPage) {
      let loginUrl = '/login';
      if (pathname && pathname !== '/login') {
        loginUrl += `?from=${encodeURIComponent(pathname)}`;
      }
      router.replace(loginUrl);
    }
    
    // Already logged in → redirect away from auth pages to dashboard
    if (token && isAuthPage) {
      router.replace('/dashboard');
    }
  }, [pathname, isAuthPage, router]);

  // Prevent UI flash during initial client-side auth check
  if (!isMounted) {
    return <main className="flex-1 w-full min-h-screen bg-[#F7F8FC]" />;
  }

  if (isAuthPage) {
    return <main className="flex-1 w-full min-h-screen bg-[#F7F8FC] text-[#14142B]">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 p-6 bg-[#F7F8FC] text-[#14142B] overflow-hidden">
        {children}
      </main>
    </>
  );
}
