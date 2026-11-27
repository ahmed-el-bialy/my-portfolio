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
  Briefcase,
  Smartphone,
  Layers,
  MessageSquare,
  Youtube,
  Smartphone as PlayIcon,
} from 'lucide-react';
import { DeveloperProfile } from '../data/portfolioData';
import { AHMED_CONFIG, getEgyptLocalTime } from '../data/config';
import { WhatsAppLogo, TikTokLogo, InstagramLogo } from './TechLogos';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/clipboard';
import { MagneticButton } from './MagneticButton';
import { MeetingType } from './BookingMeetingModal';
import { RevealOnScroll, StaggerGroup, StaggerItem } from './RevealOnScroll';

interface ContactSectionProps {
  profile: DeveloperProfile;
  onOpenBooking?: (initialType?: MeetingType | null) => void;
  onOpenResume?: () => void;
}

type InquiryTopicId = 'full-time' | 'freelance' | 'architecture' | 'general';

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

  // Modernized inquiry state with quick topic selector + 3 crisp fields
  const [inquiryTopic, setInquiryTopic] = useState<InquiryTopicId>('full-time');
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

  const handleCopy = async (key: 'email' | 'phone' | 'github' | 'linkedin', value: string) => {
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setCopiedKey(key);
    const labelMap = {
      email: lang === 'ar' ? 'تم نسخ البريد الإلكتروني' : 'Email copied to clipboard',
      phone: lang === 'ar' ? 'تم نسخ رقم واتساب' : 'WhatsApp number copied',
      github: lang === 'ar' ? 'تم نسخ رابط GitHub' : 'GitHub link copied',
      linkedin: lang === 'ar' ? 'تم نسخ رابط LinkedIn' : 'LinkedIn link copied',
    };
    showToast({ message: labelMap[key], detail: value });
    window.setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const inquiryTopics: Array<{
    id: InquiryTopicId;
    label: string;
    subjectTag: string;
    placeholder: string;
    icon: React.FC<{ size?: number; className?: string }>;
  }> = [
    {
      id: 'full-time',
      label: lang === 'ar' ? 'توظيف / فرصة عمل' : 'Full-Time Role',
      subjectTag: 'Full-Time Flutter Role',
      placeholder:
        lang === 'ar'
          ? 'شاركني تفاصيل الوظيفة أو الفريق ومواعيد المقابلة المقترحة...'
          : 'Share the role details, team stack, and preferred interview window...',
      icon: Briefcase,
    },
    {
      id: 'freelance',
      label: lang === 'ar' ? 'تطوير تطبيق جديد' : 'Freelance App',
      subjectTag: 'Freelance Flutter App Build',
      placeholder:
        lang === 'ar'
          ? 'احكي لي عن فكرة التطبيق، المنصات المطلوبة، والجدول الزمني...'
          : 'Tell me about your app idea, target platforms, and timeline...',
      icon: Smartphone,
    },
    {
      id: 'architecture',
      label: lang === 'ar' ? 'مراجعة كود / معمارية' : 'Architecture Review',
      subjectTag: 'Architecture & Code Review',
      placeholder:
        lang === 'ar'
          ? 'ما التحدي التقني أو التحسين المطلوب في تطبيق Flutter الحالي؟'
          : 'What technical challenge or optimization can I help solve in your Flutter app?',
      icon: Layers,
    },
    {
      id: 'general',
      label: lang === 'ar' ? 'تواصل عام' : 'General',
      subjectTag: 'Portfolio Inquiry',
      placeholder: t.contact.form.messagePlaceholder,
      icon: MessageSquare,
    },
  ];

  const activeTopicMeta =
    inquiryTopics.find((item) => item.id === inquiryTopic) || inquiryTopics[0];

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
          topic: activeTopicMeta.subjectTag,
          message,
          _subject: `[${activeTopicMeta.subjectTag}] Portfolio Inquiry from ${name}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Contact delivery error');
      }

      setLastSubmittedName(name.trim());
      setIsSubmitting(false);
      setSubmitStatus('success');
      try {
        const confettiModule = await import('canvas-confetti');
        confettiModule.default({
          particleCount: 65,
          spread: 55,
          origin: { y: 0.75 },
          colors: ['#0284ff', '#38bdf8', '#10B981'],
        });
      } catch {
        // Non-blocking celebration
      }
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
      {/* 1. Editorial Header */}
      <RevealOnScroll className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8] mb-2.5">
          <span>{t.contact.badge}</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
            ·
          </span>
          <span className="text-slate-600 dark:text-[#94a3b8] tabular-nums">
            {lang === 'ar' ? `توقيت مصر: ${egyptTime}` : `Egypt Time: ${egyptTime}`}
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
            ·
          </span>
          <span className="text-emerald-700 dark:text-emerald-400">
            {lang === 'ar' ? 'رد خلال 24 ساعة' : '< 24h Response'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-[#f1f5f9] tracking-tight [text-wrap:balance]">
          {t.contact.title}
        </h1>
        <p className="text-slate-600 dark:text-[#94a3b8] mt-3 text-sm sm:text-base max-w-xl leading-relaxed">
          {t.contact.subtitle}
        </p>
      </RevealOnScroll>

      {/* 2. Top Full-Width Quick Channels Strip (4 Glassmorphic Channel Cards) */}
      <StaggerGroup
        staggerDelay={0.045}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 sm:mb-8"
      >
        {/* Channel 1: WhatsApp Direct */}
        <StaggerItem className="card-shimmer rounded-2xl bg-white/95 dark:bg-[#0f1117]/82 backdrop-blur-xl border border-emerald-500/30 dark:border-emerald-500/25 hover:border-emerald-500/60 p-4 sm:p-5 flex flex-col justify-between gap-3.5 shadow-[0_8px_28px_rgba(15,23,42,0.05)] dark:shadow-[0_14px_36px_rgba(0,0,0,0.42)] transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                {lang === 'ar' ? 'تواصل فوري · واتساب' : 'Instant · WhatsApp'}
              </div>
              <div
                className="font-mono text-sm font-bold text-slate-900 dark:text-white truncate mt-1 tabular-nums"
                dir="ltr"
              >
                {AHMED_CONFIG.phone}
              </div>
            </div>
            <span className="w-9 h-9 rounded-xl bg-emerald-500/12 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <WhatsAppLogo size={17} />
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-white/[0.06]">
            <a
              href={AHMED_CONFIG.socials.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-kinetic flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors whitespace-nowrap"
            >
              <WhatsAppLogo size={13} />
              <span>{lang === 'ar' ? 'محادثة مباشرة' : 'Chat Now'}</span>
            </a>
            <button
              type="button"
              onClick={() => handleCopy('phone', AHMED_CONFIG.phone)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 min-h-[38px] rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0"
              aria-label={lang === 'ar' ? 'نسخ رقم واتساب' : 'Copy WhatsApp number'}
            >
              {copiedKey === 'phone' ? (
                <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy size={13} />
              )}
              <span>{copiedKey === 'phone' ? (lang === 'ar' ? 'تم' : 'Copied') : lang === 'ar' ? 'نسخ' : 'Copy'}</span>
            </button>
          </div>
        </StaggerItem>

        {/* Channel 2: Direct Email */}
        <StaggerItem className="card-shimmer rounded-2xl bg-white/95 dark:bg-[#0f1117]/82 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.09] hover:border-[#0284ff]/50 p-4 sm:p-5 flex flex-col justify-between gap-3.5 shadow-[0_8px_28px_rgba(15,23,42,0.05)] dark:shadow-[0_14px_36px_rgba(0,0,0,0.42)] transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8]">
                {t.contact.emailLabel}
              </div>
              <div className="font-mono text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate mt-1">
                {AHMED_CONFIG.email}
              </div>
            </div>
            <span className="w-9 h-9 rounded-xl bg-[#0284ff]/12 border border-[#0284ff]/25 text-[#0369a1] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
              <Mail size={16} />
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-white/[0.06]">
            <a
              href={`mailto:${AHMED_CONFIG.email}?subject=${encodeURIComponent(
                'Mobile App Project Inquiry - Flutter Developer'
              )}`}
              className="btn-kinetic flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-[#0284ff]/12 hover:bg-[#0284ff] text-[#0369a1] dark:text-[#38bdf8] hover:text-white border border-[#0284ff]/30 font-semibold text-xs transition-colors whitespace-nowrap"
            >
              <Mail size={13} />
              <span>{lang === 'ar' ? 'إرسال بريد' : 'Compose'}</span>
            </a>
            <button
              type="button"
              onClick={() => handleCopy('email', AHMED_CONFIG.email)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 min-h-[38px] rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0"
              aria-label={lang === 'ar' ? 'نسخ البريد الإلكتروني' : 'Copy email'}
            >
              {copiedKey === 'email' ? (
                <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy size={13} />
              )}
              <span>{copiedKey === 'email' ? (lang === 'ar' ? 'تم' : 'Copied') : lang === 'ar' ? 'نسخ' : 'Copy'}</span>
            </button>
          </div>
        </StaggerItem>

        {/* Channel 3: LinkedIn */}
        <StaggerItem className="card-shimmer rounded-2xl bg-white/95 dark:bg-[#0f1117]/82 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.09] hover:border-[#0284ff]/50 p-4 sm:p-5 flex flex-col justify-between gap-3.5 shadow-[0_8px_28px_rgba(15,23,42,0.05)] dark:shadow-[0_14px_36px_rgba(0,0,0,0.42)] transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8]">
                LinkedIn
              </div>
              <div className="font-mono text-sm font-bold text-slate-900 dark:text-white truncate mt-1">
                in/ahmedel-bialy
              </div>
            </div>
            <span className="w-9 h-9 rounded-xl bg-[#0284ff]/12 border border-[#0284ff]/25 text-[#0369a1] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
              <Linkedin size={16} />
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-white/[0.06]">
            <a
              href={AHMED_CONFIG.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-kinetic flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-[#0284ff]/12 hover:bg-[#0284ff] text-[#0369a1] dark:text-[#38bdf8] hover:text-white border border-[#0284ff]/30 font-semibold text-xs transition-colors whitespace-nowrap"
            >
              <Linkedin size={13} />
              <span>{lang === 'ar' ? 'فتح الحساب' : 'Connect'}</span>
            </a>
            <button
              type="button"
              onClick={() => handleCopy('linkedin', AHMED_CONFIG.socials.linkedin)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 min-h-[38px] rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0"
              aria-label={lang === 'ar' ? 'نسخ رابط LinkedIn' : 'Copy LinkedIn URL'}
            >
              {copiedKey === 'linkedin' ? (
                <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy size={13} />
              )}
              <span>{copiedKey === 'linkedin' ? (lang === 'ar' ? 'تم' : 'Copied') : lang === 'ar' ? 'نسخ' : 'Copy'}</span>
            </button>
          </div>
        </StaggerItem>

        {/* Channel 4: GitHub */}
        <StaggerItem className="card-shimmer rounded-2xl bg-white/95 dark:bg-[#0f1117]/82 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.09] hover:border-[#0284ff]/50 p-4 sm:p-5 flex flex-col justify-between gap-3.5 shadow-[0_8px_28px_rgba(15,23,42,0.05)] dark:shadow-[0_14px_36px_rgba(0,0,0,0.42)] transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
                GitHub
              </div>
              <div className="font-mono text-sm font-bold text-slate-900 dark:text-white truncate mt-1">
                @{AHMED_CONFIG.githubUsername}
              </div>
            </div>
            <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0">
              <Github size={16} />
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-white/[0.06]">
            <a
              href={AHMED_CONFIG.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-kinetic flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-[#0284ff] text-slate-800 dark:text-slate-100 hover:text-white border border-slate-200 dark:border-white/10 font-semibold text-xs transition-colors whitespace-nowrap"
            >
              <Github size={13} />
              <span>{lang === 'ar' ? 'تصفح الأكواد' : 'View Repos'}</span>
            </a>
            <button
              type="button"
              onClick={() => handleCopy('github', AHMED_CONFIG.socials.github)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 min-h-[38px] rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0"
              aria-label={lang === 'ar' ? 'نسخ رابط GitHub' : 'Copy GitHub URL'}
            >
              {copiedKey === 'github' ? (
                <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy size={13} />
              )}
              <span>{copiedKey === 'github' ? (lang === 'ar' ? 'تم' : 'Copied') : lang === 'ar' ? 'نسخ' : 'Copy'}</span>
            </button>
          </div>
        </StaggerItem>
      </StaggerGroup>

      {/* 2b. Social & Content Channels Bar (YouTube · TikTok · Instagram · Google Play) */}
      <RevealOnScroll
        delay={0.04}
        className="card-shimmer mb-6 sm:mb-8 rounded-2xl bg-white/90 dark:bg-[#0f1117]/75 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.08] px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_6px_22px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-[#0284ff] shrink-0" />
          <span>
            {lang === 'ar'
              ? 'حسابات المحتوى والمنصات:'
              : 'Social & Content Channels:'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={profile.youtubeUrl || AHMED_CONFIG.socials.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-kinetic inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl bg-slate-50 dark:bg-white/[0.04] hover:bg-[#0284ff]/[0.08] dark:hover:bg-[#0284ff]/[0.14] text-slate-800 dark:text-slate-200 hover:text-[#0369a1] dark:hover:text-[#38bdf8] border border-slate-200 dark:border-white/10 hover:border-[#0284ff]/45 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Youtube size={14} className="text-[#0369a1] dark:text-[#38bdf8] shrink-0" />
            <span>YouTube</span>
          </a>

          <a
            href={profile.tiktokUrl || AHMED_CONFIG.socials.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-kinetic inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl bg-slate-50 dark:bg-white/[0.04] hover:bg-[#0284ff]/[0.08] dark:hover:bg-[#0284ff]/[0.14] text-slate-800 dark:text-slate-200 hover:text-[#0369a1] dark:hover:text-[#38bdf8] border border-slate-200 dark:border-white/10 hover:border-[#0284ff]/45 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <TikTokLogo size={13} className="text-[#0369a1] dark:text-[#38bdf8] shrink-0" />
            <span>TikTok</span>
          </a>

          <a
            href={profile.instagramUrl || AHMED_CONFIG.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-kinetic inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl bg-slate-50 dark:bg-white/[0.04] hover:bg-[#0284ff]/[0.08] dark:hover:bg-[#0284ff]/[0.14] text-slate-800 dark:text-slate-200 hover:text-[#0369a1] dark:hover:text-[#38bdf8] border border-slate-200 dark:border-white/10 hover:border-[#0284ff]/45 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <InstagramLogo size={14} className="text-[#0369a1] dark:text-[#38bdf8] shrink-0" />
            <span>Instagram</span>
          </a>

          <a
            href={AHMED_CONFIG.socials.playstore}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-kinetic inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl bg-emerald-500/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 hover:text-white border border-emerald-500/25 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <PlayIcon size={13} className="shrink-0" />
            <span>{lang === 'ar' ? 'Revio على Google Play' : 'Revio · Google Play'}</span>
          </a>
        </div>
      </RevealOnScroll>

      {/* 3. Stretch-Matched 2-Column Main Area: Modernized Inquiry Form + Cal.com Booking & CV */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        {/* Left Column: Modernized Topic-Aware Inquiry Form */}
        <RevealOnScroll
          delay={0.05}
          className="card-shimmer overflow-hidden lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white/95 dark:bg-[#0f1117]/82 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.09] shadow-[0_10px_34px_rgba(15,23,42,0.06)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between"
        >
          {submitStatus === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="py-10 text-center space-y-5 my-auto"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30"
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm"
                >
                  <WhatsAppLogo size={15} />
                  <span>{lang === 'ar' ? 'متابعة فورية على واتساب' : 'Quick WhatsApp Follow-Up'}</span>
                </a>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-100 dark:bg-[#161b27] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-[#f1f5f9] font-semibold text-xs sm:text-sm border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>{lang === 'ar' ? 'إرسال رسالة أخرى' : 'Send Another Message'}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-[#f1f5f9]">
                    {t.contact.sendMessageTitle}
                  </h2>
                  <span className="text-[11px] font-mono text-[#0369a1] dark:text-[#38bdf8]">
                    {lang === 'ar' ? 'نموذج مباشر' : 'Direct Form'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-[#94a3b8] mt-1">
                  {lang === 'ar'
                    ? 'اختر نوع الطلب ثم أرسل رسالتك — تصلك الإجابة غالباً خلال ساعات.'
                    : 'Choose an inquiry focus below — replies typically arrive within hours.'}
                </p>

                {/* Interactive Inquiry Topic Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  {inquiryTopics.map((topic) => {
                    const TopicIcon = topic.icon;
                    const isSelected = inquiryTopic === topic.id;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setInquiryTopic(topic.id)}
                        className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#0284ff] text-white border-[#0284ff] shadow-xs shadow-[#0284ff]/30'
                            : 'bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#0284ff]/50'
                        }`}
                      >
                        <TopicIcon size={13} className="shrink-0" />
                        <span className="truncate">{topic.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {submitStatus === 'error' && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-200 text-xs space-y-2.5">
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
                      `Topic: ${activeTopicMeta.subjectTag}\nName: ${name || 'Visitor'}\nEmail: ${email}\nMessage: ${message}`
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/85 dark:bg-[#161b27]/90 border border-slate-200 dark:border-white/10 text-base sm:text-sm text-slate-900 dark:text-[#f1f5f9] placeholder-slate-400 focus:outline-none focus:border-[#0284ff] focus-visible:ring-2 focus-visible:ring-[#0284ff]/30 transition-colors min-h-[44px]"
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
                      aria-describedby={emailError ? 'contact-email-error' : undefined}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50/85 dark:bg-[#161b27]/90 border text-base sm:text-sm text-slate-900 dark:text-[#f1f5f9] placeholder-slate-400 focus:outline-none focus-visible:ring-2 transition-colors min-h-[44px] ${
                        emailError
                          ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/30'
                          : 'border-slate-200 dark:border-white/10 focus:border-[#0284ff] focus-visible:ring-[#0284ff]/30'
                      }`}
                    />
                    {emailError && (
                      <p
                        id="contact-email-error"
                        role="alert"
                        className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"
                      >
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{emailError}</span>
                      </p>
                    )}
                  </div>
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
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={activeTopicMeta.placeholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/85 dark:bg-[#161b27]/90 border border-slate-200 dark:border-white/10 text-base sm:text-sm text-slate-900 dark:text-[#f1f5f9] placeholder-slate-400 focus:outline-none focus:border-[#0284ff] focus-visible:ring-2 focus-visible:ring-[#0284ff]/30 transition-colors resize-none"
                  />
                </div>

                <div className="pt-1">
                  <MagneticButton
                    type="submit"
                    disabled={isSubmitting}
                    strength={0.08}
                    className="btn-kinetic w-full py-3 rounded-xl bg-[#0284ff] hover:bg-[#0070e0] border border-[#0284ff] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[46px] shadow-[0_8px_24px_rgba(2,132,255,0.28)]"
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
        </RevealOnScroll>

        {/* Right Column: Elevated Cal.com Discovery Spotlight + CV Deck */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          {/* Elevated Cal.com Consultation Spotlight Card */}
          <RevealOnScroll
            delay={0.08}
            className="card-shimmer overflow-hidden p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-white via-white to-blue-50/50 dark:from-[#0f1117]/90 dark:via-[#0f1117]/85 dark:to-[#0284ff]/[0.09] backdrop-blur-xl border border-[#0284ff]/35 shadow-[0_10px_34px_rgba(2,132,255,0.08)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] flex-1 flex flex-col justify-between gap-5"
          >
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#0369a1] dark:text-[#38bdf8]">
                <Calendar size={13} />
                <span>Cal.com Scheduling</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#f1f5f9] mt-1.5 [text-wrap:balance]">
                {t.contact.meetingCard.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94a3b8] mt-2 leading-relaxed">
                {t.contact.meetingCard.subtitle}
              </p>
            </div>

            <div className="space-y-4">
              {onOpenBooking && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {meetingSlots.map((slot) => (
                    <button
                      key={slot.type}
                      type="button"
                      onClick={() => onOpenBooking(slot.type)}
                      className="p-3.5 min-h-[54px] rounded-xl bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:border-[#0284ff]/65 text-start transition-colors cursor-pointer group flex sm:block items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#0369a1] dark:text-[#38bdf8] tabular-nums">
                        <Clock size={12} />
                        <span>{slot.duration}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-[#f1f5f9] sm:mt-1 group-hover:text-[#0369a1] dark:group-hover:text-[#38bdf8]">
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
                  className="btn-kinetic w-full py-3 px-5 rounded-xl bg-[#0284ff] hover:bg-[#0070e0] border border-[#0284ff] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[46px] shadow-[0_8px_24px_rgba(2,132,255,0.28)]"
                >
                  <Calendar size={16} />
                  <span>{t.contact.meetingCard.button}</span>
                  <ArrowRight size={15} className={dir === 'rtl' ? 'rotate-180' : ''} />
                </button>
              )}
            </div>
          </RevealOnScroll>

          {/* Resume & Portfolio Credentials Card */}
          <RevealOnScroll
            delay={0.12}
            className="card-shimmer overflow-hidden p-5 sm:p-6 rounded-2xl bg-white/95 dark:bg-[#0f1117]/82 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.09] shadow-[0_8px_28px_rgba(15,23,42,0.05)] dark:shadow-[0_14px_36px_rgba(0,0,0,0.42)] space-y-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8]">
                  {lang === 'ar' ? 'السيرة الذاتية' : 'Resume & Credentials'}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#f1f5f9] mt-0.5">
                  {lang === 'ar'
                    ? 'استعرض السيرة التفاعلية أو حمّل نسخة PDF'
                    : 'Inspect Interactive CV or Official PDF'}
                </h3>
              </div>
              <span className="w-9 h-9 rounded-xl bg-[#0284ff]/12 border border-[#0284ff]/25 text-[#0369a1] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
                <FileText size={16} />
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {onOpenResume && (
                <button
                  type="button"
                  onClick={onOpenResume}
                  className="btn-kinetic flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[42px] rounded-xl bg-[#0284ff]/12 hover:bg-[#0284ff] text-[#0369a1] dark:text-[#38bdf8] hover:text-white font-semibold text-xs border border-[#0284ff]/30 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate">
                    {lang === 'ar' ? 'السيرة التفاعلية' : 'Interactive CV'}
                  </span>
                </button>
              )}
              <a
                href={profile.cvDriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-kinetic flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[42px] rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-800 dark:text-[#f1f5f9] font-semibold text-xs border border-slate-200 dark:border-white/10 transition-colors whitespace-nowrap"
              >
                <ExternalLink size={13} className="text-[#0369a1] dark:text-[#38bdf8] shrink-0" />
                <span className="truncate">
                  {lang === 'ar' ? 'تحميل PDF الرسمي' : 'Download PDF'}
                </span>
              </a>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
};
