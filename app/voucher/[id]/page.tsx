'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getVoucherById } from '@/lib/voucherdata';

export default function VoucherDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Get voucher by ID from URL
  const voucherId = parseInt(params.id as string);
  const voucher = getVoucherById(voucherId);

  // If voucher not found, show error
  if (!voucher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Voucher Not Found</h1>
          <button 
            onClick={() => router.push('/voucher')}
            className="bg-[#417FA2] text-white px-6 py-3 rounded-full font-semibold"
          >
            Back to Vouchers
          </button>
        </div>
      </div>
    );
  }

  const handleRedeem = () => {
    setShowCode(true);
    setIsRedeemed(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6 pb-32 animate-fade-in">
      
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="mb-6 text-[#417FA2] flex items-center gap-2 hover:gap-3 transition-all"
      >
        <span className="text-2xl">←</span>
        <span className="font-semibold">Back</span>
      </button>

      {/* Voucher Card */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6 animate-slide-in-right">
        
        {/* Header Section */}
        <div 
          className="p-8 text-white relative"
          style={{ backgroundColor: voucher.color }}
        >
          {/* Decorative circles */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">{voucher.brand}</h1>
            <p className="text-sm opacity-90">Exclusive Discount Voucher</p>
          </div>
        </div>

        {/* Discount Display */}
        <div className="bg-gradient-to-r from-[#417FA2] to-[#A0BE6F] p-8 text-center">
          <p className="text-6xl font-bold text-white mb-2">{voucher.discount}</p>
          <p className="text-white/90">on your next purchase</p>
        </div>

        {/* Voucher Details */}
        <div className="p-8">
          
          {/* Status Badge */}
          {!isRedeemed ? (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full inline-block mb-6 font-semibold">
              ✓ Available to Redeem
            </div>
          ) : (
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full inline-block mb-6 font-semibold">
              ✓ Redeemed Successfully!
            </div>
          )}

          {/* Voucher Code - Blurred until redeemed */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Voucher Code</p>
            <div className="bg-gray-100 border-2 border-dashed border-[#417FA2] rounded-xl p-4 text-center relative">
              <p className={`text-3xl font-mono font-bold text-[#417FA2] tracking-wider transition-all ${
                !showCode ? 'blur-lg select-none' : ''
              }`}>
                {voucher.code}
              </p>
              {!showCode && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow">
                    Redeem to reveal code
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Expiry Date */}
          <div className="mb-6 flex items-center justify-between bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
            <span className="text-sm text-gray-700">Expires on:</span>
            <span className="font-bold text-orange-600">{voucher.expiryDate}</span>
          </div>

          {/* Points Cost */}
          <div className="mb-6 flex items-center justify-between bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <span className="text-sm text-gray-700">Points Used:</span>
            <span className="font-bold text-blue-600">{voucher.points} points</span>
          </div>

          {/* Terms & Conditions */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Terms & Conditions</h3>
            <ul className="space-y-2">
              {voucher.terms.map((term, index) => (
                <li key={index} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-[#417FA2]">•</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* QR Code Placeholder */}
          {showCode && (
            <div className="bg-gray-100 rounded-xl p-8 text-center mb-6 animate-fade-in">
              <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-gray-400 text-sm">QR Code</div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Show this at checkout</p>
            </div>
          )}

        </div>
      </div>

      {/* Action Buttons - Fixed at bottom, above nav bar */}
      <div className="fixed bottom-20 left-0 right-0 px-6 space-y-3 bg-gradient-to-t from-white via-white to-transparent pt-4">
        {!isRedeemed ? (
          <button 
            onClick={handleRedeem}
            className="w-full bg-[#417FA2] hover:bg-[#356A85] text-white py-4 rounded-full font-bold text-lg shadow-lg transition-all animate-pulse-scale"
          >
            🎁 Redeem Now
          </button>
        ) : (
          <div className="text-center py-4 bg-green-50 rounded-full">
            <p className="text-green-700 font-semibold">✓ Voucher redeemed successfully!</p>
            <p className="text-xs text-green-600 mt-1">You can now use this code at the store</p>
          </div>
        )}
        
        <button 
          onClick={() => router.push('/voucher')}
          className="w-full bg-white border-2 border-[#417FA2] text-[#417FA2] py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-all"
        >
          View All Vouchers
        </button>
      </div>

    </div>
  );
}