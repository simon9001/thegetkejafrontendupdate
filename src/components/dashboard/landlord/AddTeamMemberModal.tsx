// components/dashboard/landlord/AddTeamMemberModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Check, Loader2, Shield, Info } from 'lucide-react';
import { useSearchProfessionalsQuery, useAssignTeamMemberMutation } from '../../../features/Api/LandlordApi';
import { toast } from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddTeamMemberModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<'agent' | 'caretaker'>('agent');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Permissions for agents
  const [permissions, setPermissions] = useState({
    can_edit_listing: true,
    can_view_analytics: true,
    can_manage_bookings: true
  });

  const { data: results, isFetching } = useSearchProfessionalsQuery(
    { query: debouncedSearch, role: selectedRole },
    { skip: debouncedSearch.length < 3 }
  );

  const [assign, { isLoading: isAssigning }] = useAssignTeamMemberMutation();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAssign = async () => {
    if (!selectedUser) return;
    try {
      await assign({
        user_id: selectedUser.id,
        role: selectedRole,
        permissions: selectedRole === 'agent' ? permissions : undefined
      }).unwrap();
      toast.success(`${selectedUser.full_name} added to your team!`);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to assign team member');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white w-full max-w-xl rounded-[28px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#222222]">Add Team Member</h2>
            <p className="text-xs text-[#6a6a6a] mt-0.5">Invite an agent or caretaker to your properties</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-[#222222]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Role Toggle */}
          <div>
            <label className="block text-[11px] font-bold text-[#6a6a6a] uppercase tracking-wider mb-2.5">What are you adding?</label>
            <div className="flex gap-3">
              <button 
                onClick={() => { setSelectedRole('agent'); setSelectedUser(null); }}
                className={`flex-1 py-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all ${selectedRole === 'agent' ? 'border-[#ff385c] bg-[#fff1f3] text-[#ff385c]' : 'border-gray-100 text-[#6a6a6a] hover:border-gray-300'}`}
              >
                 <Shield className="w-4 h-4" /> Real Estate Agent
              </button>
              <button 
                onClick={() => { setSelectedRole('caretaker'); setSelectedUser(null); }}
                className={`flex-1 py-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all ${selectedRole === 'caretaker' ? 'border-[#ff385c] bg-[#fff1f3] text-[#ff385c]' : 'border-gray-100 text-[#6a6a6a] hover:border-gray-300'}`}
              >
                 <UserPlus className="w-4 h-4" /> Caretaker
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-[#6a6a6a] uppercase tracking-wider mb-2.5">Find by Name or Email</label>
            <div className={`relative flex items-center border-2 rounded-2xl transition-all ${selectedUser ? 'border-emerald-500 bg-emerald-50/10' : 'border-gray-100 bg-[#f7f7f7] focus-within:border-[#ff385c] focus-within:bg-white'}`}>
              <Search className={`w-5 h-5 ml-4 ${selectedUser ? 'text-emerald-500' : 'text-[#6a6a6a]'}`} />
              <input 
                type="text" 
                placeholder={selectedRole === 'agent' ? "Search for agents..." : "Search for caretakers..."}
                className="w-full bg-transparent border-none py-4 px-3 text-[#222222] text-sm focus:ring-0 placeholder:text-[#c1c1c1]"
                value={selectedUser ? selectedUser.full_name : searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setSelectedUser(null); }}
                readOnly={!!selectedUser}
              />
              {selectedUser && (
                <button onClick={() => { setSelectedUser(null); setSearchTerm(''); }} className="mr-4 text-xs font-bold text-emerald-600 hover:text-emerald-700">Change</button>
              )}
              {isFetching && <Loader2 className="w-4 h-4 mr-4 animate-spin text-[#ff385c]" />}
            </div>

            {/* Suggestions Dropdown */}
            {debouncedSearch.length >= 3 && !selectedUser && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-20 animate-in slide-in-from-top-2 duration-200">
                {results && results.length > 0 ? (
                  results.map(user => (
                    <button 
                      key={user.id} 
                      onClick={() => { setSelectedUser(user); setDebouncedSearch(''); setSearchTerm(''); }}
                      className="w-full text-left p-4 hover:bg-[#fff1f3] flex items-center gap-3 border-b border-gray-50 last:border-0 group transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover rounded-xl" /> : <span className="text-gray-400 font-bold">{user.full_name[0]}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#222222] text-sm truncate group-hover:text-[#ff385c]">{user.full_name}</p>
                        <p className="text-xs text-[#6a6a6a] truncate">{user.email}</p>
                      </div>
                      <Plus className="w-4 h-4 text-gray-300 group-hover:text-[#ff385c]" />
                    </button>
                  ))
                ) : !isFetching && (
                  <div className="p-8 text-center">
                    <p className="text-sm text-[#6a6a6a]">No verified {selectedRole}s found with that name.</p>
                    <p className="text-[10px] text-[#b0b0b0] mt-1">Make sure they have already upgraded their account.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Agent Permissions */}
          {selectedUser && selectedRole === 'agent' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
              <label className="block text-[11px] font-bold text-[#6a6a6a] uppercase tracking-wider">Grant Permissions</label>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-2 space-y-1">
                {[
                  { id: 'can_edit_listing', label: 'Edit Listings', desc: 'Allow agent to update property details' },
                  { id: 'can_view_analytics', label: 'View Analytics', desc: 'Allow agent to see revenue and visits' },
                  { id: 'can_manage_bookings', label: 'Manage Bookings', desc: 'Allow agent to accept/cancel bookings' }
                ].map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setPermissions(prev => ({ ...prev, [p.id]: !prev[p.id as keyof typeof prev] }))}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200 group"
                  >
                    <div className="text-left">
                      <p className="text-sm font-bold text-[#222222]">{p.label}</p>
                      <p className="text-[10px] text-[#6a6a6a]">{p.desc}</p>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${permissions[p.id as keyof typeof permissions] ? 'bg-[#ff385c]' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 bottom-1 w-3 h-3 bg-white rounded-full transition-all ${permissions[p.id as keyof typeof permissions] ? 'right-1' : 'left-1'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          {!selectedUser && (
             <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3">
               <Info className="w-5 h-5 text-blue-500 shrink-0" />
               <p className="text-xs text-blue-700 leading-relaxed">
                 You can only add users who have verified their professional roles. If you can't find them, ask them to complete the <strong>"Share Your Home"</strong> flow in their account.
               </p>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 border border-gray-200 rounded-2xl font-bold text-sm text-[#222222] hover:bg-white transition-all active:scale-95">Cancel</button>
          <button 
            disabled={!selectedUser || isAssigning}
            onClick={handleAssign}
            className="flex-1 py-3.5 bg-[#ff385c] text-white rounded-2xl font-bold text-sm shadow-sm hover:bg-[#e00b41] hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-[#ff385c] disabled:scale-100"
          >
            {isAssigning ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : `Assign ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTeamMemberModal;
