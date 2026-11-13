import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'sidebar';
  isDark?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact', isDark = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={
          variant === 'sidebar'
            ? `w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer min-h-[44px] whitespace-nowrap ${
                isDark
                  ? 'border-gray-700 bg-gray-900 text-slate-200 hover:bg-gray-800'
                  : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
              }`
            : 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer min-h-[40px] whitespace-nowrap shrink-0'
        }
      >
        <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Installa app</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={
            variant === 'sidebar'
              ? `w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer min-h-[44px] whitespace-nowrap ${
                  isDark
                    ? 'border-gray-700 bg-gray-900 text-slate-200 hover:bg-gray-800'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`
              : `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition cursor-pointer min-h-[40px] whitespace-nowrap shrink-0 ${
                  isDark
                    ? 'border-gray-700 bg-gray-900 text-slate-200 hover:bg-gray-800'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`
          }
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Installa su iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="ios-install-title"
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-6 shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 id="ios-install-title" className="text-base font-display font-bold text-slate-950 dark:text-white">
                    Installa su iPhone e iPad
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Usa Easy Decision come app a schermo intero da Safari.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Chiudi finestra"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <ol className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <Share className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    1. Tocca il pulsante <strong>Condividi</strong> nella barra di Safari.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <PlusSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    2. Scorri verso il basso e tocca <strong>Aggiungi alla schermata Home</strong>.
                  </span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer min-h-[44px]"
              >
                Ho capito
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
