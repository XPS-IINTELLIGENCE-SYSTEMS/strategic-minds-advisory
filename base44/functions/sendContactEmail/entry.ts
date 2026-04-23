import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'strategicmindsadvisory@gmail.com',
        subject: `New Contact Inquiry from ${name}`,
        body: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      });
    } catch (integrationError) {
      // If integration credits limit reached, store in database instead
      if (integrationError?.extra_data?.reason === 'integration_credits_limit_reached') {
        await base44.asServiceRole.entities.ContactInquiry.create({
          name,
          email,
          message,
          status: 'pending',
        });
        return Response.json({ success: true, stored: true });
      }
      throw integrationError;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});