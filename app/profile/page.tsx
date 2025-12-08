'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Calendar, Award, LogOut } from 'lucide-react';
import { API_URL, fetchWithAuth, getUserFromToken, removeToken } from '@/lib/auth';

interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone: string;
  is_admin: boolean;
  total_donations_count: number;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}/auth/profile`);
      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.message || 'Failed to load profile');
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      removeToken();
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#417FA2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center pb-20 px-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <p className="text-red-600 text-center mb-4">{error || 'Failed to load profile'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[#417FA2] text-white py-2 rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pb-20 animate-fade-in">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#417FA2] to-[#356A85] pt-12 pb-6 px-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-2">
          <User size={32} className="text-white" />
          <h1 className="text-white text-2xl font-bold">My Profile</h1>
        </div>
        <p className="text-white/80 text-sm">View your account details</p>
      </div>

      <div className="px-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#417FA2] to-[#A0BE6F] rounded-full flex items-center justify-center mb-3">
              <User size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
            {profile.is_admin && (
              <span className="mt-2 bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-semibold">
                👑 Admin
              </span>
            )}
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            
            {/* Email */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail size={20} className="text-[#417FA2]" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-semibold text-gray-800">{profile.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone size={20} className="text-[#417FA2]" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-semibold text-gray-800">{profile.phone || 'Not provided'}</p>
              </div>
            </div>

            {/* Donations */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Award size={20} className="text-[#A0BE6F]" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Total Donations</p>
                <p className="font-semibold text-gray-800">{profile.total_donations_count} donations</p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar size={20} className="text-[#417FA2]" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="font-semibold text-gray-800">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          
          {/* Edit Profile (Future) */}
          <button
            onClick={() => alert('Edit profile feature coming soon!')}
            className="w-full bg-[#417FA2] hover:bg-[#356A85] text-white py-3 rounded-xl font-semibold transition-all"
          >
            ✏️ Edit Profile
          </button>


          {/* Change Password Button */}
          <button
            onClick={() => router.push('/profile/change-password')}
            className="w-full bg-[#417FA2] hover:bg-[#356A85] text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 mb-3"
          >
            🔐 Change Password
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Keep donating to unlock more vouchers! You can claim 1 voucher per month after your donation is approved.
          </p>
        </div>

      </div>
    </div>
  );
}