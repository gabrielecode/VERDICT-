import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Vote, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown, 
  Star, 
  Users, 
  BarChart3, 
  FileText,
  Mail,
  LogIn
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
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Inserisci username e password validi.');
      return;
    }
    // Simple authentication check (accepts any non-empty credentials or default demo)
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
      a: "Verdict è la piattaforma collaborativa per la gestione di decisioni aziendali, sondaggi di team e votazioni ponderate. Permette ai team di creare votazioni con opzioni singole, multiple o a stelle, impostare scadenze e analizzare i risultati in tempo reale."
    },
    {
      q: "Quali credenziali devo usare per accedere?",
      a: "Puoi accedere inserendo qualsiasi username e password (es. utente: admin, psw: verdict2026) oppure cliccando sul pulsante di Accesso Rapido Demo."
    },
    {
      q: "Come vengono salvati i dati?",
      a: "Tutti i dati delle decisioni, dei membri del team e delle preferenze (incluso il Dark Mode) vengono salvati in modo sicuro nel LocalStorage del browser e persistono tra le sessioni."
    },
    {
      q: "Posso esportare o condividere i risultati?",
      a: "Sì! All'interno di ogni dettaglio decisione puoi esportare istantaneamente il report in formato PDF o inviare i risultati aggiornati tramite email."
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900'} font-sans selection:bg-blue-100 selection:text-blue-900`}>
      {/* Top Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${isDark ? 'bg-gray-950/85 border-gray-800' : 'bg-white/85 border-gray-200'} px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Vote className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight block">Verdict</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">Dashboard Decisionale</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-xl border transition ${isDark ? 'border-gray-800 bg-gray-900 text-amber-400 hover:bg-gray-800' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
            title="Cambia Tema"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <a
            href="#login-section"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" /> Accedi Ora
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Piattaforma di Decision Making aziendale
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight leading-tight">
            Prendi decisioni di team <span className="text-blue-600">chiare e condivise</span>
          </h1>
          <p className={`text-base md:text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Verdict centralizza sondaggi, votazioni a scelta multipla, valutazioni a stelle e governance aziendale in un'unica interfaccia elegante, protetta e reattiva.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Scadenze in tempo reale
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Esportazione PDF & Email
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gestione Team Integrata
            </div>
          </div>
        </div>

        {/* Login Box Card */}
        <div id="login-section" className="md:col-span-5">
          <div className={`p-8 rounded-3xl border shadow-xl ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight mb-1">Area Riservata</h2>
              <p className="text-xs text-gray-500">Accedi con le tue credenziali per entrare nella dashboard</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Username / Email</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
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
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
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
                Entra nella Dashboard <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                <span className="flex-shrink mx-4 text-[10px] text-gray-400 uppercase tracking-widest">oppure</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              </div>

              <button
                type="button"
                onClick={handleQuickDemo}
                className={`w-full py-3 px-4 rounded-xl border font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${isDark ? 'border-gray-800 hover:bg-gray-800 text-gray-200' : 'border-gray-200 hover:bg-gray-100 text-gray-700'}`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" /> Accesso Rapido Demo (1 Click)
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Instructions & Features */}
      <section className={`py-20 border-t ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-100/70 border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Guida e Funzionalità</h2>
            <h3 className="text-3xl font-display font-bold">Come utilizzare Verdict in 3 semplici passi</h3>
            <p className="text-sm text-gray-500">Ottimizza i processi decisionali della tua azienda con strumenti progettati per la massima trasparenza.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-xs space-y-4`}>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h4 className="text-lg font-bold">Crea una Decisione</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Definisci il titolo, la categoria (Design, Prodotto, HR, Finanza), le opzioni di voto (singola, multipla o a stelle) e la scadenza temporale.
              </p>
            </div>

            <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-xs space-y-4`}>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h4 className="text-lg font-bold">Esprimi il tuo Voto</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                I membri del team possono votare in tempo reale, visualizzare le percentuali con overlay dinamici e lasciare commenti di discussione.
              </p>
            </div>

            <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-xs space-y-4`}>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h4 className="text-lg font-bold">Analizza e Condividi</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Scarica il report ufficiale in formato PDF, invia i risultati via email o gestisci i ruoli aziendali dal pannello amministrativo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Supporto</h2>
          <h3 className="text-3xl font-display font-bold">Domande Frequenti (FAQ)</h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`border rounded-2xl overflow-hidden transition ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left font-bold text-sm flex items-center justify-between cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 border-t text-center text-xs text-gray-400 ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}`}>
        <p>© 2026 Verdict Collettivo. Tutti i diritti riservati. Piattaforma sicura per decisioni di team.</p>
      </footer>
    </div>
  );
};
