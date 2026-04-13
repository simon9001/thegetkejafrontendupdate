// components/dashboard/landlord/LandlordTeamTab.tsx
import React, { useState } from 'react';
import { Users, Phone, Mail, Edit3, UserCog, ShieldCheck, Trash2, Search, Plus, Loader2 } from 'lucide-react';
import { SectionHeader, Badge } from '../shared';
import { useListTeamMembersQuery, useRevokeTeamMemberMutation } from '../../../features/Api/LandlordApi';
import { toast } from 'react-hot-toast';
import AddTeamMemberModal from './AddTeamMemberModal';

const LandlordTeamTab: React.FC = () => {
  const { data, isLoading, refetch } = useListTeamMembersQuery();
  const [revoke] = useRevokeTeamMemberMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRevoke = async (id: string, role: 'agent' | 'caretaker') => {
    if (!window.confirm(`Are you sure you want to revoke access for this ${role}?`)) return;
    try {
      await revoke({ id, role }).unwrap();
      toast.success('Access revoked successfully');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to revoke access');
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="w-8 h-8 text-[#ff385c] animate-spin" />
      <p className="text-sm text-[#6a6a6a]">Loading team members...</p>
    </div>
  );

  const caretakers = data?.caretakers || [];
  const agents = data?.agents || [];

  return (
    <div className="space-y-8 max-w-7xl animate-in fade-in duration-500">
      <SectionHeader
        title="Team & Access"
        sub="Manage partnerships with Agents and assigned Caretakers"
        action={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#ff385c] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-[#e00b41] hover:shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Team Member
          </button>
        }
      />

      {/* Agents Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <ShieldCheck className="w-5 h-5 text-[#ff385c]" />
          <h3 className="font-bold text-[#222222]">Managed by Agents</h3>
          <span className="text-xs font-medium text-[#6a6a6a] bg-gray-100 px-2 py-0.5 rounded-full">{agents.length}</span>
        </div>
        {agents.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <p className="text-sm text-[#6a6a6a]">No agents assigned yet. Partner with an agent to help manage your listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map(agent => (
              <TeamCard key={agent.id} member={agent} onRevoke={() => handleRevoke(agent.id, 'agent')} />
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-gray-100 mx-2" />

      {/* Caretakers Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Users className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-[#222222]">Property Caretakers</h3>
          <span className="text-xs font-medium text-[#6a6a6a] bg-gray-100 px-2 py-0.5 rounded-full">{caretakers.length}</span>
        </div>
        {caretakers.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <p className="text-sm text-[#6a6a6a]">No caretakers assigned. Add a caretaker to handle day-to-day property tasks.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {caretakers.map(ct => (
              <TeamCard key={ct.id} member={ct} onRevoke={() => handleRevoke(ct.id, 'caretaker')} />
            ))}
          </div>
        )}
      </div>

      <AddTeamMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => { setIsModalOpen(false); refetch(); }} 
      />
    </div>
  );
};

const TeamCard: React.FC<{ member: any, onRevoke: () => void }> = ({ member, onRevoke }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#f7f7f7] border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
          {member.avatar_url ? (
            <img src={member.avatar_url} className="w-full h-full object-cover" alt="" />
          ) : (
            <span className="text-[#ff385c] font-bold text-lg">{member.full_name[0]}</span>
          )}
        </div>
        <div>
          <h4 className="font-bold text-[#222222] line-clamp-1">{member.full_name}</h4>
          <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider">{member.role}</p>
        </div>
      </div>
      <button 
        onClick={onRevoke}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        title="Revoke Access"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>

    <div className="space-y-2 mb-5">
      <div className="flex items-center gap-2 text-xs text-[#6a6a6a]">
        <Mail className="w-3.5 h-3.5" />
        <span className="truncate">{member.email}</span>
      </div>
      {member.phone_number && (
        <div className="flex items-center gap-2 text-xs text-[#6a6a6a]">
          <Phone className="w-3.5 h-3.5" />
          <span>{member.phone_number}</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-xs text-[#6a6a6a]">
        <Edit3 className="w-3.5 h-3.5" />
        <span className="truncate">Assigned: {member.property_title || 'Multiple Properties'}</span>
      </div>
    </div>

    {/* Permissions Badges (Agent only) */}
    {member.role === 'agent' && (
      <div className="flex flex-wrap gap-1.5 mb-5">
        {member.can_edit_listing && <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-md font-medium border border-green-100">Editor</span>}
        {member.can_view_analytics && <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-medium border border-blue-100">Analytics</span>}
        {member.can_manage_bookings && <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-medium border border-purple-100">Bookings</span>}
      </div>
    )}

    <div className="flex gap-2">
      <button className="flex-1 px-3 py-2.5 bg-gray-50 rounded-xl text-xs font-bold text-[#222222] hover:bg-gray-100 transition-colors border border-gray-100">Message</button>
      <button className="flex-1 px-3 py-2.5 bg-[#222222] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors">Manage Access</button>
    </div>
  </div>
);

export default LandlordTeamTab;
