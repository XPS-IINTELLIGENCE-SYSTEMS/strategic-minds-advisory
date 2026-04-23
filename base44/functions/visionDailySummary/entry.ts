import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const allIdeas = await base44.entities.VisionIdea.list('-created_date', 200);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = allIdeas.filter(i => new Date(i.created_date) > yesterday);

    const byStatus = {};
    recent.forEach(i => { byStatus[i.status] = (byStatus[i.status] || 0) + 1; });
    
    const topIdeas = recent.sort((a, b) => (b.validation_score || 0) - (a.validation_score || 0)).slice(0, 3);
    const summaryText = `Vision Cortex Daily Report: ${recent.length} ideas generated. Top: ${topIdeas.map(i => i.title).join(', ')}`;

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `🧠 Vision Cortex Daily Summary — ${recent.length} Ideas`,
      body: summaryText,
      from_name: 'Vision Cortex',
    });

    return Response.json({ success: true, ideasGenerated: recent.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});