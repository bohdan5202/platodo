"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { Menu, CheckSquare } from 'lucide-react';
import { useAlerts } from '../hooks/useAlerts';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { alerts } = useAlerts();
  const hasUnread = alerts.some(a => !a.is_read);

  const isAuthPage =
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/forgot-password') ||
    pathname?.startsWith('/reset-password') ||
    pathname?.startsWith('/verify-email');

  useEffect(() => {
    setIsMounted(true);
    // Only read sidebar preference from localStorage — NO auth logic here.
    // Auth is fully handled by middleware.ts which runs server-side on every request.
    const storedCollapsed = localStorage.getItem('platodo_sidebar_collapsed');
    if (storedCollapsed === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const handleSetCollapsed = (val: boolean) => {
    setIsCollapsed(val);
    localStorage.setItem('platodo_sidebar_collapsed', val.toString());
  };

  // Prevent hydration mismatch flash
  if (!isMounted) {
    return <main className="flex-1 w-full min-h-screen bg-[#F7F8FC]" />;
  }

  // Auth pages render without sidebar
  if (isAuthPage) {
    return (
      <main className="flex-1 w-full min-h-screen bg-[#F7F8FC] text-[#14142B]">
        {children}
      </main>
    );
  }

  // Protected pages render with sidebar — middleware already guaranteed the user is logged in
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
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-[#4A4A6A] hover:bg-[#F7F8FC] rounded-lg relative"
          >
            <Menu className="w-6 h-6" />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full border border-white" />
            )}
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