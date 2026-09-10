import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  Clock,
  ArrowLeft,
  Share2,
  CheckCircle,
  MessageSquare,
  Send,
  Users,
  Star,
  Check,
  Calendar,
  AlertCircle,
  FileText,
  FileDown
} from 'lucide-react';
import { Decision, DecisionOption, Comment } from '../types';
import { getTimeRemaining, getCategoryStyles, formatDate, TimeRemaining } from '../utils';

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
  const [copied, setCopied] = useState(false);

  // Live timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(decision.deadline));
    }, 1000); // 1-second interval for real-time countdown!

    return () => clearInterval(timer);
  }, [decision.deadline]);

  // If already voted, keep sync
  useEffect(() => {
    setSelectedOptions(decision.votedOptionIds || []);
  }, [decision.votedOptionIds]);

  const totalVotes = decision.options.reduce((sum, opt) => sum + opt.votes, 0);
  const isExpired = timeLeft.status === 'expired';
  const hasVoted = (decision.votedOptionIds && decision.votedOptionIds.length > 0) || (decision.ratingValue !== undefined);
  const catStyles = getCategoryStyles(decision.category);

  // Time remaining breakdowns
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

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Opzione', 'Voti'];
    const rows = decision.options.map(opt => [opt.text, opt.votes]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `risultati_${decision.title.replace(/\s+/g, '_')}.csv`);
    link.click();
  };

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Risultati: ${decision.title}`, 10, 10);
    
    const tableData = decision.options.map(opt => [opt.text, opt.votes]);
    (doc as any).autoTable({
      head: [['Opzione', 'Voti']],
      body: tableData,
      startY: 20,
    });
    
    doc.save(`risultati_${decision.title.replace(/\s+/g, '_')}.pdf`);
  };

  const handleVoteSubmit = (optionId: string) => {
    if (isExpired) return;

    if (decision.type === 'single' || decision.type === 'yes_no') {
      onVote(decision.id, [optionId]);
    } else if (decision.type === 'multiple') {
      const isSelected = selectedOptions.includes(optionId);
      const updated = isSelected
        ? selectedOptions.filter(id => id !== optionId)
        : [...selectedOptions, optionId];
      setSelectedOptions(updated);
    }
  };

  const handleConfirmMultipleVotes = () => {
    if (selectedOptions.length > 0 && !isExpired) {
      onVote(decision.id, selectedOptions);
    }
  };

  const handleRatingSubmit = (rating: number) => {
    if (!isExpired) {
      onVote(decision.id, [], rating);
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim().length > 0) {
      onAddComment(decision.id, newComment.trim());
      setNewComment('');
    }
  };

  // Helper to render rating breakdown
  const getRatingBreakdown = () => {
    const totalRatings = decision.options.reduce((sum, opt) => sum + opt.votes, 0) || 1;
    const average = decision.options.reduce((sum, opt, idx) => sum + (opt.votes * (idx + 1)), 0) / totalRatings;
    
    return {
      average: average.toFixed(1),
      total: totalRatings
    };
  };

  const ratingInfo = decision.type === 'rating' ? getRatingBreakdown() : null;

  return (
    <div id="decision-detail-view" className="space-y-8 max-w-4xl mx-auto pb-24">
      {/* Navigation and Actions Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-blue-600 bg-white hover:bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna alla Dashboard
        </button>

        <div className="flex items-center gap-2">
          {/* Share Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition cursor-pointer relative"
          >
            <Share2 className="w-4 h-4" />
            Condividi Link
            <AnimatePresence>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: -40, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="absolute left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-3 rounded-md font-bold whitespace-nowrap shadow-md z-20 pointer-events-none"
                >
                  Copiato negli appunti!
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
          {/* Export Buttons */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            CSV
          </button>
          
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Main Grid: Info & Voting Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Decision description, metadata, countdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xs space-y-6">
            
            {/* Category and Creator Info */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${catStyles.bg} ${catStyles.text} ${catStyles.border}`}>
                {decision.category}
              </span>

              <div className="text-xs text-slate-400 font-medium">
                Creato il {formatDate(decision.createdAt)}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-extrabold text-gray-900 font-display tracking-tight leading-tight">
              {decision.title}
            </h1>

            {/* Author Profile Card */}
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <img
                src={decision.creator.avatar}
                alt={decision.creator.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border-2 border-white ring-1 ring-gray-100 shadow-xs"
              />
              <div>
                <p className="text-xs font-bold text-gray-800 leading-none">{decision.creator.name}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{decision.creator.role}</p>
              </div>
            </div>

            {/* Full description */}
            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-normal">
              {decision.description}
            </div>
          </div>

          {/* Voting Area Options Card */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Espressione del Voto</h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  {isExpired
                    ? 'La votazione è chiusa. Risultati finali:'
                    : hasVoted
                    ? 'Hai espresso il tuo voto. Ecco l\'andamento in tempo reale:'
                    : decision.type === 'multiple'
                    ? 'Seleziona una o più opzioni e conferma:'
                    : 'Clicca su un\'opzione per esprimere il tuo voto:'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-150">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{totalVotes} {totalVotes === 1 ? 'Voto' : 'Voti'}</span>
              </div>
            </div>

            {/* Options display based on types */}
            <div className="space-y-4">
              
              {/* STAR RATING TYPE */}
              {decision.type === 'rating' && (
                <div className="space-y-6">
                  {/* Rating Selector */}
                  {!hasVoted && !isExpired ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Seleziona le stelle</span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                          <motion.button
                            key={starValue}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() => handleRatingSubmit(starValue)}
                            whileTap={{ scale: 0.9 }}
                            className="p-1 cursor-pointer"
                          >
                            <Star
                              className={`w-10 h-10 transition-colors ${
                                starValue <= (hoverRating || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200 hover:text-amber-300'
                              }`}
                            />
                          </motion.button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-4 font-normal">Fai clic su una stella per pubblicare la tua valutazione</p>
                    </div>
                  ) : (
                    /* Show Rating Results Breakdown */
                    <div className="space-y-6">
                      {/* Overall average */}
                      <div className="flex items-center gap-5 p-5 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-2xl border border-amber-500/10">
                        <div className="text-center px-4 py-2 bg-white rounded-xl shadow-xs border border-amber-100">
                          <span className="text-3xl font-black text-amber-500 block leading-tight">{ratingInfo?.average}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">su 5</span>
                        </div>
                        <div>
                          <div className="flex gap-1 text-amber-400 mb-1">
                            {[1, 2, 3, 4, 5].map((s) => {
                              const avg = parseFloat(ratingInfo?.average || '0');
                              return (
                                <Star
                                  key={s}
                                  className={`w-4 h-4 ${s <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                                />
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 font-medium">Valutazione media calcolata su {ratingInfo?.total} voti.</p>
                          {decision.ratingValue && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 font-bold px-2 py-0.5 rounded-md mt-1.5">
                              <Check className="w-3 h-3" /> La tua valutazione: {decision.ratingValue} stelle
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bar charts per star */}
                      <div className="space-y-2 pt-2">
                        {decision.options.map((opt, idx) => {
                          const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                          return (
                            <div key={opt.id} className="flex items-center gap-3 text-xs">
                              <span className="w-14 font-semibold text-gray-500 flex items-center gap-1">
                                {idx + 1} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              </span>
                              
                              <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden relative">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }}
                                  className="h-full bg-amber-400 rounded-full"
                                />
                              </div>

                              <span className="w-10 text-right font-bold text-gray-700">{percentage.toFixed(0)}%</span>
                              <span className="w-12 text-right text-gray-400 text-[11px]">{opt.votes} voti</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STANDARD SINGLE / MULTIPLE / YES_NO OPTION CARDS */}
              {decision.type !== 'rating' && (
                <div className="grid grid-cols-1 gap-4">
                  {decision.options.map((opt, index) => {
                    const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                    const isOptionSelected = selectedOptions.includes(opt.id);
                    const userVotedForThis = decision.votedOptionIds?.includes(opt.id);
                    const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...

                    return (
                      <div key={opt.id} className="relative">
                        {hasVoted || isExpired ? (
                          /* VOTING RESULTS PREVIEW STATE - LARGE CARDS */
                          <div
                            className={`border rounded-2xl p-5 transition overflow-hidden relative bg-white ${
                              userVotedForThis
                                ? 'border-blue-500 bg-blue-50/10 shadow-xs'
                                : 'border-gray-200'
                            }`}
                          >
                            {/* Blue horizontal overlay indicating percentage visually */}
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className={`absolute top-0 bottom-0 left-0 bg-opacity-[0.04] -z-1 pointer-events-none ${
                                userVotedForThis ? 'bg-blue-600' : 'bg-gray-500'
                              }`}
                            />
                            
                            <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                                {/* Large Choice Letter Circle Indicator */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                  userVotedForThis 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {optionLetter}
                                </div>
                                <span className={`text-sm font-semibold truncate ${userVotedForThis ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                                  {opt.text}
                                </span>
                              </div>

                              <div className="text-right flex items-center gap-4 shrink-0">
                                <span className="text-xs text-gray-400 font-semibold">{opt.votes} {opt.votes === 1 ? 'voto' : 'voti'}</span>
                                <span className={`text-base font-black ${userVotedForThis ? 'text-blue-600' : 'text-gray-800'}`}>
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>

                            {/* Animated bottom micro-progress bar line */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`h-full ${userVotedForThis ? 'bg-blue-600' : 'bg-gray-400'}`}
                              />
                            </div>
                          </div>
                        ) : (
                          /* ACTIVE INTERACTIVE VOTING STATE - LARGE CLICKABLE CARDS */
                          <motion.button
                            disabled={isExpired}
                            onClick={() => handleVoteSubmit(opt.id)}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full text-left border-2 rounded-2xl p-5 cursor-pointer transition flex items-center gap-4 ${
                              isOptionSelected
                                ? 'border-blue-600 bg-blue-50/20 shadow-xs'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 bg-white'
                            }`}
                          >
                            {/* Choice letter stack circle */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition ${
                              isOptionSelected 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {optionLetter}
                            </div>

                            <span className="text-sm font-semibold text-gray-800 flex-1 leading-snug">
                              {opt.text}
                            </span>

                            <div className="pt-0.5 shrink-0">
                              {decision.type === 'multiple' ? (
                                <div className={`w-5.5 h-5.5 rounded-lg border-2 flex items-center justify-center transition ${
                                  isOptionSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
                                }`}>
                                  {isOptionSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                              ) : (
                                <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition ${
                                  isOptionSelected ? 'border-blue-600 border-blue-600' : 'border-gray-300'
                                }`}>
                                  {isOptionSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                </div>
                              )}
                            </div>
                          </motion.button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Multiple Choice Submission Footer */}
              {decision.type === 'multiple' && !hasVoted && !isExpired && (
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleConfirmMultipleVotes}
                    disabled={selectedOptions.length === 0}
                    className={`flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs ${
                      selectedOptions.length > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-100'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Invia Scelte Selezionate ({selectedOptions.length})
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Expired alert warning */}
              {isExpired && (
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Questo sondaggio è scaduto ed è in sola lettura. Non è più possibile inserire voti.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Timer card and general info */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Timer card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs text-center space-y-4">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Clock className="w-4 h-4 text-blue-600" />
              Tempo di Votazione
            </div>

            {isExpired ? (
              <div className="py-4 bg-gray-50 rounded-2xl border border-gray-150">
                <span className="text-sm font-bold text-red-600 uppercase tracking-wide font-mono">Votazione Conclusa</span>
                <p className="text-[11px] text-gray-400 mt-0.5">Il termine utile è scaduto.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-xl font-extrabold text-gray-800 block leading-none font-mono">{timerBreakdown?.d}</span>
                  <span className="text-[10px] text-gray-400 font-semibold block mt-1">Giorni</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-xl font-extrabold text-gray-800 block leading-none font-mono">{timerBreakdown?.h}</span>
                  <span className="text-[10px] text-gray-400 font-semibold block mt-1">Ore</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-xl font-extrabold text-gray-800 block leading-none font-mono">{timerBreakdown?.m}</span>
                  <span className="text-[10px] text-gray-400 font-semibold block mt-1">Min</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-xl font-extrabold text-red-600 block leading-none font-mono animate-pulse">{timerBreakdown?.s}</span>
                  <span className="text-[10px] text-gray-400 font-semibold block mt-1">Sec</span>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 font-normal border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-400">Scadenza:</span>
                <span className="font-semibold text-gray-700">{formatDate(decision.deadline)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-400">Tipo:</span>
                <span className="font-semibold text-gray-700 capitalize">
                  {decision.type === 'single' ? 'Scelta Singola' : decision.type === 'multiple' ? 'Scelta Multipla' : decision.type === 'yes_no' ? 'Sì / No' : 'Valutazione'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-400">Visibilità:</span>
                <span className="font-semibold text-gray-700 capitalize">{decision.audience}</span>
              </div>
            </div>
          </div>

          {/* Quick info panel */}
          <div className="bg-gradient-to-tr from-gray-900 to-slate-900 rounded-3xl p-6 text-white space-y-3 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-5">
              <CheckCircle className="w-40 h-40" />
            </div>
            <h3 className="font-display font-bold text-sm tracking-wide">Regole di Verdict</h3>
            <ul className="text-xs text-gray-300 space-y-2 font-normal leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                Ogni utente può votare una sola volta per ciascun Verdict.
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                I voti sono crittografati e calcolati in modo trasparente.
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                I risultati intermedi sono visibili per favorire il dibattito costruttivo.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* COMMENTS SECTION AT BOTTOM */}
      <div id="comments-section" className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Discussione e Commenti</h2>
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-md">
            {decision.comments.length}
          </span>
        </div>

        {/* Post Comment Form */}
        <form onSubmit={handleSendComment} className="flex gap-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80"
            alt="My Avatar"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0"
          />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Scrivi una considerazione, fai una domanda o motiva il tuo voto..."
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition"
            />
            <button
              type="submit"
              disabled={newComment.trim().length === 0}
              className={`p-2.5 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer ${
                newComment.trim().length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Comment thread list */}
        <div className="space-y-4 pt-2">
          {decision.comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 space-y-1">
              <MessageSquare className="w-8 h-8 text-gray-200 mx-auto" />
              <p className="text-xs font-medium">Nessun commento inserito.</p>
              <p className="text-[11px] font-normal">Sii il primo ad avviare la discussione scrivendo sopra.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 space-y-4">
              {decision.comments.map((comment, index) => (
                <div key={comment.id} className={`flex gap-3 pt-4 ${index === 0 ? 'pt-0' : ''}`}>
                  <img
                    src={comment.avatar}
                    alt={comment.author}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0"
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-gray-800">{comment.author}</span>
                        {comment.role && (
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                            {comment.role}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {formatDate(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-normal break-words">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
