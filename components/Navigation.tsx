'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Camera, Gift, User, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserFromToken } from '@/lib/auth';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = getUserFromToken();
    setIsAdmin(user?.is_admin || false);
  }, [pathname]);

  // Don't show navigation on login/start pages
  if (pathname === '/' || pathname === '/login') {
    return null;
  }

  // Admin-only navigation (only show Admin link)
  const adminNavItems = [
    { icon: Shield, label: 'Admin', path: '/admin' }
  ];

  // Regular user navigation
  const userNavItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Camera, label: 'Donate', path: '/donation' },
    { icon: Gift, label: 'Vouchers', path: '/voucher' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  // Choose which navigation to show
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                isActive
                  ? 'text-[#417FA2] scale-110'
                  : 'text-gray-500 hover:text-[#417FA2]'
              }`}
            >
              <Icon size={24} className="mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}