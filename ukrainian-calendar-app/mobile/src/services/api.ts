import {getApiBaseUrl} from '../config/api';

export type CalendarEvent = {
  id: string;
  title: string;
  date_day?: number;
  date_month?: number;
  date?: string; // Optional ISO if backend adds it later
  description?: string;
  traditions?: string;
  preparation?: string;
  images?: Array<{ id: string; url: string; title?: string }>;
};

export async function fetchEvents(): Promise<CalendarEvent[]> {
  const baseUrl = getApiBaseUrl();
  try {
    if (baseUrl) {
      const res = await fetch(`${baseUrl}/events`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      return data?.data ?? data ?? [];
    }
  } catch (e) {
    // fall back to local asset
  }

  // Local fallback bundled with the app
  const local = require('../../assets/events.sample.json');
  return local as CalendarEvent[];
}

export async function fetchEventById(eventId: string): Promise<CalendarEvent | null> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return null;
  const res = await fetch(`${baseUrl}/events/${eventId}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data?.data ?? null;
}


