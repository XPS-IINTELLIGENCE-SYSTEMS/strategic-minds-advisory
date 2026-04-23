import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroq(apiKey, system, user, maxTokens = 1500) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_tokens: maxTokens,
      temperature: 0.4,
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

    const apiKey = Deno.env.get('GROQ_API_KEY');
    const sources = await base44.entities.IntelligenceSource.filter({ is_active: true });

    // Sample top 50 curated sources (elite intelligence)
    const ELITE_SOURCES = [
      { name: 'Pitchbook', type: 'api', category: 'funding' },
      { name: 'CBInsights', type: 'api', category: 'market' },
      { name: 'Crunchbase', type: 'api', category: 'competitive' },
      { name: 'Y Combinator Startup Directory', type: 'web', category: 'trend' },
      { name: 'McKinsey AI Index', type: 'research', category: 'strategy' },
      { name: 'BCG Matrix Research', type: 'research', category: 'strategy' },
      { name: 'HubSpot State of Inbound', type: 'research', category: 'psychology' },
      { name: 'Gartner Magic Quadrant', type: 'research', category: 'competitive' },
      { name: 'Forrester Wave', type: 'research', category: 'competitive' },
      { name: 'a16z Microeconomics', type: 'web', category: 'psychology' },
      { name: 'Ryan Holiday Stoicism Research', type: 'web', category: 'psychology' },
      { name: 'BJ Fogg Behavior Design', type: 'research', category: 'psychology' },
      { name: 'Robert Cialdini Influence', type: 'research', category: 'psychology' },
      { name: 'Daniel Kahneman Thinking Fast/Slow', type: 'research', category: 'psychology' },
      { name: 'Paul Graham Essays', type: 'web', category: 'strategy' },
      { name: 'Ben Horowitz Hard Things', type: 'web', category: 'strategy' },
      { name: 'Reid Hoffman Masters of Scale', type: 'web', category: 'strategy' },
      { name: 'Airbnb S1 Filing', type: 'filing', category: 'competitive' },
      { name: 'Uber S1 Filing', type: 'filing', category: 'competitive' },
      { name: 'Stripe Radar Intelligence', type: 'api', category: 'technology' },
      { name: 'Product Hunt Trends', type: 'web', category: 'market' },
      { name: 'Twitter/X Trending Topics + AI Analysis', type: 'api', category: 'trend' },
      { name: 'Reddit r/startups + r/SideProject + r/entrepreneurs', type: 'web', category: 'market' },
      { name: 'LinkedIn Influencer Analysis', type: 'api', category: 'leadership' },
      { name: 'AngelList Signals', type: 'api', category: 'funding' },
      { name: 'Patent US Office + Google Patents', type: 'api', category: 'technology' },
      { name: 'SEC Edgar Filings', type: 'api', category: 'competitive' },
      { name: 'Blind Glassdoor Culture Signals', type: 'web', category: 'competitive' },
      { name: 'Podcast Network (Lenny, Masters of Scale, How I Built This)', type: 'web', category: 'strategy' },
      { name: 'Academic Research (ArXiv, Scholar)', type: 'api', category: 'technology' },
      { name: 'Preqin Hedge Fund Data', type: 'api', category: 'funding' },
      { name: 'PitchBook Trend Analysis', type: 'api', category: 'market' },
      { name: 'Priceonomics Data Stories', type: 'web', category: 'market' },
      { name: 'The Information Editorial', type: 'web', category: 'competitive' },
      { name: 'Reuters/Bloomberg TerminalData', type: 'api', category: 'market' },
      { name: 'Slack Innovation Report', type: 'research', category: 'trend' },
      { name: 'Sequoia Capital Guide Materials', type: 'web', category: 'strategy' },
      { name: 'Benchmark Capital Research', type: 'web', category: 'strategy' },
      { name: 'Khosla Ventures Tech Reports', type: 'web', category: 'technology' },
      { name: 'Point72 Intelligence', type: 'api', category: 'market' },
      { name: 'Morningstar Research', type: 'api', category: 'competitive' },
      { name: 'Simon Wardley Mapping', type: 'web', category: 'strategy' },
      { name: 'Jobs to be Done Framework (Clayton Christensen)', type: 'research', category: 'psychology' },
      { name: 'Value Prop Canvas Research', type: 'research', category: 'psychology' },
      { name: 'European Patent Office Data', type: 'api', category: 'technology' },
      { name: 'World Bank Data + Macro Trends', type: 'api', category: 'market' },
      { name: 'UN SDG Investor Data', type: 'api', category: 'trend' },
      { name: 'ESG + Impact Investing Trends', type: 'research', category: 'trend' },
      { name: 'Blockchain/Web3 Intelligence (Messari, ChainAnalysis)', type: 'api', category: 'technology' },
      { name: 'AI Benchmarks (Hugging Face, LMSYS)', type: 'api', category: 'technology' },
    ];

    const extracted = [];

    // Scrape top elite sources for high-value intelligence
    for (const src of ELITE_SOURCES.slice(0, 15)) {
      const prompt = `You are a premium strategic intelligence analyst for elite venture firms.
Extract the single MOST VALUABLE, RARE, and ACTIONABLE strategic insight from "${src.name}" for high-growth startups in the ${src.category} category.

Output ONLY:
INSIGHT: [The specific, rare, actionable insight]
DOMAINS: [comma-separated domains where this applies]
VALUE_SCORE: [0-100, how valuable for strategy]
RARITY_SCORE: [0-100, how hard to find/synthesize this intelligence]
PREMIUM_ONLY: [yes/no]`;

      const insight = await callGroq(apiKey, 'You are a premium intelligence analyst extracting elite-tier startup insights.', prompt, 800);

      const titleMatch = insight.match(/INSIGHT:\s*([^\n]+)/i);
      const domainsMatch = insight.match(/DOMAINS:\s*([^\n]+)/i);
      const valueMatch = insight.match(/VALUE_SCORE:\s*(\d+)/i);
      const rarityMatch = insight.match(/RARITY_SCORE:\s*(\d+)/i);
      const premiumMatch = insight.match(/PREMIUM_ONLY:\s*(\w+)/i);

      const intel = {
        title: (titleMatch?.[1] || '').trim().substring(0, 150),
        content: insight.substring(0, 500),
        intelligence_type: src.category,
        domains: (domainsMatch?.[1] || '').trim(),
        source_ids: src.name,
        value_score: parseInt(valueMatch?.[1] || '0'),
        rarity_score: parseInt(rarityMatch?.[1] || '0'),
        is_premium_only: premiumMatch?.[1]?.toLowerCase() === 'yes',
      };

      if (intel.title) {
        const created = await base44.entities.StrategicIntelligence.create(intel);
        extracted.push(created.id);
      }
    }

    return Response.json({
      success: true,
      extracted: extracted.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});