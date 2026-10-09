import {
  BookingValidationService,
  BookingRequest,
  BookingValidationResult,
  SlotCapacityInfo,
} from './BookingValidationService';

export interface OfficialBooking {
  bookingId: string;
  date: string; // YYYY-MM-DD
  slot: string; // e.g. "04:00 PM CLT"
  meetingTitle: string;
  duration: string;
  platform: 'meet' | 'whatsapp' | 'zoom';
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  notes?: string;
  status: 'confirmed' | 'cancelled';
  googleMeetLink: string;
  calendarEventId?: string;
  createdAt: string;
}

const STORAGE_KEY = 'ahmed_official_locked_bookings';
const CHANNEL_NAME = 'ahmed_bookings_realtime_channel';

// Re-export validation service
export { BookingValidationService };

// Generate consistent unique booking reference
export function generateBookingId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MTG-${year}-${rand}`;
}

// Generate an official Google Meet room link
export function generateGoogleMeetLink(bookingId: string): string {
  const hash = bookingId.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://meet.google.com/ahm-${hash.slice(-4)}-dev`;
}

// Get tomorrow's ISO date string
function getTomorrowDateString(daysAhead: number = 1): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

// Initial realistic locked slots to demonstrate slot locking in action
const INITIAL_SEEDED_BOOKINGS: OfficialBooking[] = [
  {
    bookingId: 'MTG-2026-8419',
    date: getTomorrowDateString(1),
    slot: '04:00 PM CLT',
    meetingTitle: 'Project Discussion & Mobile Architecture',
    duration: '30 mins',
    platform: 'meet',
    clientName: 'Karim Mansour',
    clientEmail: 'k.mansour@techconsult.eg',
    notes: 'Architecture review for upcoming Flutter enterprise app',
    status: 'confirmed',
    googleMeetLink: 'https://meet.google.com/ahm-8419-dev',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    bookingId: 'MTG-2026-5120',
    date: getTomorrowDateString(2),
    slot: '05:30 PM CLT',
    meetingTitle: 'Technical Interview & Job Opportunity',
    duration: '45 mins',
    platform: 'meet',
    clientName: 'Sara Al-Ghamdi',
    clientEmail: 'talent@fintech-gulf.com',
    notes: 'Senior Mobile Engineer technical discussion',
    status: 'confirmed',
    googleMeetLink: 'https://meet.google.com/ahm-5120-dev',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch {
  // BroadcastChannel unavailable in this context
}

// Retrieve all confirmed bookings from persistence
export function getAllBookings(): OfficialBooking[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed initial bookings
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEEDED_BOOKINGS));
      return INITIAL_SEEDED_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((b) => b.status === 'confirmed');
    }
  } catch (err) {
    console.error('Failed to parse bookings from localStorage:', err);
  }
  return [];
}

// Check if a specific slot on a specific date is already locked/booked
export function isSlotBooked(date: string, slot: string): boolean {
  // Check both direct records and BookingValidationService
  const isAvailableInValidator = BookingValidationService.isSlotAvailable(date, slot);
  if (!isAvailableInValidator) return true;

  const bookings = getAllBookings();
  return bookings.some(
    (b) => b.date === date && b.slot === slot && b.status === 'confirmed'
  );
}

// Return list of slots already booked for a specific date
export function getBookedSlotsForDate(date: string): string[] {
  const fromValidator = BookingValidationService.getBookedSlotsForDate(date);
  const bookings = getAllBookings();
  const fromBookings = bookings
    .filter((b) => b.date === date && b.status === 'confirmed')
    .map((b) => b.slot);

  return Array.from(new Set([...fromValidator, ...fromBookings]));
}

// Find existing booking details for a slot
export function getBookingForSlot(date: string, slot: string): OfficialBooking | undefined {
  const bookings = getAllBookings();
  return bookings.find(
    (b) => b.date === date && b.slot === slot && b.status === 'confirmed'
  );
}

// Atomically lock a slot and store official booking with capacity management
export async function lockAndConfirmSlotAsync(bookingData: {
  date: string;
  slot: string;
  meetingTitle: string;
  duration: string;
  platform: 'meet' | 'whatsapp' | 'zoom';
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  notes?: string;
  maxCapacity?: number;
  calendarAccessToken?: string;
  calendarEventId?: string;
  ahmedEmail?: string;
}): Promise<{ success: boolean; booking?: OfficialBooking; error?: string }> {
  const validationResult = await BookingValidationService.validateAndBookSlot({
    date: bookingData.date,
    timeSlot: bookingData.slot,
    meetingTitle: bookingData.meetingTitle,
    duration: bookingData.duration,
    platform: bookingData.platform,
    clientName: bookingData.clientName,
    clientEmail: bookingData.clientEmail,
    clientPhone: bookingData.clientPhone,
    notes: bookingData.notes,
    maxCapacity: bookingData.maxCapacity || 1,
    calendarAccessToken: bookingData.calendarAccessToken,
    ahmedEmail: bookingData.ahmedEmail,
  });

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error || 'عذراً، هذا الميعاد محجوز بالفعل أو وصلت سعته للحد الأقصى.',
    };
  }

  const bookingId = validationResult.bookingId || generateBookingId();
  const googleMeetLink = validationResult.googleMeetLink;

  const newBooking: OfficialBooking = {
    bookingId,
    date: bookingData.date,
    slot: bookingData.slot,
    meetingTitle: bookingData.meetingTitle,
    duration: bookingData.duration,
    platform: bookingData.platform,
    clientName: bookingData.clientName,
    clientEmail: bookingData.clientEmail,
    clientPhone: bookingData.clientPhone,
    notes: bookingData.notes,
    status: 'confirmed',
    googleMeetLink,
    calendarEventId: validationResult.calendarEventResult?.id || bookingData.calendarEventId,
    createdAt: new Date().toISOString(),
  };

  try {
    const existing = getAllBookings();
    const updated = [newBooking, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'BOOKING_LOCKED', booking: newBooking });
    }

    return { success: true, booking: newBooking };
  } catch (err: any) {
    console.error('Error locking booking slot:', err);
    return {
      success: false,
      error: 'حدث خطأ أثناء حفظ الحجز في النظام. يرجى المحاولة مرة أخرى.',
    };
  }
}

// Synchronous wrapper for backwards compatibility
export function lockAndConfirmSlot(bookingData: {
  date: string;
  slot: string;
  meetingTitle: string;
  duration: string;
  platform: 'meet' | 'whatsapp' | 'zoom';
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  notes?: string;
  maxCapacity?: number;
  calendarEventId?: string;
}): { success: boolean; booking?: OfficialBooking; error?: string } {
  const { date, slot } = bookingData;

  // Strict check to ensure slot is not double-booked
  if (isSlotBooked(date, slot)) {
    return {
      success: false,
      error: 'عذراً، هذا الميعاد محجوز بالفعل لشخص آخر ولا يمكن تكرار الحجز في نفس الوقت.',
    };
  }

  const bookingId = generateBookingId();
  const googleMeetLink = generateGoogleMeetLink(bookingId);

  const newBooking: OfficialBooking = {
    bookingId,
    date,
    slot,
    meetingTitle: bookingData.meetingTitle,
    duration: bookingData.duration,
    platform: bookingData.platform,
    clientName: bookingData.clientName,
    clientEmail: bookingData.clientEmail,
    clientPhone: bookingData.clientPhone,
    notes: bookingData.notes,
    status: 'confirmed',
    googleMeetLink,
    calendarEventId: bookingData.calendarEventId,
    createdAt: new Date().toISOString(),
  };

  try {
    const existing = getAllBookings();
    const updated = [newBooking, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Register with BookingValidationService in background
    BookingValidationService.validateAndBookSlot({
      date,
      timeSlot: slot,
      meetingTitle: bookingData.meetingTitle,
      duration: bookingData.duration,
      platform: bookingData.platform,
      clientName: bookingData.clientName,
      clientEmail: bookingData.clientEmail,
      clientPhone: bookingData.clientPhone,
      notes: bookingData.notes,
      maxCapacity: bookingData.maxCapacity || 1,
    }).catch(() => {});

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'BOOKING_LOCKED', booking: newBooking });
    }

    return { success: true, booking: newBooking };
  } catch (err: any) {
    console.error('Error locking booking slot:', err);
    return {
      success: false,
      error: 'حدث خطأ أثناء حفظ الحجز في النظام. يرجى المحاولة مرة أخرى.',
    };
  }
}

// Cancel a booking and release the slot
export function cancelBooking(bookingId: string): boolean {
  try {
    const existing = getAllBookings();
    const target = existing.find((b) => b.bookingId === bookingId);
    const updated = existing.filter((b) => b.bookingId !== bookingId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (target) {
      const slotKey = BookingValidationService.getSlotKey(target.date, target.slot);
      BookingValidationService.cancelBooking(slotKey, target.clientEmail).catch(() => {});
    }

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'BOOKING_RELEASED', bookingId });
    }
    return true;
  } catch {
    return false;
  }
}

// Real-time listener for bookings changes (across tabs and state updates)
export function subscribeToBookings(
  callback: (bookings: OfficialBooking[]) => void
): () => void {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === 'ahmed_booking_validation_slots') {
      callback(getAllBookings());
    }
  };

  const handleBroadcastMessage = () => {
    callback(getAllBookings());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange);
  }

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  // Also subscribe to BookingValidationService events
  const unsubValidator = BookingValidationService.subscribe(() => {
    callback(getAllBookings());
  });

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange);
    }
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
    unsubValidator();
  };
}

