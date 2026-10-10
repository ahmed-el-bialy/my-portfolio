import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Mail,
  Send,
  Check,
  MapPin,
  Phone,
  Github,
  Linkedin,
  Clock,
  ArrowUpRight,
  Video
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeveloperProfile, openEmailClient } from '../data/portfolioData';
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
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profile.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('https://formsubmit.co/ajax/ah.elbialy.dev@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          subject: subject || 'Modal Message from ' + name,
          message,
          _subject: `New Portfolio Message from ${name}: ${subject || 'Inquiry'}`,
        })
      });

      if (!response.ok) {
        console.warn('FormSubmit responded with non-200 status');
      }
    } catch (err) {
      console.warn('Network issue while sending form:', err);
    } finally {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2500);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-3xl my-auto bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Mail size={13} />
            <span>{t.contact.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight title-contrast">
            {t.contact.title}
          </h2>
          <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm mt-1">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left Info Column */}
          <div className="md:col-span-2 space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                {t.contact.directChannels}
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => openEmailClient(profile.email, 'Mobile App Inquiry - Ahmed El-Bialy')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail size={15} className="text-cyan-500 shrink-0" />
                    <span className="text-xs text-slate-800 dark:text-gray-200 font-medium truncate">{profile.email}</span>
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold group-hover:underline shrink-0">
                    {lang === 'ar' ? 'فتح' : 'Open'}
                  </span>
                </button>

                <a
                  href="https://wa.me/201022121573"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-white/10 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2">
                    <WhatsAppLogo size={15} />
                    <span className="text-xs text-slate-800 dark:text-gray-200 font-medium">{profile.phone}</span>
                  </div>
                  <ArrowUpRight size={13} className="text-emerald-500" />
                </a>
              </div>

              {onOpenBooking && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBooking();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
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
              <div>{t.contact.locationLabel}: {t.hero.location}</div>
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
                  {lang === 'ar' ? `شكراً لك! سيتم الرد عليك قريباً عبر البريد: ${email}` : `Thank you! Ahmed will get back to you shortly at ${email}.`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
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
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
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
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
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
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
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
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
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
