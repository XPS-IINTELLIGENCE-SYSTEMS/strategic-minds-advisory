import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

async function callGroq(apiKey, system, user, maxTokens = 1024) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_tokens: maxTokens,
      temperature: 0.85,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Groq error');
  return data.choices[0].message.content;
}

const AGENT_SYSTEMS = {
  Analyzer: `You are the Analyzer Agent. You dissect ideas with ruthless precision, identify hidden assumptions, and surface non-obvious data patterns. Speak in bullet points and sharp observations. Be concise (max 200 words).`,
  Validator: `You are the Validator Agent. You are the devil's advocate. Find every flaw, every fatal assumption, every competitive threat. Challenge hard. Be specific. Max 200 words.`,
  Strategist: `You are the Strategist Agent. You defend and expand on the business potential. Cite revenue models, GTM phases, competitive moats. Be pragmatic and bold. Max 200 words.`,
  Inventor: `You are the Inventor Agent. You propose novel technical mechanisms, novel architectures, and patent-worthy innovations that make the idea defensible. Be creative and specific. Max 200 words.`,
  Predictor: `You are the Predictor Agent. Give probability estimates, revenue forecasts, adoption timelines. Use numbers. Be the voice of quantitative reason. Max 200 words.`,
  Visionary: `You are the Visionary Agent. You see the 10-year version of this idea. Extrapolate to its highest form. Inspire. Max 200 words.`,
};

// One-shot: generate full debate round given idea + user directive + conversation history
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { ideaConcept, ideaTitle, userDirective, round, debateHistory, agentSequence } = await req.json();
    const apiKey = Deno.env.get('GROQ_API_KEY');

    const agents = agentSequence || ['Analyzer', 'Validator', 'Strategist', 'Inventor', 'Predictor'];
    const sid = `debate_${Date.now()}`;

    const historyContext = debateHistory?.length
      ? '\n\nPrevious debate:\n' + debateHistory.map(m => `${m.agent}: ${m.content}`).join('\n\n')
      : '';

    const userContext = userDirective
      ? `\n\nUSER DIRECTIVE (steer toward this goal): ${userDirective}`
      : '';

    const messages = [];

    for (const agent of agents) {
      const system = AGENT_SYSTEMS[agent] || AGENT_SYSTEMS.Analyzer;
      const prompt = `Idea: "${ideaTitle}"\n\nFull Concept:\n${ideaConcept}${historyContext}${userContext}\n\nRound ${round || 1}: Give your ${agent} perspective on this idea. React to previous agents if any. Be sharp and add something new.`;

      const content = await callGroq(apiKey, system, prompt, 600);
      messages.push({ agent, content, round: round || 1 });

      // Log to VisionLog
      await base44.asServiceRole.entities.VisionLog.create({
        session_id: sid,
        agent,
        log_type: 'debate',
        message: content,
        metadata: JSON.stringify({ round, userDirective }),
      }).catch(() => {});
    }

    // Synthesizer — final summary of the round
    const synthesis = await callGroq(apiKey,
      `You are the Synthesis Agent. After agents debate, you integrate all perspectives into a single evolved idea statement. Be concise (150 words max). Start with "Round ${round || 1} synthesis:"`,
      `Idea: "${ideaTitle}"\n\nDebate:\n${messages.map(m => `${m.agent}: ${m.content}`).join('\n\n')}${userContext}`
    );

    messages.push({ agent: 'Synthesis', content: synthesis, round: round || 1, isSynthesis: true });

    return Response.json({ success: true, messages, sessionId: sid });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});