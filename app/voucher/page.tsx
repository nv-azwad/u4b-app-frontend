'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, CheckCircle, XCircle, Calendar, Copy, Eye, EyeOff } from 'lucide-react';
import { API_URL, fetchWithAuth } from '@/lib/auth';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';

interface Voucher {
  id: number;
  partner_name: string;
  description: string;
  discount_amount: string;
  terms_conditions: string;
  expiry_date: string;
}

interface ClaimedVoucher {
  id: number;
  voucher_code: string;
  claimed_at: string;
  partner_name: string;
  discount_amount: string;
  expiry_date: string;
}

interface Eligibility {
  canClaim: boolean;
  hasApprovedDonation: boolean;
  hasClaimedThisMonth: boolean;
  claimedVoucher: ClaimedVoucher | null;
}

export default function VoucherPage() {
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [myVouchers, setMyVouchers] = useState<ClaimedVoucher[]>([]);
  const [showCode, setShowCode] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchVouchers(),
        checkEligibility(),
        fetchMyVouchers()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVouchers = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/vouchers/available`);
      const data = await response.json();
      if (data.success) {
        setVouchers(data.data);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  const checkEligibility = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/vouchers/check-eligibility`);
      const data = await response.json();
      if (data.success) {
        setEligibility(data.data);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  const fetchMyVouchers = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/vouchers/my-vouchers`);
      const data = await response.json();
      if (data.success) {
        setMyVouchers(data.data);
      }
    } catch (error) {
      console.error('Error fetching my vouchers:', error);
    }
  };

  const handleClaimVoucher = async (voucherId: number) => {
    if (!eligibility?.canClaim) {
      showError('You are not eligible to claim a voucher yet');
      return;
    }

    try {
      setClaiming(true);
      const response = await fetchWithAuth(`${API_URL}/vouchers/claim`, {
        method: 'POST',
        body: JSON.stringify({ voucherId })
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('🎉 Voucher claimed successfully!');
        fetchData(); // Refresh all data
      } else {
        showError(data.message || 'Failed to claim voucher');
      }
    } catch (error) {
      console.error('Error claiming voucher:', error);
      showError('Failed to claim voucher');
    } finally {
      setClaiming(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    showSuccess('Code copied to clipboard!');
  };

  const toggleShowCode = (id: number) => {
    setShowCode(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#417FA2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vouchers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pb-20 animate-fade-in">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#417FA2] to-[#356A85] pt-12 pb-6 px-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Gift size={32} className="text-white" />
          <h1 className="text-white text-2xl font-bold">Vouchers</h1>
        </div>
        <p className="text-white/80 text-sm">Claim your monthly reward!</p>
      </div>

      <div className="px-6">

        {/* Eligibility Status */}
        {eligibility && (
          <div className={`rounded-2xl p-5 shadow-md mb-6 ${
            eligibility.canClaim 
              ? 'bg-green-50 border-2 border-green-400' 
              : 'bg-orange-50 border-2 border-orange-400'
          }`}>
            <div className="flex items-start gap-3">
              {eligibility.canClaim ? (
                <CheckCircle className="text-green-600 mt-1" size={24} />
              ) : (
                <XCircle className="text-orange-600 mt-1" size={24} />
              )}
              <div className="flex-1">
                <h3 className={`font-bold mb-1 ${
                  eligibility.canClaim ? 'text-green-800' : 'text-orange-800'
                }`}>
                  {eligibility.canClaim ? '✓ You can claim a voucher!' : '⚠️ Not eligible yet'}
                </h3>
                <p className={`text-sm ${
                  eligibility.canClaim ? 'text-green-700' : 'text-orange-700'
                }`}>
                  {!eligibility.hasApprovedDonation && 
                    'You need at least 1 approved donation to claim.'}
                  {eligibility.hasApprovedDonation && eligibility.hasClaimedThisMonth && 
                    'You already claimed a voucher this month. Come back next month!'}
                  {eligibility.canClaim && 
                    'Choose any voucher below to claim your reward!'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Available Vouchers */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Available Vouchers</h2>
          <div className="space-y-4">
            {vouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#417FA2] to-[#A0BE6F] rounded-xl flex items-center justify-center">
                    <Gift size={32} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{voucher.partner_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{voucher.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                        {voucher.discount_amount}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        Valid until {new Date(voucher.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {voucher.terms_conditions && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-600">{voucher.terms_conditions}</p>
                  </div>
                )}

                <button
                  onClick={() => handleClaimVoucher(voucher.id)}
                  disabled={!eligibility?.canClaim || claiming}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    eligibility?.canClaim && !claiming
                      ? 'bg-[#417FA2] hover:bg-[#356A85] text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {claiming ? 'Claiming...' : eligibility?.canClaim ? '🎁 Claim This Voucher' : '🔒 Not Eligible'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* My Vouchers */}
        {myVouchers.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">My Vouchers</h2>
            <div className="space-y-4">
              {myVouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 shadow-md border-2 border-purple-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-purple-800">{voucher.partner_name}</h3>
                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">
                      {voucher.discount_amount}
                    </span>
                  </div>

                  {/* Voucher Code with Blur Effect */}
                  <div className="bg-white rounded-xl p-4 mb-3">
                    <p className="text-xs text-gray-500 mb-2">Voucher Code:</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <p className={`text-2xl font-bold text-gray-800 tracking-wider transition-all ${
                          showCode[voucher.id] ? '' : 'blur-sm select-none'
                        }`}>
                          {voucher.voucher_code}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleShowCode(voucher.id)}
                        className="p-2 bg-blue-400 hover:bg-blue-300 rounded-lg transition-all"
                      >
                        {showCode[voucher.id] ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(voucher.voucher_code)}
                        className="p-2 bg-[#417FA2] hover:bg-[#356A85] text-white rounded-lg transition-all"
                      >
                        <Copy size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Claimed: {new Date(voucher.claimed_at).toLocaleDateString()}</span>
                    <span>Expires: {new Date(voucher.expiry_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-4 mt-6">
          <p className="text-sm font-semibold text-blue-800 mb-2">💡 How it works:</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Make a donation and get it approved by our team</li>
            <li>• Claim 1 voucher per month after approval</li>
            <li>• Use your voucher code at the partner store</li>
            <li>• New month = claim a new voucher!</li>
          </ul>
        </div>

      </div>
    </div>
  );
}