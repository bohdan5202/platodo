"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { getToken } from '../utils/auth';
import { Menu, CheckSquare } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Load collapse state from localStorage or default to false
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/forgot-password') || pathname?.startsWith('/reset-password');

  useEffect(() => {
    setIsMounted(true);
    
    // Read from localStorage on mount
    const storedCollapsed = localStorage.getItem('platodo_sidebar_collapsed');
    if (storedCollapsed === 'true') {
      setIsCollapsed(true);
    }

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

  // Handle saving to localStorage
  const handleSetCollapsed = (val: boolean) => {
    setIsCollapsed(val);
    localStorage.setItem('platodo_sidebar_collapsed', val.toString());
  };

  // Prevent UI flash during initial client-side auth check
  if (!isMounted) {
    return <main className="flex-1 w-full min-h-screen bg-[#F7F8FC]" />;
  }

  if (isAuthPage) {
    return <main className="flex-1 w-full min-h-screen bg-[#F7F8FC] text-[#14142B]">{children}</main>;
  }

  return (
    <>
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={handleSetCollapsed} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#E4E6F0] sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="bg-[#6B5CE7] p-2 rounded-full">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#14142B]">Platodo</h1>
          </div>
          <button onClick={() => setIsMobileOpen(true)} className="p-2 text-[#4A4A6A] hover:bg-[#F7F8FC] rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 bg-[#F7F8FC] text-[#14142B] overflow-x-hidden">
          {children}
        </main>
      </div>
    </>
  );
}
