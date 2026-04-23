import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { title, date, time, duration, attendees, description, connectorId } = await req.json();

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(connectorId);

    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + (parseInt(duration) || 60) * 60000);

    const attendeeList = attendees
      ? attendees.split(',').map(e => ({ email: e.trim() })).filter(a => a.email)
      : [];

    const event = {
      summary: title,
      description: description || '',
      start: { dateTime: startDateTime.toISOString(), timeZone: 'America/New_York' },
      end: { dateTime: endDateTime.toISOString(), timeZone: 'America/New_York' },
      attendees: attendeeList,
      reminders: { useDefault: true },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Calendar API error');

    return Response.json({ success: true, eventId: data.id, link: data.htmlLink });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});