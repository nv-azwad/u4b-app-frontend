'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Package, Clock, CheckCircle, TrendingUp, Award } from 'lucide-react';
import { API_URL, fetchWithAuth, getUserFromToken } from '@/lib/auth';

interface Stats {
  totalDonations: number;
  pendingReview: number;
  approvedToday: number;
  totalUsers: number;
  totalVouchers: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalDonations: 0,
    pendingReview: 0,
    approvedToday: 0,
    totalUsers: 0,
    totalVouchers: 0
  });

  useEffect(() => {
    const user = getUserFromToken();
    if (!user || !user.is_admin) {
      alert('Admin access only!');
      router.push('/dashboard');
      return;
    }

    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}/admin/stats`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#417FA2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pb-24">
      
      {/* Header */}
      <div className="bg-[#417FA2] pt-12 pb-6 px-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={32} className="text-white" />
          <h1 className="text-white text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-white/80 text-sm">Platform overview and statistics</p>
      </div>

      <div className="px-6">
        
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Pending Review - Highlighted */}
          <div className="col-span-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 shadow-lg text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Clock size={28} />
                </div>
                <div>
                  <p className="text-white/90 text-sm font-medium">Pending Review</p>
                  <p className="text-3xl font-bold">{stats.pendingReview}</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/admin/pending')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                Review Now →
              </button>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-xs text-white/90">
                {stats.pendingReview === 0 
                  ? '🎉 All caught up!' 
                  : `${stats.pendingReview} donation${stats.pendingReview > 1 ? 's' : ''} waiting for review`
                }
              </p>
            </div>
          </div>

          {/* Approved Today */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-green-500" size={24} />
              <p className="text-xs text-gray-600 font-medium">Approved Today</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.approvedToday}</p>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-500" size={24} />
              <p className="text-xs text-gray-600 font-medium">Total Users</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
          </div>

          {/* Total Donations */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Package className="text-purple-500" size={24} />
              <p className="text-xs text-gray-600 font-medium">All Donations</p>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.totalDonations}</p>
          </div>

          {/* Vouchers Claimed */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Award className="text-yellow-500" size={24} />
              <p className="text-xs text-gray-600 font-medium">Vouchers Claimed</p>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.totalVouchers}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            
            {/* Review Pending */}
            <button
              onClick={() => router.push('/admin/pending')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Clock size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Review Donations</p>
                    <p className="text-sm text-white/90">{stats.pendingReview} waiting for approval</p>
                  </div>
                </div>
                <span className="text-2xl">→</span>
              </div>
            </button>

            {/* View All Donations */}
            <button
              onClick={() => router.push('/admin/donations')}
              className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 text-left border-2 border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Package size={28} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-800">All Donations</p>
                    <p className="text-sm text-gray-600">View complete history & filters</p>
                  </div>
                </div>
                <span className="text-2xl text-gray-400">→</span>
              </div>
            </button>

            {/* Manage Users */}
            <button
              onClick={() => router.push('/admin/users')}
              className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 text-left border-2 border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Users size={28} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-800">Manage Users</p>
                    <p className="text-sm text-gray-600">{stats.totalUsers} registered users</p>
                  </div>
                </div>
                <span className="text-2xl text-gray-400">→</span>
              </div>
            </button>

          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-500" size={24} />
            <h2 className="text-lg font-bold text-gray-800">Platform Health</h2>
          </div>
          
          <div className="space-y-3">
            {/* Approval Rate */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-sm font-semibold text-gray-800">
                  {stats.totalDonations > 0 
                    ? Math.round(((stats.totalDonations - stats.pendingReview) / stats.totalDonations) * 100)
                    : 0
                  }%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${stats.totalDonations > 0 
                      ? Math.round(((stats.totalDonations - stats.pendingReview) / stats.totalDonations) * 100)
                      : 0
                    }%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Pending Queue */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-600">Pending Queue</p>
                <p className="text-sm font-semibold text-gray-800">{stats.pendingReview} items</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    stats.pendingReview === 0 
                      ? 'bg-green-500' 
                      : stats.pendingReview < 5 
                      ? 'bg-yellow-500' 
                      : 'bg-orange-500'
                  }`}
                  style={{ 
                    width: `${Math.min((stats.pendingReview / 10) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* User Engagement */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-600">Active Users (with donations)</p>
                <p className="text-sm font-semibold text-gray-800">
                  {stats.totalUsers > 0 && stats.totalDonations > 0 
                    ? Math.round((stats.totalDonations / stats.totalUsers) * 100) 
                    : 0
                  }%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${stats.totalUsers > 0 && stats.totalDonations > 0 
                      ? Math.round((stats.totalDonations / stats.totalUsers) * 100) 
                      : 0
                    }%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}