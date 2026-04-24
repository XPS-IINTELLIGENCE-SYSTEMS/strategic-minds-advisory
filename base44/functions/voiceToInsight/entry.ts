import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

async function transcribeAudio(audioUrl) {
  // Simplified transcription - in production, use proper speech-to-text API
  return 'Transcribed audio content from voice note...';
}

async function extractInsights(transcript) {
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
          content: `Extract strategic insights from transcript. Return ONLY valid JSON.`,
        },
        {
          role: 'user',
          content: `Analyze: "${transcript}"
          
          Return JSON:
          {
            "category": "market/competitive/operational",
            "sentiment": "positive/neutral/negative",
            "impact": 0-100,
            "confidence": 0-100,
            "tags": ["tag1", "tag2"],
            "summary": "Key insight",
            "actionItems": ["action1", "action2"]
          }`,
        },
      ],
      temperature: 0.6,
      max_tokens: 800,
    }),
  });

  const result = await response.json();
  const content = result.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {
    return {
      category: 'market',
      sentiment: 'neutral',
      impact: 50,
      confidence: 75,
      tags: ['voice_note'],
      summary: transcript,
      actionItems: [],
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

    const { audioUrl } = await req.json();

    if (!audioUrl) {
      return Response.json({ error: 'Missing audioUrl' }, { status: 400 });
    }

    const transcript = await transcribeAudio(audioUrl);
    const insights = await extractInsights(transcript);

    return Response.json({
      success: true,
      transcript,
      insights,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});