import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Phone, Shield, MapPin, Camera, Edit2, LogOut, ChevronRight } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import type { RootState } from '../../store/store';

const Profile: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.authSlice);
    const [activeTab, setActiveTab] = useState<'info' | 'security' | 'activity'>('info');

    if (!user) return null;

    const tabs = [
        { id: 'info', label: 'Personal Info', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden mb-4 border-4 border-white shadow-md relative">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#D4A373]/10 text-[#D4A373]">
                                            <User className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <button className="absolute bottom-4 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-[#D4A373] transition group-hover:scale-110">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <h2 className="text-2xl font-bold text-[#1B2430]">{user.full_name}</h2>
                            <p className="text-gray-500 text-sm mt-1 capitalize">{user.role}</p>

                            <div className="w-full h-px bg-gray-100 my-6" />

                            <div className="flex flex-col w-full gap-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition text-sm font-bold ${activeTab === tab.id
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

                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Account Status</span>
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Active</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Joined</span>
                                    <span className="text-[#1B2430] font-bold">Feb 2026</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
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
                                            <User className="w-4 h-4 text-[#D3A373]" />
                                            {user.full_name}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                                        <div className="flex items-center gap-3 text-gray-800 font-bold p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                            <Mail className="w-4 h-4 text-[#D3A373]" />
                                            {user.email}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                                        <div className="flex items-center gap-3 text-gray-800 font-bold p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                            <Phone className="w-4 h-4 text-[#D3A373]" />
                                            {user.phone || 'Not provided'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Default Location</label>
                                        <div className="flex items-center gap-3 text-gray-800 font-bold p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                            <MapPin className="w-4 h-4 text-[#D3A373]" />
                                            Embu, Kenya
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-xl shadow-sm text-[#D3A373]">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1B2430]">Two-Factor Authentication</p>
                                                <p className="text-xs text-gray-500">Security layer added to your account</p>
                                            </div>
                                        </div>
                                        <button className="text-[#D3A373] text-sm font-bold hover:underline">Enable</button>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-xl shadow-sm text-[#D3A373]">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1B2430]">Change Password</p>
                                                <p className="text-xs text-gray-500">Update your account password</p>
                                            </div>
                                        </div>
                                        <button className="text-[#D3A373] text-sm font-bold hover:underline">Update</button>
                                    </div>
                                </div>
                            )}
                        </section>

                        <div className="bg-red-50 rounded-3xl p-8 border border-red-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-red-900">Sign Out</h3>
                                <p className="text-red-700/60 text-sm">Hope to see you back soon!</p>
                            </div>
                            <button className="px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red-200">
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
