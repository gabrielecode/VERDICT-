import { useState, useEffect, useMemo } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { Decision, Comment, TeamMember } from './types';
import { MOCK_DECISIONS } from './mockData';
import { DecisionCard } from './components/DecisionCard';
import { CreationModal } from './components/CreationModal';
import { DecisionDetail } from './components/DecisionDetail';
import { AdminPanel } from './components/AdminPanel';
import { getTimeRemaining } from './utils';

// Initial dynamic team members list for local storage
const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  { id: 'mem-1', name: 'Sofia Valenti', role: 'Head of Product', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80', status: 'Attiva' },
  { id: 'mem-2', name: 'Marco Gatti', role: 'Tech Lead', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80', status: 'In riunione' },
  { id: 'mem-3', name: 'Andrea Leone', role: 'Senior UX Designer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80', status: 'Attivo' },
  { id: 'mem-4', name: 'Laura Bianchi', role: 'HR Manager', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80', status: 'Fuori ufficio' },
  { id: 'mem-5', name: 'Tu', role: 'Decision Maker', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80', status: 'Disponibile' }
];


export default function App() {
  // Main decisions state loaded from LocalStorage or falling back to beautiful default MOCK_DECISIONS
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
    localStorage.setItem('verdict_decisions_v1', JSON.stringify(decisions));
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
    localStorage.setItem('verdict_members_v1', JSON.stringify(members));
  }, [members]);

  // Routing / View States
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tutte');
  const [statusFilter, setStatusFilter] = useState<'tutti' | 'attivi' | 'chiusura' | 'conclusi'>('tutti');
  const [activeMenuTab, setActiveMenuTab] = useState<'dashboard' | 'archived' | 'admin'>('dashboard');

  // Deep Link Parser: instantly open specific decision if decisionId is present in search queries
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const decisionId = params.get('decisionId');
    if (decisionId) {
      const exists = decisions.some(d => d.id === decisionId);
      if (exists) {
        setSelectedDecisionId(decisionId);
        
        // Clean up URL query parameters so user doesn't get stuck on detail page
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [decisions]);

  // Find currently selected decision
  const activeDecision = useMemo(() => {
    return decisions.find(d => d.id === selectedDecisionId) || null;
  }, [decisions, selectedDecisionId]);

  // Compute stats for summary banners
  const statsSummary = useMemo(() => {
    const total = decisions.length;
    const activeCount = decisions.filter(d => getTimeRemaining(d.deadline).status !== 'expired').length;
    const totalVotes = decisions.reduce((sum, d) => sum + d.options.reduce((s, o) => s + o.votes, 0), 0);
    return { total, activeCount, totalVotes };
  }, [decisions]);

  // Handle publishing a new decision from the wizard modal
  const handlePublishDecision = (newDecision: Decision) => {
    setDecisions(prev => [newDecision, ...prev]);
    // Focus on the newly created decision immediately!
    setSelectedDecisionId(newDecision.id);
    setActiveMenuTab('dashboard');
  };

  // Admin Handlers for Team Members
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

  // Admin Handlers for Decisions (Verdicts)
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
        const currentDeadline = new Date(d.deadline);
        const newDeadline = new Date(currentDeadline.getTime() + 1000 * 60 * 60 * hours);
        return { ...d, deadline: newDeadline.toISOString() };
      })
    );
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

  // Handle voting selection logic
  const handleVote = (decisionId: string, optionIds: string[], ratingValue?: number) => {
    setDecisions(prevDecisions =>
      prevDecisions.map(d => {
        if (d.id !== decisionId) return d;

        // Prevent double voting if they already voted
        const alreadyVoted = (d.votedOptionIds && d.votedOptionIds.length > 0) || d.ratingValue !== undefined;
        if (alreadyVoted) return d;

        const updatedOptions = d.options.map(opt => {
          // Increment option votes
          if (optionIds.includes(opt.id)) {
            return { ...opt, votes: opt.votes + 1 };
          }
          // For ratings
          if (d.type === 'rating' && ratingValue !== undefined && opt.id === String(ratingValue)) {
            return { ...opt, votes: opt.votes + 1 };
          }
          return opt;
        });

        // Add current user to participants list if not already present
        const hasJoined = d.participants.some(p => p.name === 'Tu');
        const updatedParticipants = hasJoined
          ? d.participants
          : [
              ...d.participants,
              {
                name: 'Tu',
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

  // Handle adding a brand new interactive comment
  const handleAddComment = (decisionId: string, text: string) => {
    const newCommentObj: Comment = {
      id: `comment-user-${Date.now()}`,
      author: 'Tu (Visitatore)',
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

  // Filtered decisions list for feed rendering
  const filteredDecisions = useMemo(() => {
    return decisions.filter(d => {
      const matchQuery =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = activeCategory === 'Tutte' || d.category === activeCategory;

      const timeStatus = getTimeRemaining(d.deadline).status;
      let matchStatus = true;

      // Handle Sidebar Tabs override
      if (activeMenuTab === 'archived') {
        matchStatus = timeStatus === 'expired';
      } else {
        // Apply secondary dropdown filter if dashboard selected
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

  // Reset standard filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('Tutte');
    setStatusFilter('tutti');
    setActiveMenuTab('dashboard');
  };

  // Clear mock database and restart defaults
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* LEFT SIDEBAR - Responsive desktop view */}
      <aside className="w-full md:w-68 shrink-0 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-between sticky top-0 md:h-screen z-30">
        <div>
          {/* Brand Logo & Header */}
          <div className="px-6 py-5.5 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setSelectedDecisionId(null); setActiveMenuTab('dashboard'); }}>
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-100">
                <Vote className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-gray-900 tracking-tight block">Verdict</span>
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-[-2px] block">Collettivo</span>
              </div>
            </div>

            {/* Database Reset button directly available in header */}
            <button
              onClick={handleResetDatabase}
              title="Ripristina database originale"
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition cursor-pointer md:hidden"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {/* Dashboard menu tab */}
            <button
              onClick={() => {
                setSelectedDecisionId(null);
                setActiveMenuTab('dashboard');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition cursor-pointer text-left ${
                activeMenuTab === 'dashboard' && !selectedDecisionId
                  ? 'bg-gray-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-gray-500" />
              Dashboard
            </button>

            {/* Expired / Archive menu tab */}
            <button
              onClick={() => {
                setSelectedDecisionId(null);
                setActiveMenuTab('archived');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition cursor-pointer text-left ${
                activeMenuTab === 'archived' && !selectedDecisionId
                  ? 'bg-gray-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Archive className="w-4 h-4 text-gray-500" />
              Decisioni Archiviate
            </button>

            {/* Admin control panel tab */}
            <button
              onClick={() => {
                setSelectedDecisionId(null);
                setActiveMenuTab('admin');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition cursor-pointer text-left ${
                activeMenuTab === 'admin' && !selectedDecisionId
                  ? 'bg-gray-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-gray-500" />
              Pannello Admin
            </button>

            {/* Team Directory trigger */}
            <button
              onClick={() => setShowTeamModal(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight text-gray-600 hover:bg-gray-50 transition cursor-pointer text-left"
            >
              <Users className="w-4 h-4 text-gray-500" />
              Team Directory
            </button>
          </nav>
        </div>

        {/* Create and User Info bottom section */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3.5">
          {/* Action: Create New Decision */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition duration-150 shadow-sm shadow-blue-100 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Nuovo Verdict
          </button>

          {/* User profile capsule */}
          <div className="flex items-center gap-2.5 px-2">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces&q=80"
              alt="Tu"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-gray-800 block truncate leading-tight">Tu (Visitatore)</span>
              <span className="text-[9px] text-gray-400 block truncate font-medium">Decision Maker</span>
            </div>
            {/* Database Reset on desktop */}
            <button
              onClick={handleResetDatabase}
              title="Ripristina dati iniziali"
              className="hidden md:block p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-150 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Workspace info */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 md:relative z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Spazio Lavoro</span>
            <span className="text-gray-300 text-xs">/</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Team Alpha</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct User feedback indicator */}
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Sincronizzato locale
            </span>
          </div>
        </header>

        {/* Page contents container */}
        <div className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto">
          <AnimatePresence mode="wait">
            
            {/* DETAILED DECISION VIEW */}
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
              
              /* DASHBOARD WORKSPACE FEED */
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Hero introduction section - Clean Minimal style */}
                <div className="bg-white border border-gray-200 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 opacity-5 pointer-events-none">
                    <Vote className="w-64 h-64 text-blue-600" />
                  </div>

                  <div className="max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-blue-100">
                      <Sparkles className="w-3.5 h-3.5" />
                      Decidi Insieme, Meglio
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold font-display tracking-tight leading-tight text-gray-950">
                      Risolvi i bivi decisionali e raccogli pareri con il tuo team.
                    </h1>
                    <p className="text-gray-500 text-xs font-normal leading-relaxed">
                      Crea proposte interattive per scelte singole, multiple, sì/no o valutazioni quantitative. Condividi il link istantaneo e avvia discussioni trasparenti per giungere a un verdetto unanime.
                    </p>
                  </div>

                  {/* Summary metrics counts row */}
                  <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-150 mt-8 max-w-sm">
                    <div>
                      <span className="text-xl font-black text-gray-900 block leading-tight">{statsSummary.total}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Proposte totali</span>
                    </div>
                    <div>
                      <span className="text-xl font-black text-blue-600 block leading-tight">{statsSummary.activeCount}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Attive ora</span>
                    </div>
                    <div>
                      <span className="text-xl font-black text-emerald-600 block leading-tight">{statsSummary.totalVotes}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Voti espressi</span>
                    </div>
                  </div>
                </div>

                {/* Filters search and control row */}
                <div className="bg-white rounded-2xl p-4.5 border border-gray-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
                  
                  {/* Search query field */}
                  <div className="relative w-full lg:w-72">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cerca decisioni per titolo..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition"
                    />
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap gap-1.5 w-full lg:w-auto justify-start lg:justify-center">
                    {['Tutte', 'Design', 'Cultura', 'Team', 'Strategia', 'Logistica'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          activeCategory === cat
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Right selector Filter (Status - hidden if activeMenuTab is archived) */}
                  {activeMenuTab !== 'archived' && (
                    <div className="flex items-center gap-1.5 shrink-0 bg-gray-50 p-1 rounded-xl border border-gray-200 w-full lg:w-auto">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 ml-2" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="bg-transparent text-xs font-bold text-gray-600 focus:outline-none pr-3 cursor-pointer py-1 w-full lg:w-auto"
                      >
                        <option value="tutti">Tutti gli stati</option>
                        <option value="attivi">Attivi</option>
                        <option value="chiusura">In scadenza</option>
                        <option value="conclusi">Conclusi</option>
                      </select>
                    </div>
                  )}

                  {activeMenuTab === 'archived' && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                      Filtro Archivio Attivo
                    </span>
                  )}
                </div>

                {/* Grid content feed */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-gray-950 font-display tracking-tight flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      {activeMenuTab === 'archived' ? 'Archivio Sondaggi Conclusi' : 'Feed dei Verdetti'}
                    </h2>
                    <span className="text-xs text-gray-400 font-medium">
                      Risultati: {filteredDecisions.length} di {decisions.length}
                    </span>
                  </div>

                  {filteredDecisions.length === 0 ? (
                    /* Empty Feed state */
                    <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center max-w-md mx-auto space-y-4 shadow-sm">
                      <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto">
                        <Inbox className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-950">Nessun Verdict trovato</h3>
                        <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                          Non ci sono decisioni corrispondenti ai parametri inseriti. Prova a reimpostare la ricerca o creane una nuova.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={handleResetFilters}
                          className="text-xs font-bold text-slate-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl transition cursor-pointer"
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
                    /* Feed Grid view */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredDecisions.map((decision) => (
                        <DecisionCard
                          key={decision.id}
                          decision={decision}
                          onClick={() => setSelectedDecisionId(decision.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Standard footer */}
        <footer className="border-t border-gray-200 bg-white py-6 px-6 text-center text-gray-400 text-xs font-medium">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Vote className="w-4 h-4 text-blue-600" />
              <span className="font-display font-bold text-gray-700">Verdict</span>
              <span className="text-gray-300">|</span>
              <span>Strumento collaborativo per decisioni trasparenti.</span>
            </div>
            <div>
              <span>© {new Date().getFullYear()} Verdict. Tutti i diritti riservati.</span>
            </div>
          </div>
        </footer>
      </main>

      {/* CREATE DECISION MODAL WIZARD */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreationModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onPublish={handlePublishDecision}
          />
        )}
      </AnimatePresence>

      {/* TEAM DIRECTORY MODAL VIEW - Clean Minimalism */}
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
              className="bg-white w-full max-w-md rounded-3xl shadow-xl relative overflow-hidden flex flex-col z-10 border border-gray-200"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Spazio di lavoro</span>
                  <h2 className="text-lg font-bold text-gray-950 font-display">Membri del Team</h2>
                </div>
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="p-1.5 rounded-full hover:bg-gray-150 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Team list */}
              <div className="p-6 space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed font-normal">
                  Questi sono i membri attivi registrati in questo spazio Verdict. Ricevono notifiche push per ogni nuova proposta pubblicata.
                </p>
                
                <div className="space-y-3 pt-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-9 h-9 rounded-full object-cover border border-white shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-800 leading-tight">{member.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium mt-0.5">{member.role}</p>
                        </div>
                      </div>

                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        member.status === 'Attiva' || member.status === 'Attivo' || member.status === 'Disponibile'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : member.status === 'In riunione'
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-sm shadow-blue-100"
                >
                  Chiudi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
