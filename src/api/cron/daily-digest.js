/* global process */
// Vercel Cron Job: Daily digest (runs at 9 AM ET)
// Schedule: 0 9 * * * (in vercel.json)

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .eq('digest_enabled', true);

    if (usersError) throw usersError;

    for (const user of users) {
      // Generate digest for user
      const digestContent = await generateDailyDigest(user.id);

      // Save to database
      await supabase
        .from('daily_digests')
        .insert({
          user_id: user.id,
          email: user.email,
          content: digestContent,
          created_at: new Date().toISOString(),
        });

      // TODO: Send email via sendgrid or resend
    }

    return res.status(200).json({
      success: true,
      digests_sent: users.length,
    });
  } catch (error) {
    console.error('Cron error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function generateDailyDigest(userId) {
  // Fetch user's data and generate summary
  return `Daily Digest for ${userId}`;
}