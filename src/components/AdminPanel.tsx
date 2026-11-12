import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Briefcase,
  Users,
  Vote,
  X,
  Search,
  BarChart3,
  ListChecks,
  Menu,
  Plus,
  Check
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TeamMember, Decision, AuditLog } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface AdminPanelProps {
  members: TeamMember[];
  onAddMember: (member: Omit<TeamMember, 'id'>) => void;
  onDeleteMember: (id: string) => void;
  onUpdateMemberStatus: (id: string, status: string) => void;
  decisions: Decision[];
  onDeleteDecision: (id: string) => void;
  onExtendDeadline: (id: string, hours: number) => void;
  onExpireImmediately: (id: string) => void;
}

const PRESET_AVATARS = [
  { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80', label: 'Sofia' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80', label: 'Marco' },
  { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80', label: 'Andrea' },
  { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80', label: 'Laura' }
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  members,
  onAddMember,
  onDeleteMember,
  onUpdateMemberStatus,
  decisions,
  onDeleteDecision,
  onExtendDeadline,
  onExpireImmediately
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'decisions' | 'settings' | 'analytics' | 'audit'>('members');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const addAuditLog = (action: string) => {
    const newLog: AuditLog = {
      id: Date.now().toString(),
      action,
      timestamp: new Date().toLocaleString('it-IT'),
      user: adminName || 'Admin'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const [adminName, setAdminName] = useState(localStorage.getItem('adminName') || '');
  const [adminEmail, setAdminEmail] = useState(localStorage.getItem('adminEmail') || '');
  const [companyName, setCompanyName] = useState(localStorage.getItem('companyName') || '');

  const saveSettings = () => {
    localStorage.setItem('adminName', adminName);
    localStorage.setItem('adminEmail', adminEmail);
    localStorage.setItem('companyName', companyName);
    addAuditLog('Aggiornate impostazioni aziendali');
  };

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberSurname, setNewMemberSurname] = useState('');
  const [newMemberDepartment, setNewMemberDepartment] = useState('Prodotto');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Senior Developer');
  const [newMemberStatus, setNewMemberStatus] = useState('Attivo');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(PRESET_AVATARS[0].url);

  const [adminSearch, setAdminSearch] = useState('');
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({ isOpen: true, title, message, onConfirm });
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberSurname.trim()) return;

    onAddMember({
      name: newMemberName.trim(),
      surname: newMemberSurname.trim(),
      department: newMemberDepartment.trim(),
      email: newMemberEmail.trim(),
      phone: '',
      role: newMemberRole,
      avatar: selectedAvatarUrl,
      status: newMemberStatus
    });
    
    addAuditLog(`Creato membro: ${newMemberName} ${newMemberSurname}`);
    setNewMemberName('');
    setNewMemberSurname('');
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(adminSearch.toLowerCase()) || 
    m.role.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const filteredDecisions = decisions.filter(d =>
    d.title.toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-950 dark:text-white">Admin Panel</h1>
          </div>
        </div>

        <div className="hidden md:flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg gap-1">
          {['members', 'decisions', 'analytics', 'audit', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab as any)}
              className={`px-4 py-2 rounded-md text-xs font-bold transition cursor-pointer ${activeSubTab === tab ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {activeSubTab === 'members' && (
          <>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-5 lg:col-span-1">
              <h2 className="text-sm font-bold flex items-center gap-2"><UserPlus className="w-4 h-4" /> Add Member</h2>
              <form onSubmit={handleCreateMember} className="space-y-4">
                <input type="text" required value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Name" className="w-full px-4 py-2 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white text-xs" />
                <input type="text" required value={newMemberSurname} onChange={(e) => setNewMemberSurname(e.target.value)} placeholder="Surname" className="w-full px-4 py-2 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white text-xs" />
                <input type="email" required value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-2 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white text-xs" />
                <button type="submit" className="w-full bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer">Add Member</button>
              </form>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 lg:col-span-2 space-y-4">
              <h2 className="text-sm font-bold">Team Directory ({members.length})</h2>
              <div className="grid grid-cols-1 gap-3">
                {filteredMembers.map(member => (
                  <div key={member.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} className="w-10 h-10 rounded-full object-cover" alt={member.name} />
                      <div>
                        <h4 className="text-xs font-bold dark:text-white">{member.name} {member.surname}</h4>
                        <p className="text-[10px] text-gray-400">{member.role}</p>
                      </div>
                    </div>
                    <button onClick={() => openConfirm('Remove', 'Remove member?', () => onDeleteMember(member.id))} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeSubTab === 'decisions' && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 lg:col-span-3">
            <h2 className="text-sm font-bold">Manage Decisions</h2>
            {filteredDecisions.map(decision => (
              <div key={decision.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold dark:text-white">{decision.title}</span>
                <div className="flex gap-2">
                  <button onClick={() => onDeleteDecision(decision.id)} className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg cursor-pointer">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
      />
    </div>
  );
};
