'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, MapPin, Plus, Minus, Video, StopCircle } from 'lucide-react';
import { API_URL, fetchWithAuth } from '@/lib/auth';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';

interface Bin {
  id: number;
  bin_code: string;
  location_name: string;
  latitude: number;
  longitude: number;
}

interface Geolocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

function DonationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [loading, setLoading] = useState(false);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [fabricCount, setFabricCount] = useState(1);
  const [userLocation, setUserLocation] = useState<Geolocation | null>(null);

  // Video states
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraError, setCameraError] = useState('');

  // Get bin from QR code
  useEffect(() => {
    const binCode = searchParams.get('bin');
    if (binCode) {
      fetchBinByCode(binCode);
    }
    
    // Get user location
    getUserLocation();

    // Cleanup camera on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [searchParams]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  const fetchBinByCode = async (binCode: string) => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}/bins?limit=100`);
      const data = await response.json();

      if (data.success && data.data && data.data.bins) {
        const bin = data.data.bins.find((b: Bin) => b.bin_code === binCode);
        if (bin) {
          setSelectedBin(bin);
          showSuccess(`Location detected: ${bin.location_name}`);
        } else {
          showError(`Bin ${binCode} not found`);
        }
      }
    } catch (error) {
      console.error('Error fetching bin:', error);
      showError('Failed to load bin information');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          showError('Location access denied. Please enable location.');
        }
      );
    }
  };

  const startCamera = async () => {
    try {
      setCameraError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      showSuccess('Camera ready!');
    } catch (error: any) {
      console.error('Camera error:', error);
      setCameraError('Camera access denied. Please allow camera permissions.');
      showError('Failed to access camera');
    }
  };

  const startRecording = async () => {
    if (!stream) {
      await startCamera();
      return;
    }

    if (!selectedBin) {
      showError('Please scan a QR code first');
      return;
    }

    try {
      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        showSuccess('Recording saved!');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      showInfo('Recording started! Max 30 seconds');

    } catch (error) {
      console.error('Recording error:', error);
      showError('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  const reRecord = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    startCamera();
  };

  const handleSubmit = async () => {
    if (!selectedBin) {
      showError('Please scan the QR code on the bin first');
      return;
    }

    if (!recordedBlob) {
      showError('Please record a video first');
      return;
    }

    if (!userLocation) {
      showError('Location access required');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('video', recordedBlob, 'donation-video.webm');
      formData.append('binId', selectedBin.id.toString());
      formData.append('fabricCount', fabricCount.toString());
      formData.append('latitude', userLocation.latitude.toString());
      formData.append('longitude', userLocation.longitude.toString());
      formData.append('accuracy', userLocation.accuracy.toString());

      // Upload to backend
      const response = await fetch(`${API_URL}/donations/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('🎉 Donation submitted successfully!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        showError(data.message || 'Failed to submit donation');
      }

    } catch (error) {
      console.error('Submit error:', error);
      showError('Failed to submit donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0BE6F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pb-20 animate-fade-in">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#A0BE6F] to-[#8FAF5F] pt-12 pb-6 px-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Camera size={32} className="text-white" />
          <h1 className="text-white text-2xl font-bold">Make a Donation</h1>
        </div>
        <p className="text-white/80 text-sm">Record your fabric donation</p>
      </div>

      <div className="px-6">

        {/* Location Banner */}
        {selectedBin && (
          <div className="bg-green-50 border-2 border-green-400 rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <MapPin className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-green-600 font-semibold">📍 Location Detected</p>
                <p className="text-sm font-bold text-green-800">{selectedBin.location_name}</p>
                <p className="text-xs text-green-600">Code: {selectedBin.bin_code}</p>
              </div>
              <span className="text-2xl">✓</span>
            </div>
          </div>
        )}

        {/* No Location Warning */}
        {!selectedBin && (
          <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <MapPin className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-orange-600 font-semibold">⚠️ Location Required</p>
                <p className="text-sm font-bold text-orange-800">Please scan the QR code on the bin</p>
              </div>
            </div>
          </div>
        )}

        {/* Fabric Counter */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Number of Bags</h3>
          <div className="flex items-center justify-center gap-8 mb-4">
            <button
              onClick={() => setFabricCount(Math.max(1, fabricCount - 1))}
              className="w-14 h-14 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-all shadow-md"
              disabled={isRecording}
            >
              <Minus size={24} className="text-gray-700" />
            </button>
            
            <div className="text-center">
              <p className="text-6xl font-bold text-[#A0BE6F]">{fabricCount}</p>
              <p className="text-sm text-gray-600 mt-2">
                {fabricCount === 1 ? 'bag' : 'bags'} • ~{fabricCount * 2}kg
              </p>
            </div>
            
            <button
              onClick={() => setFabricCount(Math.min(10, fabricCount + 1))}
              className="w-14 h-14 bg-[#A0BE6F] hover:bg-[#8FAF5F] rounded-full flex items-center justify-center transition-all shadow-md"
              disabled={isRecording}
            >
              <Plus size={24} className="text-white" />
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center">Maximum 10 bags per donation</p>
        </div>

        {/* Video Recording Section */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Record Video</h3>
            {isRecording && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-bold">{recordingTime}s / 30s</span>
              </div>
            )}
          </div>
          
          {/* Video Preview */}
          <div className="bg-gray-900 rounded-xl aspect-video mb-4 relative overflow-hidden">
            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-red-400 text-sm">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="mt-4 px-4 py-2 bg-[#A0BE6F] text-white rounded-lg text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : recordedBlob ? (
              <video
                src={URL.createObjectURL(recordedBlob)}
                controls
                className="w-full h-full"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Recording Controls */}
          <div className="space-y-3">
            {!stream && !recordedBlob && (
              <button 
                onClick={startCamera}
                className="w-full bg-[#A0BE6F] hover:bg-[#8FAF5F] text-white py-4 rounded-xl font-bold transition-all"
              >
                📷 Open Camera
              </button>
            )}

            {stream && !isRecording && !recordedBlob && (
              <button 
                onClick={startRecording}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3"
              >
                <div className="w-4 h-4 bg-white rounded-full"></div>
                Start Recording (30s max)
              </button>
            )}
            
            {isRecording && (
              <button 
                onClick={stopRecording}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <StopCircle size={20} />
                Stop Recording
              </button>
            )}

            {recordedBlob && (
              <button 
                onClick={reRecord}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold"
              >
                🔄 Re-record Video
              </button>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-blue-800 mb-2">📹 Recording Tips:</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Show the bin clearly in the video</li>
            <li>• Show the fabrics you're donating</li>
            <li>• Record for at least 10 seconds</li>
            <li>• Make sure you're at the bin location</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedBin || !recordedBlob || isRecording}
          className="w-full bg-[#417FA2] hover:bg-[#356A85] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
        >
          {!selectedBin ? '⚠️ Scan QR Code First' : !recordedBlob ? '📹 Record Video First' : '✓ Submit Donation'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your donation will be reviewed within 24 hours
        </p>

      </div>
    </div>
  );
}

export default function DonationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0BE6F]"></div>
      </div>
    }>
      <DonationContent />
    </Suspense>
  );
}