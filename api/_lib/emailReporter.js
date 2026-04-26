import { insertRows } from './supabaseAdmin.js';

const DEFAULT_RECIPIENTS = ['strategicmindsadvisory@gmail.com', 'j.xpsxpress@gmail.com'];

export async function sendSandboxReport({ subject, body, recipients = DEFAULT_RECIPIENTS, metadata = {} }) {
  const provider = process.env.RESEND_API_KEY ? 'resend' : 'supabase_log';

  if (provider === 'resend') {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.REPORT_EMAIL_FROM || 'AI in Action <onboarding@resend.dev>',
          to: recipients,
          subject,
          html: body.replace(/\n/g, '<br />'),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || `Resend failed with ${response.status}`);
      return { ok: true, provider, status: 'sent', data };
    } catch (error) {
      await insertRows('ai_notifications', {
        title: 'Sandbox report email failed',
        message: error.message,
        severity: 'medium',
        notification_type: 'email_report_failed',
        channel: 'supabase_log',
        status: 'queued',
        requires_admin_action: true,
        is_public: false,
      });
      return { ok: false, provider, status: 'failed', error: error.message };
    }
  }

  await insertRows('ai_notifications', {
    title: subject,
    message: body,
    severity: metadata.severity || 'low',
    notification_type: 'sandbox_report',
    channel: 'supabase_log',
    status: 'logged_no_email_provider',
    requires_admin_action: false,
    is_public: false,
  });
  return { ok: true, provider, status: 'logged_no_email_provider' };
}
