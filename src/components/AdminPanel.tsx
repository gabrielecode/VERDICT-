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
  Key,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { TeamMember, Decision, Organization } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface AdminPanelProps {
  org: Organization | null;
  members: TeamMember[];
  currentUserMember: TeamMember | null;
  onRemoveMember: (uid: string) => void;
  onRegenerateInviteCode: () => void;
  decisions: Decision[];
  onDeleteDecision: (id: string) => void;
  onExtendDeadline: (id: string, hours: number) => void;
  onExpireImmediately: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  org,
  members,
  currentUserMember,
  onRemoveMember,
  onRegenerateInviteCode,
  decisions,
  onDeleteDecision,
  onExtendDeadline,
  onExpireImmediately
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'decisions' | 'settings'>('members');
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({ isOpen: true, title, message, onConfirm });
  };

  const handleCopyCode = () => {
    if (!org?.inviteCode) return;
    navigator.clipboard.writeText(org.inviteCode).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  const isOwner = currentUserMember?.role === 'owner';

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-950 dark:text-white">Gestione Organizzazione</h1>
            <p className="text-xs text-slate-400">{org?.name || 'Organizzazione'}</p>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg gap-1">
          <button
            onClick={() => setActiveSubTab('members')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition cursor-pointer ${activeSubTab === 'members' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
          >
            Membri e Inviti
          </button>
          <button
            onClick={() => setActiveSubTab('decisions')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition cursor-pointer ${activeSubTab === 'decisions' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
          >
            Decisioni ({decisions.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'members' && (
        <div className="space-y-6">
          {isOwner && org && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Codice Invito Organizzazione</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-mono font-bold tracking-widest text-slate-900 dark:text-white">{org.inviteCode}</span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-gray-200 transition cursor-pointer"
                    title="Copia codice"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => openConfirm('Rigenera Codice', 'Vuoi generare un nuovo codice invito? Il vecchio codice non sarà più valido.', onRegenerateInviteCode)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Rigenera Codice
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Membri del Team ({members.length})</h2>
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&q=80'} className="w-10 h-10 rounded-full object-cover" alt={member.name} />
                    <div>
                      <h4 className="text-xs font-bold dark:text-white">{member.name}</h4>
                      <p className="text-[10px] text-gray-400">{member.email} · <span className="uppercase text-blue-600 font-semibold">{member.role}</span></p>
                    </div>
                  </div>
                  {isOwner && member.uid !== currentUserMember?.uid && (
                    <button
                      onClick={() => openConfirm('Rimuovi Membro', `Vuoi rimuovere ${member.name} dall'organizzazione?`, () => onRemoveMember(member.uid))}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                      title="Rimuovi membro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'decisions' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Gestione Decisioni</h2>
          <div className="space-y-3">
            {decisions.map(decision => (
              <div key={decision.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold dark:text-white">{decision.title}</h4>
                  <p className="text-[10px] text-gray-400">{decision.category} · {decision.options.reduce((s, o) => s + o.votes, 0)} voti</p>
                </div>
                <button
                  onClick={() => openConfirm('Elimina Decisione', 'Vuoi eliminare questa decisione?', () => onDeleteDecision(decision.id))}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/30 rounded-lg cursor-pointer"
                >
                  Elimina
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
