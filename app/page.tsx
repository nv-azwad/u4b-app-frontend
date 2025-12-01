'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function StartPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-navigate to login after 2.5 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#417FA2] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full"></div>
      </div>

      {/* U4B Logo - Using same components as login page */}
      <div className="relative z-10 animate-fade-in flex items-center justify-center gap-3">
        <Image
          src="/assets/logo-w-u.png"
          alt="U"
          width={100}
          height={100}
          className="object-contain"
          priority
        />
        <Image
          src="/assets/logo-4.png"
          alt="4"
          width={100}
          height={100}
          className="object-contain"
          priority
        />
        <Image
          src="/assets/logo-w-b.png"
          alt="B"
          width={90}
          height={90}
          className="object-contain"
          priority
        />
      </div>

      {/* Tagline */}
      <div className="relative z-10 mt-8 text-white text-2xl font-light opacity-80 animate-fade-in">
        
      </div>

    </div>
  );
}