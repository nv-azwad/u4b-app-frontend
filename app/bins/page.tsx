'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Navigation, Clock } from 'lucide-react';

export default function BinsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBin, setSelectedBin] = useState<number | null>(null);

  // TODO: Fetch from API - /api/bins/nearby
  const bins = [
    {
      id: 1,
      binCode: 'BIN001',
      locationName: 'Kuantan City Mall',
      latitude: 3.8167,
      longitude: 103.3262,
      status: 'active',
      distance: 0.5, // km
      address: 'Jalan Mahkota, 25000 Kuantan',
      operatingHours: '9:00 AM - 10:00 PM'
    },
    {
      id: 2,
      binCode: 'BIN002',
      locationName: 'IIUM Kuantan',
      latitude: 3.8167,
      longitude: 103.3262,
      status: 'active',
      distance: 2.3,
      address: 'IIUM Gombak Campus',
      operatingHours: '24/7'
    },
    {
      id: 3,
      binCode: 'BIN003',
      locationName: 'Gambang Safari Park',
      latitude: 3.8167,
      longitude: 103.3262,
      status: 'active',
      distance: 15.7,
      address: 'Gambang, Kuantan',
      operatingHours: '9:00 AM - 6:00 PM'
    },
    {
      id: 4,
      binCode: 'BIN004',
      locationName: 'Teluk Cempedak Beach',
      latitude: 3.8167,
      longitude: 103.3262,
      status: 'maintenance',
      distance: 5.2,
      address: 'Teluk Cempedak, Kuantan',
      operatingHours: 'Under Maintenance'
    },
  ];

  const filteredBins = bins.filter(bin =>
    bin.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bin.binCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bin.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBins = filteredBins.filter(b => b.status === 'active');

  const handleGetDirections = (bin: typeof bins[0]) => {
    // Open Google Maps with directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${bin.latitude},${bin.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pb-24 animate-fade-in">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#417FA2] to-[#A0BE6F] pt-12 pb-6 px-6 rounded-b-3xl shadow-lg mb-6">
        <h1 className="text-white text-2xl font-bold mb-2">Find Donation Bins</h1>
        <p className="text-white/80 text-sm">Locate nearby bins to donate your fabric</p>
      </div>

      <div className="px-6">
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by location or bin code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white rounded-xl shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-[#417FA2] transition-all"
            />
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <p className="text-3xl font-bold text-[#417FA2]">{activeBins.length}</p>
            <p className="text-xs text-gray-600 mt-1">Active Bins</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <p className="text-3xl font-bold text-[#A0BE6F]">
              {activeBins.length > 0 ? activeBins[0].distance : '-'}
            </p>
            <p className="text-xs text-gray-600 mt-1">Nearest (km)</p>
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={() => {
            // TODO: Use actual geolocation
            alert('Getting your location...');
          }}
          className="w-full bg-gradient-to-r from-[#417FA2] to-[#A0BE6F] text-white py-4 rounded-xl font-semibold mb-6 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Navigation size={20} />
          Find Nearest Bin to Me
        </button>

        {/* Bins List */}
        {filteredBins.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No bins found</h3>
            <p className="text-gray-600">Try searching with a different keyword</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBins.map((bin) => (
              <div
                key={bin.id}
                className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden ${
                  selectedBin === bin.id ? 'ring-2 ring-[#417FA2]' : ''
                } ${bin.status !== 'active' ? 'opacity-60' : ''}`}
                onClick={() => setSelectedBin(selectedBin === bin.id ? null : bin.id)}
              >
                {/* Main Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800 text-lg">{bin.locationName}</h3>
                        {bin.status === 'active' ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                            Maintenance
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{bin.address}</p>
                      <p className="text-xs text-gray-500">Bin Code: {bin.binCode}</p>
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-[#417FA2]">{bin.distance}</p>
                      <p className="text-xs text-gray-500">km away</p>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                    <Clock size={16} />
                    <span>{bin.operatingHours}</span>
                  </div>

                  {/* Expanded Details */}
                  {selectedBin === bin.id && bin.status === 'active' && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in space-y-3">
                      
                      {/* Get Directions Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetDirections(bin);
                        }}
                        className="w-full bg-[#417FA2] hover:bg-[#356A85] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        <Navigation size={18} />
                        Get Directions
                      </button>

                      {/* Donate Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/donation?bin=${bin.binCode}`);
                        }}
                        className="w-full bg-[#A0BE6F] hover:bg-[#8FAF5F] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        📷 Start Donation Here
                      </button>

                      {/* Info */}
                      <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-3">
                        <p className="text-xs text-blue-800">
                          💡 <strong>Tip:</strong> Scan the QR code at this bin to start your donation and earn points!
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedBin === bin.id && bin.status !== 'active' && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                      <div className="bg-orange-50 border-l-4 border-orange-400 rounded p-3">
                        <p className="text-xs text-orange-800">
                          ⚠️ This bin is currently under maintenance. Please try another location.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200">
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-xl">📍</span>
            How to Donate
          </h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="font-bold text-purple-600">1.</span>
              <span>Find a nearby donation bin from the list above</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-purple-600">2.</span>
              <span>Go to the bin location during operating hours</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-purple-600">3.</span>
              <span>Scan the QR code on the bin to start donation</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-purple-600">4.</span>
              <span>Record video of you dropping the bag into the bin</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-purple-600">5.</span>
              <span>Earn points instantly after verification!</span>
            </li>
          </ol>
        </div>

      </div>
    </div>
  );
}