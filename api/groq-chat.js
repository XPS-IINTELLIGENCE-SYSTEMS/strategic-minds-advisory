export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || process.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

  if (!apiKey) {
    return response.status(200).json({
      mode: 'synthetic',
      message: 'Groq key is not available to this serverless route. Using synthetic AI in Action fallback.',
      output: 'AI in Action Labs is in fallback mode. Add GROQ_API_KEY in Vercel project environment variables to enable live Groq responses.',
    });
  }

  try {
    const { messages = [], prompt = '' } = request.body || {};
    const normalizedMessages = messages.length
      ? messages
      : [
          { role: 'system', content: 'You are AI in Action Labs: concise, educational, source-aware, and transparent about simulation vs live data.' },
          { role: 'user', content: prompt || 'Explain the current AI in Action Labs status.' },
        ];

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: normalizedMessages,
        temperature: 0.4,
      }),
    });

    const payload = await groqResponse.json();

    if (!groqResponse.ok) {
      return response.status(200).json({
        mode: 'fallback',
        error: payload,
        output: 'Groq request failed. The app remains operational in synthetic mode.',
      });
    }

    return response.status(200).json({
      mode: 'live',
      model,
      output: payload?.choices?.[0]?.message?.content || '',
      raw: payload,
    });
  } catch (error) {
    return response.status(200).json({
      mode: 'fallback',
      error: error.message,
      output: 'Groq route encountered an error. The app remains operational in synthetic mode.',
    });
  }
}
