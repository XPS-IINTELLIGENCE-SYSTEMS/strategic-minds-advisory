import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

async function analyzeCompetitors(competitors, analysisType, market, accessToken) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a competitive intelligence expert. Provide deep, actionable analysis. 
          Return ONLY valid JSON with no additional text.`,
        },
        {
          role: 'user',
          content: `Perform ${analysisType} analysis for competitors: ${competitors.join(', ')} in ${market} market.
          
          Return JSON format:
          {
            "title": "Analysis Title",
            "swot": { "strengths": [...], "weaknesses": [...], "opportunities": [...], "threats": [...] },
            "positioning": { "competitor": "market position description" },
            "features": [{ "name": "feature", "count": # }],
            "insights": "Key strategic insights",
            "positionScore": "Strong/Moderate/Weak",
            "marketGap": "Gap description",
            "riskLevel": "High/Medium/Low"
          }`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  const result = await response.json();
  const content = result.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    return {
      title: 'Competitive Analysis',
      swot: {
        strengths: ['Market leadership', 'Strong brand'],
        weaknesses: ['High pricing'],
        opportunities: ['Market expansion'],
        threats: ['New entrants'],
      },
      insights: content,
      positionScore: 'Strong',
      marketGap: 'Enterprise segment',
      riskLevel: 'Medium',
    };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { competitors, analysisType, market } = await req.json();

    if (!competitors || !analysisType || !market) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const analysis = await analyzeCompetitors(competitors, analysisType, market, user.email);

    return Response.json({
      success: true,
      ...analysis,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});