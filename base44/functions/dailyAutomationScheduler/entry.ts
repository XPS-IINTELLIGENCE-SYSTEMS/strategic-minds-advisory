import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate daily digest
    const ideas = await base44.entities.VisionIdea.filter({ created_by: user.email }, '-created_date', 5);
    const intel = await base44.entities.StrategicIntelligence.filter({ created_by: user.email }, '-created_date', 3);
    
    const prompt = `Create a brief daily strategic digest for the user based on:
    
Recent Ideas: ${ideas.map(i => i.title).join(', ')}
Recent Intelligence: ${intel.map(i => i.title).join(', ')}

Provide:
1. Key focus for today
2. Top 2 action items
3. One strategic insight

Keep it concise and actionable.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

    const digest = data.choices[0].message.content;

    // Save digest
    await base44.entities.DailyDigest.create({
      user_email: user.email,
      digest_date: new Date().toISOString().split('T')[0],
      summary: digest,
      intelligence_count: intel.length,
      voice_insights_count: 0,
      stress_tests_run: 0,
      critical_findings: 'Auto-generated from latest intelligence',
      recommendations: digest,
      sent: false,
    });

    // Send email notification
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `Your Daily Strategic Digest - ${new Date().toLocaleDateString()}`,
      body: `Good morning!\n\n${digest}\n\nKeep strategizing!`,
    });

    return Response.json({ success: true, digest });
  } catch (error) {
    console.error('Daily scheduler error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});