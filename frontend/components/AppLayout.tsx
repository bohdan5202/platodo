"use client";

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

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
