import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, CheckSquare, Globe, Lock, Shield, Copy, Check } from 'lucide-react';
import { Decision } from '../types';
import { getTimeRemaining, getCategoryStyles, TimeRemaining } from '../utils';

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
    }, 30000);

    return () => clearInterval(timer);
  }, [decision.deadline]);

  const totalVotes = decision.options.reduce((sum, opt) => sum + opt.votes, 0);
  const catStyles = getCategoryStyles(decision.category);

  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30';
  let statusText = 'Attivo';

  if (timeLeft.status === 'expired') {
    badgeColor = 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    statusText = 'Concluso';
  } else if (timeLeft.status === 'warning') {
    badgeColor = 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30';
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
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between h-full hover:border-slate-400 dark:hover:border-slate-600 group shadow-sm"
    >
      <div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
          <span className={catStyles.text}>{decision.category}</span>
          <span aria-hidden="true" className="opacity-40">·</span>
          <span>{statusText}</span>
          <span aria-hidden="true" className="opacity-40">·</span>
          <div className="flex items-center gap-1">
            {decision.audience === 'public' ? (
              <Globe className="w-3 h-3" />
            ) : decision.audience === 'private' ? (
              <Lock className="w-3 h-3" />
            ) : (
              <Shield className="w-3 h-3" />
            )}
            {decision.audience}
          </div>
        </div>
        
        <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {decision.title}
            </h3>
            <button 
                onClick={handleCopyLink}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition shrink-0"
                title="Copia link"
            >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
        </div>

        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6 font-normal leading-relaxed">
          {decision.description}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center justify-between text-[13px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className={`w-3.5 h-3.5 ${timeLeft.status === 'warning' ? 'text-amber-500' : 'text-slate-400'}`} />
            <span className={timeLeft.status === 'warning' ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}>
              {timeLeft.text}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-200">
            <span className="tabular-nums">{totalVotes}</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal">{totalVotes === 1 ? 'voto' : 'voti'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <img
              src={decision.creator.avatar}
              alt={decision.creator.name}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
            />
            <span className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">
              {decision.creator.name}
            </span>
          </div>

            {decision.participants && decision.participants.length > 0 && (
              <div className="flex items-center">
                <div className="flex -space-x-2 overflow-hidden">
                  {decision.participants.slice(0, 3).map((p, idx) => (
                    <img
                      key={idx}
                      className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-white dark:ring-gray-900 object-cover"
                      src={p.avatar}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                    />
                  ))}
                  {decision.participants.length > 3 && (
                    <div className="flex items-center justify-center h-6.5 w-6.5 rounded-full bg-slate-100 dark:bg-gray-800 ring-2 ring-white dark:ring-gray-900 text-[10px] font-bold text-slate-500 dark:text-gray-400">
                      +{decision.participants.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };
