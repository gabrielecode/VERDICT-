import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Vote,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Inbox,
  Users,
  Archive,
  LayoutDashboard,
  Sun,
  Moon,
  LogOut,
  Loader2,
  Menu,
  ShieldCheck,
  X
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  increment,
  arrayUnion,
  getDocs
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Decision, TeamMember, Toast, ToastType, DecisionOption } from './types';
import { DecisionCard } from './components/DecisionCard';
import { CreationModal } from './components/CreationModal';
import { DecisionDetail } from './components/DecisionDetail';
import { AdminPanel } from './components/AdminPanel';
import { ToastContainer } from './components/ToastContainer';
import { HomePage } from './components/HomePage';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModal';
import { getTimeRemaining, CATEGORIES } from './utils';
import { auth, db, signInWithGoogle, logout } from './lib/firebase';

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('easy_decision_dark_mode_v1') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('easy_decision_dark_mode_v1', String(isDark));
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);
  
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDecisions([]);
      setMembers([]);
      setLoading(false);
      return;
    }

    const dQuery = query(collection(db, 'decisions'), orderBy('createdAt', 'desc'));
    const unsubscribeDecisions = onSnapshot(dQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        const userVote = d.votes?.find((v: any) => v.userId === user.uid);
        
        return {
          ...d,
          id: doc.id,
          votedOptionIds: userVote?.optionIds || [],
          ratingValue: userVote?.ratingValue,
          comments: d.comments || [],
        } as Decision;
      });
      setDecisions(data);
      setLoading(false);
    });

    const mQuery = query(collection(db, 'members'), orderBy('name', 'asc'));
    const unsubscribeMembers = onSnapshot(mQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TeamMember));
      setMembers(data);
    });

    return () => {
      unsubscribeDecisions();
      unsubscribeMembers();
    };
  }, [user]);

  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  const openDecision = (id: string) => {
    window.history.pushState({ decisionId: id }, '');
    setSelectedDecisionId(id);
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      setSelectedDecisionId(e.state?.decisionId ?? null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tutte');
  const [statusFilter, setStatusFilter] = useState<'tutti' | 'attivi' | 'chiusura' | 'conclusi'>('tutti');
  const [activeMenuTab, setActiveMenuTab] = useState<'dashboard' | 'archived' | 'admin'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'privacy' | 'cookie' }>({
    isOpen: false,
    type: 'privacy'
  });

  const openLegal = (type: 'privacy' | 'cookie') => {
    setLegalModal({ isOpen: true, type });
  };

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const activeDecision = useMemo(() => {
    return decisions.find(d => d.id === selectedDecisionId) || null;
  }, [decisions, selectedDecisionId]);

  const statsSummary = useMemo(() => {
    const total = decisions.length;
    const activeCount = decisions.filter(d => getTimeRemaining(d.deadline).status !== 'expired').length;
    const totalVotes = decisions.reduce((sum, d) => sum + d.options.reduce((s, o) => s + o.votes, 0), 0);
    return { total, activeCount, totalVotes };
  }, [decisions]);

  const handlePublishDecision = async (newDecision: Omit<Decision, 'id'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'decisions'), {
        ...newDecision,
        creator: {
          uid: user.uid,
          name: user.displayName || 'Utente',
          avatar: user.photoURL || '',
          role: 'Decision Maker'
        },
        createdAt: new Date().toISOString(),
        votes: []
      });
      addToast('Decisione pubblicata!', 'success');
    } catch (e) {
      addToast('Errore nella pubblicazione.', 'error');
    }
  };

  const handleVote = async (decisionId: string, optionIds: string[], ratingValue?: number) => {
    if (!user) return;
    try {
      const dRef = doc(db, 'decisions', decisionId);
      const d = decisions.find(dec => dec.id === decisionId);
      if (!d) return;

      const newVotes = [...(d as any).votes || []];
      const existingVoteIdx = newVotes.findIndex((v: any) => v.userId === user.uid);

      if (existingVoteIdx > -1) {
        addToast('Hai già votato questa proposta.', 'warning');
        return;
      }

      newVotes.push({
        userId: user.uid,
        optionIds,
        ratingValue,
        timestamp: new Date().toISOString()
      });

      const updatedOptions = d.options.map(opt => {
        if (optionIds.includes(opt.id.toString())) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });

      await updateDoc(dRef, {
        votes: newVotes,
        options: updatedOptions
      });

      addToast('Voto registrato!', 'success');
    } catch (e) {
      addToast('Errore nel voto.', 'error');
    }
  };

  const handleAddComment = async (decisionId: string, text: string) => {
    if (!user) return;
    try {
      const dRef = doc(db, 'decisions', decisionId);
      const newComment = {
        id: Date.now().toString(),
        author: user.displayName || 'Utente',
        avatar: user.photoURL || '',
        text,
        timestamp: new Date().toISOString()
      };
      await updateDoc(dRef, {
        comments: arrayUnion(newComment)
      });
    } catch (e) {
      addToast('Errore nel commento.', 'error');
    }
  };

  const handleAddMember = async (newMember: Omit<TeamMember, 'id'>) => {
    try {
      await addDoc(collection(db, 'members'), newMember);
    } catch (e) {
      addToast('Errore aggiunta membro.', 'error');
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'members', id));
    } catch (e) {
      addToast('Errore eliminazione.', 'error');
    }
  };

  const handleUpdateMemberStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'members', id), { status });
    } catch (e) {
      addToast('Errore aggiornamento.', 'error');
    }
  };

  const handleDeleteDecision = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'decisions', id));
      if (selectedDecisionId === id) setSelectedDecisionId(null);
    } catch (e) {
      addToast('Errore eliminazione.', 'error');
    }
  };

  const handleExtendDecisionDeadline = async (id: string, hours: number) => {
    const decision = decisions.find(d => d.id === id);
    if (!decision) return;
    try {
      const newDeadline = new Date(Math.max(Date.now(), new Date(decision.deadline).getTime()) + hours * 3600000).toISOString();
      await updateDoc(doc(db, 'decisions', id), { deadline: newDeadline });
    } catch (e) {
      addToast('Errore proroga.', 'error');
    }
  };

  const handleExpireDecisionImmediately = async (id: string) => {
    try {
      const pastDeadline = new Date(Date.now() - 1000).toISOString();
      await updateDoc(doc(db, 'decisions', id), { deadline: pastDeadline });
    } catch (e) {
      addToast('Errore chiusura.', 'error');
    }
  };

  const filteredDecisions = useMemo(() => {
    return decisions.filter(d => {
      const matchQuery =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = activeCategory === 'Tutte' || d.category === activeCategory;

      const timeStatus = getTimeRemaining(d.deadline).status;
      let matchStatus = true;

      if (activeMenuTab === 'archived') {
        matchStatus = timeStatus === 'expired';
      } else {
        if (statusFilter === 'attivi') {
          matchStatus = timeStatus === 'active';
        } else if (statusFilter === 'chiusura') {
          matchStatus = timeStatus === 'warning';
        } else if (statusFilter === 'conclusi') {
          matchStatus = timeStatus === 'expired';
        }
      }

      return matchQuery && matchCategory && matchStatus;
    });
  }, [decisions, searchQuery, activeCategory, statusFilter, activeMenuTab]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('Tutte');
    setStatusFilter('tutti');
    setActiveMenuTab('dashboard');
  };

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <HomePage onLoginSuccess={signInWithGoogle} isDark={isDark} toggleDarkMode={() => setIsDark(!isDark)} />
      </div>
    );
  }

  return (
    <div className={`min-h-dvh ${isDark ? 'bg-gray-950 text-white dark' : 'bg-gray-50 text-gray-900'} flex flex-col md:flex-row font-sans selection:bg-blue-100 selection:text-blue-900 pb-24 md:pb-0`}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <aside className="hidden md:flex w-full md:w-68 shrink-0 bg-white dark:bg-gray-950 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex-col justify-between md:sticky md:top-0 md:h-screen z-30">
        <div>
          <div className="px-6 py-5.5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <button className="md:hidden p-1.5 -ml-2 text-gray-600" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setSelectedDecisionId(null); setActiveMenuTab('dashboard'); }}>
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-100">
                  <Vote className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="font-display font-bold text-lg text-gray-950 dark:text-white tracking-tight block">easy decision</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-[-2px] block">Cloud</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsDark(!isDark)}
                title={isDark ? 'Passa a Light Mode' : 'Passa a Dark Mode'}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition cursor-pointer"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
              </button>
            </div>
          </div>

          <nav className={`p-4 space-y-1.5 ${isSidebarOpen ? 'block' : 'hidden md:block'}`}>
            <button
              onClick={() => { setSelectedDecisionId(null); setActiveMenuTab('dashboard'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition cursor-pointer text-left ${
                activeMenuTab === 'dashboard' && !selectedDecisionId
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 opacity-70" />
              Dashboard
            </button>

            <button
              onClick={() => { setSelectedDecisionId(null); setActiveMenuTab('archived'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition cursor-pointer text-left ${
                activeMenuTab === 'archived' && !selectedDecisionId
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Archive className="w-4 h-4 opacity-70" />
              Archivio
            </button>

            <button
              onClick={() => { setSelectedDecisionId(null); setActiveMenuTab('admin'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition cursor-pointer text-left ${
                activeMenuTab === 'admin' && !selectedDecisionId
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 opacity-70" />
              Amministrazione
            </button>

            <button
              onClick={() => setShowTeamModal(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer text-left"
            >
              <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Team Directory
            </button>
          </nav>
        </div>

        <div className={`p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 space-y-3.5 ${isSidebarOpen ? 'block' : 'hidden md:block'}`}>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition duration-150 shadow-sm shadow-blue-100 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Nuova Proposta
          </button>

          <div className="flex items-center gap-2.5 px-2">
            <img
              src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces&q=80'}
              alt={user.displayName || 'Tu'}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-100 block truncate leading-tight">{user.displayName || 'Utente'}</span>
              <span className="text-xs text-gray-400 block truncate font-medium">Decision Maker</span>
            </div>
            <button
              onClick={logout}
              title="Esci dalla sessione"
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-gray-800 rounded-lg border border-transparent transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 md:relative z-20">
          <div className="flex items-center gap-2">
            <div className="flex md:hidden items-center gap-2 mr-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                <Vote className="w-4.5 h-4.5 stroke-[2.5]" />
              </div>
              <span className="font-display font-bold text-base text-gray-950 dark:text-white tracking-tight">easy decision</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold transition border border-red-200 dark:border-red-900 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </header>

        <div className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto">
          {loading && decisions.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeDecision ? (
                <motion.div
                  key="detail-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <DecisionDetail
                    decision={activeDecision}
                    onBack={() => setSelectedDecisionId(null)}
                    onVote={handleVote}
                    onAddComment={handleAddComment}
                  />
                </motion.div>
              ) : activeMenuTab === 'admin' ? (
                <motion.div
                  key="admin-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <AdminPanel
                    members={members}
                    onAddMember={handleAddMember}
                    onDeleteMember={handleDeleteMember}
                    onUpdateMemberStatus={handleUpdateMemberStatus}
                    decisions={decisions}
                    onDeleteDecision={handleDeleteDecision}
                    onExtendDeadline={handleExtendDecisionDeadline}
                    onExpireImmediately={handleExpireDecisionImmediately}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="dashboard-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 relative overflow-hidden">
                    <div className="max-w-2xl space-y-6">
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                        Collaborazione Strategica
                      </div>
                      <h1 className="text-3xl lg:text-4xl font-semibold font-display tracking-tight leading-[1.1] text-slate-950 dark:text-white">
                        Prendi decisioni migliori,<br />più velocemente.
                      </h1>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-4.5 border border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full lg:w-72">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cerca decisioni..."
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2 pl-9 pr-4 text-base md:text-xs font-medium text-gray-800 dark:text-gray-100 focus:outline-none transition"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {['Tutte', ...CATEGORIES].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition cursor-pointer ${
                            activeCategory === cat
                              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredDecisions.map((decision) => (
                      <DecisionCard
                        key={decision.id}
                        decision={decision}
                        onClick={() => openDecision(decision.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <Footer 
          isDark={isDark} 
          onViewPrivacy={() => openLegal('privacy')}
          onViewCookies={() => openLegal('cookie')}
        />
      </main>

      <LegalModal 
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })}
        type={legalModal.type}
        isDark={isDark}
      />

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreationModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onPublish={handlePublishDecision}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTeamModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTeamModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-xl relative z-10 border border-gray-200 dark:border-gray-800"
            >
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-950 dark:text-white font-display">Membri del Team</h2>
                <button onClick={() => setShowTeamModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                      {member.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav aria-label="Navigazione" className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => { setSelectedDecisionId(null); setActiveMenuTab('dashboard'); }}
          className={`flex flex-col items-center justify-center min-h-14 gap-1 ${activeMenuTab === 'dashboard' && !selectedDecisionId ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">Dash</span>
        </button>
        <button
          onClick={() => { setSelectedDecisionId(null); setActiveMenuTab('archived'); }}
          className={`flex flex-col items-center justify-center min-h-14 gap-1 ${activeMenuTab === 'archived' && !selectedDecisionId ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Archive className="w-5 h-5" />
          <span className="text-[10px] font-bold">Archive</span>
        </button>
        <div className="flex items-center justify-center -mt-6">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white dark:border-gray-950"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>
        <button
          onClick={() => { setSelectedDecisionId(null); setActiveMenuTab('admin'); }}
          className={`flex flex-col items-center justify-center min-h-14 gap-1 ${activeMenuTab === 'admin' && !selectedDecisionId ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] font-bold">Admin</span>
        </button>
        <button
          onClick={() => setShowTeamModal(true)}
          className="flex flex-col items-center justify-center min-h-14 gap-1 text-gray-400"
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-bold">Team</span>
        </button>
      </nav>
    </div>
  );
}
