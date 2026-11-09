import React, { useState, useEffect } from 'react';
import { 
  Vote, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  Star, 
  Users, 
  BarChart3, 
  FileText,
  LogIn,
  Check,
  Share2,
  Trophy,
  PieChart,
  Calendar,
  Download
} from 'lucide-react';

interface HomePageProps {
  onLoginSuccess: (username: string) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onLoginSuccess, isDark, toggleDarkMode }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('verdict2026');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "Verdict | Software per decisioni di team: votazioni e sondaggi online";
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Inserisci username e password validi.');
      return;
    }
    onLoginSuccess(username.trim());
  };

  const handleQuickDemo = () => {
    setUsername('admin');
    setPassword('verdict2026');
    onLoginSuccess('Admin Verdict');
  };

  const faqs = [
    {
      q: "Cos'è Verdict e come funziona?",
      a: "Verdict è una piattaforma progettata per agevolare le decisioni collettive all'interno dei team aziendali. Funziona permettendo agli utenti di creare proposte di voto strutturate, raccogliere feedback in tempo reale dai collaboratori e visualizzare i risultati in modo chiaro e analitico per raggiungere un verdetto condiviso."
    },
    {
      q: "Quali tipi di votazione posso creare?",
      a: "La piattaforma offre massima flessibilità permettendo di creare votazioni a scelta singola per decisioni rapide, scelta multipla per opzioni complesse, sondaggi sì/no per approvazioni immediate e valutazioni a stelle per misurare il gradimento o la priorità di specifici progetti o idee del team."
    },
    {
      q: "Come condivido una votazione con il team?",
      a: "Una volta creata la proposta nella dashboard, puoi condividere il link diretto con i tuoi colleghi. Non è richiesta la creazione di account reali per questa demo, rendendo il processo di partecipazione immediato e accessibile a tutti i membri del gruppo di lavoro coinvolti."
    },
    {
      q: "Posso esportare i risultati?",
      a: "Certamente. Verdict include funzionalità avanzate di esportazione che consentono di generare report professionali in formato PDF o scaricare i dati grezzi in formato CSV. Questo è ideale per archiviare i processi decisionali o presentare i risultati durante le riunioni di coordinamento aziendale."
    },
    {
      q: "Come funzionano le scadenze?",
      a: "Ogni votazione può essere impostata con una scadenza temporale specifica. Il sistema monitora il tempo rimanente in tempo reale, chiudendo automaticamente la raccolta dei voti una volta raggiunto il limite stabilito, garantendo così che le decisioni vengano prese entro i tempi necessari al business."
    },
    {
      q: "Posso allegare immagini o documenti?",
      a: "Sì. Quando crei una votazione puoi allegare fino a 3 file (immagini, PDF, documenti Word o file di testo), da massimo 1 MB ciascuno. Gli allegati sono visibili a tutti nella pagina di dettaglio della decisione."
    },
    {
      q: "Dove vengono salvati i dati?",
      a: "In questa versione dell'applicazione, tutti i dati vengono salvati esclusivamente nel localStorage del tuo browser. Ciò significa che le tue decisioni e preferenze rimangono sul tuo dispositivo e non vengono trasmesse a server esterni, garantendo un'esperienza di utilizzo rapida e privata per la demo."
    },
    {
      q: "Verdict è gratuito?",
      a: "Sì, l'accesso a questa versione demo di Verdict è completamente gratuito e non richiede sottoscrizioni o inserimento di dati di pagamento. Puoi testare tutte le funzionalità di creazione votazioni, gestione team ed esportazione risultati senza alcun costo, esplorando il potenziale dello strumento per la tua azienda."
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
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">Dashboard Decisionale</span>
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
            <a
              href="#login-section"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" /> Accedi Ora
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section aria-labelledby="hero-title" className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Piattaforma di Decision Making aziendale
            </div>
            <h1 id="hero-title" className="text-4xl md:text-6xl font-display font-extrabold tracking-tight leading-tight">
              Il software per <span className="text-blue-600">decisioni di team e votazioni online</span>
            </h1>
            <p className={`text-base md:text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Verdict centralizza sondaggi aziendali, votazioni a scelta multipla e decisioni di gruppo in un'unica interfaccia elegante. Gestisci la governance del tuo team con trasparenza e velocità.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" /> Scadenze in tempo reale
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" /> Esportazione PDF & CSV
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" /> Gestione Team Integrata
              </div>
            </div>
          </div>

          {/* Login Box Card */}
          <div id="login-section" className="md:col-span-5">
            <section aria-labelledby="login-title" className={`p-8 rounded-3xl border shadow-xl ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="mb-6">
                <h2 id="login-title" className="text-xl font-bold tracking-tight mb-1">Area Riservata</h2>
                <p className="text-xs text-gray-500">Accedi con le tue credenziali per entrare nella dashboard</p>
              </div>

              {error && (
                <div role="alert" className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Username / Email</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="es. admin"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Entra nella Dashboard <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                  <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase tracking-widest">oppure</span>
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                </div>

                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className={`w-full py-3 px-4 rounded-xl border font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${isDark ? 'border-gray-800 hover:bg-gray-800 text-gray-200' : 'border-gray-200 hover:bg-100 text-gray-700'}`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" /> Accesso Rapido Demo (1 Click)
                </button>
              </form>
            </section>
          </div>
        </section>

        {/* Come funziona Section */}
        <section aria-labelledby="how-it-works-title" className={`py-20 border-t ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-100/70 border-gray-200'}`}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 id="how-it-works-title" className="text-3xl font-display font-bold">Come funziona</h2>
              <p className="text-sm text-gray-500">Ottimizza i processi decisionali della tua azienda in 3 semplici passi.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-xs space-y-4`}>
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h3 className="text-lg font-bold">Crea la proposta</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Definisci il titolo, la categoria, le opzioni di voto (singola, multipla o a stelle) e imposta la scadenza temporale per il tuo team.
                </p>
              </div>

              <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-xs space-y-4`}>
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h3 className="text-lg font-bold">Condividi il link</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Invia il link diretto ai membri del tuo team. Possono votare in tempo reale e visualizzare le percentuali aggiornate istantaneamente.
                </p>
              </div>

              <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-xs space-y-4`}>
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h3 className="text-lg font-bold">Ottieni il verdetto</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Analizza i risultati finali, esporta il report in formato PDF o CSV e raggiungi una decisione di gruppo basata sui dati reali.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Funzionalità Section */}
        <section aria-labelledby="features-title" className="py-20 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 id="features-title" className="text-3xl font-display font-bold">Funzionalità</h2>
            <p className="text-sm text-gray-500">Strumenti professionali per sondaggi aziendali e governance efficace.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} space-y-3`}>
              <Check className="w-6 h-6 text-blue-600" aria-hidden="true" />
              <h3 className="font-bold">Scelta singola</h3>
              <p className="text-xs text-gray-500">Ideale per decisioni rapide dove è necessario selezionare un'unica opzione tra diverse alternative proposte.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} space-y-3`}>
              <Users className="w-6 h-6 text-blue-600" aria-hidden="true" />
              <h3 className="font-bold">Scelta multipla</h3>
              <p className="text-xs text-gray-500">Permette ai membri del team di selezionare più opzioni, utile per definire priorità o preferenze articolate.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} space-y-3`}>
              <Trophy className="w-6 h-6 text-blue-600" aria-hidden="true" />
              <h3 className="font-bold">Sì / No</h3>
              <p className="text-xs text-gray-500">Sondaggi binari per approvazioni veloci, workflow di accettazione o conferme dirette su singole proposte.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} space-y-3`}>
              <Star className="w-6 h-6 text-blue-600" aria-hidden="true" />
              <h3 className="font-bold">Valutazione a stelle</h3>
              <p className="text-xs text-gray-500">Misura il gradimento di un'idea o la qualità di un progetto con un sistema di rating da 1 a 5 stelle.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} space-y-3`}>
              <Calendar className="w-6 h-6 text-blue-600" aria-hidden="true" />
              <h3 className="font-bold">Scadenze in tempo reale</h3>
              <p className="text-xs text-gray-500">Imposta limiti temporali precisi. Il sistema chiude automaticamente le votazioni al termine del periodo stabilito.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} space-y-3`}>
              <Download className="w-6 h-6 text-blue-600" aria-hidden="true" />
              <h3 className="font-bold">Export PDF e CSV</h3>
              <p className="text-xs text-gray-500">Scarica report dettagliati per documentare ogni decisione di team e mantenere uno storico aziendale ordinato.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section aria-labelledby="faq-title" className="py-20 max-w-4xl mx-auto px-6">
          <div className="text-center mb-12 space-y-2">
            <h2 id="faq-title" className="text-3xl font-display font-bold">Domande Frequenti (FAQ)</h2>
            <p className="text-sm text-gray-500">Tutto quello che devi sapere su Verdict e le decisioni di team.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className={`border rounded-2xl overflow-hidden group transition ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
              >
                <summary className="w-full px-6 py-4 text-left font-bold text-sm flex items-center justify-between cursor-pointer list-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="px-6 pb-5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`py-12 border-t text-center ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-blue-600" aria-hidden="true" />
              <span className="font-display font-bold text-lg">Verdict</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md md:text-right">
              La piattaforma sicura per decisioni di team, votazioni online e governance aziendale trasparente. 
              Ottimizza il lavoro di gruppo e raggiungi verdetti condivisi in tempo reale.
            </p>
          </div>
          <div className="pt-8 border-t border-gray-100 dark:border-gray-900 text-xs text-gray-500 uppercase tracking-widest">
            © 2026 Verdict Collettivo. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  );
};
