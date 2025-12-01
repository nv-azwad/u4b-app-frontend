'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { API_URL, setToken } from '@/lib/auth';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email) {
      showError('Please enter your email');
      return;
    }

    if (!isLogin && !formData.name) {
      showError('Please enter your name');
      return;
    }

    if (!isLogin && !formData.phone) {
      showError('Please enter your phone number');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      
      const payload = isLogin 
        ? {
            email: formData.email,
            authId: formData.email,
            authProvider: 'email'
          }
        : {
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            authId: formData.email,
            authProvider: 'email'
          };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Save token
      setToken(data.data.token);

      // Show success message
      showSuccess(isLogin ? 'Login successful!' : 'Account created successfully!');

      // Redirect based on user role
      setTimeout(() => {
        if (data.data.user.is_admin) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }, 500);

    } catch (err: any) {
      console.error('Auth error:', err);
      showError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D1D1D1] flex flex-col items-center justify-center p-4 relative overflow-hidden animate-fade-in">
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Background Design */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-64 w-[140%] h-[100%] bg-[#417FA2] transform -rotate-[20deg] origin-top-left"></div>
        <div className="absolute -bottom-32 -left-48 w-[120%] h-[80%] bg-[#A0BE6F] transform rotate-[25deg] origin-bottom-left"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#A0BE6F] rounded-full opacity-60"></div>
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-[#417FA2] rounded-full opacity-50"></div>
        <div className="absolute top-40 left-20 w-20 h-20 bg-[#A0BE6F] rounded-full opacity-40"></div>
        <div className="absolute bottom-40 right-32 w-24 h-24 bg-[#A0BE6F] rounded-full opacity-50"></div>
        <div className="absolute top-60 right-20 w-16 h-16 bg-[#417FA2] rounded-full opacity-30"></div>
        <div className="absolute bottom-60 left-40 w-20 h-20 bg-[#417FA2] rounded-full opacity-40"></div>
      </div>
      
      {/* Main Container */}
      <div className="relative z-10 bg-white rounded-[40px] shadow-[1px_5px_5px_rgba(0,0,0,0.25)] border border-[#417FA2] w-full max-w-[340px] p-6 pb-8">
        
        {/* Welcome Text */}
        <div className="text-left mb-3">
          <h1 className="text-[38px] font-normal leading-tight text-black">
            Welcome <span className="text-[26px]">to</span>
          </h1>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Image src="/assets/logo-u.png" alt="U" width={40} height={40} className="object-contain" priority />
          <Image src="/assets/logo-4.png" alt="4" width={40} height={40} className="object-contain" priority />
          <Image src="/assets/logo-b.png" alt="B" width={35} height={35} className="object-contain" priority />
        </div>

        {/* Toggle */}
        <div className="relative flex items-center justify-center mb-5 h-8">
          <div className="absolute left-1/2 -translate-x-1/2 flex">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`px-8 py-2 rounded-full font-medium text-sm shadow-md z-10 transition-all duration-300 ${
                isLogin ? 'bg-[#A0BE6F] text-white scale-105' : 'bg-gray-200 text-gray-600'
              }`}
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`px-8 py-2 rounded-full font-medium text-sm shadow-md -ml-6 transition-all duration-300 ${
                !isLogin ? 'bg-[#417FA2] text-white scale-105' : 'bg-gray-200 text-gray-600'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 mb-5">
            {!isLogin && (
              <input 
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#D9D9D9] rounded-lg text-xs text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-[#417FA2] transition-all animate-fade-in"
                required={!isLogin}
                disabled={loading}
              />
            )}
            <input 
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[#D9D9D9] rounded-lg text-xs text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-[#417FA2] transition-all"
              required
              disabled={loading}
            />
            {!isLogin && (
              <input 
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#D9D9D9] rounded-lg text-xs text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-[#417FA2] transition-all animate-fade-in"
                required={!isLogin}
                disabled={loading}
              />
            )}
            <input 
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[#D9D9D9] rounded-lg text-xs text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-[#417FA2] transition-all"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-32 mx-auto block py-2 bg-[#D9D9D9] border-[1.5px] border-[#417FA2] rounded-lg text-[#417FA2] font-medium mb-3 hover:bg-[#417FA2] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="text-center text-xs text-black/60 mb-3">Or</div>

        <div className="space-y-2">
          <button 
            type="button"
            className="w-full py-2 bg-[#D9D9D9] border border-[#417FA2] rounded-lg flex items-center justify-center gap-2 text-[#417FA2] text-xs shadow-sm hover:bg-[#417FA2] hover:text-white transition-all duration-300"
            disabled={loading}
          >
            <span className="font-bold">G</span>
            <span>Login with Google</span>
          </button>
          <button 
            type="button"
            className="w-full py-2 bg-[#D9D9D9] border border-[#417FA2] rounded-lg flex items-center justify-center gap-2 text-[#417FA2] text-xs shadow-sm hover:bg-[#417FA2] hover:text-white transition-all duration-300"
            disabled={loading}
          >
            <span className="font-bold"></span>
            <span>Login with Apple</span>
          </button>
        </div>
      </div>

      {/* Bottom Animation */}
      <div className="relative z-20 mt-8 h-24 w-full overflow-hidden">
        <div className="animate-slide-up-fixed">
          <div className="h-24 flex items-center justify-center">
            <h2 className="text-6xl md:text-7xl font-bold text-[#000000]/70">Upcycle</h2>
          </div>
          <div className="h-24 flex items-center justify-center">
            <h2 className="text-6xl md:text-7xl font-bold text-[#000000]/70">4</h2>
          </div>
          <div className="h-24 flex items-center justify-center">
            <h2 className="text-6xl md:text-7xl font-bold text-[#000000]/70">Better</h2>
          </div>
        </div>
      </div>

    </div>
  );
}