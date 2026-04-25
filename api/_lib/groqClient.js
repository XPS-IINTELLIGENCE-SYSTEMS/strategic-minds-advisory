export async function generateGroqText({ system, user, temperature = 0.35, maxTokens = 1800 }) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  if (!apiKey) {
    return {
      text: null,
      error: 'Groq is not configured. Required env var: GROQ_API_KEY.',
      model,
    };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      return { text: null, error: json?.error?.message || `Groq request failed with ${response.status}`, model };
    }

    return {
      text: json?.choices?.[0]?.message?.content || '',
      error: null,
      model,
      usage: json?.usage || null,
    };
  } catch (error) {
    return { text: null, error: error.message, model };
  }
}
