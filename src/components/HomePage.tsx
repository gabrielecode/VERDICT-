import React, { useEffect, useState } from 'react';
import {
  Vote,
  ChevronDown,
  ArrowRight,
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
  UserCheck
} from 'lucide-react';
import { Footer } from './Footer';
import { LegalModal } from './LegalModal';
import { sendEmailLink } from '../lib/firebase';
import { ToastType } from '../types';

interface HomePageProps {
  onLoginSuccess: () => void;
  isDark: boolean;
  toggleDarkMode: () => void;
  addToast: (message: string, type: ToastType) => void;
}

type PreviewMode = 'yes_no' | 'single' | 'multiple' | 'rating';

const PREVIEW_DATA: Record<
  PreviewMode,
  {
    label: string;
    category: string;
    title: string;
    deadline: string;
    attachment: string;
    options: { id: string; text: string; votes: number }[];
  }
> = {
  yes_no: {
    label: 'Sì / No',
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
    q: 'Quali modalità di voto sono disponibili?',
    a: 'Puoi scegliere tra 4 modalità di voto: Sì / No per decisioni rapide, Scelta Singola, Scelta Multipla per raccogliere più preferenze e Valutazione a Stelle da 1 a 5.'
  }
];

export const HomePage: React.FC<HomePageProps> = ({ onLoginSuccess, isDark, toggleDarkMode, addToast }) => {
  useEffect(() => {
    document.title = 'Easy Decision | Prendi decisioni di team veloci e trasparenti';
  }, []);

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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handlePreviewModeChange = (mode: PreviewMode) => {
    setPreviewMode(mode);
    if (mode === 'yes_no') setPreviewSelection(['yn-1']);
    else if (mode === 'single') setPreviewSelection(['s-1']);
    else if (mode === 'multiple') setPreviewSelection(['m-1', 'm-2']);
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

  const currentPreview = PREVIEW_DATA[previewMode];
  const previewTotalVotes =
    previewMode === 'rating'
      ? 14
      : currentPreview.options.reduce((acc, opt) => acc + opt.votes + (previewSelection.includes(opt.id) ? 1 : 0), 0);

  return (
    <div
      className={`min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900 pb-20 md:pb-0 ${
        isDark ? 'bg-gray-950 text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* Top Bar: 3-zone contract */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b ${
          isDark ? 'bg-gray-950/90 border-gray-800' : 'bg-white/90 border-slate-200'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <a
            href="/"
            className="inline-flex items-center gap-2.5 text-lg font-display font-bold tracking-tight whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
          >
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
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
              href="#casi-duso"
              className={`whitespace-nowrap shrink-0 hover:underline underline-offset-4 transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Casi d’uso
            </a>
            <a
              href="#vantaggi"
              className={`whitespace-nowrap shrink-0 hover:underline underline-offset-4 transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Vantaggi
            </a>
            <a
              href="#faq"
              className={`whitespace-nowrap shrink-0 hover:underline underline-offset-4 transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              FAQ
            </a>
          </nav>

          {/* Zone 3: Theme toggle + Primary CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={isDark ? 'Attiva tema chiaro' : 'Attiva tema scuro'}
              className={`p-2 rounded-lg border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
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
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Inizia gratis
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div>
                <span
                  className={`inline-block px-3 py-1.5 rounded-md border text-xs font-semibold tracking-tight ${
                    isDark
                      ? 'bg-blue-950/60 border-blue-800/80 text-blue-300'
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}
                >
                  Accesso Anticipato Gratuito — Tutto incluso
                </span>
              </div>

              <h1
                className={`text-[clamp(2.25rem,4.1vw,3.75rem)] font-display font-bold tracking-tight leading-[1.08] [text-wrap:balance] ${
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
                <strong className={isDark ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>
                  chi vota non deve registrarsi
                </strong>
                . Raccogli voti in tempo reale ed esporta i risultati in PDF o CSV.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => handleCtaClick('hero')}
                  className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition-colors cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <span>Crea la tua prima votazione gratis</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmailForm((prev) => !prev)}
                  className={`px-5 py-3.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isDark
                      ? 'border-gray-800 bg-gray-900 text-slate-200 hover:bg-gray-800'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  <span>Accedi via email</span>
                </button>
              </div>

              {showEmailForm && (
                <div
                  className={`p-4 rounded-xl border max-w-md ${
                    isDark ? 'border-gray-800 bg-gray-900/70' : 'border-slate-200 bg-slate-50'
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
                        className={`flex-1 px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                          isDark
                            ? 'border-gray-700 bg-gray-950 text-white placeholder:text-slate-500'
                            : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={emailLoading}
                        className="px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                      >
                        {emailLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>Invia link</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div
                className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium pt-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <span>0 CHF / 0 EUR in Accesso Anticipato</span>
                <span aria-hidden="true">·</span>
                <span>Zero registrazione per i votanti</span>
                <span aria-hidden="true">·</span>
                <span>LPD Svizzera & GDPR</span>
              </div>
            </div>

            {/* Interactive Live Product Preview */}
            <div className="lg:col-span-5 flex flex-col">
              <div
                className={`h-full rounded-2xl border p-5 md:p-6 flex flex-col justify-between space-y-5 ${
                  isDark ? 'bg-gray-900 border-gray-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                      Anteprima interattiva · Prova un voto
                    </span>
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {currentPreview.deadline}
                    </span>
                  </div>

                  {/* Interactive mode selector */}
                  <div
                    role="tablist"
                    aria-label="Modalità di voto"
                    className={`grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-lg border ${
                      isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    {(['yes_no', 'single', 'multiple', 'rating'] as PreviewMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        role="tab"
                        aria-selected={previewMode === mode}
                        onClick={() => handlePreviewModeChange(mode)}
                        className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap truncate ${
                          previewMode === mode
                            ? 'bg-blue-600 text-white'
                            : isDark
                              ? 'text-slate-300 hover:bg-gray-800'
                              : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {PREVIEW_DATA[mode].label}
                      </button>
                    ))}
                  </div>

                  {/* Preview proposal card */}
                  <div
                    className={`rounded-xl border p-5 space-y-4 ${
                      isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{currentPreview.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Paperclip className="w-3 h-3" aria-hidden="true" />
                          {currentPreview.attachment}
                        </span>
                      </div>
                      <h2
                        className={`text-base font-display font-bold leading-snug ${
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
                              className="p-1 cursor-pointer transition-transform active:scale-95"
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
                              className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer space-y-2 ${
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

                <div
                  className={`flex items-center justify-between text-xs pt-1 border-t ${
                    isDark ? 'border-gray-800 text-slate-400' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <span className="font-mono tabular-nums">{previewTotalVotes} voti in tempo reale</span>
                  <span>Voto aperto senza login</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof / Partner strip adjacent to Hero */}
        <section
          aria-label="Organizzazioni che usano Easy Decision"
          className={`border-y py-10 ${isDark ? 'border-gray-800 bg-gray-900/30' : 'border-slate-200 bg-slate-50/70'}`}
        >
          <div className="max-w-6xl mx-auto px-6">
            <p
              className={`text-xs font-semibold text-center mb-6 ${
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
                      }group inline-flex items-center gap-2.5 shrink-0 mr-10 md:mr-14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg py-1`}
                    >
                      <span
                        className={`w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center ${
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

        {/* Come funziona (3 step) */}
        <section id="come-funziona" className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="max-w-2xl space-y-3 mb-14">
            <h2
              className={`text-2xl md:text-4xl font-display font-bold tracking-tight [text-wrap:balance] ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              Come funziona in 3 passaggi
            </h2>
            <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Dall’idea al verdetto condiviso in meno di un minuto, senza installazioni né onboarding complessi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div
                key={step.num}
                className={`p-7 rounded-2xl border flex flex-col justify-between space-y-6 ${
                  isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                      {step.num}
                    </span>
                    <step.icon
                      className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className={`text-xl font-display font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3 Casi d'uso */}
        <section
          id="casi-duso"
          className={`border-y py-20 md:py-24 ${
            isDark ? 'border-gray-800 bg-gray-900/30' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl space-y-3 mb-14">
              <h2
                className={`text-2xl md:text-4xl font-display font-bold tracking-tight [text-wrap:balance] ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                Pensato per chi deve chiudere decisioni ogni giorno
              </h2>
              <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Tre contesti reali in cui una votazione strutturata sostituisce decine di messaggi sparsi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  kicker: 'Prodotto & Operations · Scelta Multipla',
                  title: 'Team & Startup',
                  desc: 'Definisci priorità di sprint, scelta fornitori e orari di team in modalità asincrona, arrivando in riunione con la decisione già presa.',
                  example: '“Quali 2 integrazioni rilasciamo prima nel Q1?”'
                },
                {
                  icon: Briefcase,
                  kicker: 'Approvazioni & Naming · Sì / No',
                  title: 'Agenzie & Clienti',
                  desc: 'Condividi proposte grafiche, bozze di copy o preventivi con allegati e ottieni il via libera del cliente con un clic, senza fargli creare account.',
                  example: '“Approvi il layout homepage v3 allegato?”'
                },
                {
                  icon: Building2,
                  kicker: 'Comitati & Volontari · Scelta Singola',
                  title: 'Associazioni & Gruppi',
                  desc: 'Raccogli voti trasparenti per delibere, budget eventi e date di assemblea, accessibili da qualsiasi smartphone e archiviabili in PDF.',
                  example: '“Quale data preferite per l’assemblea annuale?”'
                }
              ].map((item) => (
                <article
                  key={item.title}
                  className={`p-7 rounded-2xl border flex flex-col justify-between space-y-6 ${
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

                  <p
                    className={`pt-4 border-t text-xs italic ${
                      isDark ? 'border-gray-800 text-slate-400' : 'border-slate-100 text-slate-500'
                    }`}
                  >
                    Esempio: {item.example}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Vantaggi */}
        <section id="vantaggi" className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="max-w-2xl space-y-3 mb-14">
            <h2
              className={`text-2xl md:text-4xl font-display font-bold tracking-tight [text-wrap:balance] ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              Perché i team passano a Easy Decision
            </h2>
            <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Meno attrito per chi vota, controllo completo per chi coordina e conformità normativa svizzera ed europea.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pillar 1: No registration for voters */}
            <div
              className={`lg:col-span-6 p-8 rounded-2xl border space-y-4 ${
                isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-blue-950 text-blue-400' : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <UserCheck className="w-5 h-5" aria-hidden="true" />
                </span>
                <h3 className={`text-xl font-display font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  Nessuna registrazione per chi vota
                </h3>
              </div>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Il problema principale dei sondaggi interni è la bassa partecipazione. Con Easy Decision, solo chi crea la votazione accede alla dashboard: colleghi, soci e clienti votano dal link in 10 secondi senza password né app.
              </p>
              <div
                className={`pt-3 border-t flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium ${
                  isDark ? 'border-gray-800 text-slate-400' : 'border-slate-100 text-slate-500'
                }`}
              >
                <span>Accesso istantaneo da browser</span>
                <span aria-hidden="true">·</span>
                <span>Protezione anti-voto doppio</span>
              </div>
            </div>

            {/* Pillar 2: Privacy LPD Svizzera & GDPR */}
            <div
              className={`lg:col-span-6 p-8 rounded-2xl border space-y-4 ${
                isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-blue-950 text-blue-400' : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                </span>
                <h3 className={`text-xl font-display font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  Privacy LPD Svizzera & GDPR
                </h3>
              </div>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Progettato secondo la Legge Federale sulla Protezione dei Dati (LPD) svizzera e il GDPR europeo. Scegli tra votazioni aperte via link, riservate al team o anonime, con storico completo esportabile in PDF e CSV.
              </p>
              <div
                className={`pt-3 border-t flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium ${
                  isDark ? 'border-gray-800 text-slate-400' : 'border-slate-100 text-slate-500'
                }`}
              >
                <span>Controllo accessi granulare</span>
                <span aria-hidden="true">·</span>
                <span>Solo cookie tecnici essenziali</span>
              </div>
            </div>

            {/* Pillar 3: 4 voting modes */}
            <div
              className={`lg:col-span-12 p-8 rounded-2xl border space-y-6 ${
                isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className={`text-xl font-display font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    4 modalità di voto per ogni tipo di scelta
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Adatta il formato alla decisione, aggiungi una scadenza automatica e raccogli commenti ordinati.
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium shrink-0 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>Chiusura automatica a scadenza</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Sì / No', desc: 'Approvazioni rapide, preventivi e delibere binarie.' },
                  { name: 'Scelta Singola', desc: 'Una sola opzione vincente tra più candidati o date.' },
                  { name: 'Scelta Multipla', desc: 'Raccolta di più preferenze e priorità di backlog.' },
                  { name: 'Stelle 1–5', desc: 'Valutazione qualitativa di bozze, idee e fornitori.' }
                ].map((mode) => (
                  <div
                    key={mode.name}
                    className={`p-4 rounded-xl border space-y-1.5 ${
                      isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <p className={`text-sm font-display font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {mode.name}
                    </p>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {mode.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion (4 questions aligned with JSON-LD) */}
        <section
          id="faq"
          className={`border-t py-20 md:py-24 ${
            isDark ? 'border-gray-800 bg-gray-900/20' : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <div className="max-w-3xl mx-auto px-6">
            <div className="space-y-3 mb-12">
              <h2
                className={`text-2xl md:text-4xl font-display font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                Domande frequenti
              </h2>
              <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Risposte rapide su costi, accesso dei votanti, sicurezza e modalità di voto.
              </p>
            </div>

            <div
              className={`divide-y rounded-2xl border overflow-hidden ${
                isDark ? 'divide-gray-800 border-gray-800 bg-gray-950' : 'divide-slate-200 border-slate-200 bg-white'
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
                      className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
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
                        className={`px-6 pb-5 text-sm leading-relaxed ${
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
        </section>

        {/* Final Pre-Footer CTA */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div
            className={`rounded-3xl p-10 md:p-16 border flex flex-col md:flex-row md:items-center md:justify-between gap-8 ${
              isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="space-y-3 max-w-xl">
              <p className="text-xs font-semibold text-blue-400">
                Accesso Anticipato Gratuito — Tutto incluso
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
                className="px-7 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition-colors cursor-pointer inline-flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <span>Crea gratis la tua prima votazione</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>0 CHF / 0 EUR · Conformità LPD Svizzera & GDPR</span>
              </span>
            </div>
          </div>
        </section>
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

      {/* Compact Mobile Sticky CTA (< 15% mobile viewport height) */}
      <div className="md:hidden fixed bottom-3 left-4 right-4 z-40">
        <button
          type="button"
          onClick={() => handleCtaClick('mobile_sticky')}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Crea votazione gratis</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
