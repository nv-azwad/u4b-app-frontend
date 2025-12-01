'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, MapPin, Calendar, User, AlertCircle, RefreshCw } from 'lucide-react';
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
  media_latitude: number;
  media_longitude: number;
  bin_latitude: number;
  bin_longitude: number;
}

export default function PendingReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDonations, setPendingDonations] = useState<Donation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const user = getUserFromToken();
    if (!user || !user.is_admin) {
      alert('Admin access only!');
      router.push('/dashboard');
      return;
    }

    fetchPendingDonations();
  }, [router]);

  const fetchPendingDonations = async (showRefreshAnimation = false) => {
    try {
      if (showRefreshAnimation) setRefreshing(true);
      else setLoading(true);

      const response = await fetchWithAuth(`${API_URL}/admin/donations/pending`);
      const data = await response.json();

      if (data.success) {
        setPendingDonations(data.data.donations);
      }
    } catch (error) {
      console.error('Error fetching pending donations:', error);
    } finally {
      setLoading(false);
      if (showRefreshAnimation) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  };

  const handleRefresh = () => {
    fetchPendingDonations(true);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const handleApprove = async (donationId: number) => {
    if (actionLoading) return;

    if (!confirm('Are you sure you want to approve this donation?')) return;

    try {
      setActionLoading(true);

      const response = await fetchWithAuth(
        `${API_URL}/admin/donations/${donationId}/approve`,
        {
          method: 'POST',
          body: JSON.stringify({ adminNotes: 'Approved by admin' })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('✅ Donation approved successfully!');
        setPendingDonations(prev => prev.filter(d => d.id !== donationId));
        setShowVideoModal(false);
      } else {
        alert(data.message || 'Failed to approve donation');
      }
    } catch (error) {
      console.error('Error approving donation:', error);
      alert('Error approving donation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (!selectedDonation || actionLoading) return;

    try {
      setActionLoading(true);

      const response = await fetchWithAuth(
        `${API_URL}/admin/donations/${selectedDonation.id}/reject`,
        {
          method: 'POST',
          body: JSON.stringify({ rejectionReason: rejectReason })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('❌ Donation rejected');
        setPendingDonations(prev => prev.filter(d => d.id !== selectedDonation.id));
        setShowRejectModal(false);
        setShowVideoModal(false);
        setRejectReason('');
        setSelectedDonation(null);
      } else {
        alert(data.message || 'Failed to reject donation');
      }
    } catch (error) {
      console.error('Error rejecting donation:', error);
      alert('Error rejecting donation');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#417FA2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pb-24">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 pt-12 pb-6 px-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Clock size={32} className="text-white" />
            <h1 className="text-white text-2xl font-bold">Pending Review</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
        <p className="text-white/80 text-sm">{pendingDonations.length} donation{pendingDonations.length !== 1 ? 's' : ''} awaiting approval</p>
      </div>

      <div className="px-6">

        {/* Empty State */}
        {pendingDonations.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">All Caught Up!</h3>
            <p className="text-gray-600 mb-4">No pending donations to review.</p>
            <button
              onClick={() => router.push('/admin')}
              className="bg-[#417FA2] hover:bg-[#356A85] text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingDonations.map((donation, index) => {
              const distance = donation.media_latitude && donation.bin_latitude
                ? calculateDistance(donation.media_latitude, donation.media_longitude, donation.bin_latitude, donation.bin_longitude)
                : null;

              return (
                <div
                  key={donation.id}
                  className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all"
                  style={{
                    animation: `slideInUp 0.3s ease-out ${index * 0.1}s both`
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{donation.user_name}</h3>
                        <p className="text-xs text-gray-500">{donation.user_email}</p>
                      </div>
                    </div>
                    <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-semibold">
                      Pending
                    </span>
                  </div>

                  {/* Location & Time */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-gray-500" />
                      <p className="text-sm font-semibold text-gray-800">{donation.location_name}</p>
                      <span className="text-xs text-gray-500">({donation.bin_code})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <p className="text-sm text-gray-600">
                        {new Date(donation.scan_timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Distance Warning */}
                  {distance !== null && distance > 0.1 && (
                    <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={18} className="text-orange-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-orange-800 mb-1">Distance Warning</p>
                          <p className="text-xs text-orange-700">
                            User was approximately {(distance * 1000).toFixed(0)}m away from bin
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Auto-verification */}
                  {donation.verification_notes && distance !== null && distance <= 0.1 && (
                    <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-green-800">
                        ✓ {donation.verification_notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setSelectedDonation(donation);
                        setShowVideoModal(true);
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                      disabled={actionLoading}
                    >
                      📹 Watch
                    </button>
                    <button
                      onClick={() => handleApprove(donation.id)}
                      className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                      disabled={actionLoading}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDonation(donation);
                        setShowRejectModal(true);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                      disabled={actionLoading}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Video Modal */}
      {showVideoModal && selectedDonation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Review Video</h3>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="bg-gray-900 rounded-lg mb-4 aspect-video flex items-center justify-center">
                {selectedDonation.media_url ? (
                  <video 
                    src={`http://localhost:5000${selectedDonation.media_url}`} 
                    controls 
                    className="w-full h-full rounded-lg object-contain"
                  >
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <p className="text-white text-sm">No video available</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Donor: <strong>{selectedDonation.user_name}</strong></p>
                <p className="text-sm text-gray-600 mb-1">Location: <strong>{selectedDonation.location_name}</strong></p>
                <p className="text-sm text-gray-600">Time: <strong>{new Date(selectedDonation.scan_timestamp).toLocaleString()}</strong></p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selectedDonation.id)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                  disabled={actionLoading}
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    setShowRejectModal(true);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                  disabled={actionLoading}
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedDonation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Reject Donation</h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting <strong>{selectedDonation.user_name}'s</strong> donation:
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Video quality too poor, location mismatch, inappropriate content..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 placeholder-gray-400"
              rows={4}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold disabled:opacity-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

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