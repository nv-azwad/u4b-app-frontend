'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Clock, Package, Users, LogOut, Settings } from 'lucide-react';
import { removeToken } from '@/lib/auth';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Only show admin nav on admin pages
  if (!pathname?.startsWith('/admin')) {
    return null;
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      removeToken();
      router.push('/login');
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: Home
    },
    {
      name: 'Pending',
      path: '/admin/pending',
      icon: Clock
    },
    {
      name: 'Donations',
      path: '/admin/donations',
      icon: Package
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: Users
    },
    {
    name: 'Settings',
    path: '/admin/settings',
    icon: Settings
  }

  ];

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-6 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'text-[#417FA2] bg-blue-50'
                    : 'text-gray-600 hover:text-[#417FA2] hover:bg-gray-50'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1 text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={22} strokeWidth={2} />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}