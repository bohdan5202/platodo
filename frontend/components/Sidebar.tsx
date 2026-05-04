"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Bell, LogOut, CheckSquare } from 'lucide-react';
import { removeToken } from '../utils/auth';
import { useAlerts } from '../hooks/useAlerts';

const Sidebar = () => {
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
    <aside className="w-64 bg-white border-r border-[#E4E6F0] flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-[#E4E6F0]">
        <div className="bg-[#6B5CE7] p-2 rounded-xl">
          <CheckSquare className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-[#14142B]">Platodo</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-[#F7F8FC] text-[#6B5CE7] font-semibold'
                  : 'text-[#4A4A6A] hover:bg-[#F7F8FC] hover:text-[#14142B]'
              }`}
            >
              {/* Icon with optional red dot */}
              <span className="relative flex-shrink-0">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#6B5CE7]' : 'text-[#8888AA]'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-white" />
                )}
              </span>
              {item.name}
              {/* Count badge next to text */}
              {item.badge && (
                <span className="ml-auto bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {unreadAlerts.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#E4E6F0]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[#4A4A6A] hover:bg-[#F7F8FC] hover:text-[#EF4444] transition-colors text-left"
        >
          <LogOut className="w-5 h-5 text-[#8888AA] group-hover:text-[#EF4444]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
