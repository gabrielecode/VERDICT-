import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Clock,
  Plus,
  Check,
  Briefcase,
  AlertTriangle,
  Users,
  Vote,
  Calendar,
  X,
  Sparkles,
  Search
} from 'lucide-react';
import { TeamMember, Decision } from '../types';

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
  { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80', label: 'Laura' },
  { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80', label: 'Luca' },
  { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&q=80', label: 'Giulia' },
  { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&q=80', label: 'Matteo' },
  { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&q=80', label: 'Francesca' }
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
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'decisions'>('members');
  
  // New Member state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberStatus, setNewMemberStatus] = useState('Attivo');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(PRESET_AVATARS[0].url);
  const [showCustomAvatarField, setShowCustomAvatarField] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Search filter inside admin
  const [adminSearch, setAdminSearch] = useState('');

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberRole.trim()) return;

    const finalAvatar = showCustomAvatarField && customAvatarUrl.trim()
      ? customAvatarUrl.trim()
      : selectedAvatarUrl;

    onAddMember({
      name: newMemberName.trim(),
      role: newMemberRole.trim(),
      avatar: finalAvatar,
      status: newMemberStatus
    });

    // Reset state
    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberStatus('Attivo');
    setCustomAvatarUrl('');
    setShowCustomAvatarField(false);
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
      {/* Title block */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Amministrazione</span>
              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-emerald-100">
                Pannello Controllo
              </span>
            </div>
            <h1 className="text-xl font-bold font-display text-gray-950 mt-0.5">Controllo Backend & Gestione</h1>
          </div>
        </div>

        {/* Action Toggle Tab */}
        <div className="flex bg-gray-100 p-1 rounded-xl self-stretch sm:self-auto">
          <button
            onClick={() => { setActiveSubTab('members'); setAdminSearch(''); }}
            className={`flex-1 sm:flex-none flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'members'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Gestione Team ({members.length})
          </button>
          <button
            onClick={() => { setActiveSubTab('decisions'); setAdminSearch(''); }}
            className={`flex-1 sm:flex-none flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'decisions'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            Gestione Sondaggi ({decisions.length})
          </button>
        </div>
      </div>

      {/* Admin Panel Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* TAB 1: TEAM MEMBERS MANAGEMENT */}
        {activeSubTab === 'members' && (
          <>
            {/* Adding new Member - Left Column Form */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6.5 space-y-5 lg:col-span-1">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-gray-950 font-display">Aggiungi Membro Team</h2>
              </div>

              <form onSubmit={handleCreateMember} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nome e Cognome</label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="es. Sofia Valenti"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-gray-900 placeholder-slate-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ruolo Professionale</label>
                  <input
                    type="text"
                    required
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    placeholder="es. Senior Back-End Dev"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-gray-900 placeholder-slate-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Stato Iniziale</label>
                  <select
                    value={newMemberStatus}
                    onChange={(e) => setNewMemberStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-gray-700 bg-white transition cursor-pointer"
                  >
                    <option value="Attivo">Attivo</option>
                    <option value="Attiva">Attiva</option>
                    <option value="Disponibile">Disponibile</option>
                    <option value="In riunione">In riunione</option>
                    <option value="Fuori ufficio">Fuori ufficio</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                {/* Avatar Picker Preset */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Foto Profilo (Avatar)</label>
                    <button
                      type="button"
                      onClick={() => setShowCustomAvatarField(!showCustomAvatarField)}
                      className="text-[10px] font-bold text-blue-600 hover:underline transition"
                    >
                      {showCustomAvatarField ? 'Scegli da predefiniti' : 'Inserisci URL personalizzato'}
                    </button>
                  </div>

                  {showCustomAvatarField ? (
                    <input
                      type="url"
                      required
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-gray-900 placeholder-slate-400 transition"
                    />
                  ) : (
                    <div className="grid grid-cols-4 gap-2.5 bg-gray-50 p-3 rounded-xl border border-gray-150">
                      {PRESET_AVATARS.map((avatar, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedAvatarUrl(avatar.url)}
                          className={`relative rounded-full aspect-square overflow-hidden border-2 cursor-pointer transition ${
                            selectedAvatarUrl === avatar.url ? 'border-blue-600 scale-105 shadow-sm' : 'border-transparent hover:border-gray-300'
                          }`}
                          title={avatar.label}
                        >
                          <img src={avatar.url} alt={avatar.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          {selectedAvatarUrl === avatar.url && (
                            <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition duration-150 shadow-sm shadow-blue-100 cursor-pointer pt-3"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Crea e Aggiungi Membro
                </button>
              </form>
            </div>

            {/* Members Directory - Right Columns */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6.5 space-y-6 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-950 font-display">Directory e Gestione Membri ({members.length})</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Gestisci i membri dello Spazio Lavoro, aggiorna lo stato o eliminali.</p>
                </div>

                {/* Micro search bar */}
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Filtra membri..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-8 pr-3 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {filteredMembers.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  Nessun membro corrisponde alla ricerca.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col justify-between gap-3 shadow-xs hover:border-gray-300 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                          />
                          <div>
                            <h3 className="text-xs font-bold text-gray-900 leading-tight">{member.name}</h3>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{member.role}</p>
                          </div>
                        </div>

                        {/* Delete member button - Prevent deleting 'Tu' for safety */}
                        {member.name !== 'Tu' ? (
                          <button
                            onClick={() => {
                              if (confirm(`Rimuovere ${member.name} dal team? Non riceverà più notifiche né prenderà parte ai sondaggi.`)) {
                                onDeleteMember(member.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Rimuovi dal team"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[9px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-bold uppercase">
                            Admin (Tu)
                          </span>
                        )}
                      </div>

                      {/* Status and dropdown edit row */}
                      <div className="border-t border-gray-150 pt-3 flex items-center justify-between">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          member.status === 'Attiva' || member.status === 'Attivo' || member.status === 'Disponibile'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : member.status === 'In riunione'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                          {member.status}
                        </span>

                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="text-gray-400 font-medium">Stato:</span>
                          <select
                            value={member.status}
                            onChange={(e) => onUpdateMemberStatus(member.id, e.target.value)}
                            className="bg-white border border-gray-200 rounded-md text-[10px] font-bold text-slate-600 focus:outline-none py-0.5 px-1 cursor-pointer"
                          >
                            <option value="Attivo">Attivo</option>
                            <option value="Attiva">Attiva</option>
                            <option value="Disponibile">Disponibile</option>
                            <option value="In riunione">In riunione</option>
                            <option value="Fuori ufficio">Fuori ufficio</option>
                            <option value="Offline">Offline</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: DECISIONS / VERDICTS DATABASE MANAGEMENT */}
        {activeSubTab === 'decisions' && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6.5 space-y-6 lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-950 font-display">Pannello Controllo Proposte ({decisions.length})</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Controllo delle proposte create nel sistema: estendi date, chiudi anticipatamente o elimina.</p>
              </div>

              {/* Micro search bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Cerca verdict per titolo..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-8 pr-3 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {filteredDecisions.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                Nessuna proposta trovata.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDecisions.map((decision) => {
                  const totalVotes = decision.options.reduce((sum, opt) => sum + opt.votes, 0);
                  const isExpired = new Date(decision.deadline).getTime() < Date.now();
                  
                  return (
                    <div
                      key={decision.id}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-gray-300 transition"
                    >
                      {/* Left: Info details */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            {decision.category}
                          </span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            isExpired
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {isExpired ? 'Concluso' : 'Attivo'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">
                            Tipo: <span className="font-semibold text-gray-600">{decision.type}</span>
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-gray-900 truncate leading-tight">{decision.title}</h3>
                        <p className="text-[10px] text-gray-400">
                          Autore: <span className="font-bold text-gray-600">{decision.creator.name}</span> • Scadenza: <span className="font-mono text-gray-500">{new Date(decision.deadline).toLocaleString('it-IT')}</span>
                        </p>
                      </div>

                      {/* Middle: Vote counts info */}
                      <div className="shrink-0 bg-white border border-gray-150 px-3 py-1.5 rounded-xl text-center">
                        <span className="text-xs font-black text-gray-900 block">{totalVotes}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Voti Totali</span>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 self-stretch md:self-auto justify-end">
                        {/* Extend deadline */}
                        {!isExpired && (
                          <button
                            onClick={() => {
                              onExtendDeadline(decision.id, 24);
                              alert('Scadenza prorogata di 24 ore con successo!');
                            }}
                            className="bg-white hover:bg-gray-100 border border-gray-200 hover:border-gray-300 text-slate-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                            title="Proroga di 24 ore"
                          >
                            <Clock className="w-3 h-3 text-blue-500" />
                            +24 Ore
                          </button>
                        )}

                        {/* Force close early */}
                        {!isExpired && (
                          <button
                            onClick={() => {
                              if (confirm('Sei sicuro di voler chiudere questo sondaggio immediatamente? Sarà contrassegnato come Concluso.')) {
                                onExpireImmediately(decision.id);
                              }
                            }}
                            className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                            title="Chiudi ora"
                          >
                            <Calendar className="w-3 h-3 text-amber-600" />
                            Chiudi Ora
                          </button>
                        )}

                        {/* Delete proposal */}
                        <button
                          onClick={() => {
                            if (confirm('Azioni di controllo: Sei assolutamente sicuro di voler eliminare definitivamente questo Verdict dal database? Questa azione non è reversibile.')) {
                              onDeleteDecision(decision.id);
                            }
                          }}
                          className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Elimina Verdict"
                        >
                          <Trash2 className="w-3 h-3 text-rose-600" />
                          Elimina
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
