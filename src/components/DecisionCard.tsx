import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckSquare, MessageSquare, Globe, Lock, Shield, Copy, Check } from 'lucide-react';
import { Decision } from '../types';
import { getTimeRemaining, getCategoryStyles, formatDate, TimeRemaining } from '../utils';

interface DecisionCardProps {
  decision: Decision;
  onClick: () => void;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ decision, onClick }) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(getTimeRemaining(decision.deadline));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(decision.deadline));
    }, 30000); // update every 30 seconds is enough for card views

    return () => clearInterval(timer);
  }, [decision.deadline]);

  const totalVotes = decision.options.reduce((sum, opt) => sum + opt.votes, 0);
  const catStyles = getCategoryStyles(decision.category);

  // Status computation for visual badge
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
  let statusText = 'Attivo';

  if (timeLeft.status === 'expired') {
    badgeColor = 'bg-gray-100 text-gray-600 border-gray-200';
    statusText = 'Concluso';
  } else if (timeLeft.status === 'warning') {
    badgeColor = 'bg-red-50 text-red-600 border-red-200';
    statusText = 'In scadenza';
  }

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}?decisionId=${decision.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      id={`decision-card-${decision.id}`}
      layoutId={`card-container-${decision.id}`}
      whileHover={{ y: -4, boxShadow: '0 12px 30px -10px rgba(0,0,0,0.06)' }}
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full hover:border-blue-500 group"
    >
      {/* Subtle top decoration for category */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Top meta row */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${catStyles.bg} ${catStyles.text} ${catStyles.border}`}>
            {decision.category}
          </span>

          <div className="flex items-center gap-2">
            {decision.audience === 'public' ? (
              <Globe className="w-3.5 h-3.5 text-slate-400" title="Pubblico" />
            ) : decision.audience === 'private' ? (
              <Lock className="w-3.5 h-3.5 text-slate-400" title="Privato" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-slate-400" title="Riservato" />
            )}
            
            <span className={`text-xs font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
              {statusText}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-start mb-2 gap-2">
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 tracking-tight leading-snug hover:text-blue-600 transition-colors">
                {decision.title}
            </h3>
            <button 
                onClick={handleCopyLink}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition shrink-0"
                title="Copia link"
            >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>

        {/* Short Description */}
        <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-normal">
          {decision.description}
        </p>
      </div>

      <div>
        {/* Footer info: countdown, votes & participants */}
        <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
          {/* Stats indicators */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className={`w-4 h-4 ${timeLeft.status === 'expired' ? 'text-slate-400' : timeLeft.status === 'warning' ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
              <span className={timeLeft.status === 'expired' ? 'text-slate-400' : timeLeft.status === 'warning' ? 'text-red-600 font-semibold font-mono' : 'text-slate-600'}>
                {timeLeft.text}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <CheckSquare className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700">{totalVotes}</span>
              <span>{totalVotes === 1 ? 'voto' : 'voti'}</span>
            </div>
          </div>

          {/* User creator & participant stack */}
          <div className="flex items-center justify-between pt-1">
            {/* Creator info */}
            <div className="flex items-center gap-2">
              <img
                src={decision.creator.avatar}
                alt={decision.creator.name}
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover border border-slate-100"
              />
              <span className="text-xs text-slate-500 font-medium truncate max-w-[100px]">
                {decision.creator.name}
              </span>
            </div>

            {/* Participants stack */}
            {decision.participants.length > 0 && (
              <div className="flex items-center">
                <div className="flex -space-x-2 overflow-hidden">
                  {decision.participants.slice(0, 3).map((p, idx) => (
                    <img
                      key={idx}
                      className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-white object-cover"
                      src={p.avatar}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                    />
                  ))}
                  {decision.participants.length > 3 && (
                    <div className="flex items-center justify-center h-6.5 w-6.5 rounded-full bg-slate-100 ring-2 ring-white text-xs font-bold text-slate-500">
                      +{decision.participants.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
