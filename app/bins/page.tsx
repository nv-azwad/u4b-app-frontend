'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Navigation, Clock, Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/auth';

interface Bin {
  id: number;
  bin_code: string;
  qr_code_id: string;
  site_code: string;
  location_name: string;
  address: string;
  location_code: string;
  latitude: number;
  longitude: number;
  bin_count: number;
  status: string;
  distance?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function BinsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBin, setSelectedBin] = useState<number | null>(null);
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Fetch all bins on mount
  useEffect(() => {
    fetchAllBins();
  }, []);

  const fetchAllBins = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/bins?status=active&limit=100`);
      const data = await response.json();

      if (data.success) {
        setBins(data.data.bins);
      }
    } catch (error) {
      console.error('Error fetching bins:', error);
    } finally {
      setLoading(false);
    }
  };

  const findNearestBins = async () => {
    setLocationLoading(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

          try {
            // Call nearby bins API with 50km radius
            const response = await fetch(
              `${API_URL}/bins/nearby?latitude=${latitude}&longitude=${longitude}&radius=50`
            );
            const data = await response.json();

            if (data.success) {
              setBins(data.data.bins);
              
              // Scroll to first bin
              if (data.data.bins.length > 0) {
                setTimeout(() => {
                  document.getElementById('bins-list')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }, 100);
              }
            }
          } catch (error) {
            console.error('Error finding nearby bins:', error);
            alert('Failed to find nearby bins. Please try again.');
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Location access denied. Please enable location permissions.');
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setLocationLoading(false);
    }
  };

  const filteredBins = bins.filter(bin =>
    bin.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bin.bin_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bin.site_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bin.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBins = filteredBins.filter(b => b.status === 'active');
  const nearestDistance = activeBins.length > 0 && activeBins[0].distance 
    ? activeBins[0].distance 
    : '-';

  const handleGetDirections = (bin: Bin) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${bin.latitude},${bin.longitude}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center pb-24">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-[#417FA2] mx-auto mb-4" />
          <p className="text-gray-600">Loading bins...</p>
        </div>
      </div>
    );
  }

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
              placeholder="Search by location, bin code, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white rounded-xl shadow-md text-sm text-gray-800 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#417FA2] transition-all"
            />
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={20} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <p className="text-3xl font-bold text-[#417FA2]">{activeBins.length}</p>
            <p className="text-xs text-gray-600 mt-1">Active Bins</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <p className="text-3xl font-bold text-[#A0BE6F]">{nearestDistance}</p>
            <p className="text-xs text-gray-600 mt-1">Nearest (km)</p>
          </div>
        </div>

        {/* Find Nearest Bin Button */}
        <button
          onClick={findNearestBins}
          disabled={locationLoading}
          className="w-full bg-gradient-to-r from-[#417FA2] to-[#A0BE6F] text-white py-4 rounded-xl font-semibold mb-6 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {locationLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Getting your location...
            </>
          ) : (
            <>
              <Navigation size={20} />
              Find Nearest Bin to Me
            </>
          )}
        </button>

        {/* Bins List */}
        <div id="bins-list">
          {filteredBins.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No bins found</h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Try searching with a different keyword' 
                  : 'No bins available at the moment'}
              </p>
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
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800 text-lg">{bin.location_name}</h3>
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
                        <div className="flex gap-2 flex-wrap">
                          <p className="text-xs text-gray-500">QR: {bin.bin_code}</p>
                          <p className="text-xs text-gray-500">•</p>
                          <p className="text-xs text-gray-500">Site: {bin.site_code}</p>
                          {bin.bin_count > 1 && (
                            <>
                              <p className="text-xs text-gray-500">•</p>
                              <p className="text-xs text-green-600 font-semibold">
                                {bin.bin_count} bins available
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {bin.distance && (
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-[#417FA2]">{bin.distance}</p>
                          <p className="text-xs text-gray-500">km away</p>
                        </div>
                      )}
                    </div>

                    {/* Location Code Badge */}
                    {bin.location_code && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                        <MapPin size={16} />
                        <span className="text-xs">Location Code: {bin.location_code}</span>
                      </div>
                    )}

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
                            router.push(`/donation?bin=${bin.bin_code}`);
                          }}
                          className="w-full bg-[#A0BE6F] hover:bg-[#8FAF5F] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                        >
                          📷 Start Donation Here
                        </button>

                        {/* Info */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-3">
                          <p className="text-xs text-blue-800">
                            💡 <strong>Tip:</strong> Scan the QR code at this bin to start your donation automatically!
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
        </div>

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