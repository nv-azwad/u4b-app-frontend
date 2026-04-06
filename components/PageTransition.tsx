'use client';

import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if the current page is the Login page
  const isLoginPage = pathname === '/login';

  return (
    <div
      key={pathname}
      className={`${
        isLoginPage 
          ? 'animate-slide-in-right' // Slide for Login
          : 'animate-fade-in'        // Fade for everything else
      } [animation-fill-mode:both]`}
    >
      {children}
    </div>
  );
}