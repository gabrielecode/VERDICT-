import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Cookie, FileText } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'cookie';
  isDark: boolean;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type, isDark }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl relative z-10 border ${
              isDark ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  {type === 'privacy' ? <Shield className="w-5 h-5 text-blue-600" /> : <Cookie className="w-5 h-5 text-amber-600" />}
                </div>
                <h2 className="text-lg font-bold font-display">
                  {type === 'privacy' ? 'Privacy Policy' : 'Cookie Policy'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm leading-relaxed">
              {type === 'privacy' ? (
                <div className="space-y-4">
                  <section>
                    <h3 className="font-bold text-base mb-2">1. Informazioni Generali</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      In conformità alla Legge Federale sulla Protezione dei Dati (LPD) svizzera e al Regolamento Generale sulla Protezione dei Dati (GDPR) dell'UE, questa informativa descrive come raccogliamo e trattiamo i tuoi dati personali.
                    </p>
                  </section>
                  <section>
                    <h3 className="font-bold text-base mb-2">2. Raccolta dei Dati</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Raccogliamo i dati forniti tramite l'autenticazione Google (Nome, Email, Foto Profilo) necessari per il funzionamento del servizio e la gestione delle votazioni nel team.
                    </p>
                  </section>
                  <section>
                    <h3 className="font-bold text-base mb-2">3. Finalità del Trattamento</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      I dati vengono utilizzati esclusivamente per:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-500 dark:text-gray-400">
                      <li>Identificare l'autore delle proposte e dei voti.</li>
                      <li>Prevenire abusi e votazioni multiple non autorizzate.</li>
                      <li>Gestire la sicurezza dell'accesso tramite Google Auth.</li>
                    </ul>
                  </section>
                  <section>
                    <h3 className="font-bold text-base mb-2">4. Trasferimento e Sicurezza</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      I dati sono memorizzati su infrastrutture cloud sicure gestite da Google (Firebase Firestore). Non vendiamo né cediamo i tuoi dati a terzi per scopi commerciali.
                    </p>
                  </section>
                  <section>
                    <h3 className="font-bold text-base mb-2">5. I Tuoi Diritti</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Hai il diritto di accedere, rettificare o cancellare i tuoi dati in qualsiasi momento. Per esercitare questi diritti, puoi contattarci o gestire il tuo profilo tramite l'account Google collegato.
                    </p>
                  </section>
                </div>
              ) : (
                <div className="space-y-4">
                  <section>
                    <h3 className="font-bold text-base mb-2">Informativa sui Cookie</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Utilizziamo esclusivamente cookie tecnici necessari per il corretto funzionamento dell'applicazione.
                    </p>
                  </section>
                  <section>
                    <h3 className="font-bold text-base mb-2">Cookie Utilizzati</h3>
                    <div className="space-y-3">
                      <div className={`p-3 rounded-xl border ${isDark ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-xs uppercase tracking-wider">Session Token</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Essenziale per mantenere l'accesso dell'utente durante la sessione.</p>
                      </div>
                      <div className={`p-3 rounded-xl border ${isDark ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-xs uppercase tracking-wider">User Preferences</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Utilizzato per memorizzare preferenze come il tema (Dark/Light mode).</p>
                      </div>
                    </div>
                  </section>
                  <section>
                    <h3 className="font-bold text-base mb-2">Gestione</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Poiché utilizziamo solo cookie strettamente necessari, non è richiesto il consenso preventivo secondo le normative svizzere (LPD) ed europee (ePrivacy Directive). Puoi comunque disabilitarli dalle impostazioni del browser, ma l'app potrebbe non funzionare correttamente.
                    </p>
                  </section>
                </div>
              )}
            </div>

            <div className={`p-6 border-t flex justify-end ${isDark ? 'border-gray-800 bg-gray-950/50' : 'border-gray-100 bg-gray-50'}`}>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md"
              >
                Ho capito
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
