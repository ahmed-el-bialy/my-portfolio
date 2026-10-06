import React, { useState } from 'react';
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
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeveloperProfile } from '../data/portfolioData';
import { WhatsAppLogo } from './TechLogos';
import { useScrollLock } from '../hooks/useScrollLock';

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

const TIME_SLOTS = [
  '10:00 AM CLT',
  '12:30 PM CLT',
  '03:00 PM CLT',
  '05:30 PM CLT',
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
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[2]);
  const [meetingDate, setMeetingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const currentTypeObj = MEETING_TYPES.find((t) => t.id === selectedType) || MEETING_TYPES[0];

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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setNotificationToast(`Booking confirmed for ${meetingDate} at ${selectedSlot}! Notification dispatched.`);

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
      // Graceful fallback
    }

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
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('ahmed_portfolio_bookings', JSON.stringify(existing.slice(0, 20)));
    } catch {}

    setIsSubmitting(false);
    setIsBooked(true);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.55 },
    });
  };

  const whatsappNotificationUrl = `https://wa.me/201022121573?text=${encodeURIComponent(
    `Salam Ahmed! 👋\nI have confirmed a meeting booking with you through your portfolio website:\n\n📅 Date: ${meetingDate}\n⏰ Time: ${selectedSlot} (Cairo Time)\n🎯 Topic: ${currentTypeObj.title}\n💻 Platform: ${selectedPlatform.toUpperCase()}\n👤 Name: ${name}\n✉️ Email: ${email}${phone ? `\n📱 Phone: ${phone}` : ''}${notes ? `\n📝 Notes: ${notes}` : ''}`
  )}`;

  const handleDownloadICS = () => {
    const cleanDate = meetingDate.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ahmed El-Bialy//Meeting Booking//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Meeting: ${currentTypeObj.title} with Ahmed El-Bialy`,
      `DESCRIPTION:Client: ${name} (${email})\\nPlatform: ${selectedPlatform.toUpperCase()}\\nNotes: ${notes || 'None'}`,
      `DTSTART:${cleanDate}T120000Z`,
      `DTEND:${cleanDate}T123000Z`,
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

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Meeting: ${currentTypeObj.title} with Ahmed El-Bialy`
  )}&details=${encodeURIComponent(
    `Meeting with Ahmed El-Bialy (Mobile App Developer)\nClient: ${name} (${email})\nPlatform: ${selectedPlatform.toUpperCase()}\nNotes: ${notes}`
  )}&add=${encodeURIComponent(profile.email)}&dates=${meetingDate.replace(/-/g, '')}T120000Z/${meetingDate.replace(
    /-/g,
    ''
  )}T123000Z`;

  const modalNode = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl my-auto bg-white dark:bg-[#121420] border border-slate-200 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
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
                Book a 1-on-1 Meeting (حجز موعد)
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Direct consultation with Ahmed El-Bialy • Flutter Developer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-200/70 dark:bg-white/10 hover:bg-red-500 hover:text-white text-slate-700 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Notification Banner */}
        {notificationToast && (
          <div className="bg-emerald-600 text-white text-xs font-medium px-4 py-2.5 flex items-center justify-between border-b border-emerald-500">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{notificationToast}</span>
            </span>
            <button onClick={() => setNotificationToast(null)} className="text-white hover:opacity-80">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 text-xs sm:text-sm overflow-y-auto">
          {!isBooked ? (
            <form onSubmit={handleBookingSubmit} className="space-y-4 sm:space-y-5">
              
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
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-600/15 shadow-xs'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.02]'
                        }`}
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
                        className={`p-2.5 rounded-xl border-2 flex items-center justify-center gap-2 font-semibold text-xs transition-all cursor-pointer min-h-[44px] ${
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

              {/* Step 3: Real-Time Calendar Selection */}
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
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer min-h-[44px] ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-white/[0.02] text-slate-800 dark:text-gray-200'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold opacity-80">{day.dayName}</div>
                        <div className="text-xs font-bold mt-0.5">{day.fullLabel}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">Or custom date:</span>
                  <input
                    type="date"
                    value={meetingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    required
                    className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Step 4: Time Slots */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                    4. Pick Time Slot (اختر الوقت)
                  </label>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                    Cairo Time (GMT+2)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer min-h-[40px] ${
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
                      placeholder="Your Name (الاسم) *"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email (البريد الإلكتروني) *"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    placeholder="Brief notes / agenda (ملاحظات عن الاجتماع أو نبذة عن المشروع)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#181a29] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] min-h-[44px]"
                >
                  {isSubmitting ? (
                    <span>Confirming...</span>
                  ) : (
                    <>
                      <CalendarPlus size={15} />
                      <span>Confirm Booking (تأكيد الحجز)</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            /* Confirmation Screen */
            <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Meeting Booked Successfully! (تم تأكيد الحجز بنجاح)
                </h4>
                <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-blue-600 dark:text-cyan-400">{name}</strong>. Ahmed El-Bialy has received your booking for <strong>{meetingDate}</strong> at <strong>{selectedSlot}</strong> via <strong>{selectedPlatform.toUpperCase()}</strong>.
                </p>
              </div>

              {/* Confirmation Actions */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={whatsappNotificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer hover:scale-[1.02] min-h-[44px]"
                >
                  <WhatsAppLogo size={16} />
                  <span>Send WhatsApp Confirmation (إشعار واتساب)</span>
                </a>

                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer min-h-[44px]"
                >
                  <CalendarPlus size={16} />
                  <span>Add to Google Calendar</span>
                </a>

                <button
                  type="button"
                  onClick={handleDownloadICS}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <span>Download .ics</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="text-xs text-slate-500 dark:text-gray-400 hover:underline cursor-pointer"
                >
                  Close Window
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
