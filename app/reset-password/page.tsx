'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_URL } from '@/lib/auth';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Pre-fill email if passed from previous page
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      showError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Password reset successful! Redirecting...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        showError(data.message || 'Reset failed');
      }
    } catch (err) {
      showError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Reset Password</h2>
        <p className="text-xs text-center text-gray-500 mb-6">Enter the OTP sent to your email.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input 
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 bg-[#D9D9D9] rounded-lg text-xs text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-[#417FA2]"
            required
            disabled={loading}
          />
          <input 
            type="text"
            placeholder="6-Digit OTP"
            value={formData.otp}
            onChange={(e) => setFormData({...formData, otp: e.target.value})}
            className="w-full px-4 py-3 bg-[#D9D9D9] rounded-lg text-xs text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-[#417FA2]"
            required
            disabled={loading}
          />
          <input 
            type="password"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            className="w-full px-4 py-3 bg-[#D9D9D9] rounded-lg text-xs text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-[#417FA2]"
            required
            disabled={loading}
          />
          <input 
            type="password"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            className="w-full px-4 py-3 bg-[#D9D9D9] rounded-lg text-xs text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-[#417FA2]"
            required
            disabled={loading}
          />

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#417FA2] text-white rounded-lg font-medium hover:bg-[#346682] transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="min-h-screen bg-[#D1D1D1] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-64 w-[140%] h-[100%] bg-[#417FA2] transform -rotate-[20deg] origin-top-left"></div>
        <div className="absolute -bottom-32 -left-48 w-[120%] h-[80%] bg-[#A0BE6F] transform rotate-[25deg] origin-bottom-left"></div>
      </div>

      <div className="relative z-10 bg-white rounded-[40px] shadow-[1px_5px_5px_rgba(0,0,0,0.25)] border border-[#417FA2] w-full max-w-[340px] p-6 pb-8">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}