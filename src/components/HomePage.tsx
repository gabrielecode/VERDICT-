import React, { useEffect, useState } from 'react';
import { 
  Vote, 
  ChevronDown, 
  Users, 
  LogIn,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  Sun,
  Moon,
  X,
  Clock,
  MessageSquare,
  BarChart3,
  FileText,
  Mail,
  Loader2
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

export const HomePage: React.FC<HomePageProps> = ({ onLoginSuccess, isDark, toggleDarkMode, addToast }) => {
  useEffect(() => {
    document.title = "easy decision | Software per decisioni di team: votazioni e sondaggi online";
  }, []);

  // Analytics event tracking helper (compatible with Google Tag Manager / GA4 dataLayer & custom listeners)
  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({ event: eventName, ...params });
      }
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', eventName, params);
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
      button_text: 'Provalo gratis',
      location: location,
    });
    onLoginSuccess();
  };

  const [legalModal, setLegalModal] = React.useState<{ isOpen: boolean; type: 'privacy' | 'cookie' }>({
    isOpen: false,
    type: 'privacy'
  });

  const openLegal = (type: 'privacy' | 'cookie') => {
    setLegalModal({ isOpen: true, type });
  };

  const [emailInput, setEmailInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setEmailLoading(true);
    try {
      await sendEmailLink(emailInput.trim());
      setEmailSent(true);
      addToast('Controlla la tua email', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Errore durante l\'invio dell\'email.', 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  const faqs = [
    {
      q: "Cos'è easy decision e come funziona?",
      a: "easy decision è una piattaforma progettata per agevolare le decisioni collettive all'interno dei team aziendali. Funziona permettendo agli utenti di creare proposte di voto strutturate, raccogliere feedback in tempo reale dai collaboratori e visualizzare i risultati in modo chiaro."
    },
    {
      q: "Quali tipi di votazione posso creare?",
      a: "La piattaforma offre massima flessibilità permettendo di creare votazioni a scelta singola, scelta multipla, sondaggi sì/no e valutazioni a stelle per misurare il gradimento o la priorità."
    },
    {
      q: "È necessaria la registrazione?",
      a: "Sì, per garantire l'integrità dei voti e la collaborazione in tempo reale, easy decision utilizza l'autenticazione Google. Questo permette di identificare i partecipanti e gestire i permessi all'interno del team."
    },
    {
      q: "Dove vengono salvati i dati?",
      a: "Tutti i dati sono archiviati in modo sicuro su Firebase Firestore, garantendo la persistenza e l'integrità dei dati per il tuo team."
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900'} font-sans selection:bg-blue-100 selection:text-blue-900`}>
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${isDark ? 'bg-gray-950/85 border-gray-800' : 'bg-white/85 border-gray-200'} px-6 py-4`}>
        <nav aria-label="Principale" className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Vote className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight block">easy decision</span>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">Cloud</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl border transition ${isDark ? 'border-gray-800 bg-gray-900 text-amber-400 hover:bg-gray-800' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              aria-label="Cambia Tema"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => handleCtaClick('header')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Accedi con Google
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-28 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                Ora disponibile per team remoti
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[1.1] text-slate-950 dark:text-white">
              Basta chat infinite:<br />
              <span className="text-blue-600">il tuo team decide qui.</span>
            </h1>
            
            <p className={`text-lg md:text-xl leading-relaxed max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Crea votazioni chiare, raccogli feedback e ottieni risultati in tempo reale. La soluzione professionale per PM e team che vogliono agire, non solo discutere.
            </p>


            <div className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleCtaClick('hero')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group"
                >
                  Provalo gratis con Google
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className={`p-6 rounded-2xl border ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white shadow-sm'} max-w-md space-y-3`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Accesso senza password via email</h3>
                {emailSent ? (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold text-center">
                    Controlla la tua email
                  </div>
                ) : (
                  <form onSubmit={handleEmailLogin} className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="nome@azienda.it"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={emailLoading}
                      className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Invia Link
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-950 bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt={`Membro del team ${i}`} loading="lazy" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white">Fiducia</span> in oltre 50 associazioni e PMI italiane
              </p>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className={`p-1 rounded-[2.5rem] border shadow-2xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} relative z-10 overflow-hidden`}>
              <div className={`bg-white dark:bg-gray-900 rounded-[2.2rem] overflow-hidden`}>
                {/* Browser Mockup UI */}
                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="bg-white dark:bg-gray-950 px-3 py-1 rounded-md border border-gray-200 dark:border-gray-800 text-[10px] text-gray-400 font-mono">
                    easydecision.cloud/v/83k2
                  </div>
                  <div className="w-6" />
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="inline-flex px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">Progetto Alfa</div>
                    <h3 className="text-lg font-bold leading-tight">Nuovo fornitore logistica?</h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'LogiExpress SpA', votes: 65, color: 'bg-blue-600' },
                      { label: 'FastShipping srl', votes: 35, color: 'bg-slate-300 dark:bg-slate-700' }
                    ].map((opt, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{opt.label}</span>
                          <span>{opt.votes}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full ${opt.color} rounded-full`} style={{ width: `${opt.votes}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {[1, 2, 3, 4].map(i => <div key={i} className="w-5 h-5 rounded-full border border-white dark:border-gray-900 bg-gray-200" />)}
                    </div>
                    <span className="text-[10px] font-medium text-gray-400">12 voti registrati in tempo reale</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full -z-0" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-600/20 blur-[80px] rounded-full -z-0" />
          </div>
        </section>

        {/* Pre-rendered content for SEO */}
        <section className="sr-only">
          <h2>Perché scegliere easy decision per le tue votazioni online?</h2>
          <p>easy decision è lo strumento ideale per gestire le decisioni di team in modo asincrono e trasparente. Con la nostra piattaforma di votazioni online, puoi creare sondaggi personalizzati, invitare i partecipanti con un semplice link e analizzare i risultati in tempo reale.</p>
          <ul>
            <li>Votazioni a scelta singola o multipla</li>
            <li>Sondaggi sì o no per decisioni rapide</li>
            <li>Valutazioni a stelle per feedback qualitativi</li>
            <li>Esportazione risultati in PDF e CSV</li>
          </ul>
        </section>

        <section id="problem-solution" className={`py-24 border-y ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">
                Basta perdere tempo in bivi senza fine
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Trasforma il caos delle discussioni in decisioni esecutive, tracciabili e condivise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-5">
                 <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                   <X className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Decisioni disperse in chat</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                   Smetti di scrollare centinaia di messaggi su WhatsApp o Slack per capire la volontà del team. <span className="text-blue-600 font-bold">Con easy decision</span>, hai una votazione strutturata e un verdetto immediato.
                 </p>
              </div>

              <div className="space-y-5">
                 <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                   <Clock className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Riunioni lunghe e inutili</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                   Non sprecare ore a discutere opzioni che possono essere votate in asincrono. <span className="text-blue-600 font-bold">Arriva in riunione</span> con i dati già pronti e concentrati il tempo sull'esecuzione.
                 </p>
              </div>

              <div className="space-y-5">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                   <LayoutDashboard className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mancanza di traccia storica</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                   Evita il classico "chi aveva deciso questo?". <span className="text-blue-600 font-bold">Ogni scelta</span> viene archiviata con i nomi dei votanti e i commenti, pronta per essere esportata in PDF o CSV.
                 </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className={`py-24 ${isDark ? 'bg-slate-900/10' : 'bg-white'}`}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-950 dark:text-white">
                Tutto ciò che serve per decidere bene
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Strumenti pensati per la chiarezza, non per la burocrazia.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Votazioni su misura', desc: 'Scegli tra voto singolo, multiplo, sì/no o stelle in base alla complessità del bivio.', icon: Vote },
                { title: 'Decisioni puntuali', desc: 'Imposta una scadenza automatica per evitare che le discussioni si trascinino all\'infinito.', icon: Clock },
                { title: 'Dialogo costruttivo', desc: 'Ogni proposta ha la sua sezione commenti per chiarire dubbi senza sporcare le chat.', icon: MessageSquare },
                { title: 'Dati sempre aggiornati', desc: 'Visualizza l\'andamento dei voti in tempo reale con grafici chiari e intuitivi.', icon: BarChart3 },
                { title: 'Report professionali', desc: 'Trasforma ogni decisione in un documento ufficiale PDF o CSV pronto per la condivisione.', icon: FileText },
                { title: 'Controllo totale', desc: 'Gestisci tutte le tue proposte e i membri del team da un\'unica dashboard centralizzata.', icon: ShieldCheck }
              ].map((feat, i) => (
                <div key={i} className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-900/30 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <feat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-950 dark:text-white">
              Dal dubbio al verdetto in 3 passi
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Abbiamo eliminato ogni complessità superflua per permetterti di focalizzarti solo sulla scelta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection line for desktop */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px border-t border-dashed border-gray-200 dark:border-gray-800 -z-10" />
            
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-600/20">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Crea la votazione</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Inserisci il titolo, descrivi il contesto e scegli il tipo di voto (singolo, multiplo o stelle).
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-600/20">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Invita con un link</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Copia il link privato e invialo su Slack, Teams o Email. I colleghi votano in un clic senza attriti.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-600/20">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Analizza ed Esporta</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Visualizza grafici in tempo reale e scarica il report in PDF o CSV per i tuoi archivi aziendali.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={() => handleCtaClick('how_it_works')}
              className="px-10 py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition shadow-xl shadow-blue-600/25 inline-flex items-center gap-3 group"
            >
              Provalo gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
        <section id="use-cases" className={`py-24 ${isDark ? 'bg-slate-900/20' : 'bg-slate-50'}`}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-950 dark:text-white">
                Pronto per ogni scenario
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Dalla piccola decisione quotidiana alla strategia trimestrale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Scelta Fornitori', example: 'Quale CRM adottare nel Q1?', type: 'Scelta Multipla' },
                { title: 'Approvazione Proposte', example: 'Approviamo il nuovo layout del sito?', type: 'Sì / No' },
                { title: 'Selezione Candidati', example: 'Chi è il profilo più adatto per il ruolo HR?', type: 'Valutazione a Stelle' },
                { title: 'Pianificazione Team', example: 'Dove organizziamo il prossimo off-site?', type: 'Scelta Singola' }
              ].map((useCase, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:shadow-md transition-shadow">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{useCase.type}</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">{useCase.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{useCase.example}"</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 group-hover:text-blue-500 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="social-proof" className="py-20 max-w-6xl mx-auto px-6 text-center border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-12">Hanno scelto la chiarezza</p>

          <div
            className="logo-carousel-wrapper relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
            role="region"
            aria-label="Aziende e progetti che usano easy decision"
          >
            <div className="animate-logo-carousel items-center">
              {[0, 1].map((copyIndex) => {
                const partners = [
                  {
                    name: 'Pratiko',
                    href: 'https://pratiko.ch/',
                    logo: '/logos/pratiko.webp',
                    fullBleed: false,
                    padClass: 'p-1',
                    wordmarkClass: 'text-[#083344] dark:text-white'
                  },
                  {
                    name: 'RankUpList',
                    href: 'https://rankuplist.com/',
                    logo: '/logos/rankuplist.png',
                    fullBleed: false,
                    padClass: 'p-1',
                    wordmarkClass: 'text-[#0F3C78] dark:text-sky-300'
                  },
                  {
                    name: 'SwissLeadFinder',
                    href: 'https://swissleadfinder.ch/it',
                    logo: '/logos/swissleadfinder.png',
                    fullBleed: false,
                    padClass: 'p-2.5',
                    wordmarkClass: 'text-[#0F172A] dark:text-white'
                  },
                  {
                    name: 'KarePet',
                    href: 'https://karepet.app/en/',
                    logo: '/logos/karepet.png',
                    fullBleed: true,
                    padClass: '',
                    wordmarkClass: 'text-[#4A6B53] dark:text-emerald-300'
                  },
                  {
                    name: 'EdilFree',
                    href: 'https://edilfree.vercel.app/',
                    logo: '/logos/edilfree.svg',
                    fullBleed: true,
                    padClass: '',
                    wordmarkClass: 'text-[#2563EB] dark:text-blue-400'
                  },
                  {
                    name: 'ReviewDesk',
                    href: 'https://reviewdesk.ai.studio/',
                    logo: '/logos/reviewdesk.jpg',
                    fullBleed: false,
                    padClass: 'p-2',
                    wordmarkClass: 'text-[#16365B] dark:text-slate-100'
                  },
                  {
                    name: 'CuraFamily',
                    href: 'https://curafamily.ch/it',
                    logo: '/logos/curafamily.png',
                    fullBleed: false,
                    padClass: 'p-1',
                    wordmarkClass: 'text-[#047857] dark:text-emerald-400'
                  }
                ];

                return (
                  <div
                    key={copyIndex}
                    aria-hidden={copyIndex === 1}
                    className={`flex items-center shrink-0 gap-10 sm:gap-14 pr-10 sm:pr-14 ${copyIndex === 1 ? 'logo-carousel-duplicate' : ''}`}
                  >
                    {partners.map((item) => (
                      <a
                        key={`${copyIndex}-${item.href}`}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={copyIndex === 1 ? -1 : undefined}
                        className="group inline-flex items-center gap-3.5 shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
                      >
                        <span
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-sm ${
                            item.fullBleed
                              ? ''
                              : `bg-white border border-slate-200/80 dark:border-slate-700/60 ${item.padClass}`
                          }`}
                        >
                          <img
                            src={item.logo}
                            alt={copyIndex === 0 ? `${item.name} logo` : ''}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            className={`w-full h-full ${item.fullBleed ? 'object-cover' : 'object-contain'}`}
                          />
                        </span>
                        <span className={`text-lg sm:text-xl font-bold font-display tracking-tight whitespace-nowrap transition-opacity group-hover:opacity-80 ${item.wordmarkClass}`}>
                          {item.name}
                        </span>
                      </a>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="faq" className="py-24 max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-950 dark:text-white">Domande frequenti</h2>
            <p className="text-slate-500 dark:text-slate-400">Tutto quello che devi sapere prima di iniziare.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "I partecipanti devono creare un account?",
                a: "Sì, per garantire l'integrità del voto e la tracciabilità delle decisioni, utilizziamo l'autenticazione Google. Questo impedisce voti doppi o non autorizzati."
              },
              {
                q: "È possibile esportare i risultati?",
                a: "Assolutamente. Ogni votazione conclusa può essere esportata in formato PDF (per verbali ufficiali) o CSV (per analisi dati in Excel) con un semplice clic."
              },
              {
                q: "Come vengono gestiti i dati aziendali?",
                a: "I dati sono archiviati su Firebase Firestore con regole di sicurezza che permettono l'accesso solo agli utenti autorizzati. Non condividiamo mai i dati con terze parti."
              },
              {
                q: "Funziona anche su smartphone?",
                a: "Sì, easy decision è completamente responsive. Il tuo team può votare comodamente da desktop, tablet o smartphone senza dover installare alcuna app."
              },
              {
                q: "Posso cambiare il mio voto?",
                a: "No. Per mantenere la trasparenza e la validità statistica del processo decisionale, una volta che un voto viene inviato non può essere modificato."
              }
            ].map((faq, idx) => (
              <details
                key={idx}
                className={`border rounded-2xl overflow-hidden group transition ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
              >
                <summary className="w-full px-6 py-4 text-left font-bold text-sm flex items-center justify-between cursor-pointer list-none">
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section id="cta-final" className="py-24 px-6">
          <div className={`max-w-4xl mx-auto rounded-[3rem] p-12 md:p-20 text-center space-y-10 border ${isDark ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-white shadow-2xl shadow-slate-900/20'}`}>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight leading-tight">
              Pronti a decidere in pochi minuti?
            </h2>
            <p className="text-lg opacity-80 max-w-xl mx-auto">
              Unisciti ai team che hanno già eliminato il caos decisionale. Crea la tua prima votazione oggi stesso.
            </p>
            <div className="pt-4">
              <button
                onClick={() => handleCtaClick('final_cta')}
                className={`px-10 py-5 rounded-2xl font-bold text-lg transition shadow-xl inline-flex items-center gap-3 group ${isDark ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/25'}`}
              >
                Provalo gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer 
        isDark={isDark} 
        onViewPrivacy={() => openLegal('privacy')}
        onViewCookies={() => openLegal('cookie')}
      />

      <LegalModal 
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })}
        type={legalModal.type}
        isDark={isDark}
      />

      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <button
          onClick={() => handleCtaClick('mobile_sticky')}
          className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-2 border border-blue-500"
        >
          Provalo gratis <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

