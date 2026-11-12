import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  ArrowLeft,
  Share2,
  MessageSquare,
  Send,
  Users,
  Star,
  FileText
} from 'lucide-react';
import { Decision } from '../types';
import { getTimeRemaining, getCategoryStyles, formatDate, TimeRemaining } from '../utils';
import { auth } from '../lib/firebase';

interface DecisionDetailProps {
  decision: Decision;
  onBack: () => void;
  onVote: (decisionId: string, optionIds: string[], ratingValue?: number) => void;
  onAddComment: (decisionId: string, text: string) => void;
}

export const DecisionDetail: React.FC<DecisionDetailProps> = ({
  decision,
  onBack,
  onVote,
  onAddComment,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(getTimeRemaining(decision.deadline));
  const [newComment, setNewComment] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>(decision.votedOptionIds || []);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [pendingRating, setPendingRating] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(decision.deadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [decision.deadline]);

  useEffect(() => {
    setSelectedOptions(decision.votedOptionIds || []);
  }, [decision.votedOptionIds]);

  const totalVotes = decision.options.reduce((sum, opt) => sum + opt.votes, 0);
  const isExpired = timeLeft.status === 'expired';
  const hasVoted = (decision.votedOptionIds && decision.votedOptionIds.length > 0) || (decision.ratingValue !== undefined);

  const getTimerBreakdown = () => {
    if (isExpired) return null;
    const diff = new Date(decision.deadline).getTime() - Date.now();
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return { d, h, m, s };
  };

  const timerBreakdown = getTimerBreakdown();

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}?decisionId=${decision.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleExportCSV = () => {
    const esc = (v: any) => {
      let s = String(v);
      if (/^[=+\-@]/.test(s)) s = "'" + s;
      return '"' + s.replace(/"/g, '""') + '"';
    };
    const headers = ['Opzione', 'Voti'].map(esc);
    const rows = decision.options.map(opt => [esc(opt.text), esc(opt.votes)]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `risultati_${decision.title.replace(/\s+/g, '_')}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTableModule = await import('jspdf-autotable');
    const autoTable = (autoTableModule as any).default || autoTableModule;

    const doc = new jsPDF();
    doc.text(`Risultati: ${decision.title}`, 10, 10);
    
    const tableData = decision.options.map(opt => [opt.text, opt.votes]);
    autoTable(doc, {
      head: [['Opzione', 'Voti']],
      body: tableData,
      startY: 20,
    });
    
    doc.save(`risultati_${decision.title.replace(/\s+/g, '_')}.pdf`);
  };

  const handleVoteSubmit = (optionId: string) => {
    if (isExpired || hasVoted) return;

    if (decision.type === 'single' || decision.type === 'yes_no') {
      setSelectedOptions([optionId]);
    } else if (decision.type === 'multiple') {
      const isSelected = selectedOptions.includes(optionId);
      const updated = isSelected
        ? selectedOptions.filter(id => id !== optionId)
        : [...selectedOptions, optionId];
      setSelectedOptions(updated);
    }
  };

  const handleConfirmVote = () => {
    if (isExpired || hasVoted) return;
    
    if (decision.type === 'rating' && pendingRating !== null) {
      onVote(decision.id, [], pendingRating);
    } else if (selectedOptions.length > 0) {
      onVote(decision.id, selectedOptions);
    }
  };

  const handleRatingClick = (rating: number) => {
    if (!isExpired && !hasVoted) {
      setPendingRating(rating);
    }
  };

  const handleCancelSelection = () => {
    setSelectedOptions([]);
    setPendingRating(null);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim().length > 0) {
      onAddComment(decision.id, newComment.trim());
      setNewComment('');
    }
  };

  const getRatingBreakdown = () => {
    const totalRatings = decision.options.reduce((sum, opt) => sum + opt.votes, 0);
    if (totalRatings === 0) return { average: '–', total: 0 };
    const average = decision.options.reduce((sum, opt, idx) => sum + (opt.votes * (idx + 1)), 0) / totalRatings;
    
    return {
      average: average.toFixed(1),
      total: totalRatings
    };
  };

  const ratingInfo = decision.type === 'rating' ? getRatingBreakdown() : null;

  return (
    <div id="decision-detail-view" className="space-y-8 max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 text-[13px] font-medium text-slate-900 dark:text-white hover:opacity-70 transition cursor-pointer relative"
          >
            <Share2 className="w-4 h-4" />
            Condividi
            <AnimatePresence>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: -40, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="absolute left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] py-1 px-3 rounded font-medium whitespace-nowrap shadow-md z-20 pointer-events-none"
                >
                  Copiato!
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
          <div className="flex items-center gap-3 ml-4 border-l border-slate-200 dark:border-slate-800 pl-4">
            <button onClick={handleExportCSV} className="text-[13px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer">CSV</button>
            <button onClick={handleExportPDF} className="text-[13px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer">PDF</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xs space-y-6">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>{decision.category}</span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span>{formatDate(decision.createdAt)}</span>
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight leading-tight">
              {decision.title}
            </h1>

            <div className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <img
                src={decision.creator.avatar}
                alt={decision.creator.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-900 shadow-xs"
              />
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-none">{decision.creator.name}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{decision.creator.role}</p>
              </div>
            </div>

            <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-normal">
              {decision.description}
            </div>

            {decision.attachments && decision.attachments.length > 0 && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Allegati ({decision.attachments.length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {decision.attachments.map((att, idx) => (
                    <div key={idx} className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-800 aspect-video flex items-center justify-center relative">
                      {att.startsWith('data:image/') ? (
                        <a href={att} target="_blank" rel="noopener noreferrer" className="w-full h-full block">
                          <img src={att} alt={`Allegato ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition cursor-pointer" />
                        </a>
                      ) : (
                        <div className="p-3 text-center">
                          <FileText className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                          <a href={att} download className="text-xs font-bold text-blue-600 underline truncate block">Download #{idx + 1}</a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Espressione del Voto</h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  {isExpired ? 'Votazione chiusa.' : hasVoted ? 'Voto registrato.' : 'Seleziona un\'opzione:'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-150 dark:border-gray-700">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{totalVotes} {totalVotes === 1 ? 'Voto' : 'Voti'}</span>
              </div>
            </div>

            <div className="space-y-4">
              {decision.type === 'rating' && (
                <div className="space-y-6">
                  {!hasVoted && !isExpired ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                          <motion.button
                            key={starValue}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() => handleRatingClick(starValue)}
                            whileTap={{ scale: 0.9 }}
                            className="p-1 cursor-pointer"
                          >
                            <Star className={`w-10 h-10 transition-colors ${starValue <= (hoverRating ?? pendingRating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-700 hover:text-amber-300'}`} />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-5 p-5 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-2xl border border-amber-500/10">
                        <div className="text-center px-4 py-2 bg-white dark:bg-gray-950 rounded-xl shadow-xs border border-amber-100 dark:border-amber-900/30">
                          <span className="text-3xl font-black text-amber-500 block leading-tight">{ratingInfo?.average}</span>
                          <span className="text-xs text-slate-400 font-bold uppercase">su 5</span>
                        </div>
                        <div>
                          <div className="flex gap-1 text-amber-400 mb-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-4 h-4 ${s <= Math.round(parseFloat(ratingInfo?.average || '0')) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-gray-700'}`} />
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 font-medium">Su {ratingInfo?.total} voti.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {decision.type !== 'rating' && (
                <div className="grid grid-cols-1 gap-4">
                  {decision.options.map((opt, index) => {
                    const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                    const isOptionSelected = selectedOptions.includes(opt.id.toString());
                    const userVotedForThis = decision.votedOptionIds?.includes(opt.id.toString());
                    const optionLetter = String.fromCharCode(65 + index);

                    return (
                      <div key={opt.id} className="relative">
                        {hasVoted || isExpired ? (
                          <div className={`border rounded-2xl p-5 transition relative bg-white dark:bg-gray-950 ${userVotedForThis ? 'border-blue-500 bg-blue-50/10 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-800'}`}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className={`absolute top-0 bottom-0 left-0 opacity-[0.04] -z-10 ${userVotedForThis ? 'bg-blue-600' : 'bg-gray-500'}`} />
                            <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${userVotedForThis ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{optionLetter}</div>
                                <span className={`text-sm font-semibold truncate ${userVotedForThis ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{opt.text}</span>
                              </div>
                              <div className="text-right flex items-center gap-4 shrink-0">
                                <span className={`text-base font-black ${userVotedForThis ? 'text-blue-600' : 'text-gray-800 dark:text-gray-200'}`}>{percentage.toFixed(0)}%</span>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800 rounded-b-2xl">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className={`h-full ${userVotedForThis ? 'bg-blue-600' : 'bg-gray-400'}`} />
                            </div>
                          </div>
                        ) : (
                          <motion.button onClick={() => handleVoteSubmit(opt.id.toString())} whileTap={{ scale: 0.98 }} className={`w-full text-left border-2 rounded-2xl p-5 transition flex items-center gap-4 ${isOptionSelected ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isOptionSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{optionLetter}</div>
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex-1 leading-snug">{opt.text}</span>
                          </motion.button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <AnimatePresence>
                {!hasVoted && !isExpired && (selectedOptions.length > 0 || pendingRating !== null) && (
                  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="sticky bottom-20 md:bottom-4 z-20 flex items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl">
                    <div className="flex-1"><p className="text-sm font-bold text-gray-900 dark:text-white">Conferma il tuo voto per procedere.</p></div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleCancelSelection} className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-400">Annulla</button>
                      <button onClick={handleConfirmVote} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2 rounded-xl">Invia Voto</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs text-center space-y-4">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Clock className="w-4 h-4 text-blue-600" /> Tempo di Votazione
            </div>
            {isExpired ? (
              <div className="py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl"><span className="text-sm font-bold text-red-600 uppercase">Conclusa</span></div>
            ) : (
              <div className="grid grid-cols-4 gap-2 pt-2">
                {Object.entries(timerBreakdown || {}).map(([key, val]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <span className="text-xl font-extrabold text-gray-800 dark:text-gray-100 block leading-none">{val}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 block">{key}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
              <div className="flex justify-between"><span>Scadenza:</span><span className="font-semibold">{formatDate(decision.deadline)}</span></div>
              <div className="flex justify-between"><span>Tipo:</span><span className="font-semibold capitalize">{decision.type}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div id="comments-section" className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Discussione</h2>
        </div>

        <form onSubmit={handleSendComment} className="flex gap-3">
          <img src={auth.currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80'} className="w-9 h-9 rounded-full object-cover shrink-0" alt="Me" />
          <div className="flex-1 flex gap-2">
            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Aggiungi una considerazione..." className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-base md:text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={!newComment.trim()} className="p-2.5 bg-blue-600 text-white rounded-xl disabled:opacity-50"><Send className="w-4 h-4" /></button>
          </div>
        </form>

        <div className="space-y-4 pt-2">
          {decision.comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img src={comment.avatar} className="w-9 h-9 rounded-full object-cover shrink-0" alt={comment.author} />
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-center gap-1.5"><span className="text-xs font-bold text-gray-800 dark:text-gray-100">{comment.author}</span></div>
                  <span className="text-[10px] text-gray-400">{formatDate(comment.timestamp)}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 break-words">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
