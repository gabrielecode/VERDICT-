import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  CheckSquare,
  ListTodo,
  HelpCircle,
  Star,
  Plus,
  Trash2,
  Calendar,
  Globe,
  Lock,
  Shield,
  Eye,
  Paperclip,
  Upload
} from 'lucide-react';
import { Decision, DecisionType, DecisionAudience, DecisionOption } from '../types';
import { CATEGORIES } from '../utils';

interface CreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (newDecision: Decision) => void;
}

export const CreationModal: React.FC<CreationModalProps> = ({ isOpen, onClose, onPublish }) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Design');
  const [decisionType, setDecisionType] = useState<DecisionType>('single');
  
  const [options, setOptions] = useState<string[]>(['', '']);
  
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('18:00');
  const [audience, setAudience] = useState<DecisionAudience>('org');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [resultsVisibility, setResultsVisibility] = useState<'always' | 'after_vote' | 'closed'>('always');

  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setUploadError(null);
    if (files) {
      Array.from(files).forEach((file: File) => {
        if (file.size > 256000 || attachments.length >= 3) {
          setUploadError('File troppo grande (max 250 KB) o limite di 3 allegati raggiunto.');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setAttachments(prev => {
              if (prev.length >= 3) return prev;
              return [...prev, reader.result as string];
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setDeadlineDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  useEffect(() => {
    if (decisionType === 'yes_no') {
      setOptions(['Sì, favorevole', 'No, contrario']);
    } else if (decisionType === 'rating') {
      setOptions(['1 Stella', '2 Stelle', '3 Stelle', '4 Stelle', '5 Stelle']);
    } else {
      setOptions(['', '']);
    }
  }, [decisionType]);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length >= 10) return;
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOpts = options.filter((_, i) => i !== index);
      setOptions(newOpts);
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const newOpts = [...options];
    newOpts[index] = val;
    setOptions(newOpts);
  };

  const setQuickDeadline = (hoursAhead: number) => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * hoursAhead);
    const yyyy = futureDate.getFullYear();
    const mm = String(futureDate.getMonth() + 1).padStart(2, '0');
    const dd = String(futureDate.getDate()).padStart(2, '0');
    const hh = String(futureDate.getHours()).padStart(2, '0');
    const min = String(futureDate.getMinutes()).padStart(2, '0');
    
    setDeadlineDate(`${yyyy}-${mm}-${dd}`);
    setDeadlineTime(`${hh}:${min}`);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return title.trim().length >= 4 && description.trim().length >= 10;
      case 2:
        return true;
      case 3:
        if (decisionType === 'yes_no' || decisionType === 'rating') return true;
        const validOpts = options.map(o => o.trim().toLowerCase()).filter(o => o.length > 0);
        if (validOpts.length < 2) return false;
        const uniqueOpts = new Set(validOpts);
        return uniqueOpts.size === validOpts.length;
      case 4:
        return deadlineDate !== '' && deadlineTime !== '' && !isNaN(new Date(`${deadlineDate}T${deadlineTime}`).getTime()) && new Date(`${deadlineDate}T${deadlineTime}`).getTime() > Date.now();
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (isStepValid() && step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConfirmPublish = () => {
    const finalDeadline = new Date(`${deadlineDate}T${deadlineTime}`).toISOString();
    
    const formattedOptions: DecisionOption[] = options
      .filter(opt => opt.trim().length > 0)
      .map((text, index) => ({
        id: index,
        text: text,
        votes: 0
      }));

    const newDecision: Decision = {
      id: '',
      orgId: '',
      title: title.trim(),
      description: description.trim(),
      type: decisionType,
      category: category,
      deadline: finalDeadline,
      audience: audience,
      isAnonymous,
      resultsVisibility,
      creator: {
        name: '',
        role: '',
        avatar: ''
      },
      options: formattedOptions,
      participants: [],
      comments: [],
      createdAt: new Date().toISOString(),
      attachments: attachments
    };

    onPublish(newDecision);
    onClose();
    setStep(1);
    setTitle('');
    setDescription('');
    setCategory('Design');
    setDecisionType('single');
    setOptions(['', '']);
    setAttachments([]);
    setIsAnonymous(false);
    setResultsVisibility('always');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-none sm:rounded-3xl shadow-xl relative overflow-hidden flex flex-col z-10 border border-gray-200 dark:border-gray-800 max-h-[100dvh] sm:max-h-[90dvh]"
      >
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-950 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span>Nuova Proposta</span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span>Procedura Guidata</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white font-display mt-2">Crea una proposta</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-150 dark:hover:bg-gray-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-50/50 dark:bg-gray-950 border-b border-gray-150 dark:border-gray-800 shrink-0">
          <div className="px-6 py-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Passo {step} di 5 · {
                step === 1 ? 'Titolo e Descrizione' :
                step === 2 ? 'Tipo Decisione' :
                step === 3 ? 'Opzioni / Scelte' :
                step === 4 ? 'Scadenza e Pubblico' :
                'Conferma'
              }
            </span>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 h-1.5 w-full">
            <motion.div
              initial={false}
              animate={{ width: `${(step / 5) * 100}%` }}
              className="h-full bg-blue-600"
            />
          </div>
        </div>

        <div className="p-8 flex-1 min-h-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Titolo della Proposta</label>
                  <input
                    type="text"
                    value={title}
                    maxLength={80}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="es. Quale logo preferisci per la startup?"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base md:text-xs font-medium placeholder-slate-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Descrizione / Contesto</label>
                  <textarea
                    rows={4}
                    value={description}
                    maxLength={500}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Fornisci dettagli sul contesto..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base md:text-xs font-normal placeholder-slate-400 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Categoria</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-[13px] font-medium transition cursor-pointer ${
                          category === cat
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      Allegati, File o Foto (Opzionale)
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Carica File/Foto
                    </button>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {uploadError && (
                    <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-2">
                      {uploadError}
                    </p>
                  )}

                  {attachments.length > 0 && (
                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                      {attachments.map((att, idx) => (
                        <div key={idx} className="relative group rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800 aspect-video flex items-center justify-center">
                          {att.startsWith('data:image/') ? (
                            <img src={att} alt="Attachment" className="w-full h-full object-cover" />
                          ) : (
                            <div className="p-2 text-center">
                              <Paperclip className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                              <span className="text-xs font-bold text-gray-600 dark:text-gray-400 truncate block">File #{idx + 1}</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'single', label: 'Scelta Singola', icon: CheckSquare, desc: 'Gli utenti possono votare solo una opzione.' },
                    { id: 'multiple', label: 'Scelta Multipla', icon: ListTodo, desc: 'Gli utenti possono scegliere più preferenze.' },
                    { id: 'yes_no', label: 'Sì o No (Bivio)', icon: HelpCircle, desc: 'Un semplice bivio decisionale.' },
                    { id: 'rating', label: 'Valutazione a Stelle', icon: Star, desc: 'Valutazione da 1 a 5 stelle.' },
                  ].map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setDecisionType(type.id as DecisionType)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        decisionType === type.id
                          ? 'border-blue-600 bg-blue-50/10 dark:bg-blue-900/10'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-xl ${decisionType === type.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400'}`}>
                          <type.icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{type.label}</h4>
                        <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">{type.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {(decisionType === 'single' || decisionType === 'multiple' || decisionType === 'yes_no') && (
                  <div className="space-y-3">
                    {options.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option}
                          maxLength={80}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Opzione ${idx + 1}`}
                          className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-base md:text-xs text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                        {options.length > 2 && decisionType !== 'yes_no' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {options.length < 10 && decisionType !== 'yes_no' && (
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="mt-2 flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Aggiungi opzione
                      </button>
                    )}
                  </div>
                )}
                {decisionType === 'rating' && (
                  <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-center space-y-3">
                    <div className="flex justify-center gap-1.5 text-amber-400">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-8 h-8 fill-amber-400" />)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-400">Rating qualitativo a 5 stelle.</p>
                  </div>
                )}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Scadenza
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={deadlineDate}
                      onChange={(e) => setDeadlineDate(e.target.value)}
                      className="px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-base md:text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      type="time"
                      value={deadlineTime}
                      onChange={(e) => setDeadlineTime(e.target.value)}
                      className="px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-base md:text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Visibilità
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'org', label: 'Organizzazione', icon: Globe },
                      { id: 'private', label: 'Privato', icon: Lock },
                      { id: 'link', label: 'Chiunque abbia il link', icon: Globe },
                    ].map((aud) => (
                      <div
                        key={aud.id}
                        onClick={() => setAudience(aud.id as DecisionAudience)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          audience === aud.id
                            ? 'border-blue-600 bg-blue-50/25 dark:bg-blue-900/20'
                            : 'border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <aud.icon className="w-4 h-4" />
                          <h4 className="font-bold text-gray-900 dark:text-white text-xs">{aud.label}</h4>
                        </div>
                        {audience === aud.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                    Voto Anonimo
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(false)}
                      className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${!isAnonymous ? 'border-blue-600 bg-blue-50/20 text-blue-600' : 'border-gray-200 text-gray-600 dark:text-gray-300'}`}
                    >
                      No (Palese)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(true)}
                      className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${isAnonymous ? 'border-blue-600 bg-blue-50/20 text-blue-600' : 'border-gray-200 text-gray-600 dark:text-gray-300'}`}
                    >
                      Sì (Anonimo)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                    Mostra Risultati
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'always', label: 'Sempre' },
                      { id: 'after_vote', label: 'Dopo il mio voto' },
                      { id: 'closed', label: 'A chiusura' },
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setResultsVisibility(item.id as any)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          resultsVisibility === item.id
                            ? 'border-blue-600 bg-blue-50/25 dark:bg-blue-900/20'
                            : 'border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <h4 className="font-bold text-gray-900 dark:text-white text-xs">{item.label}</h4>
                        {resultsVisibility === item.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">{title || 'Senza titolo'}</h4>
                  <p className="text-slate-500 dark:text-gray-400 text-xs">{description}</p>
                  <div className="text-xs text-slate-500 dark:text-gray-400">
                    Scadenza: {deadlineDate} {deadlineTime}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Indietro
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center gap-1 text-xs font-bold px-5 py-2.5 rounded-xl bg-blue-600 text-white disabled:opacity-50 cursor-pointer"
            >
              Avanti
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmPublish}
              className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 text-white px-6 py-2.5 rounded-xl cursor-pointer"
            >
              Pubblica
              <CheckCircle2 className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
