import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return Response.json({ error: 'Message required' }, { status: 400 });
    }

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a helpful service advisor for Strategic Minds Advisory, an AI-powered strategic planning platform.

Services offered:
- Vision Cortex: 24/7 AI invention and ideation system
- Auto-Invention System: Automated business model generation
- Elite Intelligence System: Market research and competitive analysis
- Stress Testing & Scenario Planning: Black swan scenario analysis
- Investor Pitch Decks: AI-generated investor presentations
- Strategy Playbooks: Reusable strategic frameworks

Pricing: Contact for custom quotes based on your needs.
Contact: strategicmindsadvisory@gmail.com | Phone: 772-209-0266 (FL) or 435-229-4404 (UT)
Hours: Monday-Friday, 9 AM - 7 PM ET

User question: ${message}

Respond concisely (1-2 sentences max) about services or pricing. If they need detailed consultation, recommend contacting via email or phone.`,
      model: 'gpt_5_mini',
    });

    return Response.json({ 
      success: true, 
      answer: response 
    });
  } catch (error) {
    console.error('Service AI error:', error.message);
    return Response.json({ 
      error: 'Failed to get response. Please contact us directly.' 
    }, { status: 500 });
  }
});