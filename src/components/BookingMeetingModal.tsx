import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  CalendarPlus,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MessageSquare,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  Inbox,
  LogOut,
  Check,
  Lock,
  ShieldCheck,
  Copy,
  CalendarCheck,
  Maximize2,
  Minimize2,
  Sparkles,
  CalendarSync,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeveloperProfile } from '../data/portfolioData';
import { WhatsAppLogo } from './TechLogos';
import { useScrollLock } from '../hooks/useScrollLock';
import {
  signInWithGoogleCalendar,
  getCalendarAccessToken,
  createGoogleCalendarEvent,
  initCalendarAuth,
  signOutGoogle,
  CreatedCalendarEventResult,
  fetchCalendarFreeBusy,
  isSlotOverlappingGoogleBusy,
  CalendarBusyPeriod,
} from '../services/googleCalendarService';
import {
  lockAndConfirmSlotAsync,
  getBookedSlotsForDate,
  isSlotBooked,
  getAllBookings,
  subscribeToBookings,
  OfficialBooking,
} from '../services/bookingManager';
import { User as FirebaseUser } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';

interface BookingMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DeveloperProfile;
}

// Meeting slots from 3:00 PM to 8:00 PM CLT in strict 12-hour English format
const TIME_SLOTS = [
  '03:00 PM CLT',
  '03:30 PM CLT',
  '04:00 PM CLT',
  '04:30 PM CLT',
  '05:00 PM CLT',
  '05:30 PM CLT',
  '06:00 PM CLT',
  '06:30 PM CLT',
  '07:00 PM CLT',
  '07:30 PM CLT',
  '08:00 PM CLT',
];

interface EmailValidationState {
  isValid: boolean;
  error?: string;
  suggestion?: string;
  isGmail: boolean;
}

// Strict Real-Time Email & Gmail Validator
const validateEmail = (emailStr: string, isAr: boolean): EmailValidationState => {
  const trimmed = emailStr.trim().toLowerCase();
  if (!trimmed) {
    return { isValid: false, isGmail: false };
  }

  // Common typo detector for popular email providers
  const typoMap: Record<string, string> = {
    'gmai.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gmail.con': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gmaik.com': 'gmail.com',
    'hotmial.com': 'hotmail.com',
    'hotmaill.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com',
  };

  const atIndex = trimmed.indexOf('@');
  if (atIndex === -1) {
    return {
      isValid: false,
      error: isAr
        ? 'البريد الإلكتروني ينقصه رمز @'
        : 'Email address is missing the "@" symbol.',
      isGmail: false,
    };
  }

  const parts = trimmed.split('@');
  if (parts.length > 2) {
    return {
      isValid: false,
      error: isAr
        ? 'لا يمكن أن يحتوي البريد على أكثر من رمز @ واحد'
        : 'Email cannot contain more than one "@" symbol.',
      isGmail: false,
    };
  }

  const [username, domain] = parts;
  if (!username) {
    return {
      isValid: false,
      error: isAr
        ? 'يرجى كتابة اسم المستخدم قبل @'
        : 'Please enter the username before "@".',
      isGmail: false,
    };
  }

  if (!domain) {
    return {
      isValid: false,
      error: isAr
        ? 'يرجى كتابة اسم النطاق بعد @ (مثال: gmail.com)'
        : 'Please enter domain after "@" (e.g. gmail.com).',
      isGmail: false,
    };
  }

  // Detect common domain typo
  if (typoMap[domain]) {
    const suggestedDomain = typoMap[domain];
    const suggestedEmail = `${username}@${suggestedDomain}`;
    return {
      isValid: false,
      error: isAr
        ? `يبدو أن هناك خطأ في كتابة النطاق @${domain}`
        : `Domain looks misspelled: @${domain}`,
      suggestion: suggestedEmail,
      isGmail: suggestedDomain === 'gmail.com',
    };
  }

  if (!domain.includes('.')) {
    return {
      isValid: false,
      error: isAr
        ? 'اسم النطاق ينقصه الامتداد (مثل .com أو .net)'
        : 'Domain is missing extension (e.g. .com).',
      isGmail: false,
    };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return {
      isValid: false,
      error: isAr
        ? 'امتداد النطاق قصير جداً وغير صالح'
        : 'Domain extension is too short.',
      isGmail: false,
    };
  }

  // Strict email format regex
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(trimmed)) {
    return {
      isValid: false,
      error: isAr
        ? 'صيغة البريد غير صالحة. تأكد من عدم وجود مسافات أو رموز غير مدعومة.'
        : 'Invalid email format. Check for spaces or unsupported characters.',
      isGmail: false,
    };
  }

  return {
    isValid: true,
    isGmail: domain === 'gmail.com' || domain === 'googlemail.com',
  };
};

export const BookingMeetingModal: React.FC<BookingMeetingModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  useScrollLock(isOpen);
  const { isArabic, dir } = useLanguage();

  // Modal sizing: expandable / maximized like ResumeModal
  const [isMaximized, setIsMaximized] = useState(false);

  // Tab views within modal: Multi-step Booking wizard vs Official Schedule
  const [activeView, setActiveView] = useState<'book' | 'schedule'>('book');

  // Step state for multi-step booking wizard (1: Contact & Email, 2: Session & Platform, 3: Date & Slot, 4: Review & Confirm)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form states
  const [selectedType, setSelectedType] = useState('project-discussion');
  const [selectedPlatform, setSelectedPlatform] = useState<'meet' | 'whatsapp' | 'zoom'>('meet');
  const [meetingDate, setMeetingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  // Track booked slots for currently selected date
  const [bookedSlots, setBookedSlots] = useState<string[]>(() =>
    getBookedSlotsForDate(meetingDate)
  );
  const [allBookings, setAllBookings] = useState<OfficialBooking[]>(() => getAllBookings());

  // Pick first available slot on date change
  const [selectedSlot, setSelectedSlot] = useState(() => {
    const initialBooked = getBookedSlotsForDate(meetingDate);
    const firstFree = TIME_SLOTS.find((s) => !initialBooked.includes(s));
    return firstFree || TIME_SLOTS[0];
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Email Validation Result
  const emailValidation = useMemo(() => validateEmail(email, isArabic), [email, isArabic]);

  // Google Calendar Auth & API State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticatingGoogle, setIsAuthenticatingGoogle] = useState(false);
  const [createdEventResult, setCreatedEventResult] = useState<CreatedCalendarEventResult | null>(null);
  const [googleBusyPeriods, setGoogleBusyPeriods] = useState<CalendarBusyPeriod[]>([]);
  const [isLoadingGoogleAvailability, setIsLoadingGoogleAvailability] = useState(false);
  const [isGoogleAvailabilitySynced, setIsGoogleAvailabilitySynced] = useState(false);

  // Booking Execution State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<OfficialBooking | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setBookingError(null);
    }
  }, [isOpen]);

  // Bilingual UI Dictionary
  const ui = useMemo(() => {
    if (isArabic) {
      return {
        modalTitle: 'حجز جلسة استشارية ومقابلة مباشرة',
        badgeLock: 'قفل فوري للموعد 🔒',
        badgeDirect: 'مباشر 1-على-1',
        modalSubtitle: 'حجز رسمي مؤكد مع المهندس أحمد البيلي • مزامنة فورية وروابط Google Meet',
        tabBook: 'حجز موعد بالخطوات',
        tabSchedule: 'جدول المواعيد المحجوزة',
        steps: [
          { number: 1, title: 'البيانات والبريد', desc: 'الاسم والتحقق من الإيميل' },
          { number: 2, title: 'نوع الجلسة', desc: 'المنصة وموضوع اللقاء' },
          { number: 3, title: 'الموعد المتاح', desc: 'التاريخ والتوقيت المناسب' },
          { number: 4, title: 'المراجعة والتأكيد', desc: 'تأكيد وقفل الموعد فورياً' },
        ],
        meetingTypes: [
          {
            id: 'project-discussion',
            title: 'استشارة ومناقشة مشروع تطبيق جوال',
            duration: '30 دقيقة',
            desc: 'مناقشة فكرة التطبيق، التخطيط المعماري Clean Architecture، إدارة الحالة، واختيار حزمة التقنيات المناسبة.',
            badge: 'الأكثر طلباً',
          },
          {
            id: 'job-interview',
            title: 'مقابلة تقنية وفرصة عمل',
            duration: '45 دقيقة',
            desc: 'مناقشة فرص العمل بدوام كامل، أو العمل عن بُعد، أو العقود لمطور فلاتر محترف.',
            badge: 'توظيف',
          },
          {
            id: 'quick-coffee',
            title: 'جلسة تعارف تقنية سريعة',
            duration: '15 دقيقة',
            desc: 'تواصل سريع، استفسارات تقنية، أو استشارات حول هندسة برمجيات وتطبيقات الهاتف.',
            badge: 'سريع',
          },
        ],
        platforms: {
          meet: { label: 'Google Meet', desc: 'فيديو عالي الجودة ورابط فوري' },
          whatsapp: { label: 'WhatsApp Video', desc: 'مكالمة فيديو عبر واتساب' },
          zoom: { label: 'Zoom Video', desc: 'جلسة عبر تطبيق زووم' },
        },
        step1Title: 'الخطوة 1: بيانات التواصل والتحقق من البريد الإلكتروني',
        step1Desc: 'يرجى إدخال اسمك وبريدك الإلكتروني؛ سيتم التحقق من صحة البريد فورياً لإرسال تفاصيل الدعوة ورابط الاجتماع.',
        step2Title: 'الخطوة 2: تحديد نوع الجلسة والمنصة الافتراضية',
        step2Desc: 'اختر نوع الاستشارة والمنصة المفضلة لديك للقاء، ويمكنك كتابة نبذة سريعة عن موضوع النقاش.',
        step3Title: 'الخطوة 3: اختيار التاريخ والموعد المتاح',
        step3Desc: 'اختر اليوم والوقت المناسب؛ المواعيد معروضة بتوقيت القاهرة المحلي (CLT / GMT+2).',
        step4Title: 'الخطوة 4: مراجعة تفاصيل الحجز وتأكيد القفل النهائي',
        step4Desc: 'راجع جميع البيانات قبل القفل النهائي؛ فور التأكيد سيتم حجز الموعد ومنع أي تضارب مواعيد.',
        fullNameLabel: 'الاسم الكامل *',
        fullNamePlaceholder: 'مثال: م. محمد أحمد',
        emailLabel: 'البريد الإلكتروني أو Gmail *',
        emailPlaceholder: 'name@gmail.com أو بريد العمل',
        emailHint: 'يرجى كتابة بريد صالح؛ سيتم إرسال رابط الاجتماع وتفاصيل التقويم إليه.',
        emailTypoSuggestion: 'هل تقصد:',
        emailFixBtn: 'تصحيح الإيميل بنقرة واحدة',
        emailValidNotice: 'تم التحقق بنجاح: بريد إلكتروني صالح وموثوق لاستلام الدعوة ✓',
        isGmailNotice: 'بريد Gmail موثوق: متوافق 100% مع Google Calendar وGoogle Meet',
        phoneLabel: 'رقم الهاتف أو واتساب (اختياري)',
        phonePlaceholder: '+20 10... أو رقم دولي مع كود الدولة',
        notesLabel: 'موضوع الجلسة أو نبذة عن المشروع (اختياري)',
        notesPlaceholder: 'اكتب نبذة عن فكرة المشروع، الروابط، أو أبرز الأسئلة قبل اللقاء...',
        upcomingDaysTitle: 'الأيام المتاحة القادمة',
        tomorrow: 'غداً',
        availableSlots: 'متاح',
        fullOrNoSlots: 'مكتمل',
        customDateLabel: 'أو حدد تاريخاً مخصصاً:',
        cairoTimeHeader: 'المواعيد المتاحة بتوقيت القاهرة المحلي (CLT / GMT+2)',
        slotAvailable: 'متاح للحجز',
        slotBooked: 'محجوز ومغلق',
        googleSyncTitle: 'مزامنة تقويم Google Calendar التلقائية (اختياري)',
        googleSyncDesc: 'تسجيل الدخول لإضافة الموعد تلقائياً إلى تقويم Google الخاص بك مع تنبيهات مسبقة.',
        connectGoogle: 'ربط Google Calendar',
        connectingGoogle: 'جاري الاتصال...',
        connectedAs: 'متصل بحساب:',
        disconnect: 'فصل الحساب',
        googleCalLiveActive: 'مزامنة حية مع Google Calendar: تم استبعاد أوقات انشغالك التلقائية ⚡',
        googleCalSyncingSlots: 'جاري فحص التوافر المباشر من Google Calendar...',
        slotGoogleBusy: 'مشغول في تقويمك',
        btnNext: 'المتابعة للخطوة التالية',
        btnBack: 'الرجوع للخطوة السابقة',
        cancelBtn: 'إلغاء',
        confirmBtn: 'تأكيد الحجز وقفل الموعد رسمياً 🔒',
        confirmingBtn: 'جاري قفل الموعد وتأكيد الحجز...',
        whatsappDirectBannerTitle: 'تفضل التواصل الفوري عبر واتساب؟',
        whatsappDirectBannerDesc: 'تواصل مباشرة مع أحمد بنقرة واحدة لتحديد موعد فوري أو طرح أي استفسار.',
        whatsappDirectBtn: 'محادثة واتساب مباشرة',
        scheduleBannerTitle: 'نظام قفل المواعيد الصارم (Anti Double-Booking System):',
        scheduleBannerDesc: 'أي موعد يتم تأكيده يُقفل فورياً في النظام ويمنع أي مستخدم آخر من حجزه لنفس التاريخ والتوقيت، مما يضمن دقة الجدول بنسبة 100%.',
        scheduleListTitle: 'المواعيد المحجوزة والمغلقة حالياً في الجدول',
        noBookingsText: 'لا توجد مواعيد محجوزة حالياً. جميع المواعيد متاحة للحجز.',
        statusLocked: 'مغلق',
        statusProtected: 'مؤكد ومحمي',
        backToBookBtn: '+ حجز موعد جديد',
        successTitle: 'تم تأكيد وحجز موعدك بنجاح! 🎉',
        successSubtitle: 'تم تسجيل الموعد رسمياً في جدول المهندس أحمد البيلي وتوليد رابط الاجتماع.',
        refCodeLabel: 'الرقم المرجعي للحجز:',
        clientGreeting: 'شكراً لك،',
        confirmedOnDate: 'تم قفل الموعد رسمياً لتاريخ',
        confirmedAtTime: 'في تمام',
        noConflictNotice: 'ولا يمكن لأي شخص آخر حجزه في نفس الوقت.',
        statusLabel: 'حالة الموعد: مؤكد ومغلق رسمياً',
        platformLabel: 'المنصة:',
        roomLinkCopied: 'تم النسخ',
        roomLinkCopy: 'نسخ الرابط',
        enterRoomBtn: 'دخول الغرفة',
        inboxNoticeTitle: '📩 تم إرسال تفاصيل الموعد إلى بريدك الإلكتروني',
        inboxNoticeDesc: 'يرجى مراجعة بريدك الإلكتروني لتأكيد قبول دعوة التقويم وحفظ الموعد في هاتفك.',
        sendWhatsAppNoticeBtn: 'إرسال تأكيد واتساب فوري لأحمد',
        addToGoogleCalBtn: 'إضافة إلى تقويم Google',
        downloadIcsBtn: 'تحميل ملف .ics للتقويم',
        bookAnotherBtn: 'حجز موعد آخر',
        closeWindowBtn: 'إغلاق النافذة',
        errorRequiredFields: 'يرجى إدخال اسمك وبريد إلكتروني صحيح وموثق للمتابعة.',
        errorDoubleBooking: '⚠️ عذراً، هذا الموعد تم حجزه رسمياً لشخص آخر ولا يمكن تكرار الحجز في نفس الوقت. يرجى اختيار موعد آخر متاح.',
        lockFailedError: 'عذراً، حدث خطأ أثناء قفل الموعد.',
        toastCalSuccess: 'تم الاتصال بحساب Google Calendar بنجاح.',
        toastCalFailed: 'تعذر الاتصال بـ Google Calendar، يمكنك المتابعة وسيتم حفظ الموعد وإرسال التأكيد.',
        summaryHeader: 'ملخص بيانات الحجز النهائي:',
        summaryName: 'الاسم:',
        summaryEmail: 'البريد الإلكتروني:',
        summarySession: 'نوع الجلسة:',
        summaryPlatform: 'منصة اللقاء:',
        summaryDate: 'التاريخ المحدد:',
        summaryTime: 'التوقيت المحلي:',
        summaryNotes: 'الموضوع/الملاحظات:',
        summaryLockGuarantee: 'ضمان القفل الفوري: بمجرد الضغط على التأكيد، لن يتمكن أي طرف آخر من حجز هذا التوقيت نهائياً.',
      };
    }

    return {
      modalTitle: 'Schedule a 1-on-1 Consultation',
      badgeLock: 'Real Slot Lock 🔒',
      badgeDirect: 'Direct 1-on-1',
      modalSubtitle: 'Guaranteed slot with Ahmed El-Bialy • Real-time Google Meet room & instant calendar sync',
      tabBook: 'Step-by-Step Booking',
      tabSchedule: 'Official Schedule',
      steps: [
        { number: 1, title: 'Contact & Email', desc: 'Name & verified email' },
        { number: 2, title: 'Session Type', desc: 'Platform & agenda' },
        { number: 3, title: 'Date & Time', desc: 'Available slot' },
        { number: 4, title: 'Review & Confirm', desc: 'Lock slot instantly' },
      ],
      meetingTypes: [
        {
          id: 'project-discussion',
          title: 'Project Discussion & Mobile Architecture',
          duration: '30 mins',
          desc: 'Deep-dive into your mobile app idea, Clean Architecture planning, state management, or tech stack selection.',
          badge: 'Popular',
        },
        {
          id: 'job-interview',
          title: 'Technical Interview & Job Opportunity',
          duration: '45 mins',
          desc: 'Discussion of full-time, contract, or remote Flutter developer opportunities.',
          badge: 'Hiring',
        },
        {
          id: 'quick-coffee',
          title: 'Quick 1-on-1 Tech Catchup',
          duration: '15 mins',
          desc: 'Quick intro, tech networking, or general questions regarding Flutter mobile engineering.',
          badge: 'Quick',
        },
      ],
      platforms: {
        meet: { label: 'Google Meet', desc: 'HD Video with instant meeting link' },
        whatsapp: { label: 'WhatsApp Video', desc: 'Direct video call over WhatsApp' },
        zoom: { label: 'Zoom Video', desc: 'Virtual session via Zoom video' },
      },
      step1Title: 'Step 1: Contact Information & Email Verification',
      step1Desc: 'Please enter your name and email. We strictly verify email syntax and domains to ensure calendar invitations and Meet links are delivered.',
      step2Title: 'Step 2: Session Type & Preferred Platform',
      step2Desc: 'Choose your meeting topic, preferred platform, and optionally share project context.',
      step3Title: 'Step 3: Select Date & Available Time Slot',
      step3Desc: 'Pick a date and convenient time slot. All times are displayed in Cairo Local Time (CLT / GMT+2).',
      step4Title: 'Step 4: Review Booking Summary & Final Confirmation',
      step4Desc: 'Review your meeting parameters before instant locking. Upon clicking confirm, your slot is guaranteed.',
      fullNameLabel: 'Full Name *',
      fullNamePlaceholder: 'e.g. John Doe',
      emailLabel: 'Email Address or Gmail *',
      emailPlaceholder: 'name@gmail.com or corporate email',
      emailHint: 'Please provide a valid email to receive calendar invites and video room access.',
      emailTypoSuggestion: 'Did you mean:',
      emailFixBtn: 'Fix Email with One Tap',
      emailValidNotice: 'Verified successfully: Valid email address ready for invites ✓',
      isGmailNotice: 'Verified Gmail: 100% compatible with Google Calendar and Google Meet',
      phoneLabel: 'WhatsApp / Phone Number (Optional)',
      phonePlaceholder: '+1 ... or international phone with country code',
      notesLabel: 'Meeting Objective / Project Context (Optional)',
      notesPlaceholder: 'Share project context, repo links, or key questions ahead of our call...',
      upcomingDaysTitle: 'Upcoming Available Days',
      tomorrow: 'Tomorrow',
      availableSlots: 'open',
      fullOrNoSlots: 'Full',
      customDateLabel: 'Or select a specific date:',
      cairoTimeHeader: 'Available Slots in Cairo Local Time (CLT / GMT+2)',
      slotAvailable: 'Available',
      slotBooked: 'Booked & Locked',
      googleSyncTitle: 'Automatic Google Calendar Sync (Optional)',
      googleSyncDesc: 'Sign in to automatically sync this meeting with your personal Google Calendar and get alerts.',
      connectGoogle: 'Connect Google Calendar',
      connectingGoogle: 'Connecting...',
      connectedAs: 'Connected as:',
      disconnect: 'Disconnect',
      googleCalLiveActive: 'Live Google Calendar Sync: Your conflicting busy times are automatically excluded ⚡',
      googleCalSyncingSlots: 'Checking real-time availability with Google Calendar...',
      slotGoogleBusy: 'Busy in your Calendar',
      btnNext: 'Continue to Next Step',
      btnBack: 'Back to Previous Step',
      cancelBtn: 'Cancel',
      confirmBtn: 'Confirm & Lock Slot Now 🔒',
      confirmingBtn: 'Securing & Locking Slot...',
      whatsappDirectBannerTitle: 'Prefer Instant Chat on WhatsApp?',
      whatsappDirectBannerDesc: 'Reach Ahmed directly with one tap to schedule a quick call or ask questions.',
      whatsappDirectBtn: 'Direct WhatsApp Chat',
      scheduleBannerTitle: 'Strict Anti Double-Booking Architecture:',
      scheduleBannerDesc: 'Every confirmed slot is immediately locked across all sessions to prevent duplicate bookings, ensuring 100% calendar reliability.',
      scheduleListTitle: 'Currently Locked Bookings in Schedule',
      noBookingsText: 'No booked slots yet. All calendar slots are currently open and available!',
      statusLocked: 'Locked',
      statusProtected: 'Confirmed & Protected',
      backToBookBtn: '+ Book New Meeting',
      successTitle: 'Meeting Confirmed & Slot Locked! 🎉',
      successSubtitle: 'Your appointment has been registered in Ahmed\'s calendar with a dedicated meeting link.',
      refCodeLabel: 'Booking Reference ID:',
      clientGreeting: 'Thank you,',
      confirmedOnDate: 'Your meeting is officially locked for',
      confirmedAtTime: 'at',
      noConflictNotice: 'and cannot be booked by anyone else.',
      statusLabel: 'Status: Confirmed & Locked Officially',
      platformLabel: 'Platform:',
      roomLinkCopied: 'Copied',
      roomLinkCopy: 'Copy Link',
      enterRoomBtn: 'Join Room',
      inboxNoticeTitle: '📩 Meeting details have been dispatched to your email',
      inboxNoticeDesc: 'Please check your email to accept the calendar invitation and keep the meeting saved in your agenda.',
      sendWhatsAppNoticeBtn: 'Notify Ahmed Instantly on WhatsApp',
      addToGoogleCalBtn: 'Add to Google Calendar',
      downloadIcsBtn: 'Download .ICS Calendar File',
      bookAnotherBtn: 'Book Another Session',
      closeWindowBtn: 'Close Window',
      errorRequiredFields: 'Please enter your name and a valid verified email to proceed.',
      errorDoubleBooking: '⚠️ Sorry, this slot has just been locked by someone else. Please choose another available slot.',
      lockFailedError: 'Sorry, an error occurred while securing this slot.',
      toastCalSuccess: 'Connected to Google Calendar successfully.',
      toastCalFailed: 'Could not connect to Google Calendar. You can still confirm via manual add.',
      summaryHeader: 'Final Booking Summary:',
      summaryName: 'Name:',
      summaryEmail: 'Email:',
      summarySession: 'Session Type:',
      summaryPlatform: 'Platform:',
      summaryDate: 'Selected Date:',
      summaryTime: 'Local Time:',
      summaryNotes: 'Notes / Topic:',
      summaryLockGuarantee: 'Instant Collision Protection: Once confirmed, this slot will be permanently locked against all other bookings.',
    };
  }, [isArabic]);

  // Current selected meeting type object
  const currentTypeObj = useMemo(() => {
    return ui.meetingTypes.find((t) => t.id === selectedType) || ui.meetingTypes[0];
  }, [selectedType, ui.meetingTypes]);

  // Helper to format slot string for display in Arabic/English
  // All time numbers remain strictly in English digits (0-9) as requested by user
  const formatSlotLabel = (slot: string) => {
    if (!isArabic) return slot;
    return slot
      .replace(' PM CLT', ' PM (توقيت القاهرة)')
      .replace(' AM CLT', ' AM (توقيت القاهرة)');
  };

  // Subscribe to real-time booking updates across tabs
  useEffect(() => {
    setBookedSlots(getBookedSlotsForDate(meetingDate));
  }, [meetingDate]);

  useEffect(() => {
    const unsubscribe = subscribeToBookings((bookings) => {
      setAllBookings(bookings);
      setBookedSlots(getBookedSlotsForDate(meetingDate));
    });
    return unsubscribe;
  }, [meetingDate]);

  // Query Google Calendar FreeBusy when user is connected and selects a date
  useEffect(() => {
    const currentToken = accessToken || getCalendarAccessToken();
    if (!currentToken || !meetingDate) {
      setGoogleBusyPeriods([]);
      setIsGoogleAvailabilitySynced(false);
      return;
    }

    let isMounted = true;
    setIsLoadingGoogleAvailability(true);

    fetchCalendarFreeBusy(currentToken, meetingDate)
      .then((busy) => {
        if (!isMounted) return;
        setGoogleBusyPeriods(busy);
        setIsGoogleAvailabilitySynced(true);
      })
      .catch((err) => {
        console.warn('Could not fetch Google Calendar FreeBusy availability:', err);
        if (!isMounted) return;
        setGoogleBusyPeriods([]);
        setIsGoogleAvailabilitySynced(false);
      })
      .finally(() => {
        if (isMounted) setIsLoadingGoogleAvailability(false);
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, meetingDate]);

  // Adjust selected slot if user picks a date where current slot is already booked or Google busy
  useEffect(() => {
    const isSlotBlocked =
      bookedSlots.includes(selectedSlot) ||
      isSlotOverlappingGoogleBusy(meetingDate, selectedSlot, googleBusyPeriods);

    if (isSlotBlocked) {
      const firstAvailable = TIME_SLOTS.find(
        (s) =>
          !bookedSlots.includes(s) &&
          !isSlotOverlappingGoogleBusy(meetingDate, s, googleBusyPeriods)
      );
      if (firstAvailable) {
        setSelectedSlot(firstAvailable);
      }
    }
  }, [meetingDate, bookedSlots, googleBusyPeriods, selectedSlot]);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initCalendarAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        if (user.displayName && !name) setName(user.displayName);
        if (user.email && !email) setEmail(user.email);
      },
      () => {
        // Not authenticated
      }
    );
    return () => unsubscribe();
  }, [name, email]);

  const handleGoogleSignIn = async () => {
    setIsAuthenticatingGoogle(true);
    try {
      const result = await signInWithGoogleCalendar();
      if (!result) {
        // User closed the popup, cancel gracefully without error
        return;
      }
      setCurrentUser(result.user);
      setAccessToken(result.accessToken);
      if (result.user.displayName) setName(result.user.displayName);
      if (result.user.email) setEmail(result.user.email);
      setNotificationToast(ui.toastCalSuccess);
    } catch (err: any) {
      const errorStr = String(err?.code || '') + ' ' + String(err?.message || '') + ' ' + String(err || '');
      if (
        errorStr.includes('popup-closed-by-user') ||
        errorStr.includes('cancelled-popup-request') ||
        errorStr.includes('user-cancelled') ||
        errorStr.includes('popup-blocked')
      ) {
        return;
      }
      console.error('Google Sign In error:', err);
      setNotificationToast(ui.toastCalFailed);
    } finally {
      setIsAuthenticatingGoogle(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await signOutGoogle();
    setCurrentUser(null);
    setAccessToken(null);
  };

  // Generate upcoming working days for quick-pick
  const upcomingDays = useMemo(() => {
    const list = [];
    const base = new Date();
    for (let i = 1; i <= 6; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName =
        i === 1
          ? ui.tomorrow
          : d.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { weekday: 'short' });
      const fullLabel = d.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
      const dayBooked = getBookedSlotsForDate(dateStr);
      const availableCount = TIME_SLOTS.length - dayBooked.length;
      list.push({ dateStr, dayName, fullLabel, availableCount });
    }
    return list;
  }, [allBookings, isArabic, ui.tomorrow]);

  // Step 1 Validation Guard
  const isStep1Valid = name.trim().length >= 2 && emailValidation.isValid;

  // Step 3 Validation Guard: Must not be booked in system nor busy in connected Google Calendar
  const isSelectedSlotGoogleBusy = useMemo(() => {
    return isSlotOverlappingGoogleBusy(meetingDate, selectedSlot, googleBusyPeriods);
  }, [meetingDate, selectedSlot, googleBusyPeriods]);

  const isStep3Valid =
    !!meetingDate &&
    !!selectedSlot &&
    !bookedSlots.includes(selectedSlot) &&
    !isSelectedSlotGoogleBusy;

  const handleNextStep = () => {
    setBookingError(null);
    if (currentStep === 1) {
      if (!name.trim()) {
        setBookingError(isArabic ? 'يرجى كتابة اسمك للمتابعة.' : 'Please enter your name.');
        return;
      }
      if (!emailValidation.isValid) {
        setBookingError(
          emailValidation.error ||
            (isArabic
              ? 'يرجى إدخال عنوان بريد إلكتروني صحيح ومعتمد للمتابعة.'
              : 'Please enter a valid, verified email address.')
        );
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (bookedSlots.includes(selectedSlot)) {
        setBookingError(ui.errorDoubleBooking);
        return;
      }
      if (isSelectedSlotGoogleBusy) {
        setBookingError(
          isArabic
            ? '⚠️ هذا التوقيت يتعارض مع موعد مسجل في تقويم Google الخاص بك. يرجى اختيار موعد آخر.'
            : '⚠️ This time conflicts with an existing event on your Google Calendar. Please choose another slot.'
        );
        return;
      }
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    setBookingError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  if (!isOpen) return null;

  // Real WhatsApp Instant Ping URL to Ahmed's WhatsApp
  const finalBookingId = confirmedBooking?.bookingId || 'MTG-2026';
  const finalMeetLink = confirmedBooking?.googleMeetLink || 'https://meet.google.com/new';

  const whatsappNotificationUrl = `https://wa.me/201022121573?text=${encodeURIComponent(
    isArabic
      ? `السلام عليكم يا بشمهندس أحمد! 👋\nتم تأكيد حجز موعد رسمي جديد في جدولك وقفل الموعد:\n\n🔖 الرقم المرجعي: ${finalBookingId}\n📅 التاريخ: ${meetingDate}\n⏰ الوقت: ${selectedSlot} (بتوقيت القاهرة)\n🎯 نوع اللقاء: ${currentTypeObj.title}\n💻 المنصة: ${
          selectedPlatform === 'meet' ? 'Google Meet 🎥' : selectedPlatform === 'zoom' ? 'Zoom 📹' : 'WhatsApp Video 💬'
        }\n🔗 رابط Google Meet: ${finalMeetLink}\n👤 اسم العميل: ${name}\n✉️ البريد الإلكتروني: ${email}${phone ? `\n📱 الهاتف: ${phone}` : ''}${
          notes ? `\n📝 ملاحظات/نبذة عن المشروع: ${notes}` : ''
        }\n\nيرجى تأكيد استلام الموعد.`
      : `Hello Eng. Ahmed! 👋\nI have just booked and confirmed an official consultation on your schedule:\n\n🔖 Booking Ref: ${finalBookingId}\n📅 Date: ${meetingDate}\n⏰ Time: ${selectedSlot} (Cairo Local Time)\n🎯 Session: ${currentTypeObj.title}\n💻 Platform: ${
          selectedPlatform === 'meet' ? 'Google Meet 🎥' : selectedPlatform === 'zoom' ? 'Zoom 📹' : 'WhatsApp Video 💬'
        }\n🔗 Google Meet Room: ${finalMeetLink}\n👤 Client Name: ${name}\n✉️ Email: ${email}${phone ? `\n📱 Phone: ${phone}` : ''}${
          notes ? `\n📝 Project Notes: ${notes}` : ''
        }\n\nLooking forward to our discussion.`
  )}`;

  // Google Calendar URL pre-configured with Google Meet & Ahmed's emails
  const linkedEmails = [profile.email, 'elbailyahmed47@gmail.com'].filter(Boolean).join(',');
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Official Meeting: ${currentTypeObj.title} with Ahmed El-Bialy (${finalBookingId})`
  )}&details=${encodeURIComponent(
    `Official Mobile App Engineering Consultation with Ahmed El-Bialy\n\nBooking ID: ${finalBookingId}\nClient Name: ${name}\nClient Email: ${email}\nPlatform: ${selectedPlatform.toUpperCase()}\nGoogle Meet Room: ${finalMeetLink}\nNotes: ${notes || 'None'}\n\nHost: Ahmed El-Bialy (${profile.email})`
  )}&location=${encodeURIComponent(
    selectedPlatform === 'meet' ? finalMeetLink : selectedPlatform === 'zoom' ? 'Zoom Video Call' : 'WhatsApp Video (+20 102 212 1573)'
  )}&add=${encodeURIComponent(linkedEmails)}&dates=${meetingDate.replace(/-/g, '')}T150000Z/${meetingDate.replace(
    /-/g,
    ''
  )}T153000Z`;

  const handleBookingSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setBookingError(null);

    if (!name.trim() || !emailValidation.isValid) {
      setBookingError(ui.errorRequiredFields);
      setCurrentStep(1);
      return;
    }

    // 1. Strict real-time check for double-booking
    if (isSlotBooked(meetingDate, selectedSlot)) {
      setBookingError(ui.errorDoubleBooking);
      setBookedSlots(getBookedSlotsForDate(meetingDate));
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    setNotificationToast(
      isArabic
        ? `جاري حجز الموعد وقفله رسمياً لتاريخ ${meetingDate} في تمام ${selectedSlot}...`
        : `Securing and locking slot for ${meetingDate} at ${selectedSlot}...`
    );

    let calendarResult: CreatedCalendarEventResult | null = null;

    // 2. Google Calendar OAuth API call if token exists
    const currentToken = accessToken || getCalendarAccessToken();
    if (currentToken) {
      try {
        calendarResult = await createGoogleCalendarEvent(currentToken, {
          meetingTitle: currentTypeObj.title,
          clientName: name,
          clientEmail: email,
          date: meetingDate,
          timeSlot: selectedSlot,
          platform: selectedPlatform,
          notes,
          ahmedEmail: profile.email,
        });
        setCreatedEventResult(calendarResult);
      } catch (calErr: any) {
        console.warn('Google Calendar API creation error:', calErr);
      }
    }

    // 3. Atomically validate & lock slot via booking service
    const lockResult = await lockAndConfirmSlotAsync({
      date: meetingDate,
      slot: selectedSlot,
      meetingTitle: currentTypeObj.title,
      duration: currentTypeObj.duration,
      platform: selectedPlatform,
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      notes,
      maxCapacity: 1, // 1-on-1 Consultation
      calendarAccessToken: currentToken || undefined,
      calendarEventId: calendarResult?.id,
      ahmedEmail: profile.email,
    });

    if (!lockResult.success || !lockResult.booking) {
      setIsSubmitting(false);
      setBookingError(lockResult.error || ui.lockFailedError);
      return;
    }

    const officialBooking = lockResult.booking;
    setConfirmedBooking(officialBooking);

    // 4. Dispatch Email notifications to Ahmed
    try {
      const payload = {
        bookingId: officialBooking.bookingId,
        meetingType: currentTypeObj.title,
        duration: currentTypeObj.duration,
        platform: selectedPlatform.toUpperCase(),
        date: meetingDate,
        timeSlot: selectedSlot,
        clientName: name,
        clientEmail: email,
        clientPhone: phone || 'Not provided',
        notes: notes || 'No additional notes',
        googleMeetLink: officialBooking.googleMeetLink,
        calendarEventId: calendarResult?.id || 'Locked System Booking',
        _subject: `📅 [LOCKED OFFICIAL BOOKING] ${currentTypeObj.title} (${officialBooking.bookingId}) from ${name}`,
        _captcha: 'false',
        _template: 'table',
      };

      await Promise.allSettled([
        fetch('https://formsubmit.co/ajax/ah.elbialy.dev@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        }),
        fetch('https://formsubmit.co/ajax/elbailyahmed47@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        }),
      ]);
    } catch {
      // Notification dispatch fallback
    }

    // Refresh active booked slots state
    setBookedSlots(getBookedSlotsForDate(meetingDate));
    setAllBookings(getAllBookings());

    setIsSubmitting(false);
    setIsBooked(true);

    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.55 },
    });
  };

  const handleDownloadICS = () => {
    const cleanDate = meetingDate.replace(/-/g, '');
    const bId = confirmedBooking?.bookingId || 'MTG-2026';
    const meetUrl = confirmedBooking?.googleMeetLink || 'https://meet.google.com/new';
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ahmed El-Bialy//Official Meeting Booking//EN',
      'BEGIN:VEVENT',
      `UID:${bId}@ahmedelbialy.dev`,
      `SUMMARY:Meeting: ${currentTypeObj.title} with Ahmed El-Bialy (${bId})`,
      `DESCRIPTION:Client: ${name} (${email})\\nPlatform: ${selectedPlatform.toUpperCase()}\\nMeet: ${meetUrl}\\nNotes: ${notes || 'None'}`,
      `DTSTART:${cleanDate}T150000Z`,
      `DTEND:${cleanDate}T153000Z`,
      `LOCATION:${meetUrl}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `official-meeting-${bId}-${cleanDate}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyMeetLink = () => {
    if (!finalMeetLink) return;
    navigator.clipboard.writeText(finalMeetLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyRefCode = () => {
    if (!finalBookingId) return;
    navigator.clipboard.writeText(finalBookingId);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const modalNode = (
    <div
      dir={dir}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full ${
          isMaximized ? 'max-w-[98vw] h-[97vh]' : 'max-w-4xl lg:max-w-5xl h-[88vh] sm:h-[92vh]'
        } bg-white dark:bg-[#0e1020] border-t sm:border border-slate-200/90 dark:border-white/15 rounded-t-[32px] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div 
          className="w-full pt-3 pb-1 flex justify-center sm:hidden cursor-pointer bg-slate-50 dark:bg-[#151728] border-b border-slate-200/50 dark:border-white/5 shrink-0" 
          onClick={onClose}
          aria-label="Close bottom sheet"
        >
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
        </div>
        {/* Top Action & Header Bar (like ResumeModal) */}
        <div className="p-3 sm:p-4 md:p-5 bg-slate-50 dark:bg-[#151728] border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Calendar size={20} className="sm:scale-110" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white truncate">
                  {ui.modalTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono shrink-0">
                  {ui.badgeLock}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">
                {ui.modalSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View switcher: Book vs Schedule */}
            <div className="bg-slate-200/70 dark:bg-white/10 p-0.5 rounded-xl flex items-center">
              <button
                type="button"
                onClick={() => setActiveView('book')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'book'
                    ? 'bg-white dark:bg-[#0e1020] text-blue-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {ui.tabBook}
              </button>
              <button
                type="button"
                onClick={() => setActiveView('schedule')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeView === 'schedule'
                    ? 'bg-white dark:bg-[#0e1020] text-blue-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CalendarCheck size={13} />
                <span className="hidden sm:inline">{ui.tabSchedule}</span>
              </button>
            </div>

            {/* Maximize Toggle Button like ResumeModal */}
            <button
              onClick={() => setIsMaximized((prev) => !prev)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-200/70 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer hidden sm:flex shrink-0"
              title={
                isMaximized
                  ? isArabic
                    ? 'استعادة الحجم الأصلي'
                    : 'Restore window size'
                  : isArabic
                  ? 'تكبير النافذة كاملة'
                  : 'Maximize window'
              }
              aria-label="Maximize toggle"
            >
              {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-200/70 dark:bg-white/10 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Close Booking Modal"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Live Notification Banner */}
        {notificationToast && (
          <div className="bg-emerald-600 text-white text-xs font-medium px-4 py-2.5 flex items-center justify-between border-b border-emerald-500 shrink-0">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{notificationToast}</span>
            </span>
            <button onClick={() => setNotificationToast(null)} className="text-white hover:opacity-80 p-1">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Multi-Step Stepper Progress Bar (when in Book view and not booked) */}
        {activeView === 'book' && !isBooked && (
          <div className="bg-slate-100/90 dark:bg-[#131525] border-b border-slate-200 dark:border-white/10 px-3 sm:px-6 py-3 shrink-0">
            <div className="flex items-center justify-between max-w-3xl mx-auto relative">
              {/* Stepper Connecting Background Line */}
              <div className="absolute top-1/2 start-4 end-4 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-white/10 z-0" />
              <div
                className="absolute top-1/2 start-4 -translate-y-1/2 h-0.5 bg-blue-600 transition-all duration-300 z-0"
                style={{
                  width: `${((currentStep - 1) / (ui.steps.length - 1)) * 95}%`,
                }}
              />

              {ui.steps.map((st) => {
                const isPassed = currentStep > st.number;
                const isCurrent = currentStep === st.number;

                return (
                  <button
                    key={st.number}
                    type="button"
                    onClick={() => {
                      // Allow navigating back or forward if validated
                      if (st.number < currentStep) {
                        setCurrentStep(st.number);
                      } else if (st.number === 2 && isStep1Valid) {
                        setCurrentStep(2);
                      } else if (st.number === 3 && isStep1Valid) {
                        setCurrentStep(3);
                      } else if (st.number === 4 && isStep1Valid && isStep3Valid) {
                        setCurrentStep(4);
                      }
                    }}
                    className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all duration-200 ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-md scale-110'
                          : isPassed
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-white dark:bg-[#1a1c2e] text-slate-500 dark:text-gray-400 border border-slate-300 dark:border-white/20'
                      }`}
                    >
                      {isPassed ? <Check size={14} className="stroke-[3]" /> : st.number}
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold mt-1 transition-colors hidden xs:block ${
                        isCurrent
                          ? 'text-blue-600 dark:text-cyan-400'
                          : isPassed
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500 dark:text-gray-400'
                      }`}
                    >
                      {st.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 p-4 sm:p-6 text-xs sm:text-sm overflow-y-auto">
          {activeView === 'schedule' ? (
            /* SCHEDULE AUDIT VIEW: SHOWS REAL-TIME LOCKED SLOTS TRANSPARENTLY */
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 flex items-start gap-3">
                <ShieldCheck size={20} className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white block mb-0.5 font-bold">
                    {ui.scheduleBannerTitle}
                  </strong>
                  {ui.scheduleBannerDesc}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                  <Calendar size={15} className="text-blue-500" />
                  <span>
                    {ui.scheduleListTitle} ({allBookings.length}):
                  </span>
                </h4>
                <button
                  onClick={() => setActiveView('book')}
                  className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  {ui.backToBookBtn}
                </button>
              </div>

              {allBookings.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-slate-500">
                  {ui.noBookingsText}
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {allBookings.map((b) => (
                    <div
                      key={b.bookingId}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {b.clientName}
                          </span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                            <Lock size={10} />
                            <span>{ui.statusLocked}</span>
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 dark:text-gray-400">
                            {b.bookingId}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-600 dark:text-gray-400">
                          <span className="font-bold text-blue-600 dark:text-cyan-400">
                            📅 {b.date}
                          </span>
                          <span>•</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-gray-200">
                            ⏰ {formatSlotLabel(b.slot)}
                          </span>
                          <span>•</span>
                          <span>{b.meetingTitle}</span>
                        </div>
                      </div>

                      <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
                        <Check size={12} />
                        <span>{ui.statusProtected}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : !isBooked ? (
            /* MULTI-STEP BOOKING WIZARD */
            <div className="max-w-3xl mx-auto space-y-5">
              {/* Double-booking or general error alert */}
              {bookingError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 shadow-xs animate-in fade-in">
                  <AlertTriangle size={17} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">{bookingError}</div>
                </div>
              )}

              {/* Instant WhatsApp Quick Booking Banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300/80 dark:border-emerald-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-emerald-100">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <WhatsAppLogo size={19} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">
                      {ui.whatsappDirectBannerTitle}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-emerald-300/90">
                      {ui.whatsappDirectBannerDesc}
                    </span>
                  </div>
                </div>

                <a
                  href={`https://wa.me/201022121573?text=${encodeURIComponent(
                    isArabic
                      ? 'السلام عليكم يا أحمد، أرغب في حجز موعد استشاري لمناقشة مشروع تطبيق جوال معك.'
                      : 'Hello Ahmed, I would like to schedule a consultation to discuss a mobile app project.'
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer min-h-[38px]"
                >
                  <WhatsAppLogo size={15} />
                  <span>{ui.whatsappDirectBtn}</span>
                </a>
              </div>

              {/* STEP 1: CONTACT DETAILS & REAL-TIME EMAIL / GMAIL VERIFICATION */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <User size={18} className="text-blue-500" />
                      <span>{ui.step1Title}</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                      {ui.step1Desc}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 pt-1">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                        {ui.fullNameLabel}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={ui.fullNamePlaceholder}
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[46px]"
                        />
                        {name.trim().length >= 2 && (
                          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-emerald-500">
                            <CheckCircle2 size={16} />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Email / Gmail with Real-Time Validation */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                          <Mail size={14} className="text-blue-500" />
                          <span>{ui.emailLabel}</span>
                        </label>
                        {email.trim() && (
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              emailValidation.isValid
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {emailValidation.isValid
                              ? isArabic
                                ? 'بريد معتمد ✓'
                                : 'Verified ✓'
                              : isArabic
                              ? 'صيغة غير صالحة ✕'
                              : 'Invalid ✕'}
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="email"
                          placeholder={ui.emailPlaceholder}
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#181a29] border text-slate-900 dark:text-white text-xs sm:text-sm outline-none transition-colors min-h-[46px] ${
                            !email.trim()
                              ? 'border-slate-300 dark:border-white/15 focus:ring-2 focus:ring-blue-500'
                              : emailValidation.isValid
                              ? 'border-emerald-500/60 focus:ring-2 focus:ring-emerald-500'
                              : 'border-rose-400 focus:ring-2 focus:ring-rose-500'
                          }`}
                        />
                        {email.trim() && (
                          <span className="absolute end-3 top-1/2 -translate-y-1/2">
                            {emailValidation.isValid ? (
                              <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : (
                              <AlertCircle size={18} className="text-rose-500" />
                            )}
                          </span>
                        )}
                      </div>

                      {/* Email Typo Suggestion Box */}
                      {emailValidation.suggestion && (
                        <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-xs text-amber-800 dark:text-amber-200">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Sparkles size={14} className="text-amber-500 shrink-0" />
                            <span className="truncate">
                              {ui.emailTypoSuggestion}{' '}
                              <strong className="underline font-mono">
                                {emailValidation.suggestion}
                              </strong>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEmail(emailValidation.suggestion!)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-xs transition-colors"
                          >
                            {ui.emailFixBtn}
                          </button>
                        </div>
                      )}

                      {/* Detailed Validation Status Feedback */}
                      {email.trim() && !emailValidation.isValid && emailValidation.error && !emailValidation.suggestion && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                          <AlertCircle size={13} className="shrink-0" />
                          <span>{emailValidation.error}</span>
                        </p>
                      )}

                      {emailValidation.isValid && (
                        <div className="mt-2 space-y-1">
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <CheckCircle2 size={13} className="shrink-0" />
                            <span>{ui.emailValidNotice}</span>
                          </p>
                          {emailValidation.isGmail && (
                            <p className="text-[10px] text-blue-600 dark:text-cyan-400 flex items-center gap-1 font-medium">
                              <Sparkles size={12} className="shrink-0" />
                              <span>{ui.isGmailNotice}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {!email.trim() && (
                        <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1.5">
                          {ui.emailHint}
                        </p>
                      )}
                    </div>

                    {/* WhatsApp / Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                        {ui.phoneLabel}
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder={ui.phonePlaceholder}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[46px]"
                        />
                        <span className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Phone size={15} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Google Calendar Connect Bar */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
                    <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-gray-300">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/15 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                        <CalendarPlus size={16} />
                      </div>
                      <div>
                        {currentUser ? (
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Check size={14} className="text-emerald-500" />
                              <span>
                                {ui.connectedAs} {currentUser.email}
                              </span>
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-gray-400">
                              {ui.googleSyncDesc}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {ui.googleSyncTitle}
                            </span>
                            <p className="text-[11px] text-slate-500 dark:text-gray-400">
                              {ui.googleSyncDesc}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {currentUser ? (
                      <button
                        type="button"
                        onClick={handleGoogleSignOut}
                        className="px-3 py-1.5 rounded-xl bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-gray-300 hover:bg-rose-500 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <LogOut size={13} />
                        <span>{ui.disconnect}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isAuthenticatingGoogle}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0 min-h-[40px]"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>{isAuthenticatingGoogle ? ui.connectingGoogle : ui.connectGoogle}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: MEETING TYPE & PLATFORM & PROJECT NOTES */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Video size={18} className="text-blue-500" />
                      <span>{ui.step2Title}</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                      {ui.step2Desc}
                    </p>
                  </div>

                  {/* Meeting Types Cards */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                      {isArabic ? '1. نوع الجلسة والاستشارة:' : '1. Session Objective:'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {ui.meetingTypes.map((type) => {
                        const isSelected = selectedType === type.id;
                        return (
                          <div
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer min-h-[110px] flex flex-col justify-between ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-600/15 shadow-sm'
                                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.02]'
                            }`}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') setSelectedType(type.id);
                            }}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-cyan-300 font-bold">
                                {type.duration}
                              </span>
                              {type.badge && (
                                <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400">
                                  {type.badge}
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                              {type.title}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                              {type.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Platform */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                      {isArabic ? '2. منصة اللقاء الافتراضي:' : '2. Meeting Platform:'}
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: 'meet', label: ui.platforms.meet.label, desc: ui.platforms.meet.desc, icon: Video },
                        { id: 'whatsapp', label: ui.platforms.whatsapp.label, desc: ui.platforms.whatsapp.desc, icon: WhatsAppLogo },
                        { id: 'zoom', label: ui.platforms.zoom.label, desc: ui.platforms.zoom.desc, icon: Video },
                      ].map((p) => {
                        const isSelected = selectedPlatform === p.id;
                        const IconComp = p.icon;
                        return (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => setSelectedPlatform(p.id as any)}
                            className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer min-h-[64px] ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-600/15 text-blue-700 dark:text-cyan-300 shadow-xs font-bold'
                                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-gray-300 bg-white dark:bg-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold text-xs">
                              <IconComp size={15} />
                              <span>{p.label}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-gray-400 hidden sm:inline">
                              {p.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes / Agenda */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                      {ui.notesLabel}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={ui.notesPlaceholder}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: DATE & AVAILABLE TIME SLOT */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock size={18} className="text-blue-500" />
                        <span>{ui.step3Title}</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                        {ui.step3Desc}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-blue-600 dark:text-cyan-400 font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/40">
                      {TIME_SLOTS.length - bookedSlots.length} {ui.availableSlots}
                    </span>
                  </div>

                  {/* Upcoming Days Quick Chips */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                      {ui.upcomingDaysTitle}:
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                      {upcomingDays.map((day) => {
                        const isSelected = meetingDate === day.dateStr;
                        return (
                          <button
                            type="button"
                            key={day.dateStr}
                            onClick={() => setMeetingDate(day.dateStr)}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer min-h-[58px] flex flex-col items-center justify-center ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white shadow-md font-bold'
                                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-white/[0.02] text-slate-800 dark:text-gray-200'
                            }`}
                          >
                            <div className="text-[10px] uppercase font-bold opacity-85">
                              {day.dayName}
                            </div>
                            <div className="text-xs font-bold mt-0.5">{day.fullLabel}</div>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono mt-1 ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : day.availableCount > 0
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {day.availableCount > 0
                                ? `${day.availableCount} ${ui.availableSlots}`
                                : ui.fullOrNoSlots}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Date Input */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">
                      {ui.customDateLabel}
                    </span>
                    <input
                      type="date"
                      value={meetingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      required
                      className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none min-h-[38px]"
                    />
                  </div>

                  {/* Cairo Time Note - Keeps numbers in English format */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                    <div className="text-[11px] text-cyan-700 dark:text-cyan-400 font-mono font-medium flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>{ui.cairoTimeHeader}</span>
                    </div>

                    {currentUser && (
                      <div className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-cyan-300 flex items-center gap-1 w-fit">
                        {isLoadingGoogleAvailability ? (
                          <>
                            <Loader2 size={11} className="animate-spin text-blue-500" />
                            <span>{ui.googleCalSyncingSlots}</span>
                          </>
                        ) : isGoogleAvailabilitySynced ? (
                          <>
                            <CalendarSync size={11} className="text-emerald-500" />
                            <span>{ui.googleCalLiveActive}</span>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Time Slots Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const isSystemBooked = bookedSlots.includes(slot);
                      const isGoogleBusy = isSlotOverlappingGoogleBusy(
                        meetingDate,
                        slot,
                        googleBusyPeriods
                      );
                      const isSlotTaken = isSystemBooked || isGoogleBusy;
                      const isSelected = selectedSlot === slot && !isSlotTaken;

                      if (isSystemBooked) {
                        return (
                          <div
                            key={slot}
                            title={ui.slotBooked}
                            className="py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/70 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 font-mono text-xs flex flex-col items-center justify-center min-h-[52px] opacity-75 cursor-not-allowed select-none"
                          >
                            <span className="line-through text-[11px] opacity-80">
                              {formatSlotLabel(slot)}
                            </span>
                            <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5 mt-0.5">
                              <Lock size={9} />
                              <span>{ui.slotBooked}</span>
                            </span>
                          </div>
                        );
                      }

                      if (isGoogleBusy) {
                        return (
                          <div
                            key={slot}
                            title={ui.slotGoogleBusy}
                            className="py-2.5 px-3 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 font-mono text-xs flex flex-col items-center justify-center min-h-[52px] opacity-75 cursor-not-allowed select-none"
                          >
                            <span className="line-through text-[11px] opacity-80">
                              {formatSlotLabel(slot)}
                            </span>
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 mt-0.5">
                              <Calendar size={9} />
                              <span>{ui.slotGoogleBusy}</span>
                            </span>
                          </div>
                        );
                      }

                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer min-h-[52px] flex flex-col items-center justify-center ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                              : 'border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-white/20 bg-white dark:bg-white/[0.02] text-slate-800 dark:text-gray-200'
                          }`}
                        >
                          <span>{formatSlotLabel(slot)}</span>
                          <span
                            className={`text-[9px] font-medium flex items-center gap-1 mt-0.5 ${
                              isSelected ? 'text-blue-100' : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-white' : 'bg-emerald-500 animate-pulse'
                              }`}
                            />
                            <span>{ui.slotAvailable}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & FINAL CONFIRMATION */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck size={18} className="text-blue-500" />
                      <span>{ui.step4Title}</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                      {ui.step4Desc}
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border-2 border-blue-500/30 space-y-3.5 shadow-sm">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-cyan-400 flex items-center gap-1.5">
                      <CheckCircle2 size={15} />
                      <span>{ui.summaryHeader}</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10">
                        <span className="text-[11px] text-slate-500 dark:text-gray-400 block mb-0.5">
                          {ui.summaryName}
                        </span>
                        <strong className="text-slate-900 dark:text-white">{name}</strong>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10">
                        <span className="text-[11px] text-slate-500 dark:text-gray-400 block mb-0.5">
                          {ui.summaryEmail}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-900 dark:text-white font-mono truncate">
                            {email}
                          </strong>
                          <span className="text-emerald-500 shrink-0">
                            <CheckCircle2 size={13} />
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10">
                        <span className="text-[11px] text-slate-500 dark:text-gray-400 block mb-0.5">
                          {ui.summarySession}
                        </span>
                        <strong className="text-slate-900 dark:text-white block">
                          {currentTypeObj.title}
                        </strong>
                        <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-mono font-bold">
                          {currentTypeObj.duration}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10">
                        <span className="text-[11px] text-slate-500 dark:text-gray-400 block mb-0.5">
                          {ui.summaryPlatform}
                        </span>
                        <strong className="text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Video size={14} className="text-blue-500" />
                          <span>
                            {selectedPlatform === 'meet'
                              ? 'Google Meet (HD Video Link)'
                              : selectedPlatform === 'zoom'
                              ? 'Zoom Meeting'
                              : 'WhatsApp Video'}
                          </span>
                        </strong>
                      </div>

                      <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] text-blue-700 dark:text-cyan-300 block mb-0.5 font-bold">
                            📅 {ui.summaryDate} {meetingDate}
                          </span>
                          <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            ⏰ {ui.summaryTime} {formatSlotLabel(selectedSlot)}
                          </span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold flex items-center gap-1 shrink-0 self-start sm:self-auto">
                          <Lock size={12} />
                          <span>{ui.badgeLock}</span>
                        </div>
                      </div>
                    </div>

                    {notes && (
                      <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 text-xs">
                        <span className="text-[11px] text-slate-500 dark:text-gray-400 block mb-0.5 font-bold">
                          {ui.summaryNotes}
                        </span>
                        <p className="text-slate-700 dark:text-gray-300 leading-relaxed">{notes}</p>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-[11px] text-emerald-800 dark:text-emerald-200 leading-relaxed flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                      <span>{ui.summaryLockGuarantee}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Navigation & Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10 gap-3">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                  >
                    {dir === 'rtl' ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
                    <span>{ui.btnBack}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer min-h-[44px]"
                  >
                    {ui.cancelBtn}
                  </button>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={currentStep === 1 ? !isStep1Valid : currentStep === 3 ? !isStep3Valid : false}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] min-h-[44px]"
                  >
                    <span>{ui.btnNext}</span>
                    {dir === 'rtl' ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleBookingSubmit()}
                    disabled={isSubmitting || bookedSlots.includes(selectedSlot)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] min-h-[48px]"
                  >
                    {isSubmitting ? (
                      <span>{ui.confirmingBtn}</span>
                    ) : (
                      <>
                        <Lock size={15} />
                        <span>{ui.confirmBtn}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* OFFICIAL CONFIRMATION & SUCCESS SCREEN */
            <div className="py-4 text-center space-y-4 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
              {/* Framer Motion Animated Success Checkmark */}
              <div className="relative flex items-center justify-center my-3">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.25, 1], opacity: 1 }}
                  transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                  className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/25 relative"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full bg-emerald-500/20"
                  />
                  <svg
                    className="w-12 h-12 text-emerald-500 relative z-10"
                    viewBox="0 0 52 52"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <motion.circle
                      cx="26"
                      cy="26"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.55, ease: 'easeOut' }}
                    />
                    <motion.path
                      d="M15 27L23 35L37 19"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.45, delay: 0.35, ease: 'easeOut' }}
                    />
                  </svg>
                </motion.div>
              </div>

              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-cyan-400 text-xs font-mono font-bold mb-2"
                >
                  <ShieldCheck size={14} />
                  <span>
                    {ui.refCodeLabel} {finalBookingId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRefCode}
                    className="p-1 hover:text-blue-700 dark:hover:text-cyan-300 cursor-pointer"
                    title="Copy Reference ID"
                  >
                    {copiedRef ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </motion.div>
                <motion.h4
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white"
                >
                  {ui.successTitle}
                </motion.h4>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                  className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 mt-1 max-w-md mx-auto leading-relaxed"
                >
                  {ui.clientGreeting} <strong className="text-blue-600 dark:text-cyan-400">{name}</strong>. {ui.confirmedOnDate}{' '}
                  <strong>{meetingDate}</strong> {ui.confirmedAtTime}{' '}
                  <strong>{formatSlotLabel(selectedSlot)}</strong> {ui.noConflictNotice}
                </motion.p>
              </div>

              {/* Locked Badge Box & Meet Link */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-600/30 text-xs text-start space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Lock size={14} />
                    <span>{ui.statusLabel}</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-gray-400">
                    {ui.platformLabel} {selectedPlatform.toUpperCase()}
                  </span>
                </div>

                {/* Google Meet Link Display with Copy & Direct Join */}
                <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Video size={16} className="text-blue-500 shrink-0" />
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-gray-200 truncate">
                      {finalMeetLink}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyMeetLink}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-gray-200 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedLink ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      <span>{copiedLink ? ui.roomLinkCopied : ui.roomLinkCopy}</span>
                    </button>
                    <a
                      href={finalMeetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{ui.enterRoomBtn}</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Inbox Notice */}
              <div className="p-4 rounded-2xl bg-blue-500/10 border-2 border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs text-center space-y-2 shadow-xs">
                <div className="font-bold flex items-center justify-center gap-2 text-blue-700 dark:text-cyan-300 text-xs sm:text-sm">
                  <Inbox size={18} className="text-blue-500 shrink-0" />
                  <span>
                    {ui.inboxNoticeTitle} ({email})
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs leading-relaxed max-w-lg mx-auto font-medium text-slate-700 dark:text-gray-200">
                  {ui.inboxNoticeDesc}
                </p>
              </div>

              {/* Action Buttons: WhatsApp Notification + Google Calendar + ICS */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={whatsappNotificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer hover:scale-[1.02] min-h-[48px]"
                >
                  <WhatsAppLogo size={18} />
                  <span>{ui.sendWhatsAppNoticeBtn}</span>
                </a>

                <a
                  href={createdEventResult?.htmlLink || googleCalendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02] min-h-[48px]"
                >
                  <CalendarPlus size={18} />
                  <span>{ui.addToGoogleCalBtn}</span>
                </a>

                <button
                  type="button"
                  onClick={handleDownloadICS}
                  className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[48px]"
                >
                  <span>{ui.downloadIcsBtn}</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setIsBooked(false);
                    setConfirmedBooking(null);
                    setCurrentStep(1);
                  }}
                  className="text-xs text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer p-2"
                >
                  {ui.bookAnotherBtn}
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={onClose}
                  className="text-xs text-slate-500 dark:text-gray-400 hover:underline cursor-pointer p-2"
                >
                  {ui.closeWindowBtn}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};
