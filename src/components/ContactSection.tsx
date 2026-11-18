import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Calendar,
  Copy,
  Check,
  FileText,
  ExternalLink,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Github,
  Linkedin,
  Mail,
  Phone,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeveloperProfile } from '../data/portfolioData';
import { AHMED_CONFIG, getEgyptLocalTime } from '../data/config';
import { WhatsAppLogo } from './TechLogos';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { MagneticButton } from './MagneticButton';
import { MeetingType } from './BookingMeetingModal';

interface ContactSectionProps {
  profile: DeveloperProfile;
  onOpenBooking?: (initialType?: MeetingType | null) => void;
  onOpenResume?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  profile,
  onOpenBooking,
  onOpenResume,
}) => {
  const { lang, dir, t } = useLanguage();
  const { showToast } = useToast();
  const [copiedKey, setCopiedKey] = useState<'email' | 'phone' | 'github' | 'linkedin' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [egyptTime, setEgyptTime] = useState<string>(() => getEgyptLocalTime(lang));

  // Streamlined 3-field inquiry form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [lastSubmittedName, setLastSubmittedName] = useState('');

  useEffect(() => {
    setEgyptTime(getEgyptLocalTime(lang));
    const timer = setInterval(() => {
      setEgyptTime(getEgyptLocalTime(lang));
    }, 30000);
    return () => clearInterval(timer);
  }, [lang]);

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    const regex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return regex.test(trimmed);
  };

  const handleCopy = (key: 'email' | 'phone' | 'github' | 'linkedin', value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    const labelMap = {
      email: lang === 'ar' ? 'تم نسخ البريد الإلكتروني' : 'Email copied to clipboard',
      phone: lang === 'ar' ? 'تم نسخ رقم الهاتف' : 'Phone number copied',
      github: lang === 'ar' ? 'تم نسخ رابط GitHub' : 'GitHub link copied',
      linkedin: lang === 'ar' ? 'تم نسخ رابط LinkedIn' : 'LinkedIn link copied',
    };
    showToast({ message: labelMap[key], detail: value });
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const handleResetForm = () => {
    setSubmitStatus('idle');
    setName('');
    setEmail('');
    setMessage('');
    setEmailError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    if (!validateEmail(email)) {
      setEmailError(
        lang === 'ar'
          ? 'يرجى إدخال عنوان بريد إلكتروني صحيح (مثال: name@example.com)'
          : 'Please enter a valid email address (e.g., name@example.com)'
      );
      return;
    }
    setEmailError(null);
    setIsSubmitting(true);
    setSubmitStatus('idle');

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
          message,
          _subject: `Portfolio Inquiry from ${name}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Contact delivery error');
      }

      setLastSubmittedName(name.trim());
      setIsSubmitting(false);
      setSubmitStatus('success');
      confetti({
        particleCount: 65,
        spread: 55,
        origin: { y: 0.75 },
        colors: ['#027DFD', '#00C7FF', '#10B981'],
      });
    } catch {
      setIsSubmitting(false);
      setSubmitStatus('error');
    }
  };

  const meetingSlots: Array<{
    type: MeetingType;
    duration: string;
    title: string;
  }> = [
    {
      type: 'quick-chat',
      duration: '15m',
      title: lang === 'ar' ? 'محادثة سريعة' : 'Quick Chat',
    },
    {
      type: 'discovery-cal',
      duration: '30m',
      title: lang === 'ar' ? 'مكالمة استكشافية' : 'Discovery Call',
    },
    {
      type: 'technical-discussion',
      duration: '45m',
      title: lang === 'ar' ? 'نقاش تقني ومعماري' : 'Technical Review',
    },
  ];

  return (
    <section
      id="contact"
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16 w-full"
    >
      {/* Editorial Section Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="flex items-center gap-2 text-xs font-medium text-[#027DFD] dark:text-[#00C7FF] mb-2">
          <span>{t.contact.badge}</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
            ·
          </span>
          <span className="font-mono text-slate-600 dark:text-[#94a3b8] tabular-nums">
            {lang === 'ar' ? `توقيت مصر: ${egyptTime}` : `Egypt Time: ${egyptTime}`}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-[#f1f5f9] tracking-tight [text-wrap:balance]">
          {t.contact.title}
        </h1>
        <p className="text-slate-600 dark:text-[#94a3b8] mt-2.5 text-sm sm:text-base">
          {t.contact.subtitle}
        </p>
      </div>

      {/* 2-Column Layout: Streamlined Form Left + Consultation & Quick Copy Channels Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: 3-Field Inquiry Form & Paper-Plane Success Card */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 shadow-sm">
          {submitStatus === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="py-6 sm:py-8 text-center space-y-5"
            >
              <motion.div
                initial={{ x: -18, y: 18, rotate: -15, opacity: 0 }}
                animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30"
              >
                <Send size={26} />
              </motion.div>

              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#f1f5f9]">
                  {lang === 'ar'
                    ? `شكراً لتواصلك${lastSubmittedName ? ` يا ${lastSubmittedName}` : ''}!`
                    : `Thank you${lastSubmittedName ? `, ${lastSubmittedName}` : ''}! Message sent.`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94a3b8] leading-relaxed">
                  {lang === 'ar'
                    ? 'تم إرسال رسالتك بنجاح إلى بريدي المباشر، وسأرد عليك بملاحظات واضحة خلال أقل من 24 ساعة.'
                    : 'Your message is in my inbox. I personally review every inquiry and respond with clear next steps within 24 hours.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={`https://wa.me/201022121573?text=${encodeURIComponent(
                    lang === 'ar'
                      ? `مرحباً أحمد، أرسلت لك رسالة عبر البورتفوليو من ${lastSubmittedName}`
                      : `Hi Ahmed, I just sent a message via your portfolio (${lastSubmittedName}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm"
                >
                  <WhatsAppLogo size={15} />
                  <span>{lang === 'ar' ? 'متابعة فورية على واتساب' : 'Quick WhatsApp Follow-Up'}</span>
                </a>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#161b27] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-[#f1f5f9] font-semibold text-xs sm:text-sm border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>{lang === 'ar' ? 'إرسال رسالة أخرى' : 'Send Another Message'}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#f1f5f9]">
                  {t.contact.sendMessageTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#94a3b8] mt-1">
                  {lang === 'ar'
                    ? '3 خطوات سريعة فقط — يرد أحمد عادةً خلال أقل من 24 ساعة.'
                    : 'Just 3 quick fields — replies typically arrive within 24 hours.'}
                </p>
              </div>

              {submitStatus === 'error' && (
                <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-200 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle size={15} className="text-amber-500 shrink-0" />
                    <span>
                      {lang === 'ar'
                        ? 'تعذر الإرسال التلقائي في المتصفح الحالي'
                        : 'Direct form delivery unavailable right now'}
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    {lang === 'ar'
                      ? 'يمكنك إرسال نفس الرسالة بنقرة واحدة عبر واتساب أو البريد الإلكتروني:'
                      : 'Send this same inquiry directly in one tap via WhatsApp or Email:'}
                  </p>
                  <a
                    href={`https://wa.me/201022121573?text=${encodeURIComponent(
                      `Name: ${name || 'Visitor'}\nEmail: ${email}\nMessage: ${message}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                  >
                    <WhatsAppLogo size={14} />
                    <span>{lang === 'ar' ? 'إرسال عبر واتساب' : 'Send via WhatsApp'}</span>
                  </a>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold text-slate-700 dark:text-[#f1f5f9] mb-1.5"
                  >
                    {t.contact.form.nameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'ar' ? 'أحمد محمد' : 'Your full name'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/10 text-base sm:text-sm text-slate-900 dark:text-[#f1f5f9] placeholder-slate-400 focus:outline-none focus:border-[#027DFD] focus-visible:ring-2 focus-visible:ring-[#027DFD]/30 transition-colors min-h-[44px]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold text-slate-700 dark:text-[#f1f5f9] mb-1.5"
                  >
                    {t.contact.form.emailLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    placeholder="name@company.com"
                    aria-invalid={Boolean(emailError)}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#161b27] border text-base sm:text-sm text-slate-900 dark:text-[#f1f5f9] placeholder-slate-400 focus:outline-none focus-visible:ring-2 transition-colors min-h-[44px] ${
                      emailError
                        ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/30'
                        : 'border-slate-200 dark:border-white/10 focus:border-[#027DFD] focus-visible:ring-[#027DFD]/30'
                    }`}
                  />
                  {emailError && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold text-slate-700 dark:text-[#f1f5f9] mb-1.5"
                  >
                    {t.contact.form.messageLabel} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.contact.form.messagePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/10 text-base sm:text-sm text-slate-900 dark:text-[#f1f5f9] placeholder-slate-400 focus:outline-none focus:border-[#027DFD] focus-visible:ring-2 focus-visible:ring-[#027DFD]/30 transition-colors resize-none"
                  />
                </div>

                <div className="pt-1">
                  <MagneticButton
                    type="submit"
                    disabled={isSubmitting}
                    strength={0.18}
                    className="w-full py-3 rounded-xl bg-[#027DFD] hover:bg-[#026ae0] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#027DFD]/25 cursor-pointer disabled:opacity-50 min-h-[46px]"
                  >
                    <Send size={15} />
                    <span>
                      {isSubmitting ? t.contact.form.sendingButton : t.contact.form.sendButton}
                    </span>
                  </MagneticButton>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Cal.com Scheduling + Copy-to-Clipboard Contact Cards */}
        <div className="lg:col-span-6 space-y-6">
          {/* Elevated Cal.com Consultation Spotlight Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0f1117] border-2 border-[#027DFD]/35 shadow-lg">
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#027DFD] dark:text-[#00C7FF]">
                <Calendar size={13} />
                <span>Cal.com Scheduling</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#f1f5f9] mt-1">
                {t.contact.meetingCard.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94a3b8] mt-1.5 leading-relaxed">
                {t.contact.meetingCard.subtitle}
              </p>
            </div>

            {onOpenBooking && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
                {meetingSlots.map((slot) => (
                  <button
                    key={slot.type}
                    type="button"
                    onClick={() => onOpenBooking(slot.type)}
                    className="p-3.5 min-h-[54px] rounded-xl bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/10 hover:border-[#027DFD]/60 text-start transition-all cursor-pointer group flex sm:block items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#027DFD] dark:text-[#00C7FF] tabular-nums">
                      <Clock size={12} />
                      <span>{slot.duration}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-[#f1f5f9] sm:mt-1 group-hover:text-[#027DFD] dark:group-hover:text-[#00C7FF]">
                      {slot.title}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {onOpenBooking && (
              <button
                type="button"
                onClick={() => onOpenBooking(null)}
                className="w-full py-3 px-5 rounded-xl bg-[#027DFD] hover:bg-[#026ae0] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#027DFD]/25 cursor-pointer min-h-[46px]"
              >
                <Calendar size={16} />
                <span>{t.contact.meetingCard.button}</span>
                <ArrowRight size={15} className={dir === 'rtl' ? 'rotate-180' : ''} />
              </button>
            )}
          </div>

          {/* Clickable Copy-to-Clipboard Direct Channels */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#f1f5f9]">
                {t.contact.directChannels}
              </h3>
              {copiedKey && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check size={13} />
                  <span>{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email Copy Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/8">
                <div className="text-[11px] text-slate-500 dark:text-[#94a3b8]">
                  {t.contact.emailLabel}
                </div>
                <div className="font-mono text-xs text-slate-900 dark:text-[#f1f5f9] font-semibold truncate mt-0.5">
                  {AHMED_CONFIG.email}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <a
                    href={`mailto:${AHMED_CONFIG.email}?subject=${encodeURIComponent(
                      'Mobile App Project Inquiry - Flutter Developer'
                    )}`}
                    className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] sm:min-h-[36px] rounded-lg bg-[#027DFD]/10 hover:bg-[#027DFD] hover:text-white text-[#027DFD] dark:text-[#00C7FF] font-semibold text-[11px] transition-colors"
                  >
                    <Mail size={12} />
                    <span>{lang === 'ar' ? 'مراسلة' : 'Compose'}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy('email', AHMED_CONFIG.email)}
                    className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] sm:min-h-[36px] rounded-lg bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-[11px] font-medium cursor-pointer"
                  >
                    {copiedKey === 'email' ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Copy size={12} />
                    )}
                    <span>{copiedKey === 'email' ? (lang === 'ar' ? 'تم' : 'Copied') : lang === 'ar' ? 'نسخ' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Phone / WhatsApp Copy Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/8">
                <div className="text-[11px] text-slate-500 dark:text-[#94a3b8]">
                  {t.contact.phoneLabel}
                </div>
                <div className="font-mono text-xs text-slate-900 dark:text-[#f1f5f9] font-semibold truncate mt-0.5 tabular-nums">
                  {AHMED_CONFIG.phone}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <a
                    href={AHMED_CONFIG.socials.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] sm:min-h-[36px] rounded-lg bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] transition-colors"
                  >
                    <WhatsAppLogo size={12} />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${AHMED_CONFIG.phone}`}
                    className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] sm:min-h-[36px] rounded-lg bg-[#027DFD]/10 hover:bg-[#027DFD] hover:text-white text-[#027DFD] dark:text-[#00C7FF] font-semibold text-[11px] transition-colors"
                  >
                    <Phone size={12} />
                    <span>{lang === 'ar' ? 'اتصال' : 'Call'}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy('phone', AHMED_CONFIG.phone)}
                    className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] sm:min-h-[36px] rounded-lg bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-[11px] font-medium cursor-pointer"
                  >
                    {copiedKey === 'phone' ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Copy size={12} />
                    )}
                    <span>{copiedKey === 'phone' ? (lang === 'ar' ? 'تم' : 'Copied') : lang === 'ar' ? 'نسخ' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* GitHub Copy Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/8">
                <div className="text-[11px] text-slate-500 dark:text-[#94a3b8]">GitHub</div>
                <div className="font-mono text-xs text-slate-900 dark:text-[#f1f5f9] font-semibold truncate mt-0.5">
                  @{AHMED_CONFIG.githubUsername}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <a
                    href={AHMED_CONFIG.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] sm:min-h-[36px] rounded-lg bg-slate-200/80 dark:bg-white/10 hover:bg-[#027DFD] hover:text-white text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition-colors"
                  >
                    <Github size={12} />
                    <span>{lang === 'ar' ? 'فتح' : 'Open'}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy('github', AHMED_CONFIG.socials.github)}
                    className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] sm:min-h-[36px] rounded-lg bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-[11px] font-medium cursor-pointer"
                  >
                    {copiedKey === 'github' ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Copy size={12} />
                    )}
                    <span>{copiedKey === 'github' ? (lang === 'ar' ? 'تم' : 'Copied') : lang === 'ar' ? 'نسخ' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* LinkedIn Copy Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/8">
                <div className="text-[11px] text-slate-500 dark:text-[#94a3b8]">LinkedIn</div>
                <div className="font-mono text-xs text-slate-900 dark:text-[#f1f5f9] font-semibold truncate mt-0.5">
                  in/ahmedel-bialy
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <a
                    href={AHMED_CONFIG.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] sm:min-h-[36px] rounded-lg bg-[#027DFD]/10 hover:bg-[#027DFD] hover:text-white text-[#027DFD] dark:text-[#00C7FF] font-semibold text-[11px] transition-colors"
                  >
                    <Linkedin size={12} />
                    <span>{lang === 'ar' ? 'فتح' : 'Open'}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy('linkedin', AHMED_CONFIG.socials.linkedin)}
                    className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] sm:min-h-[36px] rounded-lg bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-[11px] font-medium cursor-pointer"
                  >
                    {copiedKey === 'linkedin' ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Copy size={12} />
                    )}
                    <span>{copiedKey === 'linkedin' ? (lang === 'ar' ? 'تم' : 'Copied') : lang === 'ar' ? 'نسخ' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Resume Quick Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {onOpenResume && (
                <button
                  type="button"
                  onClick={onOpenResume}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-[#161b27] hover:bg-[#027DFD] dark:hover:bg-[#027DFD] text-white font-semibold text-xs border border-transparent dark:border-white/10 transition-colors cursor-pointer"
                >
                  <FileText size={14} />
                  <span>{lang === 'ar' ? 'استعراض السيرة التفاعلية' : 'Open Interactive CV'}</span>
                </button>
              )}
              <a
                href={profile.cvDriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-[#161b27] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-[#f1f5f9] font-semibold text-xs border border-slate-200 dark:border-white/10 transition-colors"
              >
                <ExternalLink size={13} className="text-[#027DFD] dark:text-[#00C7FF]" />
                <span>{lang === 'ar' ? 'تحميل PDF الرسمي' : 'Download PDF CV'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
