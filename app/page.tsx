'use client';

import { useEffect, Suspense } from 'react'; // Added Suspense
import { useRouter, useSearchParams } from 'next/navigation'; // Use the Hook
import Image from 'next/image';

// 1. Logic Component
function StartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // 👈 The reliable Next.js way

  useEffect(() => {
    // 2. GET ID (Check both names to be safe)
    const binId = searchParams.get('binId') || searchParams.get('bin');

    if (binId) {
      console.log(`✅ CAPTURED BIN ID: ${binId}`);
      // Save to storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('u4b_bin_id', binId);
        // Verify immediately
        console.log("💾 Verification - Saved in Storage:", localStorage.getItem('u4b_bin_id'));
      }
    } else {
      console.warn("⚠️ No 'bin' or 'binId' found in URL");
    }

    // 3. AUTO-REDIRECT (2.5s)
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#417FA2] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* --- DEBUG TEXT (Remove this later) --- */}
      <div className="absolute top-0 left-0 bg-black/50 text-white p-2 text-xs z-50">
         DEBUG STATUS: <br/>
         URL Param: {searchParams.get('bin') || searchParams.get('binId') || 'None'} <br/>
      </div>
      {/* -------------------------------------- */}

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full"></div>
      </div>

      {/* U4B Logo */}
      <div className="relative z-10 animate-fade-in flex items-center justify-center gap-3">
        <Image src="/assets/logo-w-u.png" alt="U" width={100} height={100} className="object-contain" priority />
        <Image src="/assets/logo-4.png" alt="4" width={100} height={100} className="object-contain" priority />
        <Image src="/assets/logo-w-b.png" alt="B" width={90} height={90} className="object-contain" priority />
      </div>
    </div>
  );
}

// 4. Main Export with Suspense (Required for useSearchParams)
export default function StartPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StartPageContent />
    </Suspense>
  );
}
