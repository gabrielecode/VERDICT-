import React from 'react';
import { ArrowUpRight, Check, MapPin, ShieldCheck, Zap } from 'lucide-react';

interface ConnectCreateSectionProps {
  isDark: boolean;
}

const SHOWCASE_APPS = [
  {
    name: 'Pratiko',
    area: 'Piattaforma digitale · Svizzera',
    logo: '/logos/pratiko.webp',
    alt: 'Logo di Pratiko, web app sviluppata da Connect & Create',
    padClass: 'p-1'
  },
  {
    name: 'CuraFamily',
    area: 'Servizi per famiglie · Svizzera',
    logo: '/logos/curafamily.png',
    alt: 'Logo di CuraFamily, piattaforma attiva in Svizzera',
    padClass: 'p-1'
  },
  {
    name: 'SwissLeadFinder',
    area: 'B2B Lead Intelligence · Ticino',
    logo: '/logos/swissleadfinder.png',
    alt: 'Logo di SwissLeadFinder, applicazione web svizzera',
    padClass: 'p-1.5'
  }
];

export const ConnectCreateSection: React.FC<ConnectCreateSectionProps> = ({ isDark }) => {
  return (
    <section
      aria-labelledby="connect-create-heading"
      className={`border-t transition-colors ${
        isDark ? 'border-gray-800 bg-blue-950/15' : 'border-slate-200 bg-blue-600/[0.04]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Copy & Primary CTA */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-700 dark:text-blue-400">
              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Connect &amp; Create · Morbio Inferiore, Ticino</span>
            </div>

            <h2
              id="connect-create-heading"
              className={`text-2xl md:text-4xl font-display font-bold tracking-tight leading-tight [text-wrap:balance] ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              La tecnologia di EasyDecision? È di casa in Ticino.
            </h2>

            <h3
              className={`text-lg md:text-xl font-display font-semibold leading-snug ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              Connect &amp; Create sviluppa l’app. Lo stesso rigore tecnico può essere al servizio del tuo business.
            </h3>

            <p className={`text-sm md:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              EasyDecision è stata ideata, progettata e sviluppata da Connect &amp; Create, una web agency con base a Morbio Inferiore che lavora con aziende, studi e artigiani in tutto il Canton Ticino. La filosofia è la stessa che vedi in questa applicazione: meno attrito, più risultati concreti. Codice pulito, tempi di caricamento sotto i 2 secondi, attenzione alla privacy (nLPD) e un’interfaccia che non richiede manuali.
            </p>

            <div className="space-y-3 pt-1">
              <p className={`text-sm md:text-base font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Se stai cercando un partner per il tuo prossimo progetto digitale, Connect &amp; Create offre:
              </p>

              <ul className={`space-y-2.5 text-sm md:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                  </span>
                  <span>
                    <strong className={isDark ? 'text-white font-semibold' : 'text-slate-950 font-semibold'}>
                      Siti web professionali
                    </strong>{' '}
                    – landing page, siti vetrina e e-commerce pronti per Google e smartphone, online in 7-14 giorni.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                  </span>
                  <span>
                    <strong className={isDark ? 'text-white font-semibold' : 'text-slate-950 font-semibold'}>
                      SEO locale e GEO
                    </strong>{' '}
                    – per essere trovato da chi cerca i tuoi servizi a Lugano, Mendrisio, Bellinzona o Locarno, e per farti citare anche da ChatGPT e Google AI.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                  </span>
                  <span>
                    <strong className={isDark ? 'text-white font-semibold' : 'text-slate-950 font-semibold'}>
                      Sviluppo di app e piattaforme
                    </strong>{' '}
                    – come EasyDecision, Pratiko, CuraFamily e altre web app attive in Svizzera.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <a
                href="https://sititicino.ch/?utm_source=easydecision&utm_medium=referral&utm_campaign=sviluppato_da"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 min-h-[48px] rounded-md bg-slate-950 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-sm md:text-base transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
              >
                <span>Visita sititicino.ch e richiedi un preventivo gratuito</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Right Column: Visual Showcase using existing assets */}
          <div className="lg:col-span-5">
            <div
              className={`border p-6 md:p-7 space-y-6 ${
                isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-gray-800">
                <div className="space-y-0.5">
                  <span className={`text-xs font-mono block ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                    Web Agency · Canton Ticino
                  </span>
                  <p className={`font-display font-bold text-lg ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    Connect &amp; Create
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 border ${
                    isDark ? 'border-gray-800 bg-gray-900 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <span>nLPD</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-3.5 border ${
                    isDark ? 'border-gray-800 bg-gray-900/60' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-mono text-blue-600 dark:text-blue-400 mb-1">
                    <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Velocità</span>
                  </div>
                  <p className={`font-display font-bold text-base ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    &lt; 2 secondi
                  </p>
                </div>
                <div
                  className={`p-3.5 border ${
                    isDark ? 'border-gray-800 bg-gray-900/60' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-1">
                    Consegna siti
                  </div>
                  <p className={`font-display font-bold text-base ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    7–14 giorni
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Piattaforme attive sviluppate in Svizzera
                </p>
                <div className={`border divide-y ${isDark ? 'border-gray-800 divide-gray-800' : 'border-slate-200 divide-slate-200'}`}>
                  {SHOWCASE_APPS.map((app) => (
                    <div key={app.name} className="px-3.5 py-2.5 flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 overflow-hidden bg-white ${
                          isDark ? 'border-gray-700' : 'border-slate-200'
                        } ${app.padClass}`}
                      >
                        <img
                          src={app.logo}
                          alt={app.alt}
                          loading="lazy"
                          className="w-full h-full object-contain"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className={`text-sm font-display font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                          {app.name}
                        </p>
                        <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {app.area}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
