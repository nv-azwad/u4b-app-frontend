'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft } from 'lucide-react';
import { API_URL, fetchWithAuth } from '@/lib/auth';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setLoading(true);

      const response = await fetchWithAuth(`${API_URL}/auth/change-password`, {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pb-20">
      <div className="bg-[#417FA2] pt-12 pb-6 px-6 rounded-b-3xl shadow-lg mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-3">
          <Lock size={32} className="text-white" />
          <h1 className="text-white text-2xl font-bold">Change Password</h1>
        </div>
      </div>

      <div className="px-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#417FA2] text-gray-800"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 4 characters)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#417FA2] text-gray-800"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#417FA2] text-gray-800"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#417FA2] hover:bg-[#356A85] text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>

          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>Password Requirements:</strong>
              <br />• Minimum 4 characters
              <br />• Must be different from current password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}