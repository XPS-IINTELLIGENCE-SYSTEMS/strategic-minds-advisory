import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { messages, systemPrompt, model = 'llama-3.3-70b-versatile' } = await req.json();

    const groqMessages = [];
    if (systemPrompt) groqMessages.push({ role: 'system', content: systemPrompt });
    groqMessages.push(...messages);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: groqMessages,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

    return Response.json({ 
      content: data.choices[0].message.content,
      usage: data.usage 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});