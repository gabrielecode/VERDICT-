import React, { useEffect, useState } from 'react';
import {
  Vote,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Sun,
  Moon,
  Clock,
  Paperclip,
  Share2,
  BarChart3,
  FileText,
  Mail,
  Loader2,
  Star,
  Check,
  Users,
  Briefcase,
  Building2,
  Lock,
  UserCheck,
  Smartphone,
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  MoreVertical,
  X
} from 'lucide-react';
import { Footer } from './Footer';
import { ConnectCreateSection } from './ConnectCreateSection';
import { ContactSection } from './ContactSection';
import { LegalModal } from './LegalModal';
import { sendEmailLink } from '../lib/firebase';
import { ToastType } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HomePageProps {
  onLoginSuccess: () => void;
  isDark: boolean;
  toggleDarkMode: () => void;
  addToast: (message: string, type: ToastType) => void;
}

type PreviewMode = 'yes_no' | 'single' | 'multiple' | 'rating';
type UseCaseFilter = 'all' | 'team' | 'agency' | 'assoc';

const PREVIEW_DATA: Record<
  PreviewMode,
  {
    label: string;
    shortDesc: string;
    category: string;
    title: string;
    deadline: string;
    attachment: string;
    options: { id: string; text: string; votes: number }[];
  }
> = {
  yes_no: {
    label: 'Sì / No',
    shortDesc: 'Approvazioni immediate e via libera netti su preventivi, bozze o scelte binarie.',
    category: 'Approvazione · Clienti',
    title: 'Approviamo la versione finale del preventivo Q4?',
    deadline: 'Scade tra 18h',
    attachment: 'preventivo-q4-v2.pdf',
    options: [
      { id: 'yn-1', text: 'Sì, approvato', votes: 9 },
      { id: 'yn-2', text: 'No, servono modifiche', votes: 2 }
    ]
  },
  single: {
    label: 'Scelta Singola',
    shortDesc: 'Un solo voto per partecipante per chiudere date, fornitori o tool di team.',
    category: 'Team & Startup',
    title: 'Quale strumento adottiamo per la gestione ticket?',
    deadline: 'Scade tra 2g',
    attachment: 'confronto-costi.xlsx',
    options: [
      { id: 's-1', text: 'Linear Pro', votes: 8 },
      { id: 's-2', text: 'Jira Cloud', votes: 3 },
      { id: 's-3', text: 'Shortcut', votes: 2 }
    ]
  },
  multiple: {
    label: 'Scelta Multipla',
    shortDesc: 'Raccogli più preferenze contemporaneamente per roadmap e priorità di sprint.',
    category: 'Prodotto · Sprint',
    title: 'Quali 2 priorità affrontiamo nel prossimo rilascio?',
    deadline: 'Scade tra 12h',
    attachment: 'roadmap-novembre.pdf',
    options: [
      { id: 'm-1', text: 'Export report PDF automatico', votes: 10 },
      { id: 'm-2', text: 'Notifiche email di scadenza', votes: 7 },
      { id: 'm-3', text: 'Tema scuro dashboard', votes: 5 }
    ]
  },
  rating: {
    label: 'Stelle 1–5',
    shortDesc: 'Misura il grado di consenso su proposte creative, naming o prototipi.',
    category: 'Valutazione · Agenzia',
    title: 'Quanto ti convince la nuova proposta di naming?',
    deadline: 'Scade tra 24h',
    attachment: 'brand-concept-deck.pdf',
    options: []
  }
};

const PARTNERS = [
  { name: 'Pratiko', href: 'https://pratiko.ch/', logo: '/logos/pratiko.webp', padClass: 'p-1', fullBleed: false },
  { name: 'RankUpList', href: 'https://rankuplist.com/', logo: '/logos/rankuplist.png', padClass: 'p-1', fullBleed: false },
  { name: 'SwissLeadFinder', href: 'https://swissleadfinder.ch/it', logo: '/logos/swissleadfinder.png', padClass: 'p-2', fullBleed: false },
  { name: 'KarePet', href: 'https://karepet.app/en/', logo: '/logos/karepet.png', padClass: '', fullBleed: true },
  { name: 'EdilFree', href: 'https://edilfree.vercel.app/', logo: '/logos/edilfree.svg', padClass: '', fullBleed: true },
  { name: 'ReviewDesk', href: 'https://reviewdesk.ai.studio/', logo: '/logos/reviewdesk.jpg', padClass: 'p-1.5', fullBleed: false },
  { name: 'CuraFamily', href: 'https://curafamily.ch/it', logo: '/logos/curafamily.png', padClass: 'p-1', fullBleed: false }
];

const USE_CASES = [
  {
    id: 'team',
    filterKey: 'team' as UseCaseFilter,
    icon: Users,
    kicker: 'Prodotto & Operations · Scelta Multipla',
    title: 'Team & Startup',
    desc: 'Definisci priorità di sprint, scelta fornitori e orari di team in modalità asincrona, arrivando in riunione con la decisione già presa.',
    example: '“Quali 2 integrazioni rilasciamo prima nel Q1?”',
    metric: 'Voto in 10 secondi senza login'
  },
  {
    id: 'agency',
    filterKey: 'agency' as UseCaseFilter,
    icon: Briefcase,
    kicker: 'Approvazioni & Naming · Sì / No',
    title: 'Agenzie & Clienti',
    desc: 'Condividi proposte grafiche, bozze di copy o preventivi con allegati e ottieni il via libera del cliente con un clic, senza fargli creare account.',
    example: '“Approvi il layout homepage v3 allegato?”',
    metric: 'Allegati e commenti in un link'
  },
  {
    id: 'assoc',
    filterKey: 'assoc' as UseCaseFilter,
    icon: Building2,
    kicker: 'Comitati & Volontari · Scelta Singola',
    title: 'Associazioni & Gruppi',
    desc: 'Raccogli voti trasparenti per delibere, budget eventi e date di assemblea, accessibili da qualsiasi smartphone e archiviabili in PDF.',
    example: '“Quale data preferite per l’assemblea annuale?”',
    metric: 'Verbale pronto in PDF / CSV'
  }
];

const SECURITY_SPECS = [
  {
    label: 'Trasporto cifrato',
    value: 'TLS / HTTPS attivo',
    detail: 'Tutte le sessioni e i voti viaggiano su connessioni cifrate.'
  },
  {
    label: 'Integrità del voto',
    value: 'Controllo anti-duplicato',
    detail: 'Prevenzione automatica dei voti doppi per ciascun votante.'
  },
  {
    label: 'Anonimato',
    value: 'Modalità anonima opzionale',
    detail: 'Raccogli preferenze senza esporre i nomi quando serve discrezione.'
  },
  {
    label: 'Tracciabilità',
    value: 'Export PDF & CSV istantanei',
    detail: 'Archivia il verdetto finale e il conteggio completo con un clic.'
  }
];

const FAQS = [
  {
    q: 'Quanto costa Easy Decision?',
    a: "Durante l'Accesso Anticipato Gratuito tutte le funzionalità sono incluse a 0 CHF / 0 EUR: puoi creare proposte di voto, impostare scadenze, allegare contesto ed esportare i risultati in PDF e CSV."
  },
  {
    q: 'Chi vota deve registrarsi o creare un account?',
    a: 'No: chi riceve il link di una votazione può esprimere il proprio voto istantaneamente senza registrarsi e senza installare alcuna app. Solo chi crea e gestisce la dashboard accede con Google o link email.'
  },
  {
    q: 'Come vengono protetti i dati e la privacy?',
    a: 'Easy Decision rispetta la Legge Federale sulla Protezione dei Dati (LPD) svizzera e il GDPR europeo. I dati sono archiviati su infrastruttura cloud protetta con controllo degli accessi e non vengono mai ceduti a terzi.'
  },
  {
    q: 'Posso installare Easy Decision su smartphone come app?',
    a: 'Sì: Easy Decision è una Progressive Web App (PWA) installabile su Android (Chrome, Samsung Internet, Edge) e iPhone/iPad (Safari via Condividi → Aggiungi alla schermata Home) senza passare dagli store.'
  },
  {
    q: 'Quali modalità di voto sono disponibili?',
    a: 'Puoi scegliere tra 4 modalità di voto: Sì / No per decisioni rapide, Scelta Singola, Scelta Multipla per raccogliere più preferenze e Valutazione a Stelle da 1 a 5.'
  }
];

export const HomePage: React.FC<HomePageProps> = ({ onLoginSuccess, isDark, toggleDarkMode, addToast }) => {
  useEffect(() => {
    document.title = 'Easy Decision | Prendi decisioni di team veloci e trasparenti';
  }, []);

  const { isInstallable, isInstalled, install } = usePWAInstall();

  const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
      const win = window as unknown as { dataLayer?: Record<string, unknown>[]; gtag?: (...args: unknown[]) => void };
      if (win.dataLayer) {
        win.dataLayer.push({ event: eventName, ...params });
      }
      if (typeof win.gtag === 'function') {
        win.gtag('event', eventName, params);
      }
      window.dispatchEvent(new CustomEvent('analytics_event', { detail: { eventName, params } }));
    }
  };

  useEffect(() => {
    const trackedDepths = new Set<number>();
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
      [25, 50, 75, 100].forEach((depth) => {
        if (scrollPercent >= depth && !trackedDepths.has(depth)) {
          trackedDepths.add(depth);
          trackEvent('scroll_depth', { depth_percentage: depth });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCtaClick = (location: string) => {
    trackEvent('cta_click', {
      button_text: 'Crea gratis la tua prima votazione',
      location
    });
    onLoginSuccess();
  };

  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'privacy' | 'cookie' }>({
    isOpen: false,
    type: 'privacy'
  });

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const [previewMode, setPreviewMode] = useState<PreviewMode>('yes_no');
  const [previewSelection, setPreviewSelection] = useState<string[]>(['yn-1']);
  const [previewRating, setPreviewRating] = useState<number>(4);
  const [useCaseFilter, setUseCaseFilter] = useState<UseCaseFilter>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [workflowImgError, setWorkflowImgError] = useState(false);
  const [showIOSGuideModal, setShowIOSGuideModal] = useState(false);

  const handlePreviewModeChange = (mode: PreviewMode) => {
    setPreviewMode(mode);
    if (mode === 'yes_no') setPreviewSelection(['yn-1']);
    else if (mode === 'single') setPreviewSelection(['s-1']);
    else if (mode === 'multiple') setPreviewSelection(['m-1', 'm-2']);
  };

  const handleModeCardSelect = (mode: PreviewMode) => {
    handlePreviewModeChange(mode);
    const el = document.getElementById('live-preview');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePreviewOptionToggle = (optionId: string) => {
    if (previewMode === 'multiple') {
      setPreviewSelection((prev) =>
        prev.includes(optionId) ? (prev.length > 1 ? prev.filter((id) => id !== optionId) : prev) : [...prev, optionId]
      );
    } else {
      setPreviewSelection([optionId]);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailInput.trim();
    if (!trimmed) return;
    setEmailLoading(true);
    try {
      await sendEmailLink(trimmed);
      setEmailSent(true);
      addToast('Controlla la tua email per completare l’accesso.', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Errore durante l'invio dell'email.";
      addToast(message, 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleAndroidInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        addToast('Easy Decision installata sul tuo dispositivo!', 'success');
      }
      return;
    }
    const stepsEl = document.getElementById('android-steps');
    if (stepsEl) {
      stepsEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    addToast('Segui i 3 passaggi nella scheda Android dal menu del browser.', 'info');
  };

  const currentPreview = PREVIEW_DATA[previewMode];
  const previewTotalVotes =
    previewMode === 'rating'
      ? 14
      : currentPreview.options.reduce((acc, opt) => acc + opt.votes + (previewSelection.includes(opt.id) ? 1 : 0), 0);

  const filteredUseCases =
    useCaseFilter === 'all' ? USE_CASES : USE_CASES.filter((item) => item.filterKey === useCaseFilter);

  return (
    <div
      className={`min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900 pb-20 md:pb-0 ${
        isDark ? 'bg-[#09090b] text-slate-100' : 'bg-[#F4F6F8] text-slate-900'
      }`}
    >
      {/* Top Bar: Clean 3-zone contract */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b ${
          isDark ? 'bg-[#09090b]/90 border-gray-800' : 'bg-white/90 border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="/"
            className="inline-flex items-center gap-2.5 text-lg font-display font-bold tracking-tight whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
          >
            <span className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Vote className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </span>
            <span>Easy Decision</span>
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav aria-label="Principale" className="hidden md:flex items-center gap-7 text-sm font-medium">
            <a
              href="#come-funziona"
              className={`whitespace-nowrap shrink-0 hover:underline underline-offset-4 transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Come funziona
            </a>
            <a
              href="#modalita"
              className={`whitespace-nowrap shrink-0 hover:underline underline-offset-4 transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Modalità
            </a>
            <a
              href="#sicurezza"
              className={`whitespace-nowrap shrink-0 hover:underline underline-offset-4 transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Sicurezza
            </a>
            <a
              href="#app-mobile"
              className={`whitespace-nowrap shrink-0 hover:underline underline-offset-4 transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              App mobile
            </a>
          </nav>

          {/* Zone 3: Primary action + Theme toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={isDark ? 'Attiva tema chiaro' : 'Attiva tema scuro'}
              className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-md border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isDark
                  ? 'border-gray-800 bg-gray-900 text-amber-400 hover:bg-gray-800'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => handleCtaClick('header')}
              className="px-4 py-2 min-h-[40px] rounded-md bg-slate-950 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Inizia gratis
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section: Aurora-inspired architectural 12-col split on grid canvas */}
        <section
          className={`relative overflow-hidden border-b ${
            isDark ? 'border-gray-800 bg-[#09090b]' : 'border-slate-200 bg-[#E6EAEC]/60'
          }`}
        >
          <div className={`absolute inset-0 pointer-events-none ${isDark ? 'arch-grid-bg-dark opacity-70' : 'arch-grid-bg opacity-80'}`} />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-14 md:py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              {/* Hero Left Column */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-blue-700 dark:text-blue-400">
                  <span>Accesso Anticipato Gratuito</span>
                  <span aria-hidden="true">·</span>
                  <span>0 CHF / 0 EUR</span>
                </div>

                <h1
                  className={`text-[clamp(2.25rem,4.1vw,3.75rem)] font-display font-bold tracking-tight leading-[1.04] [text-wrap:balance] ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  Decidi con il tuo team in 60 secondi, senza riunioni infinite
                </h1>

                <p
                  className={`text-base md:text-lg leading-relaxed max-w-2xl ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Crea una proposta con opzioni, allegati e scadenza e invia un semplice link:{' '}
                  <strong className={isDark ? 'text-white font-semibold' : 'text-slate-950 font-semibold'}>
                    chi vota non deve registrarsi
                  </strong>
                  . Raccogli voti in tempo reale ed esporta i risultati in PDF o CSV.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCtaClick('hero')}
                    className="px-6 py-3.5 min-h-[48px] rounded-md bg-slate-950 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-sm md:text-base transition-colors cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    <span>Crea la tua prima votazione gratis</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEmailForm((prev) => !prev)}
                    className={`px-5 py-3.5 min-h-[48px] rounded-md border text-sm font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      isDark
                        ? 'border-gray-700 bg-gray-900 text-slate-200 hover:bg-gray-800'
                        : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Mail className="w-4 h-4" aria-hidden="true" />
                    <span>Accedi via email</span>
                  </button>
                </div>

                {showEmailForm && (
                  <div
                    className={`p-4 rounded-md border max-w-md ${
                      isDark ? 'border-gray-800 bg-gray-900' : 'border-slate-200 bg-white'
                    }`}
                  >
                    {emailSent ? (
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Link inviato: controlla la tua email per accedere alla dashboard.
                      </p>
                    ) : (
                      <form onSubmit={handleEmailLogin} className="flex flex-col sm:flex-row gap-2">
                        <label htmlFor="hero-email-login" className="sr-only">
                          Indirizzo email aziendale
                        </label>
                        <input
                          id="hero-email-login"
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="nome@azienda.it"
                          className={`flex-1 min-h-[44px] px-3.5 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                            isDark
                              ? 'border-gray-700 bg-gray-950 text-white placeholder:text-slate-500'
                              : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400'
                          }`}
                        />
                        <button
                          type="submit"
                          disabled={emailLoading}
                          className="px-4 py-2 min-h-[44px] rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                        >
                          {emailLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                          <span>Invia link</span>
                        </button>
                      </form>
                    )}
                  </div>
                )}

                <div
                  className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono pt-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  <span>Zero registrazione per i votanti</span>
                  <span aria-hidden="true">·</span>
                  <span>Risultati in tempo reale</span>
                  <span aria-hidden="true">·</span>
                  <span>LPD Svizzera &amp; GDPR</span>
                </div>
              </div>

              {/* Hero Right Column: Architectural Summary & Interactive Vote Preview */}
              <div id="live-preview" className="lg:col-span-5 flex flex-col">
                <div
                  className={`h-full border p-5 md:p-6 flex flex-col justify-between space-y-5 ${
                    isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-gray-800">
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Anteprima interattiva · Prova un voto
                      </span>
                      <span className={`text-xs font-mono tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {currentPreview.deadline}
                      </span>
                    </div>

                    {/* Interactive mode selector */}
                    <div
                      role="tablist"
                      aria-label="Modalità di voto"
                      className={`grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-md border ${
                        isDark ? 'bg-gray-900 border-gray-800' : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      {(['yes_no', 'single', 'multiple', 'rating'] as PreviewMode[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          role="tab"
                          aria-selected={previewMode === mode}
                          onClick={() => handlePreviewModeChange(mode)}
                          className={`px-2 py-2 min-h-[36px] text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap truncate ${
                            previewMode === mode
                              ? 'bg-blue-600 text-white'
                              : isDark
                                ? 'text-slate-300 hover:bg-gray-800'
                                : 'text-slate-600 hover:bg-white'
                          }`}
                        >
                          {PREVIEW_DATA[mode].label}
                        </button>
                      ))}
                    </div>

                    {/* Preview proposal block */}
                    <div className="space-y-4 pt-1">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>{currentPreview.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 truncate">
                            <Paperclip className="w-3 h-3 shrink-0" aria-hidden="true" />
                            <span className="truncate">{currentPreview.attachment}</span>
                          </span>
                        </div>
                        <h2
                          className={`text-lg font-display font-bold leading-snug ${
                            isDark ? 'text-white' : 'text-slate-950'
                          }`}
                        >
                          {currentPreview.title}
                        </h2>
                      </div>

                      {previewMode === 'rating' ? (
                        <div className="space-y-3 py-2">
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setPreviewRating(star)}
                                aria-label={`Valuta ${star} stelle su 5`}
                                className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                              >
                                <Star
                                  className={`w-7 h-7 ${
                                    star <= previewRating
                                      ? 'fill-amber-400 text-amber-400'
                                      : isDark
                                        ? 'text-gray-700'
                                        : 'text-slate-200'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="ml-auto text-sm font-mono font-bold tabular-nums text-amber-500">
                              {((4.3 * 13 + previewRating) / 14).toFixed(1)} / 5
                            </span>
                          </div>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Il tuo voto di prova: {previewRating} {previewRating === 1 ? 'stella' : 'stelle'} su 5
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {currentPreview.options.map((opt) => {
                            const isSelected = previewSelection.includes(opt.id);
                            const count = opt.votes + (isSelected ? 1 : 0);
                            const pct = previewTotalVotes > 0 ? Math.round((count / previewTotalVotes) * 100) : 0;

                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handlePreviewOptionToggle(opt.id)}
                                className={`w-full text-left p-3 min-h-[48px] rounded-md border transition-colors cursor-pointer space-y-2 ${
                                  isSelected
                                    ? isDark
                                      ? 'border-blue-500 bg-blue-950/30'
                                      : 'border-blue-600 bg-blue-50/50'
                                    : isDark
                                      ? 'border-gray-800 hover:border-gray-700'
                                      : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                                  <span className="flex items-center gap-2 min-w-0">
                                    <span
                                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                        isSelected
                                          ? 'bg-blue-600 border-blue-600 text-white'
                                          : isDark
                                            ? 'border-gray-700'
                                            : 'border-slate-300'
                                      }`}
                                    >
                                      {isSelected && <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />}
                                    </span>
                                    <span className="truncate">{opt.text}</span>
                                  </span>
                                  <span className="font-mono tabular-nums shrink-0">{pct}%</span>
                                </div>
                                <div
                                  className={`h-1.5 w-full rounded-full overflow-hidden ${
                                    isDark ? 'bg-gray-800' : 'bg-slate-100'
                                  }`}
                                >
                                  <div
                                    className="h-full bg-blue-600 transition-all duration-200"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Aurora-inspired Swiss trust & status strip */}
                  <div
                    className={`pt-4 border-t flex items-center justify-between gap-4 text-xs ${
                      isDark ? 'border-gray-800 text-slate-400' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="font-mono tabular-nums">{previewTotalVotes} voti · Aperto senza login</span>
                    <span className="inline-flex items-center gap-2 font-mono text-xs shrink-0">
                      <span className="w-4 h-4 bg-[#E0262C] flex items-center justify-center shrink-0" aria-hidden="true">
                        <span className="relative block w-2.5 h-2.5">
                          <span className="absolute left-[4px] top-0 w-[2px] h-2.5 bg-white" />
                          <span className="absolute top-[4px] left-0 h-[2px] w-2.5 bg-white" />
                        </span>
                      </span>
                      <span>LPD &amp; GDPR</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statement / Value Proposition Band (Aurora wa section) */}
        <section
          className={`border-b ${
            isDark ? 'border-gray-800 bg-gray-950' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-20">
            <div className="max-w-4xl space-y-4">
              <p className="text-xs font-mono text-blue-600 dark:text-blue-400">
                Tutto in una sola piattaforma
              </p>
              <h2
                className={`font-display text-2xl sm:text-4xl font-bold leading-tight tracking-tight [text-wrap:balance] ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                Quello che oggi richiede decine di messaggi sparsi e riunioni infinite,{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  noi lo chiudiamo in una sola votazione chiavi in mano.
                </span>
              </h2>
            </div>
          </div>
        </section>

        {/* Social proof / Partner strip */}
        <section
          aria-label="Organizzazioni che usano Easy Decision"
          className={`border-b py-9 ${isDark ? 'border-gray-800 bg-gray-900/40' : 'border-slate-200 bg-[#F4F6F8]'}`}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <p
              className={`text-xs font-medium text-center mb-6 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Scelto da team, agenzie e associazioni tra Svizzera e Italia
            </p>
            <div className="logo-carousel-wrapper relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <div className="animate-logo-carousel items-center py-1">
                {[0, 1].map((copyIdx) =>
                  PARTNERS.map((partner) => (
                    <a
                      key={`${copyIdx}-${partner.href}`}
                      href={partner.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-hidden={copyIdx === 1 ? true : undefined}
                      tabIndex={copyIdx === 1 ? -1 : undefined}
                      className={`${
                        copyIdx === 1 ? 'logo-carousel-duplicate ' : ''
                      }group inline-flex items-center gap-2.5 shrink-0 mr-10 md:mr-14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md py-1`}
                    >
                      <span
                        className={`w-9 h-9 rounded-md overflow-hidden shrink-0 flex items-center justify-center ${
                          partner.fullBleed
                            ? ''
                            : `bg-white border border-slate-200 dark:border-slate-700 ${partner.padClass}`
                        }`}
                      >
                        <img
                          src={partner.logo}
                          alt={copyIdx === 1 ? '' : `${partner.name} logo`}
                          referrerPolicy="no-referrer"
                          className={`w-full h-full ${partner.fullBleed ? 'object-cover' : 'object-contain'}`}
                        />
                      </span>
                      <span
                        className={`text-sm font-display font-bold tracking-tight whitespace-nowrap transition-colors ${
                          isDark ? 'text-slate-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-950'
                        }`}
                      >
                        {partner.name}
                      </span>
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Come funziona: 1px-ruled architectural grid + workflow visual (Aurora vn style) */}
        <section id="come-funziona" className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-10">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-mono text-blue-600 dark:text-blue-400">Flusso operativo</p>
              <h2
                className={`text-2xl md:text-4xl font-display font-bold tracking-tight [text-wrap:balance] ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                Dalla proposta al verdetto in 3 passaggi
              </h2>
              <p className={`text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Nessun onboarding complesso: prepari i dettagli, invii un link e segui i voti aggiornarsi in diretta.
              </p>
              <p className={`text-xs font-mono pt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Proposta con allegati · Voto senza account · Verbale PDF e CSV
              </p>
            </div>

            <div className="lg:col-span-7">
              <div
                className={`aspect-[16/9] overflow-hidden border ${
                  isDark ? 'border-gray-800 bg-gray-900' : 'border-slate-200 bg-[#ece9e2]'
                }`}
              >
                {!workflowImgError ? (
                  <img
                    src="/assets/aistudio/SaaS_UI_decision_dashboard_illus__5c103c16_7f8bf637.jpg"
                    alt="Flusso decisionale Easy Decision: dalla proposta al voto, alla discussione e approvazione fino ai risultati in tempo reale"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={() => setWorkflowImgError(true)}
                    className="w-full h-full object-cover object-right dark:brightness-95"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 ${
                      isDark ? 'bg-gray-900 text-slate-300' : 'bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-4 text-blue-600 dark:text-blue-400">
                      <FileText className="w-7 h-7" aria-hidden="true" />
                      <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      <Share2 className="w-7 h-7" aria-hidden="true" />
                      <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      <BarChart3 className="w-7 h-7" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-display font-bold">
                      Proposta → Voto &amp; Discussione → Risultati live
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <ul
            className={`grid grid-cols-1 md:grid-cols-3 gap-px border ${
              isDark ? 'bg-gray-800 border-gray-800' : 'bg-slate-200 border-slate-200'
            }`}
          >
            {[
              {
                num: '01.',
                title: 'Crea la proposta',
                desc: 'Imposta titolo, descrizione, eventuali allegati di riferimento e data di scadenza. Scegli tra Sì/No, scelta singola, multipla o stelle 1–5.',
                icon: FileText
              },
              {
                num: '02.',
                title: 'Condividi il link',
                desc: 'Copia il link diretto e invialo su WhatsApp, Slack, Microsoft Teams o email. Chi vota apre la pagina e sceglie subito, senza creare un account.',
                icon: Share2
              },
              {
                num: '03.',
                title: 'Risultato in tempo reale',
                desc: 'Segui i voti e i commenti aggiornarsi istantaneamente. A chiusura, archivia il verdetto ed esporta il verbale in PDF o CSV con un clic.',
                icon: BarChart3
              }
            ].map((step) => (
              <li
                key={step.num}
                className={`p-7 flex flex-col justify-between space-y-6 transition-colors ${
                  isDark
                    ? 'bg-gray-950 hover:bg-slate-900'
                    : 'bg-white hover:bg-slate-950 hover:text-white group'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-400 tabular-nums">
                      {step.num}
                    </span>
                    <step.icon
                      className={`w-5 h-5 ${
                        isDark ? 'text-slate-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  <h3
                    className={`text-xl font-display font-bold ${
                      isDark ? 'text-white' : 'text-slate-950 group-hover:text-white'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600 group-hover:text-slate-300'
                    }`}
                  >
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 4 Modalità di voto: 4-column 1px-ruled interactive architectural grid (Aurora vn pattern) */}
        <section
          id="modalita"
          className={`border-y py-16 md:py-20 ${
            isDark ? 'border-gray-800 bg-gray-900/20' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div className="max-w-2xl space-y-2">
                <p className="text-xs font-mono text-blue-600 dark:text-blue-400">Modalità di voto</p>
                <h2
                  className={`text-2xl md:text-4xl font-display font-bold tracking-tight [text-wrap:balance] ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  4 formati pronti per ogni tipo di scelta
                </h2>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-mono ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>Chiusura automatica a scadenza</span>
              </span>
            </div>

            <ul
              className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-px border ${
                isDark ? 'bg-gray-800 border-gray-800' : 'bg-slate-200 border-slate-200'
              }`}
            >
              {(['yes_no', 'single', 'multiple', 'rating'] as PreviewMode[]).map((mode, idx) => {
                const item = PREVIEW_DATA[mode];
                const isActive = previewMode === mode;
                return (
                  <li key={mode}>
                    <button
                      type="button"
                      onClick={() => handleModeCardSelect(mode)}
                      className={`w-full h-full text-left p-6 flex flex-col justify-between space-y-5 transition-colors cursor-pointer ${
                        isActive
                          ? isDark
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-950 text-white'
                          : isDark
                            ? 'bg-gray-950 text-slate-200 hover:bg-slate-900'
                            : 'bg-white text-slate-900 hover:bg-slate-950 hover:text-white group'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-xs font-mono tabular-nums ${
                              isActive
                                ? 'text-blue-400'
                                : 'text-blue-600 dark:text-blue-400 group-hover:text-blue-400'
                            }`}
                          >
                            0{idx + 1}.
                          </span>
                          <ArrowUpRight
                            className={`w-4 h-4 shrink-0 ${
                              isActive
                                ? 'text-blue-400'
                                : 'text-slate-400 group-hover:text-white'
                            }`}
                            aria-hidden="true"
                          />
                        </div>
                        <h3 className="font-display text-xl font-bold leading-tight">{item.label}</h3>
                        <p
                          className={`text-sm leading-relaxed ${
                            isActive
                              ? 'text-slate-300'
                              : isDark
                                ? 'text-slate-400'
                                : 'text-slate-600 group-hover:text-slate-300'
                          }`}
                        >
                          {item.shortDesc}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-mono ${
                          isActive
                            ? 'text-blue-400'
                            : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      >
                        Prova nell’anteprima →
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Filterable Use Cases Section (Aurora fn pattern: filter tabs + horizontal snap on mobile) */}
        <section id="casi-duso" className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-mono text-blue-600 dark:text-blue-400">Casi d’uso</p>
              <h2
                className={`text-2xl md:text-4xl font-display font-bold tracking-tight [text-wrap:balance] ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                Pensato per chi deve chiudere decisioni ogni giorno
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all' as UseCaseFilter, label: 'Tutti' },
                { key: 'team' as UseCaseFilter, label: 'Team & Startup' },
                { key: 'agency' as UseCaseFilter, label: 'Agenzie & Clienti' },
                { key: 'assoc' as UseCaseFilter, label: 'Associazioni' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setUseCaseFilter(tab.key)}
                  className={`px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    useCaseFilter === tab.key
                      ? 'bg-slate-950 dark:bg-blue-600 text-white border-slate-950 dark:border-blue-600'
                      : isDark
                        ? 'border-gray-800 bg-gray-900 text-slate-300 hover:border-gray-700'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-950'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-3 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0">
            {filteredUseCases.map((item) => (
              <article
                key={item.id}
                className={`min-w-[84%] sm:min-w-[60%] md:min-w-0 snap-center p-7 border flex flex-col justify-between space-y-6 ${
                  isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                      {item.kicker}
                    </span>
                    <item.icon
                      className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className={`text-xl font-display font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {item.desc}
                  </p>
                </div>

                <div
                  className={`pt-4 border-t space-y-1.5 text-xs ${
                    isDark ? 'border-gray-800 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}
                >
                  <p className="italic">Esempio: {item.example}</p>
                  <p className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.metric}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Dark Architectural Security Section (Aurora Na section) */}
        <section id="sicurezza" className="bg-[#111827] text-white relative overflow-hidden border-y border-slate-800">
          <div className="absolute inset-0 arch-grid-bg-dark opacity-50 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-400">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Sicurezza dei dati · LPD Svizzera &amp; GDPR</span>
                </div>

                <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight [text-wrap:balance]">
                  Dati protetti con standard svizzeri,{' '}
                  <span className="text-blue-400">controllo completo per tutto il team</span>
                </h2>

                <div className="inline-flex items-center gap-2.5 text-sm font-mono text-slate-200 pt-1">
                  <span className="w-5 h-5 bg-[#E0262C] flex items-center justify-center shrink-0" aria-hidden="true">
                    <span className="relative block w-3 h-3">
                      <span className="absolute left-[5px] top-0 w-[2px] h-3 bg-white" />
                      <span className="absolute top-[5px] left-0 h-[2px] w-3 bg-white" />
                    </span>
                  </span>
                  <span>Sicurezza svizzera · Nessun account richiesto per votare</span>
                </div>
              </div>

              <div className="lg:col-span-6 self-end space-y-5">
                <p className="text-base text-slate-300 leading-relaxed">
                  Lavoriamo con decisioni aziendali, preventivi e votazioni di team: la protezione è parte integrante della piattaforma. Scegli tra votazioni aperte via link, riservate all’organizzazione o completamente anonime.
                </p>

                <div className="border border-slate-700 bg-slate-950/70 divide-y divide-slate-800">
                  {SECURITY_SPECS.map((spec) => (
                    <div key={spec.label} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <span className="font-mono text-slate-400">{spec.label}</span>
                      <span className="font-mono font-semibold text-emerald-400">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-800 border border-slate-800">
              <div className="bg-slate-900/90 p-6 space-y-2">
                <div className="flex items-center gap-2 text-blue-400">
                  <UserCheck className="w-4 h-4" aria-hidden="true" />
                  <h3 className="font-display font-bold text-base text-white">Voto aperto senza account</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Colleghi, clienti e soci votano in 10 secondi dal browser senza password, con protezione anti-voto doppio integrata.
                </p>
              </div>
              <div className="bg-slate-900/90 p-6 space-y-2">
                <div className="flex items-center gap-2 text-blue-400">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <h3 className="font-display font-bold text-base text-white">LPD Svizzera &amp; GDPR</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Solo cookie tecnici essenziali per il funzionamento della sessione. I dati non vengono mai ceduti o rivenduti a terzi.
                </p>
              </div>
              <div className="bg-slate-900/90 p-6 space-y-2">
                <div className="flex items-center gap-2 text-blue-400">
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  <h3 className="font-display font-bold text-base text-white">Verbali PDF e CSV</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Esporta il riepilogo ufficiale dei voti e della decisione finale in PDF o CSV per l’archivio aziendale o assembleare.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Editorial 12-Col Split FAQ (Aurora Ua section) */}
        <section
          id="faq"
          className={`border-b py-16 md:py-24 ${
            isDark ? 'border-gray-800 bg-gray-950' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4 space-y-4">
              <p className="text-xs font-mono text-blue-600 dark:text-blue-400">Domande frequenti</p>
              <h2
                className={`text-2xl md:text-4xl font-display font-bold tracking-tight [text-wrap:balance] ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                Tutto quello che serve sapere prima di iniziare
              </h2>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Risposte rapide su costi dell’Accesso Anticipato, voto senza registrazione, privacy e app mobile.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleCtaClick('faq_sidebar')}
                  className="px-5 py-2.5 min-h-[44px] rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Inizia gratis ora</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div
                className={`flex items-center justify-between pb-3 border-b text-xs font-mono ${
                  isDark ? 'border-gray-700 text-slate-400' : 'border-slate-900 text-slate-500'
                }`}
              >
                <span>Argomento</span>
                <span>Dettagli</span>
              </div>
              <div
                className={`divide-y ${
                  isDark ? 'divide-gray-800' : 'divide-slate-200'
                }`}
              >
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={faq.q}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${idx}`}
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full py-5 text-left flex items-center justify-between gap-4 cursor-pointer min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        <span className={`text-sm md:text-base font-semibold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen && (
                        <div
                          id={`faq-panel-${idx}`}
                          className={`pb-5 text-sm leading-relaxed max-w-2xl ${
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Mobile App / PWA Install Section (Aurora Ft section) */}
        <section id="app-mobile" className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-20">
          <div className="mb-10 max-w-2xl space-y-2">
            <p className="text-xs font-mono text-blue-600 dark:text-blue-400">App mobile · Web App Installabile</p>
            <h2
              className={`text-2xl sm:text-4xl font-display font-bold tracking-tight [text-wrap:balance] ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              Installa Easy Decision sul tuo smartphone
            </h2>
            <p className={`text-sm md:text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Crea proposte, controlla i risultati in tempo reale e gestisci le decisioni del team direttamente dalla schermata Home. Gratis, ottimizzata per touch e senza passare dagli store.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Android Card */}
            <div
              className={`border p-7 flex flex-col justify-between space-y-6 ${
                isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-md bg-slate-950 dark:bg-gray-800 text-white flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        Android
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Chrome, Samsung Internet, Edge
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-500">PWA</span>
                </div>

                <ol id="android-steps" className={`space-y-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li className="flex items-start gap-3">
                    <MoreVertical className="w-4 h-4 text-blue-600 shrink-0 mt-1" aria-hidden="true" />
                    <span>Apri questo sito con Chrome e tocca il menu ⋮ in alto a destra.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Download className="w-4 h-4 text-blue-600 shrink-0 mt-1" aria-hidden="true" />
                    <span>Scegli “Installa app” oppure “Aggiungi a schermata Home”.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-1" aria-hidden="true" />
                    <span>Conferma: Easy Decision appare tra le tue app a schermo intero.</span>
                  </li>
                </ol>
              </div>

              <div className="pt-2">
                {isInstalled ? (
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>App già installata su questo dispositivo</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleAndroidInstallClick}
                    className="w-full sm:w-auto px-5 py-3 min-h-[44px] rounded-md bg-slate-950 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>{isInstallable ? 'Installa subito su Android' : 'Come installare su Android'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* iOS Card */}
            <div
              className={`border p-7 flex flex-col justify-between space-y-6 ${
                isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        iPhone · iPad
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Safari</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-500">iOS</span>
                </div>

                <ol className={`space-y-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li className="flex items-start gap-3">
                    <Share className="w-4 h-4 text-blue-600 shrink-0 mt-1" aria-hidden="true" />
                    <span>Apri questo sito con Safari e tocca il pulsante Condividi.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <PlusSquare className="w-4 h-4 text-blue-600 shrink-0 mt-1" aria-hidden="true" />
                    <span>Scorri e scegli “Aggiungi alla schermata Home”.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-1" aria-hidden="true" />
                    <span>Tocca “Aggiungi”: Easy Decision si apre come una vera app.</span>
                  </li>
                </ol>
              </div>

              <div className="pt-2">
                {isInstalled ? (
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>App già installata su questo dispositivo</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowIOSGuideModal(true)}
                    className="w-full sm:w-auto px-5 py-3 min-h-[44px] rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>Installa su iPhone</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Final Pre-Footer CTA */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-20">
          <div
            className={`p-10 md:p-14 border flex flex-col md:flex-row md:items-center md:justify-between gap-8 ${
              isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-slate-950 border-slate-900 text-white'
            }`}
          >
            <div className="space-y-3 max-w-xl">
              <p className="text-xs font-mono text-blue-400">
                Accesso Anticipato Gratuito · Tutto incluso
              </p>
              <h2 className="text-2xl md:text-4xl font-display font-bold tracking-tight leading-tight [text-wrap:balance]">
                Pronto a prendere la prossima decisione senza riunioni?
              </h2>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                Crea gratis la tua prima votazione in 60 secondi e condividi il link: chi vota non deve registrarsi.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleCtaClick('final_cta')}
                className="px-7 py-4 min-h-[48px] rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition-colors cursor-pointer inline-flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <span>Crea gratis la tua prima votazione</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>0 CHF / 0 EUR · Conformità LPD Svizzera &amp; GDPR</span>
              </span>
            </div>
          </div>
        </section>

        {/* Connect & Create Section */}
        <ConnectCreateSection isDark={isDark} />

        {/* Contact Mailto Section */}
        <ContactSection isDark={isDark} />
      </main>

      <Footer
        isDark={isDark}
        onViewPrivacy={() => setLegalModal({ isOpen: true, type: 'privacy' })}
        onViewCookies={() => setLegalModal({ isOpen: true, type: 'cookie' })}
      />

      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })}
        type={legalModal.type}
        isDark={isDark}
      />

      {/* iPhone / iPad Safari installation modal */}
      {showIOSGuideModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="homepage-ios-modal-title"
            className={`w-full max-w-sm rounded-xl border p-6 shadow-xl space-y-4 ${
              isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-950'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="homepage-ios-modal-title" className="text-base font-display font-bold">
                  Installa su iPhone e iPad
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Usa Easy Decision come web app a schermo intero da Safari.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuideModal(false)}
                aria-label="Chiudi guida"
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className={`space-y-3 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <li className="flex items-start gap-3">
                <Share className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  1. Apri questa pagina con <strong>Safari</strong> e tocca <strong>Condividi</strong> nella barra in basso.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <PlusSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  2. Scorri l’elenco e tocca <strong>Aggiungi alla schermata Home</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  3. Conferma con <strong>Aggiungi</strong> in alto a destra.
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSGuideModal(false)}
              className="w-full py-2.5 min-h-[44px] rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}

      {/* Compact Mobile Sticky CTA (< 15% mobile viewport height) */}
      <div className="md:hidden fixed bottom-3 left-4 right-4 z-40">
        <button
          type="button"
          onClick={() => handleCtaClick('mobile_sticky')}
          className="w-full py-3 px-4 min-h-[44px] rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Crea votazione gratis</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
