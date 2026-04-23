import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contentType, topic, context, tone, length } = await req.json();

    const lengthGuide = {
      short: '400-600 words',
      medium: '800-1200 words',
      long: '1500-2500 words',
    }[length] || '800-1200 words';

    const typeInstructions = {
      blog_post: `Write a comprehensive, SEO-optimized blog post. Include: compelling H1 title, executive summary, 4-6 sections with H2 headers, actionable insights, a strong conclusion with CTA. Length: ${lengthGuide}.`,
      linkedin: `Write a high-engagement LinkedIn post. Start with a powerful hook (first line is everything on LinkedIn). Use short paragraphs, line breaks, and relevant emojis sparingly. Include a thought-provoking question or CTA at the end. Length: 150-300 words max.`,
      newsletter: `Write a professional newsletter edition. Include: subject line suggestion, preview text, personal greeting, 2-3 main sections with insights, a featured resource or recommendation, and a sign-off. Length: ${lengthGuide}.`,
      email_draft: `Write a professional outreach/follow-up email. Include: subject line, personalized opener, clear value proposition, specific ask/CTA, professional sign-off. Keep it concise and scannable.`,
    }[contentType] || `Write high-quality ${contentType} content.`;

    const prompt = `You are a world-class content strategist and writer for Strategic Minds Advisory, a premier AI consulting firm.

Content Type: ${contentType.replace(/_/g, ' ').toUpperCase()}
Topic: ${topic}
Context/Angle: ${context || 'Strategic AI consulting perspective for business leaders'}
Tone: ${tone || 'Authoritative, insightful, forward-thinking'}

Instructions: ${typeInstructions}

Write the complete content now. Do not include any meta-commentary — just the content itself.`;

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
        temperature: 0.75,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

    const body = data.choices[0].message.content;
    const wordCount = body.split(/\s+/).length;

    return Response.json({ body, wordCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});