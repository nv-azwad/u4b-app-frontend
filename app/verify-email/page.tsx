'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_URL } from '@/lib/auth';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';

function VerifyContent() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  // Ref to track if we have already attempted verification
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      showError('No verification token found.');
      return;
    }

    // Prevent double-firing in React Strict Mode
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          showSuccess('Email verified successfully!');
          setTimeout(() => router.push('/login'), 3000);
        } else {
          // If 400 error, check if it might be "already verified"
          // Since we can't distinguish easily, we usually assume error unless we add a specific check.
          // However, for user experience, if it fails, we ask them to try logging in.
          setStatus('error');
          showError(data.message || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        showError('Something went wrong. Please try again.');
      }
    };

    verify();
  }, [token, router, showSuccess, showError]);

  return (
    <div className="text-center">
      {status === 'verifying' && (
        <h2 className="text-xl font-bold text-gray-700 mb-4">Verifying your email...</h2>
      )}
      {status === 'success' && (
        <div>
          <h2 className="text-xl font-bold text-[#A0BE6F] mb-2">Success!</h2>
          <p className="text-gray-600 mb-4">Your email has been verified. Redirecting to login...</p>
        </div>
      )}
      {status === 'error' && (
        <div>
          <h2 className="text-xl font-bold text-red-500 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-4">The token is invalid or has expired.</p>
          <div className="space-y-3">
             <p className="text-xs text-gray-500">
               (If you just clicked this link, you might already be verified.)
             </p>
             <button 
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-[#417FA2] text-white rounded-lg hover:bg-[#346682]"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="min-h-screen bg-[#D1D1D1] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Background Design */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-64 w-[140%] h-[100%] bg-[#417FA2] transform -rotate-[20deg] origin-top-left"></div>
        <div className="absolute -bottom-32 -left-48 w-[120%] h-[80%] bg-[#A0BE6F] transform rotate-[25deg] origin-bottom-left"></div>
      </div>

      <div className="relative z-10 bg-white rounded-[40px] shadow-[1px_5px_5px_rgba(0,0,0,0.25)] border border-[#417FA2] w-full max-w-[340px] p-8">
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}