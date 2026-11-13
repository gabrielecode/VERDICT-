import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
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
  X,
  Building,
  Key
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  setDoc,
  onSnapshot, 
  query, 
  where,
  orderBy,
  arrayUnion,
  runTransaction,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Decision, TeamMember, Organization, Toast, ToastType, DecisionOption, Vote as VoteData } from './types';
import { DecisionCard } from './components/DecisionCard';
import { ToastContainer } from './components/ToastContainer';
import { HomePage } from './components/HomePage';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModal';
import { getTimeRemaining, CATEGORIES } from './utils';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  signInWithGoogleRedirect, 
  checkRedirectResult, 
  parseAuthError, 
  logout, 
  signInAnon,
  handleFirestoreError, 
  OperationType 
} from './lib/firebase';
import { AuthDomainModal } from './components/AuthDomainModal';

const CreationModal = lazy(() => import('./components/CreationModal').then(m => ({ default: m.CreationModal })));
const DecisionDetail = lazy(() => import('./components/DecisionDetail').then(m => ({ default: m.DecisionDetail })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));

export default function App() {
  const pathname = window.location.pathname;
  const publicMatch = pathname.match(/^\/v\/([a-zA-Z0-9_-]+)$/);
  const publicDecisionId = publicMatch ? publicMatch[1] : null;

  const [publicDecision, setPublicDecision] = useState<Decision | null>(null);
  const [publicLoading, setPublicLoading] = useState(true);
  const [publicVoted, setPublicVoted] = useState(false);
  const [publicSelectedOptions, setPublicSelectedOptions] = useState<string[]>([]);
  const [publicPendingRating, setPublicPendingRating] = useState<number | null>(null);
  const [publicVoterName, setPublicVoterName] = useState('');

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

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('easy_decision_dark_mode_v1') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('easy_decision_dark_mode_v1', String(isDark));
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    if (!publicDecisionId) return;
    if (!auth.currentUser) {
      signInAnon().catch(() => {});
    }
  }, [publicDecisionId]);

  useEffect(() => {
    if (!publicDecisionId) return;
    const unsub = onSnapshot(doc(db, 'decisions', publicDecisionId), (snap) => {
      if (snap.exists()) {
        const item = snap.data();
        setPublicDecision({ ...item, id: snap.id } as Decision);
      }
      setPublicLoading(false);
    }, () => {
      setPublicLoading(false);
    });

    if (auth.currentUser) {
      getDoc(doc(db, 'decisions', publicDecisionId, 'votes', auth.currentUser.uid)).then(snap => {
        if (snap.exists()) {
          setPublicVoted(true);
        }
      }).catch(() => {});
    }

    return () => unsub();
  }, [publicDecisionId]);



  if (publicDecisionId) {
    if (publicLoading) {
      return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950 text-white dark' : 'bg-gray-50 text-gray-900'}`}>
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      );
    }

    if (!publicDecision) {
      return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-gray-950 text-white dark' : 'bg-gray-50 text-gray-900'}`}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4">
            <h1 className="text-xl font-bold">Decisione non trovata</h1>
            <p className="text-xs text-slate-400">La proposta richiesta non esiste o non è accessibile.</p>
            <a href="/" className="inline-block bg-blue-600 text-white text-xs font-bold px-6 py-3 rounded-xl">Torna alla Home</a>
          </div>
        </div>
      );
    }

    const totalVotes = publicDecision.options.reduce((sum, opt) => sum + opt.votes, 0);

    const handlePublicVote = async () => {
      if (!auth.currentUser) return;
      try {
        const dRef = doc(db, 'decisions', publicDecisionId);
        const voteRef = doc(db, 'decisions', publicDecisionId, 'votes', auth.currentUser.uid);

        await runTransaction(db, async (transaction) => {
          const vSnap = await transaction.get(voteRef);
          if (vSnap.exists()) {
            throw new Error('ALREADY_VOTED');
          }

          const dSnap = await transaction.get(dRef);
          if (!dSnap.exists()) {
            throw new Error('Decisione non trovata');
          }

          const data = dSnap.data();
          const currentOptions: DecisionOption[] = data.options || [];

          const newVote: any = {
            userId: auth.currentUser!.uid,
            optionIds: publicSelectedOptions,
            ...(publicPendingRating !== undefined && publicPendingRating !== null ? { ratingValue: publicPendingRating } : {}),
            ...(publicVoterName.trim() ? { voterName: publicVoterName.trim() } : {}),
            timestamp: new Date().toISOString()
          };

          const updatedOptions = currentOptions.map(opt => {
            if (publicSelectedOptions.includes(opt.id.toString())) {
              return { ...opt, votes: (opt.votes || 0) + 1 };
            }
            return opt;
          });

          transaction.set(voteRef, newVote);
          transaction.update(dRef, {
            options: updatedOptions
          });
        });

        setPublicVoted(true);
        addToast('Voto registrato!', 'success');
      } catch (e: any) {
        if (e?.message === 'ALREADY_VOTED') {
          setPublicVoted(true);
          addToast('Hai già votato questa proposta.', 'warning');
          return;
        }
        const msg = handleFirestoreError(e, OperationType.UPDATE, `decisions/${publicDecisionId}`);
        addToast(msg, 'error');
      }
    };

    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white dark' : 'bg-gray-50 text-gray-900'} flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900`}>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { window.location.href = '/'; }}>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Vote className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-display font-bold text-lg text-gray-950 dark:text-white tracking-tight">easy decision</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Accedi per creare le tue decisioni
            </a>
          </div>
        </header>

        <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 space-y-8">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xs space-y-6">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <span>{publicDecision.category}</span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span>Pubblico</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight leading-tight">
              {publicDecision.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {publicDecision.description}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Esprimi il tuo voto</h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  {publicVoted ? 'Voto registrato con successo.' : 'Seleziona un\'opzione:'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{totalVotes} {totalVotes === 1 ? 'Voto' : 'Voti'}</span>
              </div>
            </div>

            {!publicVoted && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Il tuo nome (Opzionale)</label>
                <input
                  type="text"
                  value={publicVoterName}
                  onChange={(e) => setPublicVoterName(e.target.value)}
                  placeholder="es. Mario Rossi"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {publicDecision.options.map((opt, index) => {
                  const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                  const isSelected = publicSelectedOptions.includes(opt.id.toString());
                  const optionLetter = String.fromCharCode(65 + index);

                  return (
                    <div key={opt.id} className="relative">
                      {publicVoted ? (
                        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-5 relative bg-white dark:bg-gray-950">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className="absolute top-0 bottom-0 left-0 bg-blue-600 opacity-[0.04] -z-10" />
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center font-bold text-sm shrink-0">{optionLetter}</div>
                              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{opt.text}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-base font-black text-blue-600">{percentage.toFixed(0)}%</span>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800 rounded-b-2xl">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className="h-full bg-blue-600" />
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (publicDecision.type === 'single') {
                              setPublicSelectedOptions([opt.id.toString()]);
                            } else {
                              const exists = publicSelectedOptions.includes(opt.id.toString());
                              setPublicSelectedOptions(exists ? publicSelectedOptions.filter(id => id !== opt.id.toString()) : [...publicSelectedOptions, opt.id.toString()]);
                            }
                          }}
                          className={`w-full text-left border-2 rounded-2xl p-5 transition flex items-center gap-4 ${isSelected ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{optionLetter}</div>
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex-1">{opt.text}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {!publicVoted && publicSelectedOptions.length > 0 && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handlePublicVote}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md cursor-pointer"
                  >
                    Invia Voto
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer 
          isDark={isDark} 
          onViewPrivacy={() => {}}
          onViewCookies={() => {}}
        />
      </div>
    );
  }

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [authErrorDetails, setAuthErrorDetails] = useState<{ code: string; message: string } | undefined>(undefined);

  const [userOrgId, setUserOrgId] = useState<string | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loadingDecisions, setLoadingDecisions] = useState(true);

  const [orgNameInput, setOrgNameInput] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [onboardingTab, setOnboardingTab] = useState<'create' | 'join'>('create');

  useEffect(() => {
    checkRedirectResult()
      .then((result) => {
        if (result?.user) {
          addToast(`Benvenuto, ${result.user.displayName || 'Utente'}!`, 'success');
        }
      })
      .catch((error) => {
        const parsed = parseAuthError(error);
        if (parsed.isUnauthorizedDomain || parsed.isOperationNotAllowed) {
          setAuthErrorDetails({ code: parsed.code, message: parsed.message });
          setShowDomainModal(true);
        } else if (error?.code !== 'auth/popup-closed-by-user') {
          addToast(parsed.message, 'error');
        }
      });

    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setUserOrgId(null);
        setOrg(null);
        setMembers([]);
        setDecisions([]);
        setOrgLoading(false);
      }
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserOrgId(data.orgId || null);
      } else {
        setUserOrgId(null);
      }
      setOrgLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      setOrgLoading(false);
    });

    return () => unsubscribeUser();
  }, [user]);

  useEffect(() => {
    if (!userOrgId) {
      setOrg(null);
      setMembers([]);
      setDecisions([]);
      setLoadingDecisions(false);
      return;
    }

    const orgRef = doc(db, 'orgs', userOrgId);
    const unsubOrg = onSnapshot(orgRef, (snap) => {
      if (snap.exists()) {
        setOrg({ id: snap.id, ...snap.data() } as Organization);
      }
    });

    const mQuery = collection(db, 'orgs', userOrgId, 'members');
    const unsubMembers = onSnapshot(mQuery, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TeamMember));
      setMembers(data);
    });

    const dQuery = query(collection(db, 'decisions'), where('orgId', '==', userOrgId), orderBy('createdAt', 'desc'));
    const unsubDecisions = onSnapshot(dQuery, (snapshot) => {
      const data = snapshot.docs.map(d => {
        const item = d.data();
        const userVote = item.votes?.find((v: any) => v.userId === user?.uid);
        return {
          ...item,
          id: d.id,
          votedOptionIds: userVote?.optionIds || [],
          ratingValue: userVote?.ratingValue,
          comments: item.comments || []
        } as Decision;
      });
      setDecisions(data);
      setLoadingDecisions(false);
    }, (error) => {
      const msg = handleFirestoreError(error, OperationType.LIST, 'decisions');
      addToast(msg, 'error');
      setLoadingDecisions(false);
    });

    return () => {
      unsubOrg();
      unsubMembers();
      unsubDecisions();
    };
  }, [userOrgId, user]);

  const currentUserMember = useMemo(() => {
    if (!user) return null;
    return members.find(m => m.uid === user.uid) || null;
  }, [members, user]);

  const isOwner = currentUserMember?.role === 'owner';

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !orgNameInput.trim()) return;
    try {
      const orgRef = doc(collection(db, 'orgs'));
      const orgId = orgRef.id;
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      await setDoc(orgRef, {
        name: orgNameInput.trim(),
        ownerUid: user.uid,
        createdAt: new Date().toISOString(),
        inviteCode: inviteCode
      });

      await setDoc(doc(db, 'inviteCodes', inviteCode), {
        orgId: orgId
      });

      await setDoc(doc(db, 'orgs', orgId, 'members', user.uid), {
        uid: user.uid,
        role: 'owner',
        name: user.displayName || 'Owner',
        email: user.email || '',
        joinedAt: new Date().toISOString(),
        avatar: user.photoURL || ''
      });

      await setDoc(doc(db, 'users', user.uid), {
        orgId: orgId
      });

      addToast('Organizzazione creata con successo!', 'success');
    } catch (err) {
      const msg = handleFirestoreError(err, OperationType.WRITE, 'orgs');
      addToast(msg, 'error');
    }
  };

  const handleJoinOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCodeInput.trim()) return;
    try {
      const code = inviteCodeInput.trim().toUpperCase();
      const codeRef = doc(db, 'inviteCodes', code);
      const codeSnap = await getDoc(codeRef);

      if (!codeSnap.exists()) {
        addToast('Codice invito non valido.', 'error');
        return;
      }

      const orgId = codeSnap.data().orgId;

      await setDoc(doc(db, 'orgs', orgId, 'members', user.uid), {
        uid: user.uid,
        role: 'member',
        name: user.displayName || 'Membro',
        email: user.email || '',
        joinedAt: new Date().toISOString(),
        avatar: user.photoURL || ''
      });

      await setDoc(doc(db, 'users', user.uid), {
        orgId: orgId
      });

      addToast('Accesso all\'organizzazione avvenuto con successo!', 'success');
    } catch (err) {
      const msg = handleFirestoreError(err, OperationType.WRITE, 'orgs');
      addToast(msg, 'error');
    }
  };

  const handleRemoveMember = async (memberUid: string) => {
    if (!userOrgId) return;
    try {
      await deleteDoc(doc(db, 'orgs', userOrgId, 'members', memberUid));
      await deleteDoc(doc(db, 'users', memberUid));
      addToast('Membro rimosso.', 'success');
    } catch (err) {
      const msg = handleFirestoreError(err, OperationType.DELETE, 'members');
      addToast(msg, 'error');
    }
  };

  const handleRegenerateInviteCode = async () => {
    if (!org || !userOrgId) return;
    try {
      const oldCode = org.inviteCode;
      const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      if (oldCode) {
        await deleteDoc(doc(db, 'inviteCodes', oldCode));
      }

      await setDoc(doc(db, 'inviteCodes', newCode), {
        orgId: userOrgId
      });

      await updateDoc(doc(db, 'orgs', userOrgId), {
        inviteCode: newCode
      });

      addToast('Codice invito rigenerato!', 'success');
    } catch (err) {
      const msg = handleFirestoreError(err, OperationType.UPDATE, 'orgs');
      addToast(msg, 'error');
    }
  };

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



  const activeDecision = useMemo(() => {
    return decisions.find(d => d.id === selectedDecisionId) || null;
  }, [decisions, selectedDecisionId]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user') {
        return;
      }
      const parsed = parseAuthError(error);
      if (parsed.isUnauthorizedDomain || parsed.isOperationNotAllowed) {
        setAuthErrorDetails({ code: parsed.code, message: parsed.message });
        setShowDomainModal(true);
      } else if (parsed.isPopupBlocked) {
        addToast('Popup bloccato dal browser. Tentativo con Redirect in corso...', 'info');
        try {
          await signInWithGoogleRedirect();
        } catch (redirErr: any) {
          const parsedRedir = parseAuthError(redirErr);
          if (parsedRedir.isUnauthorizedDomain) {
            setAuthErrorDetails({ code: parsedRedir.code, message: parsedRedir.message });
            setShowDomainModal(true);
          } else {
            addToast(parsedRedir.message, 'error');
          }
        }
      } else {
        addToast(parsed.message, 'error');
      }
    }
  };

  const handlePublishDecision = async (newDecision: Omit<Decision, 'id'>) => {
    if (!user || !userOrgId) return;
    try {
      const deadlineDate = new Date(newDecision.deadline);
      await addDoc(collection(db, 'decisions'), {
        ...newDecision,
        orgId: userOrgId,
        creator: {
          uid: user.uid,
          name: user.displayName || 'Utente',
          avatar: user.photoURL || '',
          role: currentUserMember?.role === 'owner' ? 'Owner' : 'Member'
        },
        createdAt: new Date().toISOString(),
        deadlineTs: Timestamp.fromDate(deadlineDate)
      });
      addToast('Decisione pubblicata!', 'success');
    } catch (e) {
      const msg = handleFirestoreError(e, OperationType.CREATE, 'decisions');
      addToast(msg, 'error');
    }
  };

  const handleVote = async (decisionId: string, optionIds: string[], ratingValue?: number) => {
    if (!user) return;
    try {
      const dRef = doc(db, 'decisions', decisionId);
      const voteRef = doc(db, 'decisions', decisionId, 'votes', user.uid);

      await runTransaction(db, async (transaction) => {
        const vSnap = await transaction.get(voteRef);
        if (vSnap.exists()) {
          throw new Error('ALREADY_VOTED');
        }

        const dSnap = await transaction.get(dRef);
        if (!dSnap.exists()) {
          throw new Error('Decisione non trovata');
        }

        const data = dSnap.data();
        const currentOptions: DecisionOption[] = data.options || [];

        const newVote: VoteData = {
          userId: user.uid,
          optionIds,
          ...(ratingValue !== undefined ? { ratingValue } : {}),
          timestamp: new Date().toISOString()
        };

        const updatedOptions = currentOptions.map(opt => {
          if (optionIds.includes(opt.id.toString())) {
            return { ...opt, votes: (opt.votes || 0) + 1 };
          }
          return opt;
        });

        transaction.set(voteRef, newVote);
        transaction.update(dRef, {
          options: updatedOptions
        });
      });

      addToast('Voto registrato!', 'success');
    } catch (e: any) {
      if (e?.message === 'ALREADY_VOTED') {
        addToast('Hai già votato questa proposta.', 'warning');
        return;
      }
      const msg = handleFirestoreError(e, OperationType.UPDATE, `decisions/${decisionId}`);
      addToast(msg, 'error');
    }
  };

  const handleAddComment = async (decisionId: string, text: string) => {
    if (!user) return;
    try {
      const dRef = doc(db, 'decisions', decisionId);
      const newComment = {
        id: Date.now().toString(),
        author: user.displayName || 'Utente',
        uid: user.uid,
        avatar: user.photoURL || '',
        text,
        timestamp: new Date().toISOString()
      };
      await updateDoc(dRef, {
        comments: arrayUnion(newComment)
      });
    } catch (e) {
      const msg = handleFirestoreError(e, OperationType.UPDATE, `decisions/${decisionId}`);
      addToast(msg, 'error');
    }
  };

  const handleDeleteDecision = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'decisions', id));
      if (selectedDecisionId === id) setSelectedDecisionId(null);
      addToast('Decisione eliminata.', 'success');
    } catch (e) {
      const msg = handleFirestoreError(e, OperationType.DELETE, `decisions/${id}`);
      addToast(msg, 'error');
    }
  };

  const handleExtendDecisionDeadline = async (id: string, hours: number) => {
    const decision = decisions.find(d => d.id === id);
    if (!decision) return;
    try {
      const newDeadline = new Date(Math.max(Date.now(), new Date(decision.deadline).getTime()) + hours * 3600000).toISOString();
      await updateDoc(doc(db, 'decisions', id), { deadline: newDeadline });
    } catch (e) {
      const msg = handleFirestoreError(e, OperationType.UPDATE, `decisions/${id}`);
      addToast(msg, 'error');
    }
  };

  const handleExpireDecisionImmediately = async (id: string) => {
    try {
      const pastDeadline = new Date(Date.now() - 1000).toISOString();
      await updateDoc(doc(db, 'decisions', id), { deadline: pastDeadline });
    } catch (e) {
      const msg = handleFirestoreError(e, OperationType.UPDATE, `decisions/${id}`);
      addToast(msg, 'error');
    }
  };

  const filteredDecisions = useMemo(() => {
    return decisions.filter(d => {
      if (d.audience === 'private' && d.creator?.uid !== user?.uid && !isOwner) {
        return false;
      }

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
  }, [decisions, searchQuery, activeCategory, statusFilter, activeMenuTab, user, isOwner]);

  if (authLoading || orgLoading) {
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
        <HomePage onLoginSuccess={handleLogin} isDark={isDark} toggleDarkMode={() => setIsDark(!isDark)} />
        <AuthDomainModal
          isOpen={showDomainModal}
          onClose={() => setShowDomainModal(false)}
          onTryRedirect={() => {
            setShowDomainModal(false);
            signInWithGoogleRedirect().catch((e) => {
              const p = parseAuthError(e);
              addToast(p.message, 'error');
            });
          }}
          errorDetails={authErrorDetails}
        />
      </div>
    );
  }

  if (!userOrgId) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-950 text-white dark' : 'bg-gray-50 text-gray-900'}`}>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Building className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold font-display">Organizzazione</h1>
            <p className="text-xs text-slate-400">Crea una nuova organizzazione o entra con un codice invito.</p>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setOnboardingTab('create')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${onboardingTab === 'create' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              Crea Organizzazione
            </button>
            <button
              onClick={() => setOnboardingTab('join')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${onboardingTab === 'join' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              Codice Invito
            </button>
          </div>

          {onboardingTab === 'create' ? (
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome Organizzazione</label>
                <input
                  type="text"
                  required
                  value={orgNameInput}
                  onChange={(e) => setOrgNameInput(e.target.value)}
                  placeholder="es. Acme Corp"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer shadow-sm"
              >
                Crea Organizzazione
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Codice Invito (8 caratteri)</label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  placeholder="es. A1B2C3D4"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-mono text-center tracking-widest text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer shadow-sm"
              >
                Entra nell'Organizzazione
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <button onClick={logout} className="text-xs font-bold text-red-500 hover:underline cursor-pointer">
              Esci dalla sessione
            </button>
          </div>
        </div>
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
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-[-2px] block">{org?.name || 'Org'}</span>
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
              Team Directory ({members.length})
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
              <span className="text-xs text-blue-600 block truncate font-semibold uppercase">{currentUserMember?.role || 'Member'}</span>
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
          {loadingDecisions && decisions.length === 0 ? (
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
                  <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>}>
                    <DecisionDetail
                      decision={activeDecision}
                      onBack={() => setSelectedDecisionId(null)}
                      onVote={handleVote}
                      onAddComment={handleAddComment}
                    />
                  </Suspense>
                </motion.div>
              ) : activeMenuTab === 'admin' ? (
                <motion.div
                  key="admin-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>}>
                    <AdminPanel
                      org={org}
                      members={members}
                      currentUserMember={currentUserMember}
                      onRemoveMember={handleRemoveMember}
                      onRegenerateInviteCode={handleRegenerateInviteCode}
                      decisions={decisions}
                      onDeleteDecision={handleDeleteDecision}
                      onExtendDeadline={handleExtendDecisionDeadline}
                      onExpireImmediately={handleExpireDecisionImmediately}
                    />
                  </Suspense>
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
                        {org?.name || 'Organizzazione'}
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
          <Suspense fallback={null}>
            <CreationModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onPublish={handlePublishDecision}
            />
          </Suspense>
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
                <h2 className="text-lg font-bold text-gray-950 dark:text-white font-display">Team Directory ({members.length})</h2>
                <button onClick={() => setShowTeamModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&q=80'} alt={member.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{member.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">{member.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                      Attivo
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
      <AuthDomainModal
        isOpen={showDomainModal}
        onClose={() => setShowDomainModal(false)}
        onTryRedirect={() => {
          setShowDomainModal(false);
          signInWithGoogleRedirect().catch((e) => {
            const p = parseAuthError(e);
            addToast(p.message, 'error');
          });
        }}
        errorDetails={authErrorDetails}
      />
    </div>
  );
}
