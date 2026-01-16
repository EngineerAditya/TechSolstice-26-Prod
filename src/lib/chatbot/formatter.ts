type Focus = 'time' | 'venue' | 'prize' | 'team' | 'general';

export function formatEventDetails(event: any, query: string): string {
  // 1. Determine User Intent (Focus) from the query
  const lowerQ = query.toLowerCase();
  let focus: Focus = 'general';

  if (/\b(when|time|timing|schedule|start|starts|date)\b/.test(lowerQ)) focus = 'time';
  else if (/\b(where|venue|location|place|spot|room|hall)\b/.test(lowerQ)) focus = 'venue';
  else if (/\b(prize|pool|money|cash|winning|amount|reward)\b/.test(lowerQ)) focus = 'prize';
  else if (/\b(team|size|participants|group|solo|squad)\b/.test(lowerQ)) focus = 'team';

  // 2. Format Date/Time Helpers
  const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' };
  const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' };

  const dateStr = event.starts_at ? new Date(event.starts_at).toLocaleDateString('en-IN', dateOptions) : 'Date TBA';
  const timeStr = event.starts_at ? new Date(event.starts_at).toLocaleTimeString('en-IN', timeOptions) : 'Time TBA';
  const venueStr = event.venue || 'Venue to be announced';
  const prizeStr = event.prize_pool || 'Prize details coming soon';

  // 3. Return Context-Specific Answer
  switch (focus) {
    case 'time':
      return `**${event.name}** is scheduled for **${dateStr}** at **${timeStr}**.`;

    case 'venue':
      return `**${event.name}** will be held at the **${venueStr}**.`;

    case 'prize':
      return `The prize pool for **${event.name}** is **${prizeStr}**.`;

    case 'team':
      if (!event.min_team_size) return `Team size details for **${event.name}** are not available yet.`;
      const size = event.min_team_size === event.max_team_size
        ? `${event.min_team_size} members`
        : `${event.min_team_size} - ${event.max_team_size} members`;
      return `**${event.name}** allows a team size of **${size}**.`;

    case 'general':
    default:
      // A conversational summary (Not a receipt)
      let summary = `**${event.name}** is a ${event.category || 'general'} event taking place on **${dateStr}** at **${timeStr}** in the **${venueStr}**.\n\n`;

      if (event.shortDescription) summary += `${event.shortDescription}\n\n`;

      // Add "chips" of info if they exist
      const extras = [];
      if (event.prize_pool) extras.push(`💰 Prize: ${event.prize_pool}`);
      if (event.min_team_size) extras.push(`👥 Team: ${event.min_team_size === event.max_team_size ? event.min_team_size : `${event.min_team_size}-${event.max_team_size}`}`);

      if (extras.length > 0) summary += extras.join('  |  ');

      return summary;
  }
}