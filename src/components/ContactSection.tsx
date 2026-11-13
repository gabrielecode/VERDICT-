import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

interface ContactSectionProps {
  isDark: boolean;
}

const CONTACT_EMAIL = 'info@sititicino.ch';
const EMAIL_SUBJECT = 'richiesta informazioni Easy Decision';

export const ContactSection: React.FC<ContactSectionProps> = ({ isDark }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const baseMailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines: string[] = [];
    if (name.trim()) lines.push(`Nome: ${name.trim()}`);
    if (email.trim()) lines.push(`Email: ${email.trim()}`);
    if (message.trim()) {
      if (lines.length > 0) lines.push('');
      lines.push(message.trim());
    }

    const body = lines.join('\n');
    const mailtoUrl = `${baseMailtoHref}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setSubmitted(true);
  };

  return (
    <section
      id="contatti"
      aria-labelledby="contact-section-heading"
      className={`border-t transition-colors ${
        isDark ? 'border-gray-800 bg-[#09090b]' : 'border-slate-200 bg-[#F4F6F8]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Title & direct mailto link */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-700 dark:text-blue-400">
              <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Contatto diretto</span>
            </div>

            <h2
              id="contact-section-heading"
              className={`text-2xl md:text-3xl font-display font-bold tracking-tight [text-wrap:balance] ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              Hai domande su Easy Decision? Scrivici
            </h2>

            <p className={`text-sm md:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Compila il modulo per aprire subito il tuo client di posta con l’oggetto precompilato, oppure scrivici direttamente all’indirizzo email qui sotto.
            </p>

            <div className="pt-1">
              <a
                href={baseMailtoHref}
                className={`inline-flex items-center gap-2 text-sm font-mono font-semibold underline-offset-4 hover:underline rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-700 hover:text-blue-800'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{CONTACT_EMAIL}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Simple Mailto Contact Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className={`border p-6 md:p-7 space-y-4 ${
                isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-name"
                    className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    Nome e cognome
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (submitted) setSubmitted(false);
                    }}
                    placeholder="Mario Rossi"
                    className={`w-full min-h-[44px] px-3.5 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      isDark
                        ? 'border-gray-800 bg-gray-900 text-white placeholder:text-slate-500'
                        : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-email"
                    className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    La tua email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (submitted) setSubmitted(false);
                    }}
                    placeholder="nome@azienda.ch"
                    className={`w-full min-h-[44px] px-3.5 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      isDark
                        ? 'border-gray-800 bg-gray-900 text-white placeholder:text-slate-500'
                        : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-message"
                  className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                >
                  Messaggio
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (submitted) setSubmitted(false);
                  }}
                  placeholder="Scrivi qui la tua richiesta di informazioni su Easy Decision..."
                  className={`w-full px-3.5 py-2.5 rounded-md border text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y ${
                    isDark
                      ? 'border-gray-800 bg-gray-900 text-white placeholder:text-slate-500'
                      : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <button
                  type="submit"
                  className="px-6 py-3 min-h-[44px] rounded-md bg-slate-950 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                >
                  <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Invia richiesta via email</span>
                </button>

                {submitted ? (
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Client email aperto con oggetto precompilato.</span>
                  </p>
                ) : (
                  <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Oggetto: {EMAIL_SUBJECT}
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
