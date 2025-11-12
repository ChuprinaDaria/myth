import { google } from 'googleapis';

/**
 * Генерація посилання для додавання події в Google Calendar
 */
export const generateGoogleCalendarLink = (
  title: string,
  description: string,
  date: { day: number; month: number }
): string => {
  const currentYear = new Date().getFullYear();

  // Створюємо дату події (весь день)
  const startDate = new Date(currentYear, date.month - 1, date.day);
  const endDate = new Date(currentYear, date.month - 1, date.day + 1);

  // Форматуємо дати для Google Calendar (YYYYMMDD)
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    ctz: 'Europe/Kiev'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Експорт подій в iCal формат для імпорту в календарі
 */
export const generateICalendar = (events: any[]): string => {
  const currentYear = new Date().getFullYear();

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ukrainian Calendar//UA',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Українські Язичницькі Свята',
    'X-WR-TIMEZONE:Europe/Kiev',
    'X-WR-CALDESC:Календар українських язичницьких свят',
  ];

  events.forEach(event => {
    const startDate = new Date(currentYear, event.date_month - 1, event.date_day);
    const endDate = new Date(currentYear, event.date_month - 1, event.date_day + 1);

    const formatDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const formatDateOnly = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    };

    // Очищуємо опис від спецсимволів
    const description = (event.description || '')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,');

    lines.push(
      'BEGIN:VEVENT',
      `UID:event-${event.id}@ukrainian-calendar.app`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART;VALUE=DATE:${formatDateOnly(startDate)}`,
      `DTEND;VALUE=DATE:${formatDateOnly(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      // Повторюється щороку
      'RRULE:FREQ=YEARLY',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
};

export default {
  generateGoogleCalendarLink,
  generateICalendar
};
