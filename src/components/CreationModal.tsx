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

interface CreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (newDecision: Decision) => void;
}

const CATEGORIES = ['Design', 'Cultura', 'Team', 'Strategia', 'Logistica', 'Altro'];

export const CreationModal: React.FC<CreationModalProps> = ({ isOpen, onClose, onPublish }) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Design');
  const [decisionType, setDecisionType] = useState<DecisionType>('single');
  
  // For options (Step 3)
  const [options, setOptions] = useState<string[]>(['', '']);
  
  // For deadline and audience (Step 4)
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('18:00');
  const [audience, setAudience] = useState<DecisionAudience>('public');

  // Attachments (Files and Photos)
  const [attachments, setAttachments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setAttachments(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Initialize deadline date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setDeadlineDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Sync default options when decision type changes
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

  // Quick deadline helpers
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

  // Validation
  const isStepValid = () => {
    switch (step) {
      case 1:
        return title.trim().length >= 4 && description.trim().length >= 10;
      case 2:
        return true; // Any type is selected by default
      case 3:
        if (decisionType === 'yes_no' || decisionType === 'rating') return true;
        // Single/multiple choice options must be non-empty and unique (case-insensitive, trim)
        const validOpts = options.map(o => o.trim().toLowerCase()).filter(o => o.length > 0);
        if (validOpts.length < 2) return false;
        const uniqueOpts = new Set(validOpts);
        return uniqueOpts.size === validOpts.length;
      case 4:
        return deadlineDate !== '' && deadlineTime !== '';
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
    // Construct final decision object
    const finalDeadline = new Date(`${deadlineDate}T${deadlineTime}`).toISOString();
    
    const formattedOptions: DecisionOption[] = options
      .filter(opt => opt.trim().length > 0)
      .map((text, index) => ({
        id: `opt-custom-${Date.now()}-${index}`,
        text: text,
        votes: 0
      }));

    const newDecision: Decision = {
      id: `dec-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      type: decisionType,
      category: category,
      deadline: finalDeadline,
      audience: audience,
      creator: {
        name: 'Tu',
        role: 'Autore',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80'
      },
      options: formattedOptions,
      participants: [],
      comments: [],
      createdAt: new Date().toISOString(),
      attachments: attachments
    };

    onPublish(newDecision);
    onClose();
    // Reset state
    setStep(1);
    setTitle('');
    setDescription('');
    setCategory('Design');
    setDecisionType('single');
    setOptions(['', '']);
    setAttachments([]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-xl relative overflow-hidden flex flex-col z-10 border border-gray-200 max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Crea un nuovo Verdict</span>
            <h2 className="text-xl font-bold text-gray-950 font-display">Procedura Guidata</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-150 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker Bar */}
        <div className="bg-gray-100 h-1.5 w-full flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-full transition-all duration-300 flex-1 ${
                s <= step ? 'bg-blue-600' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Step Indicator Badges */}
        <div className="px-6 py-3 border-b border-gray-150 flex justify-between text-[11px] font-bold text-slate-400 bg-gray-50/50">
          <span className={step === 1 ? 'text-blue-600' : ''}>1. Titolo e Descrizione</span>
          <span className={step === 2 ? 'text-blue-600' : ''}>2. Tipo Decisione</span>
          <span className={step === 3 ? 'text-blue-600' : ''}>3. Opzioni / Scelte</span>
          <span className={step === 4 ? 'text-blue-600' : ''}>4. Scadenza e Pubblico</span>
          <span className={step === 5 ? 'text-blue-600' : ''}>5. Anteprima e Conferma</span>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-8 overflow-y-auto flex-1">
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
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Titolo del Verdict</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="es. Quale logo preferisci per la startup?"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-slate-400 font-medium transition"
                  />
                  {title.length > 0 && title.length < 4 && (
                    <p className="text-red-500 text-xs mt-1 font-mono">Il titolo deve contenere almeno 4 caratteri.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descrizione / Contesto</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Fornisci dettagli sul contesto, file di riferimento, o criteri che il team dovrebbe considerare..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-slate-400 font-normal transition resize-none"
                  />
                  {description.length > 0 && description.length < 10 && (
                    <p className="text-red-500 text-xs mt-1 font-mono">Descrivi meglio il contesto (almeno 10 caratteri).</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoria</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          category === cat
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-white border-gray-200 text-slate-600 hover:border-gray-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File / Photo Upload Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      Allegati, File o Foto (Opzionale)
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
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

                  {attachments.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                      {attachments.map((att, idx) => (
                        <div key={idx} className="relative group rounded-xl border border-gray-200 overflow-hidden bg-gray-50 aspect-video flex items-center justify-center">
                          {att.startsWith('data:image/') ? (
                            <img src={att} alt="Attachment" className="w-full h-full object-cover" />
                          ) : (
                            <div className="p-2 text-center">
                              <Paperclip className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                              <span className="text-[10px] font-bold text-gray-600 truncate block">File #{idx + 1}</span>
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
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-4 text-center cursor-pointer transition bg-gray-50/50"
                    >
                      <p className="text-xs text-slate-400 font-medium">Trascina qui i file o clicca per caricare foto e documenti di supporto</p>
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
                <div className="text-center max-w-md mx-auto mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Seleziona il tipo di decisione</h3>
                  <p className="text-slate-500 text-sm mt-1">Scegli come gli utenti dovranno esprimere il loro voto.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Single Choice */}
                  <div
                    onClick={() => setDecisionType('single')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      decisionType === 'single'
                        ? 'border-blue-600 bg-blue-50/10'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${decisionType === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-500'}`}>
                        <CheckSquare className="w-5 h-5" />
                      </div>
                      {decisionType === 'single' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Scelta Singola</h4>
                      <p className="text-slate-500 text-xs mt-1">Gli utenti possono votare solo una opzione tra quelle inserite.</p>
                    </div>
                  </div>

                  {/* Multiple Choice */}
                  <div
                    onClick={() => setDecisionType('multiple')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      decisionType === 'multiple'
                        ? 'border-blue-600 bg-blue-50/10'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${decisionType === 'multiple' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-500'}`}>
                        <ListTodo className="w-5 h-5" />
                      </div>
                      {decisionType === 'multiple' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Scelta Multipla</h4>
                      <p className="text-slate-500 text-xs mt-1">Gli utenti possono scegliere più preferenze contemporaneamente.</p>
                    </div>
                  </div>

                  {/* Yes / No */}
                  <div
                    onClick={() => setDecisionType('yes_no')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      decisionType === 'yes_no'
                        ? 'border-blue-600 bg-blue-50/10'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${decisionType === 'yes_no' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-500'}`}>
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      {decisionType === 'yes_no' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Sì o No (Bivio)</h4>
                      <p className="text-slate-500 text-xs mt-1">Un semplice bivio decisionale per approvazioni o rifiuti rapidi.</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div
                    onClick={() => setDecisionType('rating')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      decisionType === 'rating'
                        ? 'border-blue-600 bg-blue-50/10'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${decisionType === 'rating' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-500'}`}>
                        <Star className="w-5 h-5" />
                      </div>
                      {decisionType === 'rating' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Valutazione a Stelle</h4>
                      <p className="text-slate-500 text-xs mt-1">Gli utenti valutano l'oggetto con un punteggio qualitativo da 1 a 5 stelle.</p>
                    </div>
                  </div>
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
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Configura le opzioni di voto</h3>
                  <p className="text-slate-500 text-xs mb-4">Compila le scelte disponibili per gli utenti del tuo Verdict.</p>
                </div>

                {decisionType === 'yes_no' && (
                  <div className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs text-slate-500 font-medium">Per i bivi decisionali (Sì/No), le opzioni sono preconfigurate per chiarezza ma puoi modificarle se desideri:</p>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={options[0]}
                        onChange={(e) => handleOptionChange(0, e.target.value)}
                        className="w-full bg-white px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Opzione positiva"
                      />
                      <input
                        type="text"
                        value={options[1]}
                        onChange={(e) => handleOptionChange(1, e.target.value)}
                        className="w-full bg-white px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Opzione negativa"
                      />
                    </div>
                  </div>
                )}

                {decisionType === 'rating' && (
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center space-y-3">
                    <div className="flex justify-center gap-1.5 text-amber-400">
                      <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                      <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                      <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                      <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                      <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">Pronto per il Rating qualitativo</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Gli utenti vedranno una scala interattiva a 5 stelle per valutare la proposta. I risultati verranno calcolati come media pesata dei voti ricevuti.
                    </p>
                  </div>
                )}

                {(decisionType === 'single' || decisionType === 'multiple') && (
                  <div className="space-y-3">
                    {options.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 w-5">#{idx + 1}</span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`es. Opzione alternativa ${idx + 1}`}
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="mt-2 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Aggiungi un'opzione
                    </button>
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
                {/* Deadline Picker */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Seleziona Data e Ora di Scadenza
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="date"
                      value={deadlineDate}
                      onChange={(e) => setDeadlineDate(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <input
                      type="time"
                      value={deadlineTime}
                      onChange={(e) => setDeadlineTime(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Quick helpers */}
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    <span className="text-xs text-slate-400 self-center font-medium mr-1">Preimposta:</span>
                    <button
                      type="button"
                      onClick={() => setQuickDeadline(1)}
                      className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 text-slate-600 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                    >
                      +1 Ora
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDeadline(24)}
                      className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 text-slate-600 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                    >
                      +24 Ore
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDeadline(72)}
                      className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 text-slate-600 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                    >
                      +3 Giorni
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDeadline(168)}
                      className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 text-slate-600 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                    >
                      +1 Settimana
                    </button>
                  </div>
                </div>

                {/* Audience visibility */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Chi può partecipare? (Visibilità)
                  </label>
                  <div className="space-y-2">
                    {/* Public */}
                    <div
                      onClick={() => setAudience('public')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        audience === 'public'
                          ? 'border-blue-600 bg-blue-50/25'
                          : 'border-gray-150 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${audience === 'public' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-500'}`}>
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-xs">Pubblico</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Chiunque abbia il link condivisibile può visualizzare e votare.</p>
                        </div>
                      </div>
                      {audience === 'public' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>

                    {/* Restricted */}
                    <div
                      onClick={() => setAudience('restricted')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        audience === 'restricted'
                          ? 'border-blue-600 bg-blue-50/25'
                          : 'border-gray-150 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${audience === 'restricted' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-500'}`}>
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-xs">Membri del Team (Riservato)</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Limitato ai soli utenti loggati appartenenti alla tua organizzazione.</p>
                        </div>
                      </div>
                      {audience === 'restricted' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>

                    {/* Private */}
                    <div
                      onClick={() => setAudience('private')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        audience === 'private'
                          ? 'border-blue-600 bg-blue-50/25'
                          : 'border-gray-150 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${audience === 'private' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-500'}`}>
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-xs">Privato</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Solo i membri specificati che ricevono un invito email diretto.</p>
                        </div>
                      </div>
                      {audience === 'private' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
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
                <div className="text-center max-w-sm mx-auto mb-2">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-3 border border-blue-100">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Pronto per il lancio!</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Ecco un'anteprima dei dettagli principali che verranno creati. Ricontrolla prima di pubblicare.
                  </p>
                </div>

                {/* Simulated preview box */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-600 px-2.5 py-0.5 bg-blue-50 rounded-md border border-blue-100">
                      {category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      {audience === 'public' ? <Globe className="w-3 h-3 text-emerald-500" /> : <Lock className="w-3 h-3 text-amber-500" />}
                      {audience === 'public' ? 'Pubblico' : audience === 'restricted' ? 'Riservato' : 'Privato'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-base leading-snug">{title || 'Senza titolo'}</h4>
                    <p className="text-slate-500 text-xs mt-1 font-normal line-clamp-3">{description || 'Nessuna descrizione fornita.'}</p>
                  </div>

                  {/* Options visualization */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Opzioni configurate:</span>
                    {decisionType === 'rating' ? (
                      <div className="flex gap-1 text-amber-400 py-1">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400" />)}
                        <span className="text-[11px] text-slate-500 font-medium ml-1">Scala di valutazione</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-1.5">
                        {options.filter(o => o.trim().length > 0).slice(0, 3).map((opt, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-gray-100 px-3 py-1.5 rounded-lg font-medium">
                            <span className="text-blue-600 text-[10px] font-extrabold">{i+1}.</span>
                            <span className="truncate">{opt}</span>
                          </div>
                        ))}
                        {options.filter(o => o.trim().length > 0).length > 3 && (
                          <span className="text-[10px] text-slate-400 font-semibold italic pl-1">
                            + altre {options.filter(o => o.trim().length > 0).length - 3} opzioni
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-150 pt-3 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Scadenza: {deadlineDate ? `${deadlineDate} alle ${deadlineTime}` : 'Non definita'}</span>
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold uppercase text-[9px]">Stato: Attivo</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1}
            className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer ${
              step === 1
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Indietro
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`flex items-center gap-1 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer ${
                isStepValid()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-blue-100'
                  : 'bg-gray-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Avanti
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmPublish}
              className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-blue-100"
            >
              Pubblica Verdict
              <CheckCircle2 className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
