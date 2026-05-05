"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Bell, LogOut, CheckSquare, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { removeToken } from '../utils/auth';
import { useAlerts } from '../hooks/useAlerts';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) => {
  const pathname = usePathname();
  const { alerts } = useAlerts();
  const unreadAlerts = alerts.filter(a => !a.is_read);
  const hasUnread = unreadAlerts.length > 0;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Planner', href: '/planner', icon: Calendar },
    { name: 'Alerts', href: '/alerts', icon: Bell, badge: hasUnread },
  ];

  const handleLogout = () => {
    removeToken();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-[#E4E6F0] flex flex-col h-[100dvh] transform transition-all duration-300 ease-in-out
          md:sticky md:top-0 md:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64 w-64'}
        `}
      >
        <div className={`p-6 flex items-center border-b border-[#E4E6F0] ${isCollapsed ? 'justify-center px-0' : 'justify-between gap-3'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-[#6B5CE7] p-2 rounded-full flex-shrink-0">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && <h1 className="text-xl font-bold text-[#14142B] whitespace-nowrap">Platodo</h1>}
          </div>
          
          {/* Mobile Close Button */}
          <button 
            className="md:hidden text-[#4A4A6A] hover:text-[#14142B] flex-shrink-0"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center rounded-xl transition-colors ${
                  isCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3'
                } ${
                  isActive
                    ? 'bg-[#F7F8FC] text-[#6B5CE7] font-semibold'
                    : 'text-[#4A4A6A] hover:bg-[#F7F8FC] hover:text-[#14142B]'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                {/* Icon with optional red dot */}
                <span className="relative flex-shrink-0">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#6B5CE7]' : 'text-[#8888AA]'}`} />
                  {item.badge && (
                    <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-white ${isCollapsed ? 'border-transparent' : ''}`} />
                  )}
                </span>
                
                {!isCollapsed && (
                  <>
                    <span className="whitespace-nowrap">{item.name}</span>
                    {/* Count badge next to text */}
                    {item.badge && (
                      <span className="ml-auto bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {unreadAlerts.length}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E4E6F0] flex flex-col gap-2">
          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:flex items-center rounded-xl text-[#4A4A6A] hover:bg-[#F7F8FC] hover:text-[#14142B] transition-colors ${
              isCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3'
            }`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-[#8888AA]" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 text-[#8888AA] flex-shrink-0" />
                <span className="whitespace-nowrap">Collapse Menu</span>
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className={`flex items-center rounded-xl text-[#4A4A6A] hover:bg-[#F7F8FC] hover:text-[#EF4444] transition-colors ${
              isCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3 text-left'
            }`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 text-[#8888AA] group-hover:text-[#EF4444] flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
