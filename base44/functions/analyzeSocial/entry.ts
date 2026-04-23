import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { topic, platform, brandName, competitors, industry } = await req.json();

    const prompt = `You are a world-class social media intelligence analyst with access to real-time platform data patterns.

Analyze the social media landscape for the following:
- Topic/Niche: ${topic}
- Platform: ${platform}
- Brand Name: ${brandName || 'Our Brand'}
- Competitors: ${competitors || 'General industry players'}
- Industry: ${industry || 'B2B Technology / AI Consulting'}

Perform a comprehensive social intelligence analysis. Return ONLY valid JSON:
{
  "trending_hashtags": [
    { "hashtag": "#AIStrategy", "volume": "245K posts/week", "growth": "+34%", "relevance": 9, "competition": "medium" }
  ],
  "competitor_insights": [
    { "name": "Competitor Name", "strengths": ["posting cadence", "engagement tactics"], "weaknesses": ["thin content", "low video"], "estimated_followers": "45K", "top_content_type": "LinkedIn thought leadership", "engagement_rate": "3.2%" }
  ],
  "trending_content_formats": [
    { "format": "Short-form video", "platform_fit": 9, "growth_trend": "+67% YoY", "recommendation": "Prioritize 60-90s explainer videos" }
  ],
  "benchmark_metrics": {
    "industry_avg_engagement": "2.8%",
    "top_quartile_engagement": "5.4%",
    "optimal_posting_frequency": "5x/week LinkedIn, 3x/week Twitter",
    "best_posting_times": ["Tuesday 9-11am", "Thursday 2-4pm", "Sunday 6-8pm"],
    "avg_content_lifespan": "18 hours LinkedIn, 30 min Twitter"
  },
  "content_opportunities": [
    { "opportunity": "Opportunity description", "effort": "low|medium|high", "impact": "low|medium|high", "example_hook": "Hook example for this content type" }
  ],
  "sentiment_analysis": {
    "overall": "positive|neutral|negative|mixed",
    "score": 7.2,
    "key_themes": ["theme 1", "theme 2", "theme 3"],
    "pain_points": ["pain 1", "pain 2"],
    "aspirations": ["aspiration 1", "aspiration 2"]
  },
  "recommended_hashtag_strategy": {
    "pillar_hashtags": ["#hashtag1", "#hashtag2"],
    "niche_hashtags": ["#hashtag3", "#hashtag4"],
    "branded_hashtag": "#YourBrandHashtag",
    "rationale": "Explanation of strategy"
  },
  "opportunity_score": 8.2,
  "executive_summary": "2-3 sentence summary of the key opportunity"
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

    const result = JSON.parse(data.choices[0].message.content);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});