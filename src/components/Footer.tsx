import React from 'react';
import {
  Vote,
  ExternalLink,
  Briefcase,
  TrendingUp,
  Target,
  PawPrint,
  Building2,
  Star,
  HeartHandshake
} from 'lucide-react';

interface FooterProps {
  isDark: boolean;
  onViewPrivacy?: () => void;
  onViewCookies?: () => void;
}

const PARTNER_LINKS = [
  { name: 'Pratiko', href: 'https://pratiko.ch/', icon: Briefcase },
  { name: 'RankUpList', href: 'https://rankuplist.com/', icon: TrendingUp },
  { name: 'SwissLeadFinder', href: 'https://swissleadfinder.ch/it', icon: Target },
  { name: 'KarePet', href: 'https://karepet.app/en/', icon: PawPrint },
  { name: 'EdilFree', href: 'https://edilfree.vercel.app/', icon: Building2 },
  { name: 'ReviewDesk', href: 'https://reviewdesk.ai.studio/', icon: Star },
  { name: 'CuraFamily', href: 'https://curafamily.ch/it', icon: HeartHandshake },
];

export const Footer: React.FC<FooterProps> = ({ isDark, onViewPrivacy, onViewCookies }) => {
  return (
    <footer className={`border-t py-8 px-6 transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-950 border-gray-800 text-gray-400' 
        : 'bg-white border-gray-200 text-gray-500'
    }`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Vote className="w-5 h-5 text-blue-600" />
              <span className={`font-display font-semibold text-lg tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>easy decision</span>
            </div>
            <p className="text-xs max-w-xs leading-relaxed">
              Piattaforma professionale per la governance e le decisioni di team. Trasparenza e collaborazione al servizio del tuo business.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <div className="flex flex-col gap-3">
              <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Legale</h4>
              <nav className="flex flex-col gap-2">
                <button 
                  onClick={onViewPrivacy}
                  className="text-xs hover:text-blue-600 transition-colors text-left"
                >
                  Privacy Policy (LPD & GDPR)
                </button>
                <button 
                  onClick={onViewCookies}
                  className="text-xs hover:text-blue-600 transition-colors text-left"
                >
                  Cookie Policy
                </button>
              </nav>
            </div>
            
            <div className="flex flex-col gap-3">
              <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Credits</h4>
              <div className="flex flex-col gap-2">
                <a 
                  href="https://sititicino.ch" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs hover:text-blue-600 transition-colors flex items-center gap-1.5"
                >
                  Creato da Connect & Create
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-8 pt-6 border-t ${isDark ? 'border-slate-900' : 'border-slate-100'}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Hanno scelto la chiarezza
            </span>
            <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2.5">
              {PARTNER_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-blue-600 ${
                    isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5 text-blue-600/80 group-hover:text-blue-600 transition-colors" />
                  <span>{item.name}</span>
                </a>
              ))}
            </div>
          </div>

          <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${isDark ? 'border-slate-900' : 'border-slate-100'}`}>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
              © {new Date().getFullYear()} easy decision · Tutti i diritti riservati.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              <span>Swiss Compliance</span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span>Standard Enforced</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
