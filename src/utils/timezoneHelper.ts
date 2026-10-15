/**
 * Timezone Helper for Meeting Booking System
 * Automatically detects client timezone and formats times relative to Cairo Time (CLT / GMT+2)
 */

export interface TimezoneInfo {
  timeZone: string;
  city: string;
  offsetString: string;
  offsetHours: number;
}

export function getClientTimezoneInfo(): TimezoneInfo {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const now = new Date();
    
    // Get offset in minutes between client time and UTC
    const clientOffsetMinutes = -now.getTimezoneOffset();
    const offsetHours = clientOffsetMinutes / 60;
    
    const sign = offsetHours >= 0 ? '+' : '-';
    const absHours = Math.floor(Math.abs(offsetHours));
    const absMins = Math.abs(clientOffsetMinutes % 60);
    const offsetString = `UTC${sign}${String(absHours).padStart(2, '0')}:${String(absMins).padStart(2, '0')}`;
    
    // Extract city name from IANA string (e.g. "Europe/London" -> "London")
    const parts = tz.split('/');
    const city = parts[parts.length - 1].replace(/_/g, ' ');

    return {
      timeZone: tz,
      city: city || tz,
      offsetString,
      offsetHours,
    };
  } catch {
    return {
      timeZone: 'Africa/Cairo',
      city: 'Cairo',
      offsetString: 'UTC+02:00',
      offsetHours: 2,
    };
  }
}

/**
 * Converts a Cairo time slot (e.g., "15:00") on a given date to the client's local time string
 */
export function convertCairoSlotToLocal(cairoDateStr: string, cairoSlotTime: string): { localTimeStr: string; localDateStr: string; isDifferentDay: boolean } {
  try {
    // Cairo is UTC+2 (ignoring DST complexities or standardizing to +02:00)
    // Construct ISO string for Cairo time: YYYY-MM-DDTHH:MM:00+02:00
    const [hours, mins] = cairoSlotTime.split(':').map(Number);
    const [year, month, day] = cairoDateStr.split('-').map(Number);

    // Create date in UTC+2
    // UTC time = Cairo time - 2 hours
    const utcHours = hours - 2;
    const utcDate = new Date(Date.UTC(year, month - 1, day, utcHours, mins || 0));

    // Format in client's local timezone
    const localTimeStr = utcDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const localDateStr = utcDate.toISOString().split('T')[0];
    const isDifferentDay = localDateStr !== cairoDateStr;

    return { localTimeStr, localDateStr, isDifferentDay };
  } catch {
    return { localTimeStr: cairoSlotTime, localDateStr: cairoDateStr, isDifferentDay: false };
  }
}
