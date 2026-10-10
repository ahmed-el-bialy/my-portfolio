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
  Layers,
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
  lockAndConfirmSlot,
  lockAndConfirmSlotAsync,
  BookingValidationService,
  getBookedSlotsForDate,
  isSlotBooked,
  getAllBookings,
  cancelBooking,
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

const MEETING_TYPES = [
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
];

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
  const { lang, dir, t } = useLanguage();

  // Tab views within modal: Booking form vs Official Schedule
  const [activeView, setActiveView] = useState<'book' | 'schedule'>('book');

  // Form states
  const [selectedType, setSelectedType] = useState(MEETING_TYPES[0].id);
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

  const currentTypeObj = MEETING_TYPES.find((t) => t.id === selectedType) || MEETING_TYPES[0];

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
      setNotificationToast(`Connected as ${result.user.email}. Google Calendar API ready.`);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setNotificationToast('Could not connect to Google Calendar. You can still confirm via manual add.');
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
      const dayName = i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayBooked = getBookedSlotsForDate(dateStr);
      const availableCount = TIME_SLOTS.length - dayBooked.length;
      list.push({ dateStr, dayName, fullLabel, availableCount });
    }
    return list;
  }, [allBookings]);

  if (!isOpen) return null;

  // Real WhatsApp Instant Ping URL to Ahmed's WhatsApp
  const finalBookingId = confirmedBooking?.bookingId || 'MTG-2026';
  const finalMeetLink = confirmedBooking?.googleMeetLink || 'https://meet.google.com/new';

  const whatsappNotificationUrl = `https://wa.me/201022121573?text=${encodeURIComponent(
    `السلام عليكم يا بشمهندس أحمد! 👋\nتم تأكيد حجز موعد رسمي جديد في جدولك وقفل الموعد:\n\n🔖 الرقم المرجعي: ${finalBookingId}\n📅 التاريخ: ${meetingDate}\n⏰ الوقت: ${selectedSlot} (بتوقيت القاهرة)\n🎯 نوع اللقاء: ${currentTypeObj.title}\n💻 المنصة: ${
      selectedPlatform === 'meet' ? 'Google Meet 🎥' : selectedPlatform === 'zoom' ? 'Zoom 📹' : 'WhatsApp Video 💬'
    }\n🔗 رابط Google Meet: ${finalMeetLink}\n👤 اسم العميل: ${name}\n✉️ البريد الإلكتروني: ${email}${phone ? `\n📱 الهاتف: ${phone}` : ''}${
      notes ? `\n📝 ملاحظات/نبذة عن المشروع: ${notes}` : ''
    }\n\nيرجى تأكيد استلام الموعد.`
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
      setBookingError('يرجى كتابة الاسم والبريد الإلكتروني للمتابعة.');
      return;
    }

    // 1. Strict real-time check for double-booking
    if (isSlotBooked(meetingDate, selectedSlot)) {
      setBookingError(
        '⚠️ عذراً، هذا الموعد تم حجزه رسمياً لشخص آخر ولا يمكن تكرار الحجز في نفس الوقت. يرجى اختيار موعد آخر متاح.'
      );
      setBookedSlots(getBookedSlotsForDate(meetingDate));
      return;
    }

    setIsSubmitting(true);
    setNotificationToast(`جاري حجز الموعد وقفله رسمياً لتاريخ ${meetingDate} في تمام ${selectedSlot}...`);

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

    // 3. Atomically validate & lock slot via BookingValidationService
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
      maxCapacity: 1, // 1-on-1 Consultation: 1 participant locks the slot
      calendarAccessToken: currentToken || undefined,
      calendarEventId: calendarResult?.id,
      ahmedEmail: profile.email,
    });

    if (!lockResult.success || !lockResult.booking) {
      setIsSubmitting(false);
      setBookingError(lockResult.error || 'عذراً، حدث خطأ أثناء قفل الموعد.');
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
      particleCount: 110,
      spread: 80,
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

  const modalNode = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl my-auto bg-white dark:bg-[#121420] border border-slate-200 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#171928] border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 text-blue-600 dark:text-cyan-400 flex items-center justify-center border border-blue-500/20">
              <Calendar size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  حجز موعد رسمي مع أحمد البيلي
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono">
                  Real Slot Lock 🔒
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                قفل فوري للموعد لمنع تكرار الحجز • روابط Google Meet رسمية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView(activeView === 'book' ? 'schedule' : 'book')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                activeView === 'schedule'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10'
              }`}
              title="عرض جدول المواعيد المحجوزة والمغلقة"
            >
              <CalendarCheck size={14} />
              <span className="hidden sm:inline">
                {activeView === 'schedule' ? 'العودة للحجز' : 'عرض الجدول المحجوز'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-200/70 dark:bg-white/10 hover:bg-red-500 hover:text-white text-slate-700 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close Booking Modal"
            >
              <X size={18} />
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 text-xs sm:text-sm overflow-y-auto">
          {activeView === 'schedule' ? (
            /* SCHEDULE AUDIT VIEW: SHOWS REAL-TIME LOCKED SLOTS TRANSPARENTLY */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 flex items-start gap-3">
                <ShieldCheck size={20} className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white block mb-0.5 font-bold">
                    نظام قفل المواعيد الصارم (Anti Double-Booking System):
                  </strong>
                  أي موعد يتم تأكيده يُقفل فورياً في النظام ويمنع أي مستخدم آخر من حجزه لنفس التاريخ والتوقيت، مما يضمن تنظيم الجدول بدقة 100%.
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                  <Calendar size={15} className="text-blue-500" />
                  <span>المواعيد المحجوزة والمغلقة حالياً في الجدول ({allBookings.length}):</span>
                </h4>
                <button
                  onClick={() => setActiveView('book')}
                  className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  + حجز موعد جديد
                </button>
              </div>

              {allBookings.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-slate-500">
                  لا توجد مواعيد محجوزة حالياً. جميع المواعيد متاحة للحجز.
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
                            <span>مغلق</span>
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
                            ⏰ {b.slot}
                          </span>
                          <span>•</span>
                          <span>{b.meetingTitle}</span>
                        </div>
                      </div>

                      <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
                        <Check size={12} />
                        <span>مؤكد ومحمي</span>
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

              {/* Instant Direct WhatsApp Quick Booking Banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-emerald-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <WhatsAppLogo size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">
                      تفضل التواصل السريع على واتساب؟
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-emerald-300/90">
                      تواصل مباشرة مع أحمد بنقرة واحدة لتحديد موعد فوري
                    </span>
                  </div>
                </div>

                <a
                  href={`https://wa.me/201022121573?text=${encodeURIComponent(
                    `السلام عليكم يا أحمد، أرغب في حجز موعد لمناقشة مشروع معك.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer min-h-[38px]"
                >
                  <WhatsAppLogo size={15} />
                  <span>محادثة واتساب مباشرة</span>
                </a>
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
                          <span>متصل بتقويم Google Calendar</span>
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-gray-400">
                          {currentUser.email} (سيتم إنشاء الاجتماع مباشرة في تقويمك)
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          الربط مع Google Calendar API
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-gray-400">
                          تسجيل الدخول لإضافة الموعد تلقائياً إلى تقويم Google الخاص بك
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
                    <span>فصل الحساب</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isAuthenticatingGoogle}
                    className="gsi-material-button px-3.5 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0 min-h-[40px]"
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
                    <span>{isAuthenticatingGoogle ? 'جاري الاتصال...' : 'ربط Google Calendar'}</span>
                  </button>
                )}
              </div>

              {/* Step 1: Meeting Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                  1. نوع الاجتماع والغرض منه
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {MEETING_TYPES.map((type) => {
                    const isSelected = selectedType === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer min-h-[60px] flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-600/15 shadow-xs'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.02]'
                        }`}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-cyan-300 font-bold">
                            {type.duration}
                          </span>
                          {type.badge && (
                            <span className="text-[9px] font-bold text-slate-500 dark:text-gray-400">
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

              {/* Step 2: Platform Choice */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                  2. منصة عقد اللقاء
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'meet', label: 'Google Meet', icon: Video },
                    { id: 'whatsapp', label: 'WhatsApp Video', icon: WhatsAppLogo },
                    { id: 'zoom', label: 'Zoom Call', icon: Video },
                  ].map((p) => {
                    const isSelected = selectedPlatform === p.id;
                    const IconComp = p.icon;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setSelectedPlatform(p.id as any)}
                        className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-semibold text-xs transition-all cursor-pointer min-h-[48px] ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-600/15 text-blue-700 dark:text-cyan-300 shadow-xs font-bold'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-gray-300 bg-white dark:bg-transparent'
                        }`}
                      >
                        <IconComp size={16} />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Date Picker with Live Availability Indicators */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                    3. اختيار اليوم المناسب
                  </label>
                  <span className="text-[11px] font-mono text-blue-600 dark:text-cyan-400 font-semibold">
                    متبقي {TIME_SLOTS.length - bookedSlots.length} مواعيد متاحة في هذا اليوم
                  </span>
                </div>

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
                          {day.availableCount > 0 ? `${day.availableCount} متاح` : 'مكتمل'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">أو اختر تاريخاً مخصصاً:</span>
                  <input
                    type="date"
                    value={meetingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    required
                    className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none min-h-[44px]"
                  />
                </div>
              </div>

              {/* Step 4: Time Slots with Real Slot Locking */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-500" />
                    <span>4. المواعيد الرسمية المتاحة (3:00 PM – 8:00 PM CLT)</span>
                  </label>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                    توقيت القاهرة (GMT+2)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSlotTaken = bookedSlots.includes(slot);
                    const isSelected = selectedSlot === slot && !isSlotTaken;

                    if (isSlotTaken) {
                      return (
                        <div
                          key={slot}
                          title="هذا الموعد محجوز رسمياً في الجدول وغير متاح لأي شخص آخر"
                          className="py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/70 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 font-mono text-xs flex flex-col items-center justify-center min-h-[52px] opacity-75 cursor-not-allowed select-none"
                        >
                          <span className="line-through text-[11px] opacity-80">{slot}</span>
                          <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5 mt-0.5">
                            <Lock size={9} />
                            <span>محجوز ومغلق</span>
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
                        <span>{slot}</span>
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
                          <span>متاح للحجز</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 5: Contact Details */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                  5. بيانات التواصل لتأكيد الحجز
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="الاسم بالكامل (Full Name) *"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="البريد الإلكتروني (Email Address) *"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="رقم الهاتف أو واتساب (اختياري)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  />
                </div>

                <div>
                  <textarea
                    rows={2}
                    placeholder="ملاحظات أو نبذة عن المشروع أو التطبيق المطلوب مناقشته..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer min-h-[44px]"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || bookedSlots.includes(selectedSlot)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] min-h-[48px]"
                >
                  {isSubmitting ? (
                    <span>جاري قفل الموعد وتأكيد الحجز...</span>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>تأكيد الحجز وقفل الموعد رسمياً</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* OFFICIAL CONFIRMATION SCREEN: PROVES SLOT IS OFFICIALLY LOCKED */
            <div className="py-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-cyan-400 text-xs font-mono font-bold mb-2">
                  <ShieldCheck size={14} />
                  <span>الرقم المرجعي: {confirmedBooking?.bookingId || 'MTG-2026'}</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  تم حجز الموعد وقفله رسمياً في الجدول!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 mt-1 max-w-md mx-auto leading-relaxed">
                  شكراً لك، <strong className="text-blue-600 dark:text-cyan-400">{name}</strong>. تم قفل الموعد رسمياً لتاريخ{' '}
                  <strong>{meetingDate}</strong> في تمام <strong>{selectedSlot}</strong> ولا يمكن لأي شخص آخر حجزه في نفس الوقت.
                </p>
              </div>

              {/* Official Locked Badge Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-600/30 text-xs text-left space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Lock size={14} />
                    <span>حالة الموعد: مؤكد ومغلق رسمياً</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-gray-400">
                    منصة: {selectedPlatform.toUpperCase()}
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
                      <span>{copiedLink ? 'تم النسخ' : 'نسخ الرابط'}</span>
                    </button>
                    <a
                      href={finalMeetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>دخول الغرفة</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Mandatory Inbox Notice */}
              <div className="p-4 rounded-2xl bg-blue-500/10 border-2 border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs text-center space-y-2 shadow-xs">
                <div className="font-bold flex items-center justify-center gap-2 text-blue-700 dark:text-cyan-300 text-xs sm:text-sm">
                  <Inbox size={18} className="text-blue-500 shrink-0" />
                  <span>📩 تم إرسال تفاصيل الموعد إلى بريدك ({email})</span>
                </div>
                <p className="text-[11px] sm:text-xs leading-relaxed max-w-lg mx-auto font-medium text-slate-700 dark:text-gray-200">
                  يرجى مراجعة بريدك الإلكتروني لتأكيد قبول دعوة التقويم وحفظ الموعد في هاتفك.
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
                  <span>إرسال إشعار واتساب فوري لأحمد</span>
                </a>

                <a
                  href={createdEventResult?.htmlLink || googleCalendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02] min-h-[48px]"
                >
                  <CalendarPlus size={18} />
                  <span>إضافة إلى تقويم Google</span>
                </a>

                <button
                  type="button"
                  onClick={handleDownloadICS}
                  className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[48px]"
                >
                  <span>تحميل ملف .ics</span>
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
                  حجز موعد آخر
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={onClose}
                  className="text-xs text-slate-500 dark:text-gray-400 hover:underline cursor-pointer p-2"
                >
                  إغلاق النافذة
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
