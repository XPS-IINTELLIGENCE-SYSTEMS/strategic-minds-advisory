import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Passive intelligence feed — ingests signal topics and generates curated intelligence briefs
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { categories } = await req.json();
    const apiKey = Deno.env.get('GROQ_API_KEY');

    const targets = categories || [
      'AI & LLM Research', 'Crypto & DeFi', 'Finance & Markets',
      'Geopolitics & Economy', 'Science & Biotech', 'Philosophy & Consciousness',
      'Social Media Trends', 'Invention & Patents', 'Climate & Energy',
    ];

    const prompt = `You are an elite intelligence analyst with access to all global information streams.

Synthesize a real-time intelligence brief across these domains: ${targets.join(', ')}.

For each domain, provide the most critical, non-obvious signals and insights that an AI entrepreneur or inventor would need to know RIGHT NOW to create the next billion-dollar idea.

Return JSON:
{
  "timestamp": "ISO string",
  "intelligence_brief": [
    {
      "domain": "domain name",
      "signal": "specific insight or development",
      "implication": "what this means for AI entrepreneurs",
      "urgency": "high|medium|low",
      "idea_seed": "one concrete idea this signal suggests"
    }
  ],
  "cross_domain_opportunities": [
    {
      "domains_intersecting": ["domain1", "domain2"],
      "opportunity": "specific opportunity at intersection",
      "why_now": "why this moment is unique",
      "potential_value": "estimated market value or impact"
    }
  ],
  "top_seed_for_today": "The single most compelling idea seed based on all signals today"
}`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
        temperature: 0.6,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Groq error');
    const result = JSON.parse(data.choices[0].message.content);

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});