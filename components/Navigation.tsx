'use client';

import Link from 'next/link'; 
import { usePathname } from 'next/navigation';
import { Home, Camera, Gift, User, Shield} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserFromToken, API_URL, fetchWithAuth } from '@/lib/auth';

export default function Navigation() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

const [canDonate, setCanDonate] = useState(true); // Default to visible

  useEffect(() => {
    const checkUser = async () => {
      const user = getUserFromToken();
      setIsAdmin(user?.is_admin || false);

      // Check eligibility if user is logged in
      if (user && !user.is_admin) {
        try {
          const res = await fetchWithAuth(`${API_URL}/donations/check-eligibility`);
          const data = await res.json();
          if (data.success) {
            setCanDonate(data.data.canDonate);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    checkUser();
  }, [pathname]);

  useEffect(() => {
    const user = getUserFromToken();
    setIsAdmin(user?.is_admin || false);
  }, [pathname]);

  if (pathname === '/' || pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password' || pathname === '/verify-email') {
    return null;
  }

  const adminNavItems = [
    { icon: Shield, label: 'Admin', path: '/admin' }
  ];

const userNavItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    // Only show Donate if canDonate is true
    ...(canDonate ? [{ icon: Camera, label: 'Donate', path: '/donation' }] : []),
    { icon: Gift, label: 'Vouchers', path: '/voucher' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                isActive
                  ? 'text-[#417FA2] scale-110'
                  : 'text-gray-500 hover:text-[#417FA2]'
              }`}
            >
              <Icon size={24} className="mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}