import React, { useEffect } from 'react';
import { 
  Vote, 
  Sparkles, 
  ChevronDown, 
  Star, 
  Users, 
  LogIn,
  Check,
  Calendar,
  Download,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  MessageSquare
} from 'lucide-react';
import { Footer } from './Footer';
import { LegalModal } from './LegalModal';

interface HomePageProps {
  onLoginSuccess: () => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onLoginSuccess, isDark, toggleDarkMode }) => {
  useEffect(() => {
    document.title = "Verdict | Software per decisioni di team: votazioni e sondaggi online";
  }, []);

  const [legalModal, setLegalModal] = React.useState<{ isOpen: boolean; type: 'privacy' | 'cookie' }>({
    isOpen: false,
    type: 'privacy'
  });

  const openLegal = (type: 'privacy' | 'cookie') => {
    setLegalModal({ isOpen: true, type });
  };

  const faqs = [
    {
      q: "Cos'è Verdict e come funziona?",
      a: "Verdict è una piattaforma progettata per agevolare le decisioni collettive all'interno dei team aziendali. Funziona permettendo agli utenti di creare proposte di voto strutturate, raccogliere feedback in tempo reale dai collaboratori e visualizzare i risultati in modo chiaro."
    },
    {
      q: "Quali tipi di votazione posso creare?",
      a: "La piattaforma offre massima flessibilità permettendo di creare votazioni a scelta singola, scelta multipla, sondaggi sì/no e valutazioni a stelle per misurare il gradimento o la priorità."
    },
    {
      q: "È necessaria la registrazione?",
      a: "Sì, per garantire l'integrità dei voti e la collaborazione in tempo reale, Verdict utilizza l'autenticazione Google. Questo permette di identificare i partecipanti e gestire i permessi all'interno del team."
    },
    {
      q: "Dove vengono salvati i dati?",
      a: "Tutti i dati sono archiviati in modo sicuro su un database relazionale Postgres (Cloud SQL), garantendo la persistenza e l'integrità dei dati per il tuo team."
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
              <span className="font-display font-bold text-xl tracking-tight block">Verdict</span>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">SQL Cloud</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl border transition ${isDark ? 'border-gray-800 bg-gray-900 text-amber-400 hover:bg-gray-800' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              aria-label="Cambia Tema"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={onLoginSuccess}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Accedi con Google
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Ora con sincronizzazione Cloud Real-time
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight leading-tight">
              Decidi insieme al tuo team <span className="text-blue-600">in tempo reale</span>
            </h1>
            <p className={`text-base md:text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Verdict è la piattaforma professionale per la governance dei team. Crea proposte, raccogli voti e discuti i bivi decisionali in un ambiente sicuro e trasparente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={onLoginSuccess}
                className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                Inizia ora gratis <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex -space-x-3 items-center ml-2">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-950 shadow-sm" alt="User" />
                ))}
                <span className={`pl-5 text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>+500 decisioni prese</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className={`p-6 rounded-3xl border shadow-2xl ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} space-y-6 relative z-10`}>
              <div className="flex items-center justify-between border-b dark:border-gray-800 pb-4">
                 <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black uppercase tracking-widest">Dashboard Preview</span>
                 </div>
                 <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                 </div>
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200'} space-y-2`}>
                   <div className="h-2 w-24 bg-blue-600/20 rounded-full mb-3" />
                   <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
                   <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div className="h-20 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                   </div>
                   <div className="h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                   </div>
                </div>
              </div>

              <div className="pt-2">
                <button onClick={onLoginSuccess} className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-blue-600 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4" /> Accedi per sbloccare
                </button>
              </div>
            </div>
            {/* Background decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-600/10 blur-3xl rounded-full" />
          </div>
        </section>

        <section className={`py-20 border-t ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-100/70 border-gray-200'}`}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                 <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold">Sicuro</h3>
                 <p className="text-xs text-gray-500">Autenticazione Google e permessi granulari per il team.</p>
              </div>
              <div className="space-y-3">
                 <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold">Collaborativo</h3>
                 <p className="text-xs text-gray-500">Commenta e discuti ogni proposta in tempo reale.</p>
              </div>
              <div className="space-y-3">
                 <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold">Organizzato</h3>
                 <p className="text-xs text-gray-500">Gestisci scadenze e archivia i verdetti passati.</p>
              </div>
              <div className="space-y-3">
                 <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <Download className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold">Esportabile</h3>
                 <p className="text-xs text-gray-500">Genera report in PDF e CSV per i tuoi meeting.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 max-w-4xl mx-auto px-6">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-3xl font-display font-bold">FAQ</h2>
            <p className="text-sm text-gray-500">Risposte alle domande più comuni.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className={`border rounded-2xl overflow-hidden group transition ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
              >
                <summary className="w-full px-6 py-4 text-left font-bold text-sm flex items-center justify-between cursor-pointer list-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
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
    </div>
  );
};
