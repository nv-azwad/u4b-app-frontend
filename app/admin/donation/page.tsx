'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Filter, Search, MapPin, Calendar, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { API_URL, fetchWithAuth, getUserFromToken } from '@/lib/auth';

interface Donation {
  id: number;
  user_name: string;
  user_email: string;
  bin_code: string;
  location_name: string;
  media_url: string;
  scan_timestamp: string;
  verification_notes: string;
  status: string;
  admin_reviewed: boolean;
  reviewed_at: string;
}

export default function AllDonationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected' | 'pending_admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const user = getUserFromToken();
    if (!user || !user.is_admin) {
      alert('Admin access only!');
      router.push('/dashboard');
      return;
    }

    fetchDonations();
  }, [router, filter]);

  const fetchDonations = async (showRefreshAnimation = false) => {
    try {
      if (showRefreshAnimation) setRefreshing(true);
      else setLoading(true);

      const statusParam = filter === 'all' ? 'all' : filter;
      const response = await fetchWithAuth(`${API_URL}/admin/donations?status=${statusParam}&limit=100`);
      const data = await response.json();

      if (data.success) {
        setDonations(data.data.donations);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
      if (showRefreshAnimation) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  };

  const handleRefresh = () => {
    fetchDonations(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending_admin':
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'pending_admin':
      case 'pending':
        return <Clock size={18} className="text-orange-600" />;
      case 'rejected':
        return <XCircle size={18} className="text-red-600" />;
      default:
        return <Clock size={18} className="text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending_admin':
        return 'Pending';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  // Filter by search query
  const filteredDonations = donations.filter(donation => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      donation.user_name.toLowerCase().includes(query) ||
      donation.user_email.toLowerCase().includes(query) ||
      donation.location_name.toLowerCase().includes(query) ||
      donation.bin_code.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#417FA2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pb-24">
      
      {/* Header */}
      <div className="bg-[#417FA2] pt-12 pb-6 px-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Package size={32} className="text-white" />
            <h1 className="text-white text-2xl font-bold">All Donations</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
        <p className="text-white/80 text-sm">Complete donation history & management</p>
      </div>

      <div className="px-6">

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-3 shadow-md mb-4">
          <div className="flex items-center gap-2">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by user, email, location, or bin code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-white rounded-lg p-2 shadow-md text-center">
            <p className="text-lg font-bold text-gray-800">{donations.length}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-md text-center">
            <p className="text-lg font-bold text-green-600">
              {donations.filter(d => d.status === 'approved').length}
            </p>
            <p className="text-xs text-gray-600">Approved</p>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-md text-center">
            <p className="text-lg font-bold text-orange-600">
              {donations.filter(d => d.status === 'pending_admin').length}
            </p>
            <p className="text-xs text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-md text-center">
            <p className="text-lg font-bold text-red-600">
              {donations.filter(d => d.status === 'rejected').length}
            </p>
            <p className="text-xs text-gray-600">Rejected</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl p-3 shadow-md mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={16} className="text-gray-600" />
            <p className="text-sm font-semibold text-gray-700">Filter:</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-[#417FA2] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'approved'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('pending_admin')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'pending_admin'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'rejected'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Donations List */}
        {filteredDonations.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-md text-center">
            <Package size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold mb-2">
              {searchQuery ? 'No donations found' : 'No donations yet'}
            </p>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search query' : 'Donations will appear here once users start donating'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDonations.map((donation, index) => (
              <div
                key={donation.id}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
                style={{
                  animation: `slideInUp 0.3s ease-out ${index * 0.05}s both`
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border-2 ${getStatusColor(donation.status)}`}>
                      {getStatusIcon(donation.status)}
                      <span className="text-xs font-bold">
                        {getStatusLabel(donation.status)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">#{donation.id}</span>
                </div>

                {/* User Info */}
                <div className="mb-2">
                  <p className="font-semibold text-gray-800 text-sm">{donation.user_name}</p>
                  <p className="text-xs text-gray-500">{donation.user_email}</p>
                </div>

                {/* Location & Time */}
                <div className="flex flex-col gap-1 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-500" />
                    <p className="text-xs text-gray-600">
                      {donation.location_name} <span className="text-gray-400">({donation.bin_code})</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-500" />
                    <p className="text-xs text-gray-600">
                      {new Date(donation.scan_timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Verification Notes */}
                {donation.verification_notes && (
                  <div className={`rounded-lg p-2 text-xs ${
                    donation.status === 'approved' 
                      ? 'bg-green-50 text-green-800'
                      : donation.status === 'rejected'
                      ? 'bg-red-50 text-red-800'
                      : 'bg-blue-50 text-blue-800'
                  }`}>
                    {donation.verification_notes}
                  </div>
                )}

                {/* Review Info */}
                {donation.admin_reviewed && donation.reviewed_at && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Reviewed: {new Date(donation.reviewed_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {searchQuery && filteredDonations.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Showing {filteredDonations.length} of {donations.length} donations
            </p>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}