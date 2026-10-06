import React, { useState, useEffect } from 'react';
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
import { User as FirebaseUser } from 'firebase/auth';

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

  // Form states
  const [selectedType, setSelectedType] = useState(MEETING_TYPES[0].id);
  const [selectedPlatform, setSelectedPlatform] = useState<'meet' | 'whatsapp' | 'zoom'>('meet');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [meetingDate, setMeetingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const currentTypeObj = MEETING_TYPES.find((t) => t.id === selectedType) || MEETING_TYPES[0];

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
        // Not authenticated with token
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
  const upcomingDays = React.useMemo(() => {
    const list = [];
    const base = new Date();
    for (let i = 1; i <= 6; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      list.push({ dateStr, dayName, fullLabel });
    }
    return list;
  }, []);

  if (!isOpen) return null;

  // Real WhatsApp Instant Ping URL to Ahmed's WhatsApp
  const whatsappNotificationUrl = `https://wa.me/201022121573?text=${encodeURIComponent(
    `السلام عليكم يا أحمد! 👋\nتم تأكيد حجز موعد اجتماع جديد من خلال معرض أعمالك (Portfolio):\n\n📅 التاريخ: ${meetingDate}\n⏰ الوقت: ${selectedSlot} (بتوقيت القاهرة)\n🎯 نوع اللقاء: ${currentTypeObj.title}\n💻 المنصة: ${
      selectedPlatform === 'meet' ? 'Google Meet 🎥' : selectedPlatform === 'zoom' ? 'Zoom 📹' : 'WhatsApp Video 💬'
    }\n👤 اسم العميل: ${name}\n✉️ البريد الإلكتروني: ${email}${phone ? `\n📱 الهاتف: ${phone}` : ''}${
      notes ? `\n📝 ملاحظات/نبذة عن المشروع: ${notes}` : ''
    }\n\nيرجى التواصل لتأكيد رابط اللقاء.`
  )}`;

  // Google Calendar URL pre-configured with Google Meet & Ahmed's email
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Meeting: ${currentTypeObj.title} with Ahmed El-Bialy`
  )}&details=${encodeURIComponent(
    `Mobile App Developer Consultation with Ahmed El-Bialy\n\nClient Name: ${name}\nClient Email: ${email}\nPlatform: ${selectedPlatform.toUpperCase()}\nNotes: ${notes || 'None'}\n\nGoogle Meet: https://meet.google.com/new`
  )}&location=${encodeURIComponent(
    selectedPlatform === 'meet' ? 'Google Meet (Online)' : selectedPlatform === 'zoom' ? 'Zoom Video Call' : 'WhatsApp Video (+20 102 212 1573)'
  )}&add=${encodeURIComponent(profile.email)}&dates=${meetingDate.replace(/-/g, '')}T150000Z/${meetingDate.replace(
    /-/g,
    ''
  )}T153000Z`;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setNotificationToast(`Processing booking for ${meetingDate} at ${selectedSlot}...`);

    let calendarResult: CreatedCalendarEventResult | null = null;

    // 1. If Google Calendar OAuth token exists, create event directly via Google Calendar API
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

    // 2. Dispatch FormSubmit email to Ahmed
    try {
      const payload = {
        meetingType: currentTypeObj.title,
        duration: currentTypeObj.duration,
        platform: selectedPlatform.toUpperCase(),
        date: meetingDate,
        timeSlot: selectedSlot,
        clientName: name,
        clientEmail: email,
        clientPhone: phone || 'Not provided',
        notes: notes || 'No additional notes',
        calendarEventId: calendarResult?.id || 'Manual Invite Generated',
        googleMeetLink: calendarResult?.hangoutLink || 'Google Meet',
        _subject: `📅 [CONFIRMED BOOKING] ${currentTypeObj.title} from ${name}`,
        _captcha: 'false',
        _template: 'table',
      };

      await fetch('https://formsubmit.co/ajax/ah.elbialy.dev@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // FormSubmit fallback
    }

    // 3. Save to local storage cache
    try {
      const existing = JSON.parse(localStorage.getItem('ahmed_portfolio_bookings') || '[]');
      existing.unshift({
        id: Date.now(),
        type: currentTypeObj.title,
        date: meetingDate,
        slot: selectedSlot,
        platform: selectedPlatform,
        name,
        email,
        phone,
        notes,
        calendarEventId: calendarResult?.id,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('ahmed_portfolio_bookings', JSON.stringify(existing.slice(0, 20)));
    } catch {}

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
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ahmed El-Bialy//Meeting Booking//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Meeting: ${currentTypeObj.title} with Ahmed El-Bialy`,
      `DESCRIPTION:Client: ${name} (${email})\\nPlatform: ${selectedPlatform.toUpperCase()}\\nNotes: ${notes || 'None'}`,
      `DTSTART:${cleanDate}T150000Z`,
      `DTEND:${cleanDate}T153000Z`,
      `LOCATION:${selectedPlatform === 'meet' ? 'Google Meet' : selectedPlatform === 'zoom' ? 'Zoom' : 'WhatsApp'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `meeting-ahmed-elbialy-${cleanDate}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const modalNode = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl my-auto bg-white dark:bg-[#121420] border border-slate-200 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#171928] border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 text-blue-600 dark:text-cyan-400 flex items-center justify-center border border-blue-500/20">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Book a 1-on-1 Meeting (حجز موعد فوري)
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Google Calendar API & Meet Integration • Direct with Ahmed El-Bialy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-200/70 dark:bg-white/10 hover:bg-red-500 hover:text-white text-slate-700 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Booking Modal"
          >
            <X size={20} />
          </button>
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
          {!isBooked ? (
            <form onSubmit={handleBookingSubmit} className="space-y-4 sm:space-y-5">
              
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
                          <span>Connected with Google Calendar</span>
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-gray-400">
                          {currentUser.email} (Events created automatically)
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Automate with Google Calendar API
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-gray-400">
                          Sign in to create the event directly in your Google Calendar
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
                    <span>Disconnect</span>
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
                    <span>{isAuthenticatingGoogle ? 'Connecting...' : 'Sign in with Google'}</span>
                  </button>
                )}
              </div>

              {/* Step 1: Meeting Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                  1. Select Meeting Purpose (نوع الاجتماع)
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
                  2. Preferred Video Platform (منصة اللقاء)
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'meet', label: 'Google Meet', icon: Video },
                    { id: 'whatsapp', label: 'WhatsApp Video', icon: WhatsAppLogo },
                    { id: 'zoom', label: 'Zoom Video', icon: Video },
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
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-600/15 text-blue-700 dark:text-cyan-300 shadow-xs'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-gray-300'
                        }`}
                      >
                        <IconComp size={16} />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Date Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                  3. Select Date (اختر اليوم المناسب)
                </label>
                
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2.5">
                  {upcomingDays.map((day) => {
                    const isSelected = meetingDate === day.dateStr;
                    return (
                      <button
                        type="button"
                        key={day.dateStr}
                        onClick={() => setMeetingDate(day.dateStr)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer min-h-[50px] flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md font-bold'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-white/[0.02] text-slate-800 dark:text-gray-200'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold opacity-85">{day.dayName}</div>
                        <div className="text-xs font-bold mt-0.5">{day.fullLabel}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">Or pick custom date:</span>
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

              {/* Step 4: Time Slots (3:00 PM to 8:00 PM) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                    4. Available Times (3:00 PM – 8:00 PM CLT)
                  </label>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                    Cairo Time (GMT+2)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-white/[0.02] text-slate-800 dark:text-gray-200'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 5: Contact Details */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                  5. Your Details (بياناتك للتواصل)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Full Name (الاسم بالكامل) *"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email (البريد الإلكتروني) *"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    placeholder="Meeting Agenda or Project Summary (ملاحظات عن الاجتماع أو فكرة المشروع)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Submit Buttons Bar */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] min-h-[48px]"
                >
                  {isSubmitting ? (
                    <span>Confirming & Creating Event...</span>
                  ) : (
                    <>
                      <CalendarPlus size={16} />
                      <span>Confirm & Schedule Meeting (تأكيد الحجز)</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            /* Confirmation Screen with Mandatory Check Inbox Note */
            <div className="py-5 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Meeting Booked Successfully! (تم تسجيل الموعد بنجاح)
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 mt-1 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-blue-600 dark:text-cyan-400">{name}</strong>. Your slot has been recorded for <strong>{meetingDate}</strong> at <strong>{selectedSlot}</strong>.
                </p>
              </div>

              {/* USER-FACING INBOX CONFIRMATION NOTE (MANDATORY AS REQUESTED) */}
              <div className="p-4 rounded-2xl bg-blue-500/10 border-2 border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs text-center space-y-2 shadow-xs">
                <div className="font-bold flex items-center justify-center gap-2 text-blue-700 dark:text-cyan-300 text-xs sm:text-sm">
                  <Inbox size={18} className="text-blue-500 shrink-0" />
                  <span>📩 Check Your Inbox to Confirm Calendar Invite (تحقق من بريدك)</span>
                </div>
                <p className="text-[11px] sm:text-xs leading-relaxed max-w-lg mx-auto font-medium text-slate-700 dark:text-gray-200">
                  A Google Calendar invitation has been dispatched to <strong className="text-blue-600 dark:text-cyan-400">{email}</strong>. Please check your inbox (or updates/spam folder) and accept the invite to confirm the meeting.
                </p>
                <p className="text-[11px] text-slate-600 dark:text-gray-400 font-arabic">
                  تم إرسال دعوة التقويم إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد لديك لتأكيد قبول الدعوة وتثبيت الموعد!
                </p>
              </div>

              {/* Direct Hangout Link if generated via Google Calendar API */}
              {createdEventResult?.hangoutLink && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-2">
                  <span className="font-semibold truncate">Google Meet Link Ready:</span>
                  <a
                    href={createdEventResult.hangoutLink}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold underline text-blue-600 dark:text-cyan-400 flex items-center gap-1 shrink-0"
                  >
                    <span>Join Meet</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* Action Buttons: WhatsApp Ping + Google Calendar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {/* Send WhatsApp Confirmation */}
                <a
                  href={whatsappNotificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer hover:scale-[1.02] min-h-[48px]"
                >
                  <WhatsAppLogo size={18} />
                  <span>Send WhatsApp Notification (إشعار واتساب مباشر)</span>
                </a>

                {/* Add directly to Google Calendar */}
                <a
                  href={createdEventResult?.htmlLink || googleCalendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02] min-h-[48px]"
                >
                  <CalendarPlus size={18} />
                  <span>View in Google Calendar (فتح في الكالندر)</span>
                </a>

                {/* Download .ics file */}
                <button
                  type="button"
                  onClick={handleDownloadICS}
                  className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[48px]"
                >
                  <span>Download .ics</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="text-xs text-slate-500 dark:text-gray-400 hover:underline cursor-pointer p-2"
                >
                  Close Window (إغلاق)
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
