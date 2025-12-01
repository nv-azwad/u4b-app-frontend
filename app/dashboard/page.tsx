'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { API_URL, fetchWithAuth, getUserFromToken } from '@/lib/auth';

interface UserData {
  name: string;
  totalDonations: number;
  monthlyDonations: number;
  approvedDonations: number;
  vouchersClaimed: number;
  canClaimVoucher: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    name: 'User',
    totalDonations: 0,
    monthlyDonations: 0,
    approvedDonations: 0,
    vouchersClaimed: 0,
    canClaimVoucher: false
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get user from token for name
      const user = getUserFromToken();
      
      // Fetch profile data
      const profileResponse = await fetchWithAuth(`${API_URL}/auth/profile`);
      const profileData = await profileResponse.json();

      if (profileData.success) {
        // Get donation stats
        const donationsResponse = await fetchWithAuth(`${API_URL}/donations/my-donations?limit=100`);
        const donationsData = await donationsResponse.json();

        // Calculate stats
        const allDonations = donationsData.success ? donationsData.data.donations : [];
        const approvedDonations = allDonations.filter((d: any) => d.status === 'approved');
        
        // Get current month donations
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyDonations = allDonations.filter((d: any) => {
          const donationDate = new Date(d.created_at);
          return donationDate.getMonth() === currentMonth && 
                 donationDate.getFullYear() === currentYear;
        });

        // Check voucher eligibility
        const vouchersResponse = await fetchWithAuth(`${API_URL}/vouchers/my-vouchers`);
        const vouchersData = await vouchersResponse.json();
        const claimedThisMonth = vouchersData.success ? vouchersData.data.filter((v: any) => {
          const claimDate = new Date(v.claimed_at);
          return claimDate.getMonth() === currentMonth && 
                 claimDate.getFullYear() === currentYear;
        }).length : 0;

        setUserData({
          name: profileData.data.name || 'User',
          totalDonations: allDonations.length,
          monthlyDonations: monthlyDonations.length,
          approvedDonations: approvedDonations.length,
          vouchersClaimed: vouchersData.success ? vouchersData.data.length : 0,
          canClaimVoucher: approvedDonations.length > 0 && claimedThisMonth === 0
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#417FA2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pb-20 animate-fade-in">
      
      {/* Header with Logo */}
      <div className="bg-[#417FA2] pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">Welcome back,</p>
            <h1 className="text-white text-2xl font-bold">{userData.name}</h1>
          </div>
          
          {/* U4B Logo */}
          <div className="flex items-center gap-1">
            <Image
              src="/assets/logo-w-u.png"
              alt="U"
              width={30}
              height={30}
              className="object-contain"
            />
            <Image
              src="/assets/logo-4.png"
              alt="4"
              width={30}
              height={30}
              className="object-contain"
            />
            <Image
              src="/assets/logo-w-b.png"
              alt="B"
              width={25}
              height={25}
              className="object-contain"
            />
          </div>
        </div>
        
        {/* Donation Stats Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
          <p className="text-white/80 text-sm mb-1">Your Activity</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{userData.totalDonations}</span>
            <span className="text-white/80 text-sm">donations</span>
          </div>
          <div className="mt-3 flex gap-3">
            <div className="flex-1">
              <p className="text-white/60 text-xs">This Month</p>
              <p className="text-white font-semibold">{userData.monthlyDonations}</p>
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-xs">Voucher Status</p>
              <p className="text-white font-semibold">
                {userData.canClaimVoucher ? '✓ Available' : '✗ Not Available'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6">
        
        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            
            <button
              onClick={() => router.push('/donation')}
              className="bg-gradient-to-br from-[#A0BE6F] to-[#8FAF5F] text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <div className="text-3xl mb-2">📷</div>
              <p className="font-semibold">Donate Now</p>
              <p className="text-xs opacity-90">Record & submit</p>
            </button>
            
            <button
              onClick={() => router.push('/voucher')}
              className="bg-gradient-to-br from-[#417FA2] to-[#356A85] text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <div className="text-3xl mb-2">🎁</div>
              <p className="font-semibold">Get Voucher</p>
              <p className="text-xs opacity-90">1 per month</p>
            </button>
            
            <button
              onClick={() => router.push('/bins')}
              className="bg-gradient-to-br from-gray-700 to-gray-800 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <div className="text-3xl mb-2">📍</div>
              <p className="font-semibold">Find Bins</p>
              <p className="text-xs opacity-90">Near you</p>
            </button>
            
            <button
              onClick={() => router.push('/history')}
              className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <div className="text-3xl mb-2">📊</div>
              <p className="font-semibold">History</p>
              <p className="text-xs opacity-90">View activity</p>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Your Impact</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">♻️</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Items Recycled</p>
                  <p className="font-bold text-gray-800">{userData.totalDonations} donations</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved Donations</p>
                  <p className="font-bold text-gray-800">{userData.approvedDonations} approved</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🎫</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vouchers Claimed</p>
                  <p className="font-bold text-gray-800">{userData.vouchersClaimed} vouchers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Banner */}
        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border-l-4 border-orange-400 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-gray-800 mb-1">💡 How It Works</p>
          <p className="text-xs text-gray-700">
            Donate fabric at any bin → Our team reviews your video → Get approved → 
            Claim <strong>1 voucher per month</strong> (U4B, Best Bundle, or Zalora)!
          </p>
        </div>

        {/* Call to Action */}
        {userData.totalDonations === 0 && (
          <div className="bg-gradient-to-br from-[#A0BE6F] to-[#8FAF5F] rounded-2xl p-6 text-white text-center shadow-lg">
            <p className="text-2xl mb-2">🎉</p>
            <p className="font-bold text-lg mb-2">Ready to make your first donation?</p>
            <p className="text-sm opacity-90 mb-4">Start your journey towards sustainability!</p>
            <button
              onClick={() => router.push('/donation')}
              className="bg-white text-[#A0BE6F] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
            >
              Donate Now
            </button>
          </div>
        )}

      </div>
    </div>
  );
}