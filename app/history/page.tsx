'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { History, MapPin, Calendar, CheckCircle, Clock, XCircle, Filter, RefreshCw } from 'lucide-react';
import { API_URL, fetchWithAuth } from '@/lib/auth';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';

interface Donation {
  id: number;
  status: string;
  scan_timestamp: string;
  media_url: string;
  verification_notes: string;
  bin_code: string;
  location_name: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { toasts, removeToast, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending_admin' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async (showRefreshAnimation = false) => {
    try {
      if (showRefreshAnimation) setRefreshing(true);
      else setLoading(true);

      const response = await fetchWithAuth(`${API_URL}/donations/my-donations?limit=100`);
      const data = await response.json();

      if (data.success) {
        setDonations(data.data.donations);
      } else {
        showError('Failed to load history');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      showError('Failed to load donation history');
    } finally {
      setLoading(false);
      if (showRefreshAnimation) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  };

  const handleRefresh = () => {
    fetchHistory(true);
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
        return <CheckCircle size={20} className="text-green-600" />;
      case 'pending_admin':
      case 'pending':
        return <Clock size={20} className="text-orange-600" />;
      case 'rejected':
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending_admin':
        return 'Pending Review';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const isDistanceWarning = (notes: string) => {
    return notes && notes.toLowerCase().includes('warning') && notes.toLowerCase().includes('away from bin');
  };

  const extractDistance = (notes: string) => {
    const match = notes.match(/(\d+)m away from bin/);
    return match ? match[1] : null;
  };

  const filteredDonations = filter === 'all' 
    ? donations 
    : donations.filter(d => d.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#417FA2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pb-20">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header - Blue gradient matching Dashboard */}
      <div className="bg-[#417FA2] pt-12 pb-6 px-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <History size={32} className="text-white" />
            <h1 className="text-white text-2xl font-bold">Donation History</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
        <p className="text-white/80 text-sm">Track all your donations</p>
      </div>

      <div className="px-6">

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 shadow-md text-center transform hover:scale-105 transition-transform">
            <p className="text-2xl font-bold text-gray-800">{donations.length}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md text-center transform hover:scale-105 transition-transform">
            <p className="text-2xl font-bold text-green-600">
              {donations.filter(d => d.status === 'approved').length}
            </p>
            <p className="text-xs text-gray-600">Approved</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md text-center transform hover:scale-105 transition-transform">
            <p className="text-2xl font-bold text-orange-600">
              {donations.filter(d => d.status === 'pending_admin').length}
            </p>
            <p className="text-xs text-gray-600">Pending</p>
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
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 ${
                filter === 'all'
                  ? 'bg-[#417FA2] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({donations.length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 ${
                filter === 'approved'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({donations.filter(d => d.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('pending_admin')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 ${
                filter === 'pending_admin'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({donations.filter(d => d.status === 'pending_admin').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 ${
                filter === 'rejected'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({donations.filter(d => d.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Donation List */}
        {filteredDonations.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-md text-center">
            <History size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold mb-2">
              {filter === 'all' ? 'No donations yet' : `No ${filter.replace('_', ' ')} donations`}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {filter === 'all' 
                ? 'Start donating to see your history here!' 
                : 'Try selecting a different filter'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => router.push('/donation')}
                className="bg-[#A0BE6F] hover:bg-[#8FAF5F] text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Make a Donation
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDonations.map((donation, index) => (
              <div
                key={donation.id}
                className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]"
                style={{
                  animation: `slideInUp 0.3s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border-2 ${getStatusColor(donation.status)}`}>
                    {getStatusIcon(donation.status)}
                    <span className="text-sm font-bold">
                      {getStatusLabel(donation.status)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    #{donation.id}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-gray-500" />
                  <p className="text-sm font-semibold text-gray-800">{donation.location_name}</p>
                  <span className="text-xs text-gray-500">({donation.bin_code})</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-gray-500" />
                  <p className="text-sm text-gray-600">
                    {new Date(donation.scan_timestamp).toLocaleString()}
                  </p>
                </div>

                {/* Verification Notes */}
                {donation.verification_notes && (
                  <div>
                    {/* Distance Warning (if applicable) */}
                    {isDistanceWarning(donation.verification_notes) && (
                      <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-3 mb-2">
                        <div className="flex items-start gap-2">
                          <span className="text-orange-600 text-lg">⚠️</span>
                          <div>
                            <p className="text-xs font-semibold text-orange-800 mb-1">Distance Warning</p>
                            <p className="text-xs text-orange-700">
                              You were approximately {extractDistance(donation.verification_notes)}m away from the bin during donation.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Regular Verification Notes */}
                    {!isDistanceWarning(donation.verification_notes) && (
                      <div className={`rounded-lg p-3 ${
                        donation.status === 'approved' 
                          ? 'bg-green-50 border-l-4 border-green-400'
                          : donation.status === 'rejected'
                          ? 'bg-red-50 border-l-4 border-red-400'
                          : 'bg-blue-50 border-l-4 border-blue-400'
                      }`}>
                        <p className={`text-xs font-medium ${
                          donation.status === 'approved'
                            ? 'text-green-800'
                            : donation.status === 'rejected'
                            ? 'text-red-800'
                            : 'text-blue-800'
                        }`}>
                          {donation.verification_notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
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