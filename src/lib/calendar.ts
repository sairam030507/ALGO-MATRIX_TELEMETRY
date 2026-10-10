import { Contest } from '../types';

/**
 * Format ISO Date string to iCal UTC format (YYYYMMDDTHHMMSSZ)
 */
function toICalDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generate standard RFC 5545 .ics calendar content for a single contest or list of contests.
 */
export function generateICalFeed(contests: Contest[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AlgoPulse//Unified CP Contest Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:AlgoPulse CP Contests',
    'X-WR-TIMEZONE:UTC',
  ];

  for (const contest of contests) {
    const dtStart = toICalDate(contest.startTime);
    const dtEnd = toICalDate(contest.endTime);
    const now = toICalDate(new Date().toISOString());

    lines.push(
      'BEGIN:VEVENT',
      `UID:algopulse-${contest.platform}-${contest.id}@algopulse.dev`,
      `DTSTAMP:${now}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:[${contest.platform.toUpperCase()}] ${contest.name}`,
      `DESCRIPTION:Competitive Programming Contest on ${contest.platform.toUpperCase()}\\nRegister & Participate: ${contest.url}\\nDivision: ${contest.division || 'Open'}\\nRated: ${contest.rated ? 'Yes' : 'No'}`,
      `URL:${contest.url}`,
      'STATUS:CONFIRMED',
      // T-24h Alarm
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Contest starts in 24 hours: ${contest.name}`,
      'END:VALARM',
      // T-1h Alarm
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Contest starts in 1 hour: ${contest.name}`,
      'END:VALARM',
      // T-15m Alarm
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      `DESCRIPTION:Contest starts in 15 minutes! Open arena: ${contest.url}`,
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Generates direct Google Calendar web template URL.
 */
export function generateGoogleCalendarUrl(contest: Contest): string {
  const start = toICalDate(contest.startTime);
  const end = toICalDate(contest.endTime);
  const title = encodeURIComponent(`[${contest.platform.toUpperCase()}] ${contest.name}`);
  const details = encodeURIComponent(
    `Competitive Programming Contest on ${contest.platform.toUpperCase()}\nLink: ${contest.url}\nRated: ${contest.rated ? 'Yes' : 'No'}\nDuration: ${Math.round(contest.durationSeconds / 60)} minutes.`
  );
  const location = encodeURIComponent(contest.url);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

/**
 * Generates Discord webhook embed payload.
 */
export function generateDiscordWebhookPayload(contest: Contest, milestone: '24h' | '1h' | '15m') {
  const platformColors: Record<string, number> = {
    leetcode: 0xffa116,   // LeetCode orange
    codeforces: 0x3182ce, // Codeforces blue
    codechef: 0x5b4638,   // CodeChef brown/slate
  };

  const milestoneTitles = {
    '24h': 'Contest Starting in 24 Hours',
    '1h': 'Contest Starting in 1 Hour!',
    '15m': 'FINAL CALL: Contest Starting in 15 Minutes!',
  };

  return {
    content: milestone === '15m' ? '@everyone 🚨 Contest is starting in 15 minutes!' : undefined,
    embeds: [
      {
        title: contest.name,
        description: `**Platform:** ${contest.platform.toUpperCase()}\n**Start Time:** <t:${Math.floor(new Date(contest.startTime).getTime() / 1000)}:F> (<t:${Math.floor(new Date(contest.startTime).getTime() / 1000)}:R>)\n**Duration:** ${Math.round(contest.durationSeconds / 60)} mins\n**Rated:** ${contest.rated ? '✅ Yes' : '❌ No'}`,
        url: contest.url,
        color: platformColors[contest.platform] || 0x6366f1,
        author: {
          name: `AlgoPulse Alert · ${milestoneTitles[milestone]}`,
        },
        fields: [
          {
            name: 'Arena Link',
            value: `[Open Contest Arena](${contest.url})`,
            inline: true,
          },
          {
            name: 'Division / Tier',
            value: contest.division || 'All Divisions',
            inline: true,
          },
        ],
        footer: {
          text: 'AlgoPulse CP Contest Scheduler',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Generates Telegram message payload in MarkdownV2.
 */
export function generateTelegramMessagePayload(contest: Contest, milestone: '24h' | '1h' | '15m') {
  const milestoneLabels = {
    '24h': '⏰ Contest starts in 24 hours',
    '1h': '⏳ Contest starts in 1 hour',
    '15m': '🚨 *FINAL CALL* — Contest starts in 15 minutes!',
  };

  return {
    parse_mode: 'HTML',
    text: `<b>${milestoneLabels[milestone]}</b>\n\n` +
      `🏆 <b>${contest.name}</b>\n` +
      `🌐 <b>Platform:</b> ${contest.platform.toUpperCase()}\n` +
      `⏱ <b>Duration:</b> ${Math.round(contest.durationSeconds / 60)} minutes\n` +
      `⭐ <b>Rated:</b> ${contest.rated ? 'Yes' : 'No'}\n` +
      `🔗 <a href="${contest.url}">Open Contest Arena</a>\n\n` +
      `<i>Synced via AlgoPulse Unified CP Engine</i>`,
  };
}
