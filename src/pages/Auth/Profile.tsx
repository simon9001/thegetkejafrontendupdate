import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Shield, MapPin, Camera, Edit2, LogOut, ChevronRight, Home } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { selectCurrentUser, selectIsAuthenticated, clearCredentials } from '../../features/Slice/AuthSlice';
import { useLogoutMutation } from '../../features/Api/AuthApi';

const Profile: React.FC = () => {
  const dispatch        = useDispatch();
  const navigate        = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user            = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
  const [logout] = useLogoutMutation();

  // Shouldn't render if not authenticated, but guard anyway
  if (!isAuthenticated || !user) return null;

  const primaryRole = user.primaryRole ?? user.roles?.[0] ?? 'seeker';

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) await logout({ refreshToken }).unwrap();
    } catch {
      // ignore server errors — always clear locally
    } finally {
      dispatch(clearCredentials());
      navigate('/login');
    }
  };

  const tabs = [
    { id: 'info',     label: 'Personal Info', icon: User   },
    { id: 'security', label: 'Security',       icon: Shield },
  ] as const;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative group mb-4">
                <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-md">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name ?? user.email} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#D4A373]/10 text-[#D4A373]">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-[#D4A373] transition group-hover:scale-110">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-[#1B2430]">{user.full_name ?? user.email}</h2>
              <p className="text-gray-500 text-sm mt-1 capitalize">{primaryRole}</p>

              {/* Role badges — show all roles if user has multiple */}
              {user.roles && user.roles.length > 1 && (
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {user.roles.map((r) => (
                    <span key={r} className="text-[10px] bg-[#D4A373]/10 text-[#8B6E4E] px-2 py-0.5 rounded-full font-medium capitalize">
                      {r}
                    </span>
                  ))}
                </div>
              )}

              <div className="w-full h-px bg-gray-100 my-6" />

              {/* Tab nav */}
              <div className="flex flex-col w-full gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition text-sm font-bold ${
                      activeTab === tab.id
                        ? 'bg-[#1B2430] text-white shadow-lg'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-[#1B2430]'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Account Status</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                    {user.account_status ?? 'Active'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Email Verified</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    user.email_verified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {user.email_verified ? 'Yes' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Auth</span>
                  <span className="text-[#1B2430] font-bold capitalize">{user.auth_provider ?? 'local'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-[#1B2430]">
                  {activeTab === 'info' ? 'Personal Information' : 'Account Security'}
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </div>

              {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                    <div className="flex items-center gap-3 text-gray-800 font-bold p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <User className="w-4 h-4 text-[#D4A373]" />
                      {user.full_name ?? '—'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                    <div className="flex items-center gap-3 text-gray-800 font-bold p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <Mail className="w-4 h-4 text-[#D4A373]" />
                      {user.email}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                    <div className="flex items-center gap-3 text-gray-800 font-bold p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <Phone className="w-4 h-4 text-[#D4A373]" />
                      {user.phone ?? 'Not provided'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">County</label>
                    <div className="flex items-center gap-3 text-gray-800 font-bold p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <MapPin className="w-4 h-4 text-[#D4A373]" />
                      {user.county ?? 'Not set'}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm text-[#D4A373]">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1B2430]">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-500">Add an extra layer of security</p>
                      </div>
                    </div>
                    <button className="text-[#D4A373] text-sm font-bold hover:underline">Enable</button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm text-[#D4A373]">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1B2430]">Change Password</p>
                        <p className="text-xs text-gray-500">Update your account password</p>
                      </div>
                    </div>
                    <button className="text-[#D4A373] text-sm font-bold hover:underline">Update</button>
                  </div>
                </div>
              )}
            </section>

            {/* Become a Host CTA — shown only to seekers without landlord/developer/agent role */}
            {!['landlord', 'developer', 'agent'].some(r => user.roles?.includes(r)) && (
              <div className="bg-gradient-to-br from-[#fff8f0] to-[#fff1e0] rounded-3xl p-8 border border-[#D4A373]/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#D4A373]/10 rounded-2xl text-[#D4A373]">
                    <Home className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#1B2430]">Share your home, earn income</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">
                      List your property on GetKeja and reach thousands of potential tenants and buyers.
                      Submit your details for a quick verification by our team.
                    </p>
                    <Link
                      to="/become-host"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4A373] hover:bg-[#8B6E4E] text-white font-bold rounded-2xl transition-colors text-sm"
                    >
                      <Home className="w-4 h-4" />
                      Become a Host
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Logout */}
            <div className="bg-red-50 rounded-3xl p-8 border border-red-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-red-900">Sign Out</h3>
                <p className="text-red-700/60 text-sm">Hope to see you back soon!</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red-200"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;