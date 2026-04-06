'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/auth';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('OTP sent! Please check your email.');
        // Redirect to Reset Password page, passing email as query param for convenience
        setTimeout(() => router.push(`/reset-password?email=${encodeURIComponent(email)}`), 1500);
      } else {
        showError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      showError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D1D1D1] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Background Design */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-64 w-[140%] h-[100%] bg-[#417FA2] transform -rotate-[20deg] origin-top-left"></div>
        <div className="absolute -bottom-32 -left-48 w-[120%] h-[80%] bg-[#A0BE6F] transform rotate-[25deg] origin-bottom-left"></div>
      </div>

      <div className="relative z-10 bg-white rounded-[40px] shadow-[1px_5px_5px_rgba(0,0,0,0.25)] border border-[#417FA2] w-full max-w-[340px] p-6 pb-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Forgot Password</h2>
        <p className="text-xs text-center text-gray-500 mb-6">Enter your email to receive a reset code.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#D9D9D9] rounded-lg text-xs text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-[#417FA2]"
            required
            disabled={loading}
          />

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#417FA2] text-white rounded-lg font-medium hover:bg-[#346682] transition-all disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>

        <button 
          onClick={() => router.push('/login')}
          className="w-full mt-4 text-xs text-gray-500 hover:text-[#417FA2]"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}