import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initCalendarAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleCalendar = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google OAuth access token');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCalendarAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const signOutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface CreateMeetingEventParams {
  meetingTitle: string;
  clientName: string;
  clientEmail: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "03:00 PM CLT"
  durationMinutes?: number;
  platform: 'meet' | 'whatsapp' | 'zoom';
  notes?: string;
  ahmedEmail?: string;
}

export interface CreatedCalendarEventResult {
  id: string;
  htmlLink: string;
  hangoutLink?: string;
  summary: string;
  status: string;
}

/**
 * Parses timeSlot like "03:00 PM CLT" and date "2026-10-07" into ISO Date Strings with Cairo time (+02:00)
 */
export const calculateMeetingDateTimes = (date: string, timeSlot: string, durationMinutes: number = 30) => {
  // Extract hour and minute
  const match = timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let hours = 15;
  let minutes = 0;

  if (match) {
    let rawHours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const meridiem = match[3].toUpperCase();
    if (meridiem === 'PM' && rawHours < 12) rawHours += 12;
    if (meridiem === 'AM' && rawHours === 12) rawHours = 0;
    hours = rawHours;
  }

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const startIso = `${date}T${pad(hours)}:${pad(minutes)}:00+02:00`;

  // Calculate end time
  const totalMinutes = minutes + durationMinutes;
  const endHours = hours + Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  const endIso = `${date}T${pad(endHours)}:${pad(endMinutes)}:00+02:00`;

  return { startIso, endIso };
};

/**
 * Creates an event directly in Google Calendar via Google Calendar v3 REST API
 */
export const createGoogleCalendarEvent = async (
  accessToken: string,
  params: CreateMeetingEventParams
): Promise<CreatedCalendarEventResult> => {
  const { startIso, endIso } = calculateMeetingDateTimes(
    params.date,
    params.timeSlot,
    params.durationMinutes || 30
  );

  const primaryEmail = params.ahmedEmail || 'ah.elbialy.dev@gmail.com';
  const secondaryEmail = 'elbailyahmed47@gmail.com';

  const attendeesList = [
    { email: params.clientEmail, displayName: params.clientName },
    { email: primaryEmail, displayName: 'Ahmed El-Bialy' },
  ];

  if (secondaryEmail.toLowerCase() !== primaryEmail.toLowerCase() && secondaryEmail.toLowerCase() !== params.clientEmail.toLowerCase()) {
    attendeesList.push({ email: secondaryEmail, displayName: 'Ahmed El-Bialy (Direct)' });
  }

  const requestBody: any = {
    summary: `Meeting: ${params.meetingTitle} - Ahmed El-Bialy & ${params.clientName}`,
    description: `Consultation with Ahmed El-Bialy (Mobile App Developer)\n\nClient Name: ${params.clientName}\nClient Email: ${params.clientEmail}\nPlatform: ${params.platform.toUpperCase()}\nAgenda / Project Notes: ${params.notes || 'None'}\n\nLinked Calendar Account: ${primaryEmail} / ${secondaryEmail}\nGoogle Calendar Auto-Created Event.`,
    start: {
      dateTime: startIso,
      timeZone: 'Africa/Cairo',
    },
    end: {
      dateTime: endIso,
      timeZone: 'Africa/Cairo',
    },
    attendees: attendeesList,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  };

  // If Google Meet is requested, automatically generate Hangout Meet video conference data
  if (params.platform === 'meet') {
    requestBody.conferenceData = {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    };
    requestBody.location = 'Google Meet';
  } else if (params.platform === 'whatsapp') {
    requestBody.location = 'WhatsApp Video Call (+20 102 212 1573)';
  } else {
    requestBody.location = 'Zoom Video Meeting';
  }

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Google Calendar API error: ${response.status}`);
  }

  const eventData = await response.json();
  return {
    id: eventData.id,
    htmlLink: eventData.htmlLink,
    hangoutLink: eventData.hangoutLink || eventData.conferenceData?.entryPoints?.[0]?.uri,
    summary: eventData.summary,
    status: eventData.status,
  };
};
