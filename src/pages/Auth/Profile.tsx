import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Mail, Phone, Shield, MapPin, Camera, Edit2, LogOut,
  ChevronRight, Home, Save, X, Lock, Eye, EyeOff, Monitor,
  Smartphone, Globe, Bell, BellOff, MessageSquare, Loader2,
  CheckCircle, AlertCircle, Building2, Briefcase, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import {
  selectCurrentUser, selectIsAuthenticated,
  clearCredentials, updateUserProfile,
} from '../../features/Slice/AuthSlice';
import { useLogoutMutation, useChangePasswordMutation, useGetSessionsQuery, useRevokeSessionMutation } from '../../features/Api/AuthApi';
import { useGetMyProfileQuery, useUpdateMyProfileMutation } from '../../features/Api/UsersApi';
import { useUploadPropertyImagesMutation } from '../../features/Api/PropertiesApi';

// ─── Small helpers ────────────────────────────────────────────────────────────

const KENYA_COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa',
  'Homa Bay','Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi',
  'Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos',
  'Makueni','Mandera','Marsabit','Meru','Migori','Mombasa','Murang\'a',
  'Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri','Samburu',
  'Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia','Turkana',
  'Uasin Gishu','Vihiga','Wajir','West Pokot',
];

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700',
  staff:       'bg-orange-100 text-orange-700',
  landlord:    'bg-blue-100 text-blue-700',
  agent:       'bg-purple-100 text-purple-700',
  developer:   'bg-indigo-100 text-indigo-700',
  caretaker:   'bg-teal-100 text-teal-700',
  seeker:      'bg-gray-100 text-gray-600',
};

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-3 text-gray-800 font-medium p-3 bg-gray-50 rounded-2xl border border-gray-100 text-sm min-h-[44px]">
        {value ?? <span className="text-gray-400 italic">Not set</span>}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const Profile: React.FC = () => {
  const dispatch        = useDispatch();
  const navigate        = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const storeUser       = useSelector(selectCurrentUser);

  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'sessions'>('info');
  const [editMode,  setEditMode]  = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Edit form state
  const [form, setForm] = useState({
    full_name:          '',
    display_name:       '',
    county:             '',
    whatsapp_number:    '',
    preferred_language: 'en',
    notif_email:        true,
    notif_sms:          true,
    notif_push:         true,
  });

  // Password change form state
  const [pwForm, setPwForm]   = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw]   = useState({ current: false, next: false, confirm: false });
  const [pwError, setPwError] = useState('');
  const [pwOk,    setPwOk]    = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── API hooks ─────────────────────────────────────────────────────────────
  const { data: profileData, isLoading: profileLoading } = useGetMyProfileQuery();
  const [updateMyProfile, { isLoading: saving }]         = useUpdateMyProfileMutation();
  const [uploadImages]                                    = useUploadPropertyImagesMutation();
  const [changePassword, { isLoading: changingPw }]      = useChangePasswordMutation();
  const [logout]                                         = useLogoutMutation();
  const {
    data: sessionsData, isLoading: sessionsLoading, refetch: refetchSessions,
  } = useGetSessionsQuery(undefined, { skip: activeTab !== 'sessions' });
  const [revokeSession, { isLoading: revoking }] = useRevokeSessionMutation();

  // Live profile (from backend) or fall back to Redux store while loading
  const profile = profileData?.user ?? storeUser;

  // Seed form whenever profile loads or edit mode opens
  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name:          profile.full_name ?? '',
      display_name:       (profile as any).display_name ?? '',
      county:             profile.county ?? '',
      whatsapp_number:    (profile as any).whatsapp_number ?? '',
      preferred_language: (profile as any).preferred_language ?? 'en',
      notif_email:        (profile as any).notification_prefs?.email ?? true,
      notif_sms:          (profile as any).notification_prefs?.sms   ?? true,
      notif_push:         (profile as any).notification_prefs?.push  ?? true,
    });
  }, [profile, editMode]);

  if (!isAuthenticated || !storeUser) return null;

  const primaryRole = storeUser.primaryRole ?? storeUser.roles?.[0] ?? 'seeker';

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) await logout({ refreshToken }).unwrap();
    } catch { /* ignore */ } finally {
      dispatch(clearCredentials());
      navigate('/login');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateMyProfile({
        full_name:          form.full_name      || undefined,
        display_name:       form.display_name   || undefined,
        county:             form.county         || undefined,
        whatsapp_number:    form.whatsapp_number|| undefined,
        preferred_language: form.preferred_language,
        notification_prefs: {
          email: form.notif_email,
          sms:   form.notif_sms,
          push:  form.notif_push,
        },
      }).unwrap();

      // Sync Redux so Navbar / other components reflect the new name instantly
      dispatch(updateUserProfile({
        full_name:       form.full_name       || undefined,
        display_name:    form.display_name    || undefined,
        county:          form.county          || undefined,
        whatsapp_number: form.whatsapp_number || undefined,
      }));

      setEditMode(false);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to save profile');
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const fd = new FormData();
      fd.append('images', file);
      const res = await uploadImages(fd).unwrap();
      const url = res.images?.[0]?.url;
      if (!url) throw new Error('No URL returned');
      await updateMyProfile({ avatar_url: url }).unwrap();
      dispatch(updateUserProfile({ avatar_url: url }));
      toast.success('Avatar updated!');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to upload avatar');
    } finally {
      setAvatarLoading(false);
      e.target.value = '';
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwError('');
    setPwOk(false);
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    try {
      await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next }).unwrap();
      setPwOk(true);
      setPwForm({ current: '', next: '', confirm: '' });
      toast.success('Password changed!');
    } catch (err: any) {
      setPwError(err?.data?.message ?? 'Failed to change password');
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId).unwrap();
      refetchSessions();
      toast.success('Session revoked');
    } catch {
      toast.error('Failed to revoke session');
    }
  };

  const tabs = [
    { id: 'info',     label: 'Personal Info', icon: User    },
    { id: 'security', label: 'Security',       icon: Shield  },
    { id: 'sessions', label: 'Sessions',       icon: Monitor },
  ] as const;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        {profileLoading && (
          <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading profile…</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">

              {/* Avatar */}
              <div className="relative group mb-4">
                <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-md">
                  {(profile as any)?.avatar_url ? (
                    <img
                      src={(profile as any).avatar_url}
                      alt={profile?.full_name ?? profile?.email}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#D4A373]/10 text-[#D4A373]">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                  {avatarLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  disabled={avatarLoading}
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-[#D4A373] transition group-hover:scale-110 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              <h2 className="text-xl font-bold text-[#1B2430]">{profile?.full_name ?? profile?.email}</h2>
              {(profile as any)?.display_name && (
                <p className="text-gray-400 text-xs mt-0.5">@{(profile as any).display_name}</p>
              )}
              <p className="text-gray-500 text-sm mt-1 capitalize">{primaryRole.replace(/_/g, ' ')}</p>

              {/* Role badges */}
              {storeUser.roles && storeUser.roles.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {storeUser.roles.map((r) => (
                    <span key={r} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${ROLE_COLORS[r] ?? 'bg-gray-100 text-gray-600'}`}>
                      {r.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              <div className="w-full h-px bg-gray-100 my-5" />

              {/* Tabs nav */}
              <div className="flex flex-col w-full gap-1.5">
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
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    storeUser.account_status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : storeUser.account_status === 'suspended'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {storeUser.account_status ?? 'Active'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Email verified</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    storeUser.email_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {storeUser.email_verified ? 'Yes' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Auth</span>
                  <span className="text-[#1B2430] font-bold capitalize">{storeUser.auth_provider ?? 'local'}</span>
                </div>
                {(profile as any)?.created_at && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Member since</span>
                    <span className="text-[#1B2430] font-bold">
                      {new Date((profile as any).created_at).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Personal Info tab ── */}
            {activeTab === 'info' && (
              <>
                <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#1B2430]">Personal Information</h3>
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditMode(false)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#1B2430] text-white rounded-xl text-sm font-bold hover:bg-[#2C3A4E] transition disabled:opacity-60"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save
                        </button>
                      </div>
                    )}
                  </div>

                  {editMode ? (
                    /* ── Edit form ── */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                        <input
                          value={form.full_name}
                          onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                          placeholder="Your full name"
                          className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
                        <input
                          value={form.display_name}
                          onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                          placeholder="@username shown publicly"
                          className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">County</label>
                        <select
                          value={form.county}
                          onChange={(e) => setForm((f) => ({ ...f, county: e.target.value }))}
                          className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373] bg-white"
                        >
                          <option value="">-- Select county --</option>
                          {KENYA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">WhatsApp Number</label>
                        <input
                          value={form.whatsapp_number}
                          onChange={(e) => setForm((f) => ({ ...f, whatsapp_number: e.target.value }))}
                          placeholder="+254 7XX XXX XXX"
                          className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Language</label>
                        <select
                          value={form.preferred_language}
                          onChange={(e) => setForm((f) => ({ ...f, preferred_language: e.target.value }))}
                          className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373] bg-white"
                        >
                          <option value="en">English</option>
                          <option value="sw">Kiswahili</option>
                        </select>
                      </div>
                      {/* Notification prefs */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Notifications</label>
                        <div className="flex gap-3 flex-wrap">
                          {[
                            { key: 'notif_email', label: 'Email', icon: <Mail className="w-3.5 h-3.5" /> },
                            { key: 'notif_sms',   label: 'SMS',   icon: <MessageSquare className="w-3.5 h-3.5" /> },
                            { key: 'notif_push',  label: 'Push',  icon: <Bell className="w-3.5 h-3.5" /> },
                          ].map(({ key, label, icon }) => {
                            const checked = form[key as keyof typeof form] as boolean;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                                  checked
                                    ? 'bg-[#1B2430] text-white border-[#1B2430]'
                                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                {checked ? icon : <BellOff className="w-3.5 h-3.5" />}
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── View mode ── */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FieldRow
                        label="Full Name"
                        value={<><User className="w-4 h-4 text-[#D4A373] flex-shrink-0" />{profile?.full_name}</>}
                      />
                      <FieldRow
                        label="Email Address"
                        value={<><Mail className="w-4 h-4 text-[#D4A373] flex-shrink-0" />{profile?.email}</>}
                      />
                      <FieldRow
                        label="Display Name"
                        value={(profile as any)?.display_name ? <>@{(profile as any).display_name}</> : null}
                      />
                      <FieldRow
                        label="Phone Number"
                        value={<><Phone className="w-4 h-4 text-[#D4A373] flex-shrink-0" />{(profile as any)?.phone ?? profile?.phone ?? <span className="text-gray-400 italic">Not provided</span>}</>}
                      />
                      <FieldRow
                        label="WhatsApp"
                        value={(profile as any)?.whatsapp_number
                          ? <><Smartphone className="w-4 h-4 text-[#D4A373] flex-shrink-0" />{(profile as any).whatsapp_number}</>
                          : null}
                      />
                      <FieldRow
                        label="County"
                        value={<><MapPin className="w-4 h-4 text-[#D4A373] flex-shrink-0" />{profile?.county}</>}
                      />
                      <FieldRow
                        label="Language"
                        value={<><Globe className="w-4 h-4 text-[#D4A373] flex-shrink-0" />{(profile as any)?.preferred_language === 'sw' ? 'Kiswahili' : 'English'}</>}
                      />
                      {/* Notification prefs */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Notifications</label>
                        <div className="flex gap-2 flex-wrap mt-1">
                          {[
                            { key: 'email', label: 'Email' },
                            { key: 'sms',   label: 'SMS' },
                            { key: 'push',  label: 'Push' },
                          ].map(({ key, label }) => {
                            const on = (profile as any)?.notification_prefs?.[key] ?? true;
                            return (
                              <span key={key} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${on ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                {on ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                                {label} {on ? 'On' : 'Off'}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Role-specific profile snippets */}
                {(profile as any)?.landlord_profile && (
                  <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="w-5 h-5 text-blue-500" />
                      <h3 className="text-base font-bold text-[#1B2430]">Landlord Profile</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      <div><p className="text-gray-400 text-xs">Company</p><p className="font-semibold">{(profile as any).landlord_profile.company_name ?? '—'}</p></div>
                      <div><p className="text-gray-400 text-xs">Properties</p><p className="font-semibold">{(profile as any).landlord_profile.total_properties ?? 0}</p></div>
                      <div><p className="text-gray-400 text-xs">Rating</p><p className="font-semibold flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400" />{(profile as any).landlord_profile.rating?.toFixed(1) ?? '—'}</p></div>
                      <div><p className="text-gray-400 text-xs">ID Verified</p>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${(profile as any).landlord_profile.id_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {(profile as any).landlord_profile.id_verified ? 'Yes' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </section>
                )}

                {(profile as any)?.agent_profile && (
                  <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase className="w-5 h-5 text-purple-500" />
                      <h3 className="text-base font-bold text-[#1B2430]">Agent Profile</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      <div><p className="text-gray-400 text-xs">Agency</p><p className="font-semibold">{(profile as any).agent_profile.agency_name ?? '—'}</p></div>
                      <div><p className="text-gray-400 text-xs">EARB License</p><p className="font-semibold">{(profile as any).agent_profile.earb_license_no ?? '—'}</p></div>
                      <div><p className="text-gray-400 text-xs">Experience</p><p className="font-semibold">{(profile as any).agent_profile.years_experience ?? 0} yrs</p></div>
                      <div><p className="text-gray-400 text-xs">Listings</p><p className="font-semibold">{(profile as any).agent_profile.total_listings ?? 0}</p></div>
                      <div><p className="text-gray-400 text-xs">Deals Closed</p><p className="font-semibold">{(profile as any).agent_profile.total_closed_deals ?? 0}</p></div>
                      <div><p className="text-gray-400 text-xs">Rating</p><p className="font-semibold flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400" />{(profile as any).agent_profile.rating?.toFixed(1) ?? '—'}</p></div>
                    </div>
                  </section>
                )}

                {/* Become Host CTA */}
                {!['landlord', 'developer', 'agent'].some(r => storeUser.roles?.includes(r)) && (
                  <div className="bg-gradient-to-br from-[#fff8f0] to-[#fff1e0] rounded-3xl p-8 border border-[#D4A373]/20">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#D4A373]/10 rounded-2xl text-[#D4A373]">
                        <Home className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#1B2430]">Share your home, earn income</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-4">
                          List your property on GetKeja and reach thousands of potential tenants and buyers.
                        </p>
                        <Link
                          to="/become-host"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4A373] hover:bg-[#8B6E4E] text-white font-bold rounded-2xl transition-colors text-sm"
                        >
                          <Home className="w-4 h-4" /> Become a Host <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Security tab ── */}
            {activeTab === 'security' && (
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-[#1B2430] mb-6">Account Security</h3>

                {/* Only show password change for local auth */}
                {storeUser.auth_provider !== 'google' ? (
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <h4 className="font-bold text-[#1B2430] flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#D4A373]" /> Change Password
                    </h4>

                    {(['current', 'next', 'confirm'] as const).map((field) => {
                      const labels        = { current: 'Current Password',  next: 'New Password',  confirm: 'Confirm New Password' };
                      const autoCompletes = { current: 'current-password',  next: 'new-password',  confirm: 'new-password' };
                      return (
                        <div key={field} className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{labels[field]}</label>
                          <div className="relative">
                            <input
                              type={showPw[field] ? 'text' : 'password'}
                              value={pwForm[field]}
                              onChange={(e) => setPwForm((f) => ({ ...f, [field]: e.target.value }))}
                              required
                              autoComplete={autoCompletes[field]}
                              placeholder="••••••••"
                              className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPw((s) => ({ ...s, [field]: !s[field] }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {pwError && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {pwError}
                      </div>
                    )}
                    {pwOk && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" /> Password changed successfully!
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={changingPw}
                      className="flex items-center gap-2 px-6 py-3 bg-[#1B2430] text-white font-bold rounded-2xl hover:bg-[#2C3A4E] transition disabled:opacity-60"
                    >
                      {changingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      Update Password
                    </button>
                  </form>
                ) : (
                  <div className="p-4 bg-blue-50 rounded-2xl text-sm text-blue-700 border border-blue-100">
                    You signed in with Google. Password management is handled through your Google account.
                  </div>
                )}
              </section>
            )}

            {/* ── Sessions tab ── */}
            {activeTab === 'sessions' && (
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-[#1B2430] mb-6">Active Sessions</h3>
                {sessionsLoading ? (
                  <div className="flex items-center gap-2 text-gray-400 py-6">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading sessions…
                  </div>
                ) : (sessionsData?.sessions ?? []).length === 0 ? (
                  <p className="text-gray-400 text-sm">No active sessions found.</p>
                ) : (
                  <div className="space-y-3">
                    {(sessionsData?.sessions ?? []).map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-xl shadow-sm text-[#D4A373]">
                            {s.deviceType === 'mobile' ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1B2430] capitalize">{s.deviceType ?? 'Unknown device'}</p>
                            <p className="text-xs text-gray-400">{s.ipAddress ?? 'Unknown IP'} · Started {new Date(s.createdAt).toLocaleDateString()}</p>
                            <p className="text-[10px] text-gray-300 truncate max-w-[220px]">{s.userAgent}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevokeSession(s.id)}
                          disabled={revoking}
                          className="text-xs font-bold text-red-500 hover:text-red-700 transition disabled:opacity-50 px-3 py-1.5 rounded-lg hover:bg-red-50"
                        >
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Logout — always shown */}
            <div className="bg-red-50 rounded-3xl p-8 border border-red-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-red-900">Sign Out</h3>
                <p className="text-red-700/60 text-sm">Hope to see you back soon!</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red-200"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
