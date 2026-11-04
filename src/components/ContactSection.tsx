import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check, Github, Linkedin, Youtube, Calendar, Copy, FileText, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeveloperProfile, openEmailClient } from '../data/portfolioData';
import { WhatsAppLogo, TikTokLogo } from './TechLogos';
import { useLanguage } from '../context/LanguageContext';
import { SpotlightCard } from './SpotlightCard';
import { MagneticButton } from './MagneticButton';

interface ContactSectionProps {
  profile: DeveloperProfile;
  onOpenBooking?: () => void;
  onOpenResume?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile, onOpenBooking, onOpenResume }) => {
  const { lang, dir, t } = useLanguage();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return regex.test(trimmed);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profile.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(profile.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    if (!validateEmail(email)) {
      setEmailError(
        lang === 'ar'
          ? 'يرجى إدخال عنوان بريد إلكتروني صالح (مثال: name@example.com)'
          : 'Please enter a valid email address (e.g., name@example.com)'
      );
      return;
    }
    setEmailError(null);

    setIsSubmitting(true);
    setSubmitStatus('idle');

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
          subject: subject || 'New Portfolio Inquiry from ' + name,
          message,
          _subject: `New Message from Portfolio: ${subject || name}`,
        })
      });

      if (!response.ok) {
        throw new Error('FormSubmit error');
      }

      setIsSubmitting(false);
      setSubmitted(true);
      setSubmitStatus('success');
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 }
      });
      setTimeout(() => {
        setSubmitted(false);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }, 5000);
    } catch {
      setIsSubmitting(false);
      setSubmitStatus('error');
    }
  };

  return (
    <section id="contact" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-16 sm:py-20 border-t border-black/10 dark:border-white/5 w-full">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Mail size={13} />
          <span>{t.contact.badge}</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight title-contrast">
          {t.contact.title}
        </h2>
        <p className="text-slate-600 dark:text-gray-400 mt-2 text-sm sm:text-base body-contrast">
          {t.contact.subtitle}
        </p>
      </div>

      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
        
        {/* Card 1: Contact Form */}
        <SpotlightCard
          spotlightColor="rgba(59, 130, 246, 0.18)"
          borderColor="rgba(59, 130, 246, 0.45)"
          className="p-5 sm:p-7 flex flex-col justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Mail size={13} />
              <span>{lang === 'ar' ? 'رسالة مباشرة' : 'Direct Inquiry'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1 title-contrast">
              {t.contact.sendMessageTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-5">
              {lang === 'ar' ? 'يتم الرد عادةً خلال أقل من 24 ساعة.' : 'Replies are usually sent promptly within 24 hours.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Inline Status Banner with WhatsApp Fallback */}
              {submitStatus === 'success' && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs space-y-2 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span>{lang === 'ar' ? 'تم استلام رسالتك بنجاح!' : 'Message received successfully!'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-emerald-200/90">
                    {lang === 'ar'
                      ? 'شكراً لتواصلك، سأقوم بالرد عليك خلال أقل من 24 ساعة. للمتابعة العاجلة فوراً:'
                      : 'Thank you! I will review and reply within 24 hours. For instant direct follow-up:'}
                  </p>
                  <a
                    href={`https://wa.me/201022121573?text=${encodeURIComponent(
                      lang === 'ar'
                        ? `مرحباً أحمد، أرسلت لك رسالة عبر بورتفوليو بخصوص: ${subject || name}`
                        : `Hi Ahmed, I just sent a portfolio inquiry regarding: ${subject || name}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    <WhatsAppLogo size={14} />
                    <span>{lang === 'ar' ? 'تواصل فوري عبر واتساب' : 'Chat on WhatsApp Now'}</span>
                  </a>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs space-y-2 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle size={16} className="text-amber-500 shrink-0" />
                    <span>{lang === 'ar' ? 'تعذر الإرسال التلقائي' : 'Delivery delayed'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-amber-200/90">
                    {lang === 'ar'
                      ? 'يمكنك إرسال رسالتك مباشرة إلى أحمد بنقرة واحدة عبر واتساب:'
                      : 'You can reach Ahmed directly and securely on WhatsApp in one click:'}
                  </p>
                  <a
                    href={`https://wa.me/201022121573?text=${encodeURIComponent(
                      `Name: ${name || 'Inquirer'}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    <WhatsAppLogo size={14} />
                    <span>{lang === 'ar' ? 'إرسال الرسالة عبر واتساب' : 'Send via WhatsApp'}</span>
                  </a>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">
                    {t.contact.form.nameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.contact.form.namePlaceholder}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">
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
                    placeholder={t.contact.form.emailPlaceholder}
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={emailError ? 'contact-email-error' : undefined}
                    className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 transition-colors ${
                      emailError
                        ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/40'
                        : 'border-slate-300 dark:border-white/10 focus:border-cyan-500 focus-visible:ring-blue-500'
                    }`}
                  />
                  {emailError && (
                    <p id="contact-email-error" className="text-[11px] text-red-500 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">
                    {t.contact.form.subjectLabel} <span className="text-slate-400 text-[10px]">({lang === 'ar' ? 'اختياري' : 'optional'})</span>
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t.contact.form.subjectPlaceholder}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">
                    {t.contact.form.messageLabel} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.contact.form.messagePlaceholder}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <MagneticButton
                  type="submit"
                  disabled={isSubmitting || submitted}
                  strength={0.2}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50 min-h-[42px]"
                >
                  {submitted ? (
                    <>
                      <Check size={16} />
                      <span>{t.contact.form.sentSuccess}</span>
                    </>
                  ) : isSubmitting ? (
                    <span>{t.contact.form.sendingButton}</span>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>{t.contact.form.sendButton}</span>
                    </>
                  )}
                </MagneticButton>

                {onOpenBooking && (
                  <button
                    type="button"
                    onClick={onOpenBooking}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/15 to-cyan-500/15 hover:from-blue-600 hover:to-cyan-500 hover:text-white text-blue-700 dark:text-cyan-300 font-bold text-xs border border-blue-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[42px]"
                  >
                    <Calendar size={14} />
                    <span>{t.hero.bookMeeting}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </SpotlightCard>

        {/* Card 2: Direct Channels */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.18)"
          borderColor="rgba(16, 185, 129, 0.45)"
          className="p-5 sm:p-7 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Phone size={13} />
                <span>{lang === 'ar' ? 'تواصل فوري' : 'Instant Reach'}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1 title-contrast">
                {t.contact.directChannels}
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                {lang === 'ar' ? 'متاح عبر القنوات المهنية، واتساب والبريد الرسمي.' : 'Available across professional channels and phone.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                  <Mail size={16} />
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="text-xs text-slate-500 dark:text-gray-400">{t.contact.emailLabel}</div>
                  <div className="font-mono text-xs text-slate-900 dark:text-white font-semibold truncate mt-0.5">
                    {profile.email}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => openEmailClient(profile.email, 'Mobile App Project Inquiry - Flutter Developer')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-cyan-300 font-semibold text-[11px] border border-blue-500/25 transition-all cursor-pointer min-h-[30px]"
                    >
                      <Mail size={11} />
                      <span>{lang === 'ar' ? 'إرسال إيميل' : 'Send Email'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-gray-300 text-[11px] font-medium transition-colors cursor-pointer min-h-[30px]"
                    >
                      <Copy size={11} />
                      <span>{copiedEmail ? (lang === 'ar' ? '✓' : '✓') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Phone size={16} />
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="text-xs text-slate-500 dark:text-gray-400">{t.contact.phoneLabel}</div>
                  <div className="font-mono text-xs text-slate-900 dark:text-white font-semibold truncate mt-0.5">
                    {profile.phone}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href="https://wa.me/201022121573"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] border border-emerald-500/25 transition-all cursor-pointer min-h-[30px]"
                      title="Open WhatsApp Chat directly"
                    >
                      <WhatsAppLogo size={11} />
                      <span>{lang === 'ar' ? 'محادثة واتساب' : 'WhatsApp'}</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-gray-300 text-[11px] font-medium transition-colors cursor-pointer min-h-[30px]"
                      title="Copy phone number"
                    >
                      <Copy size={11} />
                      <span>{copiedPhone ? (lang === 'ar' ? '✓' : '✓') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-gray-400">{t.contact.locationLabel}</div>
                  <div className="text-xs sm:text-sm text-slate-900 dark:text-white font-semibold mt-0.5">
                    {t.hero.location}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-gray-500 mt-0.5 inline-block">
                    {lang === 'ar' ? 'توقيت مصر (GMT+2) • متاح للعمل عن بعد أو الانتقال' : 'Egypt (GMT+2) • Open to Remote & Relocation'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Icons row */}
          <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5">
            <div className="text-xs text-slate-500 dark:text-gray-400 mb-2">
              {lang === 'ar' ? 'الشبكات والمنصات:' : 'Social Networks:'}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="GitHub"
              >
                <Github size={16} />
              </a>
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-blue-600/20 text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="LinkedIn"
              >
                <Linkedin size={16} />
              </a>
              <a
                href={profile.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-red-600/20 text-slate-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="YouTube"
              >
                <Youtube size={16} />
              </a>
              <a
                href={profile.tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-pink-600/20 text-slate-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 text-xs font-semibold transition-colors min-h-[36px] flex items-center justify-center"
                title="TikTok"
              >
                <TikTokLogo size={13} />
              </a>
              <a
                href="https://wa.me/201022121573"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-emerald-600/20 text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="WhatsApp Direct Chat"
              >
                <WhatsAppLogo size={16} />
              </a>
            </div>
          </div>
        </SpotlightCard>

        {/* Card 3: Discover & Download Resume (CV) */}
        <SpotlightCard
          spotlightColor="rgba(6, 182, 212, 0.18)"
          borderColor="rgba(6, 182, 212, 0.45)"
          className="p-5 sm:p-7 flex flex-col justify-between md:col-span-2 lg:col-span-1"
        >
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <FileText size={13} />
                <span>{lang === 'ar' ? 'السيرة الذاتية المهنية' : 'Resume & Credentials'}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1 title-contrast">
                {lang === 'ar' ? 'استكشاف السيرة الذاتية' : 'Discover Resume'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                {lang === 'ar' 
                  ? 'استعرض خبراتي الأكاديمية والعملية بالنمط الرقمي التفاعلي أو حمّل النسخة الرسمية PDF.' 
                  : 'Explore my professional qualifications in interactive digital mode or direct PDF format.'}
              </p>
            </div>

            {/* Credential Highlights */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-transparent border border-blue-500/15 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {lang === 'ar' ? 'أبرز الإنجازات المهنية' : 'Career Highlights'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  ATS Verified
                </span>
              </div>
              
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>{lang === 'ar' ? 'مطور تطبيق Revio المنشور رسمياً على Google Play' : 'Creator of "Revio" published on Google Play'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>{lang === 'ar' ? 'معمارية Clean Architecture مع BLoC/Cubit' : 'Clean Architecture + BLoC/Cubit State Pattern'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>{lang === 'ar' ? 'طالب بكلية الذكاء الاصطناعي - جامعة كفر الشيخ' : 'AI Student at Kafrelsheikh University'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>{lang === 'ar' ? 'جاهز للتعيين الفوري (دوام كامل / عن بُعد)' : 'Immediate Availability (Full-time / Remote)'}</span>
                </li>
              </ul>
            </div>

            {/* Quick stats mini row */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <div className="text-sm font-black font-mono text-cyan-600 dark:text-cyan-400">1 Live App</div>
                <div className="text-[10px] text-slate-500 dark:text-gray-400">Google Play</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <div className="text-sm font-black font-mono text-blue-600 dark:text-blue-400">13+ Repos</div>
                <div className="text-[10px] text-slate-500 dark:text-gray-400">GitHub Verified</div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Digital & PDF */}
          <div className="space-y-2.5 pt-4 mt-4 border-t border-black/5 dark:border-white/5">
            {onOpenResume && (
              <button
                type="button"
                onClick={onOpenResume}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer min-h-[42px]"
              >
                <FileText size={15} />
                <span>{lang === 'ar' ? 'استعراض السيرة الرقمية (Digital CV)' : 'Explore Digital Interactive CV'}</span>
              </button>
            )}

            <a
              href={profile.cvDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white font-bold text-xs sm:text-sm border border-black/10 dark:border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[42px]"
              title="Open Google Drive PDF Resume"
            >
              <ExternalLink size={14} className="text-cyan-500" />
              <span>{lang === 'ar' ? 'تحميل وعرض ملف الـ PDF' : 'Download / View PDF File'}</span>
            </a>
          </div>
        </SpotlightCard>

      </div>
    </section>
  );
};
