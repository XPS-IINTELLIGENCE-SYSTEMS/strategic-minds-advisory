import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroq(apiKey, system, user) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_tokens: 2000,
      temperature: 0.3,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Groq error');
  return data.choices[0].message.content;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { ideaId, includeFinancials } = await req.json();
    const apiKey = Deno.env.get('GROQ_API_KEY');

    const idea = await base44.entities.VisionIdea.filter({ id: ideaId });
    if (!idea.length) return Response.json({ error: 'Idea not found' }, { status: 404 });

    const ideaData = idea[0];
    const simData = ideaData.simulation_result ? JSON.parse(ideaData.simulation_result) : {};

    // Generate pitch deck content
    const deckPrompt = `You are a world-class pitch deck writer who has helped 100+ startups raise billions.

Create a professional investor pitch deck for this startup:
TITLE: "${ideaData.title}"
PROBLEM: ${ideaData.description}
DOMAIN: ${ideaData.domain}
CONCEPT: ${ideaData.full_concept?.substring(0, 500) || 'N/A'}
TARGET_MARKET: ${simData.targetMarket || 'N/A'}
MOAT: ${simData.moat || 'N/A'}

Generate the content for these 12 slides in [SLIDE #] format:
1. Title Slide (Hook + Problem statement)
2. The Problem (Current pain points, market evidence)
3. The Solution (How you solve it, unique approach)
4. Market Opportunity (TAM, SAM, SOM with numbers)
5. Business Model (How you make money, unit economics)
6. Product/Technology (Tech stack, MVP status, roadmap)
7. Competitive Landscape (Competition, your advantage, moat)
8. Traction (What you've achieved so far, metrics)
9. Go-to-Market Strategy (How you acquire users, CAC projections)
10. Financial Projections (3-year revenue, growth, profitability)
11. Team (Who is executing, track records, why they'll win)
12. The Ask (How much, what's next, use of funds)

Make each slide compelling, data-driven, and designed for elite institutional investors.`;

    const deckContent = await callGroq(apiKey,
      'You are a venture capitalist pitch deck expert. Create compelling, strategic, data-driven pitch slides.',
      deckPrompt
    );

    // Generate executive summary
    const summaryPrompt = `Write a 300-word executive summary for investors about "${ideaData.title}".
Include: Problem, Solution, Market Size, Why Now, Business Model, Traction, Ask.
Make it compelling and concise for a 2-minute elevator pitch.`;

    const executiveSummary = await callGroq(apiKey,
      'You are a pitch expert. Write compelling executive summaries.',
      summaryPrompt, 600
    );

    // Build JSON structure for PDF generation
    const deckStructure = {
      ideaTitle: ideaData.title,
      domain: ideaData.domain,
      executiveSummary,
      slides: deckContent,
      generatedAt: new Date().toISOString(),
      includeFinancials,
      ideaId,
    };

    return Response.json({ success: true, deck: deckStructure });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});