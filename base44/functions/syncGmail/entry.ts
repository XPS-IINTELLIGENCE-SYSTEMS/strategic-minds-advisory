import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { to, subject, body, connectorId } = await req.json();

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(connectorId);

    // Build RFC 2822 message
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      body,
    ].join('\r\n');

    const encoded = btoa(unescape(encodeURIComponent(message)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encoded }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Gmail API error');

    return Response.json({ success: true, messageId: data.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});