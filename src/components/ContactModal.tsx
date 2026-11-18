import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Mail,
  Send,
  Check,
  Phone,
  Clock,
  ArrowUpRight,
  Video,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeveloperProfile } from '../data/portfolioData';
import { WhatsAppLogo } from './TechLogos';
import { useScrollLock } from '../hooks/useScrollLock';
import { useLanguage } from '../context/LanguageContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DeveloperProfile;
  onOpenBooking?: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  profile,
  onOpenBooking,
}) => {
  useScrollLock(isOpen);
  const { lang, dir, t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setSubmitError(false);

    try {
      const formspreeId = import.meta.env.VITE_FORMSPREE_ID?.trim();
      const endpoint = formspreeId
        ? `https://formspree.io/f/${formspreeId}`
        : 'https://formsubmit.co/ajax/ah.elbialy.dev@gmail.com';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject: subject || `Modal Message from ${name}`,
          message,
          _subject: `New Portfolio Message from ${name}: ${subject || 'Inquiry'}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Delivery failed');
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        onClose();
      }, 2400);
    } catch {
      setIsSubmitting(false);
      setSubmitError(true);
    }
  };

  const mailtoHref = `mailto:${profile.email}?subject=${encodeURIComponent(
    subject || 'Flutter Mobile Developer Opportunity - Ahmed El-Bialy'
  )}&body=${encodeURIComponent(message || '')}`;

  const whatsappFallbackHref = `https://wa.me/201022121573?text=${encodeURIComponent(
    `Name: ${name || 'Visitor'}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`
  )}`;

  const modalContent = (
    <div
      dir={dir}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-3xl my-auto bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* RTL-safe Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 sm:top-5 sm:end-5 w-11 h-11 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pe-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0284ff]/10 border border-[#0284ff]/25 text-[#0284ff] dark:text-[#00C7FF] text-xs font-semibold uppercase tracking-wider mb-2">
            <Mail size={13} />
            <span>{t.contact.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#f1f5f9] tracking-tight">
            {t.contact.title}
          </h2>
          <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm mt-1">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left Info Column */}
          <div className="md:col-span-2 space-y-4 text-xs sm:text-sm">
            <div className="card-shimmer overflow-hidden p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                {t.contact.directChannels}
              </div>

              <div className="space-y-2">
                <a
                  href={`mailto:${profile.email}?subject=${encodeURIComponent(
                    'Mobile App Inquiry - Ahmed El-Bialy'
                  )}`}
                  className="w-full min-h-[44px] flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors text-start group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail size={15} className="text-[#0284ff] dark:text-[#00C7FF] shrink-0" />
                    <span className="text-xs text-slate-800 dark:text-gray-200 font-medium truncate">
                      {profile.email}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#0284ff] dark:text-[#00C7FF] font-semibold group-hover:underline shrink-0">
                    {lang === 'ar' ? 'فتح' : 'Open'}
                  </span>
                </a>

                <a
                  href="https://wa.me/201022121573"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-white/10 transition-colors text-start group"
                >
                  <div className="flex items-center gap-2">
                    <WhatsAppLogo size={15} />
                    <span dir="ltr" className="text-xs text-slate-800 dark:text-gray-200 font-medium tabular-nums">
                      {profile.phone}
                    </span>
                  </div>
                  <ArrowUpRight size={13} className="text-emerald-500" />
                </a>

                <a
                  href={`tel:${profile.phone}`}
                  className="min-h-[44px] flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-[#0284ff]/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors text-start group"
                >
                  <div className="flex items-center gap-2">
                    <Phone size={15} className="text-[#0284ff] dark:text-[#00C7FF] shrink-0" />
                    <span className="text-xs text-slate-800 dark:text-gray-200 font-medium">
                      {lang === 'ar' ? 'اتصال مباشر' : 'Call Directly'}
                    </span>
                  </div>
                  <ArrowUpRight size={13} className="text-[#0284ff] dark:text-[#00C7FF]" />
                </a>
              </div>

              {onOpenBooking && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBooking();
                  }}
                  className="btn-kinetic w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0284ff] to-[#00C7FF] hover:opacity-95 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
                >
                  <Video size={13} />
                  <span>{t.hero.bookMeeting}</span>
                </button>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-gray-400 space-y-1.5 font-mono">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Clock size={12} />
                <span>{lang === 'ar' ? 'زمن الاستجابة: أقل من 12 ساعة' : 'Response Time: < 12 Hours'}</span>
              </div>
              <div>
                {t.contact.locationLabel}: {t.hero.location}
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="md:col-span-3">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3">
                  <Check size={24} />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{t.contact.form.sentSuccess}</h4>
                <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
                  {lang === 'ar'
                    ? `شكراً لك! سيتم الرد عليك قريباً عبر البريد: ${email}`
                    : `Thank you! Ahmed will get back to you shortly at ${email}.`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {submitError && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <AlertCircle size={14} className="text-amber-500 shrink-0" />
                      <span>
                        {lang === 'ar'
                          ? 'تعذر الإرسال التلقائي — يمكنك الإرسال فوراً عبر:'
                          : 'Direct delivery unavailable right now — send instantly via:'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={whatsappFallbackHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg bg-emerald-600 text-white font-semibold text-xs"
                      >
                        <WhatsAppLogo size={13} />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={mailtoHref}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] sm:min-h-[38px] rounded-lg bg-[#0284ff] hover:bg-[#0070e0] text-white font-semibold text-xs transition-colors"
                      >
                        <Mail size={13} />
                        <span>{lang === 'ar' ? 'تطبيق البريد' : 'Email App'}</span>
                      </a>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                    {t.contact.form.nameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.contact.form.namePlaceholder}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0284ff] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                    {t.contact.form.emailLabel} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.contact.form.emailPlaceholder}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0284ff] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                    {t.contact.form.subjectLabel}
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t.contact.form.subjectPlaceholder}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0284ff] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                    {t.contact.form.messageLabel} *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.contact.form.messagePlaceholder}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0284ff] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-kinetic w-full min-h-[46px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0284ff] hover:bg-[#0070e0] text-white font-semibold text-sm shadow-md shadow-[#0284ff]/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>{t.contact.form.sendingButton}</span>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>{t.contact.form.sendButton}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
