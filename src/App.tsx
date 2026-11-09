import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Vote,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  Inbox,
  Users,
  Archive,
  LayoutDashboard,
  X,
  Check,
  ShieldCheck,
  Menu,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { Decision, Comment, TeamMember, Toast, ToastType } from './types';
import { MOCK_DECISIONS } from './mockData';
import { DecisionCard } from './components/DecisionCard';
import { CreationModal } from './components/CreationModal';
import { DecisionDetail } from './components/DecisionDetail';
import { AdminPanel } from './components/AdminPanel';
import { ToastContainer } from './components/ToastContainer';
import { HomePage } from './components/HomePage';
import { getTimeRemaining, CATEGORIES, getCurrentUserName } from './utils';

// Initial dynamic team members list for local storage
const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  { id: 'mem-1', name: 'Sofia', surname: 'Valenti', department: 'Prodotto', email: 'sofia@verdict.it', phone: '+39 02 5550192', role: 'Head of Product', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80', status: 'Attiva' },
  { id: 'mem-2', name: 'Marco', surname: 'Gatti', department: 'Ingegneria', email: 'marco@verdict.it', phone: '+39 02 5550193', role: 'Tech Lead', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80', status: 'In riunione' },
  { id: 'mem-3', name: 'Andrea', surname: 'Leone', department: 'Design', email: 'andrea@verdict.it', phone: '+39 02 5550194', role: 'Senior UX Designer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80', status: 'Attivo' },
  { id: 'mem-4', name: 'Laura', surname: 'Bianchi', department: 'HR', email: 'laura@verdict.it', phone: '+39 02 5550195', role: 'HR Manager', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80', status: 'Fuori ufficio' },
  { id: 'mem-5', name: 'Tu', surname: '(Admin)', department: 'Direzione', email: 'tu@verdict.it', phone: '+39 02 5550196', role: 'Decision Maker', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80', status: 'Disponibile' }
];

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('verdict_dark_mode_v1') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('verdict_dark_mode_v1', String(isDark));
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);
  
  // Main decisions state loaded from LocalStorage
  const [decisions, setDecisions] = useState<Decision[]>(() => {
    try {
      const saved = localStorage.getItem('verdict_decisions_v1');
      return saved ? JSON.parse(saved) : MOCK_DECISIONS;
    } catch (e) {
      return MOCK_DECISIONS;
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('verdict_decisions_v1', JSON.stringify(decisions));
    } catch (e) {
      addToast('Memoria del browser piena: riduci gli allegati.', 'error');
    }
  }, [decisions]);

  // Dynamic Team Members state
  const [members, setMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('verdict_members_v1');
      return saved ? JSON.parse(saved) : INITIAL_TEAM_MEMBERS;
    } catch (e) {
      return INITIAL_TEAM_MEMBERS;
    }
  });

  // Sync members to local storage
  useEffect(() => {
    try {
      localStorage.setItem('verdict_members_v1', JSON.stringify(members));
    } catch (e) {
      addToast('Memoria del browser piena: riduci gli allegati.', 'error');
    }
  }, [members]);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('verdict_auth_v1') === 'true';
  });

  const handleLoginSuccess = (username: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('verdict_auth_v1', 'true');
    localStorage.setItem('adminName', username);
    addToast(`Benvenuto in Verdict, ${username}!`, 'success');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('verdict_auth_v1');
    addToast('Disconnesso con successo.', 'info');
  };

  // Routing / View States
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

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tutte');
  const [statusFilter, setStatusFilter] = useState<'tutti' | 'attivi' | 'chiusura' | 'conclusi'>('tutti');
  const [activeMenuTab, setActiveMenuTab] = useState<'dashboard' | 'archived' | 'admin'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toast state
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

  const notifiedExpired = useRef<Set<string>>(new Set(
    decisions.filter(d => new Date(d.deadline).getTime() < Date.now()).map(d => d.id)
  ));

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      decisions.forEach(d => {
        const deadline = new Date(d.deadline).getTime();
        if (deadline < now && deadline > now - 5000 && !notifiedExpired.current.has(d.id)) {
          notifiedExpired.current.add(d.id);
          addToast(`La decisione "${d.title}" è scaduta!`, 'warning');
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [decisions]);

  // Deep Link Parser
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const decisionId = params.get('decisionId');
    if (decisionId) {
      const exists = decisions.some(d => d.id === decisionId);
      if (exists) {
        setSelectedDecisionId(decisionId);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [decisions]);

  const activeDecision = useMemo(() => {
    return decisions.find(d => d.id === selectedDecisionId) || null;
  }, [decisions, selectedDecisionId]);

  const statsSummary = useMemo(() => {
    const total = decisions.length;
    const activeCount = decisions.filter(d => getTimeRemaining(d.deadline).status !== 'expired').length;
    const totalVotes = decisions.reduce((sum, d) => sum + d.options.reduce((s, o) => s + o.votes, 0), 0);
    return { total, activeCount, totalVotes };
  }, [decisions]);

  const handlePublishDecision = (newDecision: Decision) => {
    setDecisions(prev => [newDecision, ...prev]);
    openDecision(newDecision.id);
    setActiveMenuTab('dashboard');
    addToast('Nuova decisione pubblicata con successo!', 'success');
  };

  const handleAddMember = (newMember: Omit<TeamMember, 'id'>) => {
    const memberWithId: TeamMember = {
      ...newMember,
      id: `mem-${Date.now()}`
    };
    setMembers(prev => [...prev, memberWithId]);
  };

  const handleDeleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleUpdateMemberStatus = (id: string, status: string) => {
    setMembers(prev =>
      prev.map(m => (m.id === id ? { ...m, status } : m))
    );
  };

  const handleDeleteDecision = (id: string) => {
    setDecisions(prev => prev.filter(d => d.id !== id));
    if (selectedDecisionId === id) {
      setSelectedDecisionId(null);
    }
  };

  const handleExtendDecisionDeadline = (id: string, hours: number) => {
    setDecisions(prev =>
      prev.map(d => {
        if (d.id !== id) return d;
        const newDeadlineDate = new Date(Math.max(Date.now(), new Date(d.deadline).getTime()) + hours * 3600000);
        return { ...d, deadline: newDeadlineDate.toISOString() };
      })
    );
    notifiedExpired.current.delete(id);
  };

  const handleExpireDecisionImmediately = (id: string) => {
    setDecisions(prev =>
      prev.map(d => {
        if (d.id !== id) return d;
        const pastDeadline = new Date(Date.now() - 1000);
        return { ...d, deadline: pastDeadline.toISOString() };
      })
    );
  };

  const handleVote = (decisionId: string, optionIds: string[], ratingValue?: number) => {
    setDecisions(prevDecisions =>
      prevDecisions.map(d => {
        if (d.id !== decisionId) return d;
        const alreadyVoted = (d.votedOptionIds && d.votedOptionIds.length > 0) || d.ratingValue !== undefined;
        if (alreadyVoted) return d;

        const updatedOptions = d.options.map(opt => {
          if (optionIds.includes(opt.id)) {
            return { ...opt, votes: opt.votes + 1 };
          }
          if (d.type === 'rating' && ratingValue !== undefined && (d.options.indexOf(opt) + 1) === ratingValue) {
            return { ...opt, votes: opt.votes + 1 };
          }
          return opt;
        });

        const hasJoined = d.participants.some(p => p.name === getCurrentUserName());
        const updatedParticipants = hasJoined
          ? d.participants
          : [
              ...d.participants,
              {
                name: getCurrentUserName(),
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80'
              }
            ];

        return {
          ...d,
          options: updatedOptions,
          votedOptionIds: optionIds,
          ratingValue: ratingValue,
          participants: updatedParticipants
        };
      })
    );
  };

  const handleAddComment = (decisionId: string, text: string) => {
    const newCommentObj: Comment = {
      id: `comment-user-${Date.now()}`,
      author: getCurrentUserName(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80',
      role: 'Decision Maker',
      text: text,
      timestamp: new Date().toISOString()
    };

    setDecisions(prevDecisions =>
      prevDecisions.map(d => {
        if (d.id !== decisionId) return d;
        return {
          ...d,
          comments: [newCommentObj, ...d.comments]
        };
      })
    );
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

  const handleResetDatabase = () => {
    if (confirm('Sei sicuro di voler ripristinare il database di Verdict ai dati iniziali? Le tue decisioni e i membri del team verranno ripristinati.')) {
      localStorage.removeItem('verdict_decisions_v1');
      localStorage.removeItem('verdict_members_v1');
      setDecisions(MOCK_DECISIONS);
      setMembers(INITIAL_TEAM_MEMBERS);
      setSelectedDecisionId(null);
      setActiveMenuTab('dashboard');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <HomePage onLoginSuccess={handleLoginSuccess} isDark={isDark} toggleDarkMode={() => setIsDark(!isDark)} />
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
                  <span className="font-display font-bold text-lg text-gray-950 dark:text-white tracking-tight block">Verdict</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-[-2px] block">Collettivo</span>
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
              <button
                onClick={handleResetDatabase}
                title="Ripristina database originale"
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <nav className={`p-4 space-y-1.5 ${isSidebarOpen ? 'block' : 'hidden md:block'}`}>
            <button
              onClick={() => { setSelectedDecisionId(null); setActiveMenuTab('dashboard'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition cursor-pointer text-left ${
                activeMenuTab === 'dashboard' && !selectedDecisionId
                  ? 'bg-gray-100 dark:bg-gray-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Dashboard
            </button>

            <button
              onClick={() => { setSelectedDecisionId(null); setActiveMenuTab('archived'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition cursor-pointer text-left ${
                activeMenuTab === 'archived' && !selectedDecisionId
                  ? 'bg-gray-100 dark:bg-gray-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              <Archive className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Decisioni Archiviate
            </button>

            <button
              onClick={() => { setSelectedDecisionId(null); setActiveMenuTab('admin'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition cursor-pointer text-left ${
                activeMenuTab === 'admin' && !selectedDecisionId
                  ? 'bg-gray-100 dark:bg-gray-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Pannello Admin
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
            Nuovo Verdict
          </button>

          <div className="flex items-center gap-2.5 px-2">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces&q=80"
              alt="Tu"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-100 block truncate leading-tight">{localStorage.getItem('adminName') || 'Tu (Visitatore)'}</span>
              <span className="text-xs text-gray-400 block truncate font-medium">Decision Maker</span>
            </div>
            <button
              onClick={handleLogout}
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
              <span className="font-display font-bold text-base text-gray-950 dark:text-white tracking-tight">Verdict</span>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Spazio Lavoro</span>
              <span className="text-gray-300 dark:text-gray-700 text-xs">/</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900">Team Alpha</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Sincronizzato locale
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold transition border border-red-200 dark:border-red-900 cursor-pointer"
              title="Esci dalla sessione"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </header>

        <div className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto">
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
                  <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 opacity-5 pointer-events-none">
                    <Vote className="w-64 h-64 text-blue-600" />
                  </div>

                  <div className="max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900">
                      <Sparkles className="w-3.5 h-3.5" />
                      Decidi Insieme, Meglio
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold font-display tracking-tight leading-tight text-gray-950 dark:text-white">
                      Risolvi i bivi decisionali e raccogli pareri con il tuo team.
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-normal leading-relaxed">
                      Crea proposte interattive per scelte singole, multiple, sì/no o valutazioni quantitative. Condividi il link istantaneo e avvia discussioni trasparenti per giungere a un verdetto unanime.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-150 dark:border-gray-800 mt-8 max-w-sm">
                    <div>
                      <span className="text-xl font-black text-gray-900 dark:text-white block leading-tight">{statsSummary.total}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proposte totali</span>
                    </div>
                    <div>
                      <span className="text-xl font-black text-blue-600 block leading-tight">{statsSummary.activeCount}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attive ora</span>
                    </div>
                    <div>
                      <span className="text-xl font-black text-emerald-600 block leading-tight">{statsSummary.totalVotes}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Voti espressi</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4.5 border border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full lg:w-72">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cerca decisioni per titolo..."
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2 pl-9 pr-4 text-base md:text-xs font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-950 focus:border-transparent transition"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 w-full lg:w-auto justify-start lg:justify-center">
                    {['Tutte', ...CATEGORIES].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          activeCategory === cat
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {activeMenuTab !== 'archived' && (
                    <div className="flex items-center gap-1.5 shrink-0 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 w-full lg:w-auto">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 ml-2" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="bg-transparent text-xs font-bold text-gray-600 dark:text-gray-300 focus:outline-none pr-3 cursor-pointer py-1 w-full lg:w-auto"
                      >
                        <option value="tutti">Tutti gli stati</option>
                        <option value="attivi">Attivi</option>
                        <option value="chiusura">In scadenza</option>
                        <option value="conclusi">Conclusi</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-gray-950 dark:text-white font-display tracking-tight flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      {activeMenuTab === 'archived' ? 'Archivio Sondaggi Conclusi' : 'Feed dei Verdetti'}
                    </h2>
                    <span className="text-xs text-gray-400 font-medium">
                      Risultati: {filteredDecisions.length} di {decisions.length}
                    </span>
                  </div>

                  {filteredDecisions.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-16 text-center max-w-md mx-auto space-y-4 shadow-sm">
                      <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mx-auto">
                        <Inbox className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-950 dark:text-white">Nessun Verdict trovato</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 leading-relaxed">
                          Non ci sono decisioni corrispondenti ai parametri inseriti. Prova a reimpostare la ricerca o creane una nuova.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={handleResetFilters}
                          className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                          Azzera filtri
                        </button>
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
                        >
                          Crea Proposta
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredDecisions.map((decision) => (
                        <DecisionCard
                          key={decision.id}
                          decision={decision}
                          onClick={() => openDecision(decision.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-6 px-6 text-center text-gray-400 text-xs font-medium">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Vote className="w-4 h-4 text-blue-600" />
              <span className="font-display font-bold text-gray-700 dark:text-gray-300">Verdict</span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span>Strumento collaborativo per decisioni trasparenti.</span>
            </div>
            <div>
              <span>© {new Date().getFullYear()} Verdict. Tutti i diritti riservati.</span>
            </div>
          </div>
        </footer>
      </main>

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
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-xl relative overflow-hidden flex flex-col z-10 border border-gray-200 dark:border-gray-800"
            >
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-950">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Spazio di lavoro</span>
                  <h2 className="text-lg font-bold text-gray-950 dark:text-white font-display">Membri del Team</h2>
                </div>
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="p-1.5 rounded-full hover:bg-gray-150 dark:hover:bg-gray-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                  Questi sono i membri attivi registrati in questo spazio Verdict. Ricevono notifiche push per ogni nuova proposta pubblicata.
                </p>
                
                <div className="space-y-3 pt-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-9 h-9 rounded-full object-cover border border-white dark:border-gray-900 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-tight">{member.name}</p>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">{member.role}</p>
                        </div>
                      </div>

                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        member.status === 'Attiva' || member.status === 'Attivo' || member.status === 'Disponibile'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                          : member.status === 'In riunione'
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-sm shadow-blue-100 dark:shadow-none"
                >
                  Chiudi
                </button>
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
          <span className="text-xs font-bold">Dashboard</span>
        </button>
        <button
          onClick={() => { setSelectedDecisionId(null); setActiveMenuTab('archived'); }}
          className={`flex flex-col items-center justify-center min-h-14 gap-1 ${activeMenuTab === 'archived' && !selectedDecisionId ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Archive className="w-5 h-5" />
          <span className="text-xs font-bold">Archivio</span>
        </button>
        <div className="flex items-center justify-center -mt-6">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none border-4 border-white dark:border-gray-950"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>
        <button
          onClick={() => { setSelectedDecisionId(null); setActiveMenuTab('admin'); }}
          className={`flex flex-col items-center justify-center min-h-14 gap-1 ${activeMenuTab === 'admin' && !selectedDecisionId ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold">Admin</span>
        </button>
        <button
          onClick={() => setShowTeamModal(true)}
          className="flex flex-col items-center justify-center min-h-14 gap-1 text-gray-400"
        >
          <Users className="w-5 h-5" />
          <span className="text-xs font-bold">Team</span>
        </button>
      </nav>
    </div>
  );
}
