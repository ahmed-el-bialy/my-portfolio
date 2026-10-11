import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  CalendarPlus,
  ArrowRight,
  User,
  Mail,
  Phone,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Inbox,
  LogOut,
  Check,
  Lock,
  ShieldCheck,
  Copy,
  CalendarCheck,
  Trash2,
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

// Meeting slots from 3:00 PM to 8:00 PM CLT
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

export const BookingMeetingModal: React.FC<BookingMeetingModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  useScrollLock(isOpen);
  const { lang, isArabic, dir } = useLanguage();

  // Tab views within modal: Booking form vs Official Schedule
  const [activeView, setActiveView] = useState<'book' | 'schedule'>('book');

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

  // Google Calendar Auth & API State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticatingGoogle, setIsAuthenticatingGoogle] = useState(false);
  const [createdEventResult, setCreatedEventResult] = useState<CreatedCalendarEventResult | null>(null);

  // Booking Execution State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<OfficialBooking | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Bilingual UI Dictionary
  const ui = useMemo(() => {
    if (isArabic) {
      return {
        modalTitle: 'حجز جلسة استشارية ومقابلة مباشرة',
        badgeLock: 'قفل فوري للموعد 🔒',
        badgeDirect: 'مباشر 1-على-1',
        modalSubtitle: 'حجز رسمي مؤكد مع المهندس أحمد البيلي • روابط Google Meet مباشرة ومزامنة تقويم فورية',
        tabBook: 'حجز موعد جديد',
        tabSchedule: 'جدول المواعيد المحجوزة',
        step1: '1. نوع الجلسة والاستشارة',
        step2: '2. منصة اللقاء الافتراضي',
        step3: '3. اختيار التاريخ والموعد المتاح',
        step4: '4. بيانات التواصل وتأكيد الحجز',
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
        upcomingDaysTitle: 'الأيام المتاحة القادمة',
        tomorrow: 'غداً',
        availableSlots: 'متاح',
        fullOrNoSlots: 'مكتمل',
        customDateLabel: 'أو اختر تاريخاً مخصصاً:',
        cairoTimeHeader: 'المواعيد المتاحة بتوقيت القاهرة المحلي (CLT / GMT+2)',
        cairoTimeNote: 'جميع المواعيد معروضة بتوقيت القاهرة المحلي (GMT+2)',
        slotAvailable: 'متاح للحجز',
        slotBooked: 'محجوز ومغلق',
        googleSyncTitle: 'مزامنة تقويم Google Calendar التلقائية',
        googleSyncDesc: 'تسجيل الدخول لإضافة الموعد تلقائياً إلى تقويم Google الخاص بك مع تذكيرات قبل الموعد.',
        connectGoogle: 'ربط Google Calendar',
        connectingGoogle: 'جاري الاتصال...',
        connectedAs: 'متصل بحساب:',
        disconnect: 'فصل الحساب',
        fullNameLabel: 'الاسم الكامل *',
        fullNamePlaceholder: 'مثال: م. محمد أحمد',
        emailLabel: 'البريد الإلكتروني *',
        emailPlaceholder: 'name@company.com',
        phoneLabel: 'رقم الهاتف أو واتساب (اختياري)',
        phonePlaceholder: '+20 10... أو رقم دولي',
        notesLabel: 'موضوع الجلسة أو نبذة عن المشروع (اختياري)',
        notesPlaceholder: 'اكتب نبذة عن فكرة المشروع، الروابط، أو أبرز الأسئلة قبل اللقاء...',
        cancelBtn: 'إلغاء',
        confirmBtn: 'تأكيد الحجز وقفل الموعد رسمياً',
        confirmingBtn: 'جاري قفل الموعد وتأكيد الحجز...',
        whatsappDirectBannerTitle: 'تفضل التواصل المباشر عبر واتساب؟',
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
        errorRequiredFields: 'يرجى كتابة الاسم والبريد الإلكتروني لإتمام الحجز.',
        errorDoubleBooking: '⚠️ عذراً، هذا الموعد تم حجزه رسمياً لشخص آخر ولا يمكن تكرار الحجز في نفس الوقت. يرجى اختيار موعد آخر متاح.',
        lockFailedError: 'عذراً، حدث خطأ أثناء قفل الموعد.',
        toastCalSuccess: 'تم الاتصال بحساب Google Calendar بنجاح.',
        toastCalFailed: 'تعذر الاتصال بـ Google Calendar، يمكنك المتابعة وسيتم حفظ الموعد وإرسال التأكيد.',
      };
    }

    return {
      modalTitle: 'Schedule a 1-on-1 Consultation',
      badgeLock: 'Real Slot Lock 🔒',
      badgeDirect: 'Direct 1-on-1',
      modalSubtitle: 'Guaranteed slot with Ahmed El-Bialy • Real-time Google Meet room & instant calendar sync',
      tabBook: 'Book New Meeting',
      tabSchedule: 'Official Schedule',
      step1: '1. Select Meeting Type',
      step2: '2. Preferred Platform',
      step3: '3. Choose Available Date & Time',
      step4: '4. Contact Details & Confirmation',
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
      upcomingDaysTitle: 'Upcoming Available Days',
      tomorrow: 'Tomorrow',
      availableSlots: 'open',
      fullOrNoSlots: 'Full',
      customDateLabel: 'Or select a specific date:',
      cairoTimeHeader: 'Available Slots in Cairo Local Time (CLT / GMT+2)',
      cairoTimeNote: 'All time slots are displayed in Cairo Local Time (GMT+2)',
      slotAvailable: 'Available',
      slotBooked: 'Booked & Locked',
      googleSyncTitle: 'Automatic Google Calendar Sync',
      googleSyncDesc: 'Sign in to automatically sync this meeting with your personal Google Calendar and get alerts.',
      connectGoogle: 'Connect Google Calendar',
      connectingGoogle: 'Connecting...',
      connectedAs: 'Connected as:',
      disconnect: 'Disconnect',
      fullNameLabel: 'Full Name *',
      fullNamePlaceholder: 'e.g. John Doe',
      emailLabel: 'Email Address *',
      emailPlaceholder: 'name@company.com',
      phoneLabel: 'WhatsApp / Phone Number (Optional)',
      phonePlaceholder: '+1 ... or international number',
      notesLabel: 'Meeting Objective / Project Context (Optional)',
      notesPlaceholder: 'Share project context, repo links, or key questions ahead of our call...',
      cancelBtn: 'Cancel',
      confirmBtn: 'Confirm & Lock Slot Now',
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
      errorRequiredFields: 'Please enter your name and email to proceed.',
      errorDoubleBooking: '⚠️ Sorry, this slot has just been locked by someone else. Please choose another available slot.',
      lockFailedError: 'Sorry, an error occurred while securing this slot.',
      toastCalSuccess: 'Connected to Google Calendar successfully.',
      toastCalFailed: 'Could not connect to Google Calendar. You can still confirm via manual add.',
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

  // Adjust selected slot if user picks a date where current slot is already booked
  useEffect(() => {
    if (bookedSlots.includes(selectedSlot)) {
      const firstAvailable = TIME_SLOTS.find((s) => !bookedSlots.includes(s));
      if (firstAvailable) {
        setSelectedSlot(firstAvailable);
      }
    }
  }, [meetingDate, bookedSlots, selectedSlot]);

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
      setCurrentUser(result.user);
      setAccessToken(result.accessToken);
      if (result.user.displayName) setName(result.user.displayName);
      if (result.user.email) setEmail(result.user.email);
      setNotificationToast(ui.toastCalSuccess);
    } catch (err: any) {
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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!name.trim() || !email.trim()) {
      setBookingError(ui.errorRequiredFields);
      return;
    }

    // 1. Strict real-time check for double-booking
    if (isSlotBooked(meetingDate, selectedSlot)) {
      setBookingError(ui.errorDoubleBooking);
      setBookedSlots(getBookedSlotsForDate(meetingDate));
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
      particleCount: 120,
      spread: 85,
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl lg:max-w-3xl my-auto bg-white dark:bg-[#0e1020] border border-slate-200/90 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#151728] border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between shrink-0 gap-3">
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

          <div className="flex items-center gap-2 shrink-0">
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

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 text-xs sm:text-sm overflow-y-auto">
          {activeView === 'schedule' ? (
            /* SCHEDULE AUDIT VIEW: SHOWS REAL-TIME LOCKED SLOTS TRANSPARENTLY */
            <div className="space-y-4">
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
                  <span>{ui.scheduleListTitle} ({allBookings.length}):</span>
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
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
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
            <form onSubmit={handleBookingSubmit} className="space-y-4 sm:space-y-5">
              {/* Double-booking error alert */}
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

              {/* Step 1: Meeting Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                  {ui.step1}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {ui.meetingTypes.map((type) => {
                    const isSelected = selectedType === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer min-h-[85px] flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-600/15 shadow-xs'
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
                        <div className="font-bold text-xs text-slate-900 dark:text-white mb-1 line-clamp-1">
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

              {/* Step 2: Preferred Platform */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                  {ui.step2}
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
                        className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer min-h-[56px] ${
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

              {/* Step 3: Date & Time Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-500" />
                    <span>{ui.step3}</span>
                  </label>
                  <span className="text-[11px] font-mono text-blue-600 dark:text-cyan-400 font-semibold">
                    {TIME_SLOTS.length - bookedSlots.length} {ui.availableSlots}
                  </span>
                </div>

                {/* Upcoming Days Quick Chips */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2.5">
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
                        <div className="text-[10px] uppercase font-bold opacity-85">{day.dayName}</div>
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
                          {day.availableCount > 0 ? `${day.availableCount} ${ui.availableSlots}` : ui.fullOrNoSlots}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 mb-3">
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

                {/* Cairo Time Note */}
                <div className="text-[11px] text-cyan-700 dark:text-cyan-400 font-mono font-medium mb-2 flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>{ui.cairoTimeHeader}</span>
                </div>

                {/* Time Slots Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSlotTaken = bookedSlots.includes(slot);
                    const isSelected = selectedSlot === slot && !isSlotTaken;

                    if (isSlotTaken) {
                      return (
                        <div
                          key={slot}
                          title={ui.slotBooked}
                          className="py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/70 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 font-mono text-xs flex flex-col items-center justify-center min-h-[52px] opacity-75 cursor-not-allowed select-none"
                        >
                          <span className="line-through text-[11px] opacity-80">{formatSlotLabel(slot)}</span>
                          <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5 mt-0.5">
                            <Lock size={9} />
                            <span>{ui.slotBooked}</span>
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

              {/* Google Calendar Connect Bar */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-gray-300">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/15 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <CalendarPlus size={16} />
                  </div>
                  <div>
                    {currentUser ? (
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Check size={14} className="text-emerald-500" />
                          <span>{ui.connectedAs} {currentUser.email}</span>
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
                    className="px-3 py-1.5 rounded-xl bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-gray-300 hover:bg-red-500 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
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

              {/* Step 4: Contact Details */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                  {ui.step4}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-gray-400 mb-1">
                      {ui.fullNameLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={ui.fullNamePlaceholder}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-gray-400 mb-1">
                      {ui.emailLabel}
                    </label>
                    <input
                      type="email"
                      placeholder={ui.emailPlaceholder}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-gray-400 mb-1">
                    {ui.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    placeholder={ui.phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-gray-400 mb-1">
                    {ui.notesLabel}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={ui.notesPlaceholder}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer min-h-[44px]"
                >
                  {ui.cancelBtn}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || bookedSlots.includes(selectedSlot)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] min-h-[48px]"
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
              </div>
            </form>
          ) : (
            /* OFFICIAL CONFIRMATION SCREEN */
            <div className="py-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-cyan-400 text-xs font-mono font-bold mb-2">
                  <ShieldCheck size={14} />
                  <span>{ui.refCodeLabel} {finalBookingId}</span>
                  <button
                    type="button"
                    onClick={handleCopyRefCode}
                    className="p-1 hover:text-blue-700 dark:hover:text-cyan-300 cursor-pointer"
                    title="Copy Reference ID"
                  >
                    {copiedRef ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {ui.successTitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 mt-1 max-w-md mx-auto leading-relaxed">
                  {ui.clientGreeting} <strong className="text-blue-600 dark:text-cyan-400">{name}</strong>. {ui.confirmedOnDate}{' '}
                  <strong>{meetingDate}</strong> {ui.confirmedAtTime} <strong>{formatSlotLabel(selectedSlot)}</strong> {ui.noConflictNotice}
                </p>
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
                  <span>{ui.inboxNoticeTitle} ({email})</span>
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
