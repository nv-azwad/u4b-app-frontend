'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, Mail, Calendar, Award, Package, RefreshCw, X } from 'lucide-react';
import { API_URL, fetchWithAuth, getUserFromToken } from '@/lib/auth';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  total_donations_count: number;
  created_at: string;
  is_admin: boolean;
}

interface UserDetails extends User {
  donations: Array<{
    id: number;
    status: string;
    location_name: string;
    scan_timestamp: string;
  }>;
}

export default function ManageUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  useEffect(() => {
    const user = getUserFromToken();
    if (!user || !user.is_admin) {
      alert('Admin access only!');
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [router]);

  const fetchUsers = async (showRefreshAnimation = false) => {
    try {
      if (showRefreshAnimation) setRefreshing(true);
      else setLoading(true);

      // Note: You'll need to create this endpoint in your backend
      const response = await fetchWithAuth(`${API_URL}/admin/users`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // For now, show error but don't crash
      alert('Note: /admin/users endpoint needs to be created in backend');
    } finally {
      setLoading(false);
      if (showRefreshAnimation) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  };

  const fetchUserDetails = async (userId: number) => {
    try {
      setLoadingUserDetails(true);
      
      // Fetch user donations
      const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}/donations`);
      const data = await response.json();

      if (data.success) {
        setSelectedUser(data.data);
        setShowUserModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Note: /admin/users/:id/donations endpoint needs to be created');
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers(true);
  };

  // Filter users by search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone && user.phone.includes(query))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#417FA2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
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
            <Users size={32} className="text-white" />
            <h1 className="text-white text-2xl font-bold">Manage Users</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
        <p className="text-white/80 text-sm">{users.length} registered users</p>
      </div>

      <div className="px-6">

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-3 shadow-md mb-4">
          <div className="flex items-center gap-2">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 shadow-md text-center">
            <p className="text-2xl font-bold text-blue-600">{users.length}</p>
            <p className="text-xs text-gray-600">Total Users</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md text-center">
            <p className="text-2xl font-bold text-green-600">
              {users.filter(u => u.total_donations_count > 0).length}
            </p>
            <p className="text-xs text-gray-600">Active</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md text-center">
            <p className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.is_admin).length}
            </p>
            <p className="text-xs text-gray-600">Admins</p>
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-md text-center">
            <Users size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold mb-2">
              {searchQuery ? 'No users found' : 'No users yet'}
            </p>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search query' : 'Users will appear here once they register'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user, index) => (
              <div
                key={user.id}
                onClick={() => fetchUserDetails(user.id)}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                style={{
                  animation: `slideInUp 0.3s ease-out ${index * 0.05}s both`
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800">{user.name}</h3>
                        {user.is_admin && (
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail size={12} />
                        <p>{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>

                {/* Stats */}
                <div className="flex gap-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500">Donations</p>
                      <p className="text-sm font-bold text-gray-800">{user.total_donations_count}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Joined</p>
                      <p className="text-sm font-bold text-gray-800">
                        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {searchQuery && filteredUsers.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        )}

      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-gray-800">{selectedUser.name}</h2>
                      {selectedUser.is_admin && (
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-semibold">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-500 hover:text-gray-800 p-2"
                >
                  <X size={24} />
                </button>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-gray-800 mb-3">User Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">User ID</span>
                    <span className="text-sm font-semibold text-gray-800">#{selectedUser.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email</span>
                    <span className="text-sm font-semibold text-gray-800">{selectedUser.email}</span>
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Phone</span>
                      <span className="text-sm font-semibold text-gray-800">{selectedUser.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Donations</span>
                    <span className="text-sm font-semibold text-gray-800">{selectedUser.total_donations_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Donation History */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Donation History ({selectedUser.donations?.length || 0})</h3>
                {selectedUser.donations && selectedUser.donations.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedUser.donations.map((donation) => (
                      <div key={donation.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-700">#{donation.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            donation.status === 'approved' 
                              ? 'bg-green-100 text-green-700'
                              : donation.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {donation.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{donation.location_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(donation.scan_timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <Package size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No donations yet</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay for User Details */}
      {loadingUserDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#417FA2] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user details...</p>
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