import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, ExternalLink, Copy, Check, X, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

interface AuthDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryRedirect: () => void;
  errorDetails?: {
    code: string;
    message: string;
  };
}

export const AuthDomainModal: React.FC<AuthDomainModalProps> = ({
  isOpen,
  onClose,
  onTryRedirect,
  errorDetails
}) => {
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedProjectId, setCopiedProjectId] = useState(false);

  if (!isOpen) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  const consoleUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

  const copyToClipboard = (text: string, type: 'domain' | 'project') => {
    navigator.clipboard.writeText(text);
    if (type === 'domain') {
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    } else {
      setCopiedProjectId(true);
      setTimeout(() => setCopiedProjectId(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-3xl shadow-2xl relative z-10 border border-amber-200 dark:border-amber-900/50 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-5 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-900/30 px-2 py-0.5 rounded-full text-amber-100 border border-amber-400/30">
                  Configurazione Vercel + Firebase
                </span>
                <h2 className="text-xl font-bold font-display leading-tight mt-0.5">
                  Dominio Vercel da Autorizzare
                </h2>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Perché "Accedi con Google" non funziona su Vercel?</p>
                  <p className="mt-1 leading-relaxed opacity-90">
                    Per motivi di sicurezza, Firebase blocca i tentativi di autenticazione da domini esterni non inseriti nell'elenco dei <strong>Domini Autorizzati</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Data Copy Box */}
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-gray-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Il tuo dominio Vercel corrente</span>
                    <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-100">{currentDomain}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(currentDomain, 'domain')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer"
                  >
                    {copiedDomain ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" /> Copiato!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copia Dominio
                      </>
                    )}
                  </button>
                </div>

                <div className="border-t border-slate-200 dark:border-gray-700 pt-2.5 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. ID Progetto Firebase</span>
                    <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-100">{projectId}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(projectId, 'project')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-medium transition shrink-0 cursor-pointer"
                  >
                    {copiedProjectId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiedProjectId ? 'Copiato' : 'Copia ID'}
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Come risolvere in 1 minuto (Solo la prima volta)
              </h3>

              <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-3 bg-white dark:bg-gray-800/40 p-3 rounded-xl border border-slate-100 dark:border-gray-800">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span>Apri il pannello <strong>Firebase Console</strong> per il progetto <code className="bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-[11px]">{projectId}</code>.</span>
                </li>

                <li className="flex items-start gap-3 bg-white dark:bg-gray-800/40 p-3 rounded-xl border border-slate-100 dark:border-gray-800">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span>Nel menu a sinistra vai su <strong>Authentication</strong> &rarr; scheda <strong>Settings (Impostazioni)</strong> &rarr; <strong>Authorized domains (Domini autorizzati)</strong>.</span>
                </li>

                <li className="flex items-start gap-3 bg-white dark:bg-gray-800/40 p-3 rounded-xl border border-slate-100 dark:border-gray-800">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <span>Clicca su <strong>Add domain (Aggiungi dominio)</strong> e incolla <code className="bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-[11px] text-blue-600 dark:text-blue-400">{currentDomain}</code>.</span>
                </li>

                <li className="flex items-start gap-3 bg-white dark:bg-gray-800/40 p-3 rounded-xl border border-slate-100 dark:border-gray-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                  <span>Salva le modifiche. L'accesso con Google funzionerà immediatamente per tutti gli utenti su Vercel!</span>
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <a
                href={consoleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                Apri Firebase Console <ExternalLink className="w-4 h-4" />
              </a>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={onTryRedirect}
                  className="flex-1 py-2.5 px-3 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-gray-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Prova Login con Redirect
                </button>
                <button
                  onClick={onClose}
                  className="py-2.5 px-4 bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
