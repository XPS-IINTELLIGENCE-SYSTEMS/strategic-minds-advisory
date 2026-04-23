import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

async function callGroq(apiKey, systemPrompt, userPrompt, jsonMode = false) {
  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 4096,
    temperature: 0.8,
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Groq error');
  const content = data.choices[0].message.content;
  if (jsonMode) {
    try { return JSON.parse(content); } catch { return { raw: content }; }
  }
  return content;
}

const AGENTS = {
  analyzer: {
    name: 'Analyzer',
    emoji: '🔬',
    system: `You are the Analyzer Agent inside Vision Cortex — a collective AI invention engine.
Your role: deeply analyze information, identify patterns, extract signals, and synthesize insights from diverse domains (AI, finance, crypto, science, politics, philosophy, technology).
You are rigorous, data-driven, and relentlessly curious. Surface non-obvious connections.`,
  },
  visionary: {
    name: 'Visionary',
    emoji: '🌌',
    system: `You are the Visionary Agent inside Vision Cortex.
Your role: dream at scale. Take analyzed signals and project them into transformative, paradigm-shifting ideas. Think 5-10 years ahead. Invent products, systems, and businesses that don't yet exist but will be worth billions.
Be bold, creative, and specific.`,
  },
  strategist: {
    name: 'Strategist',
    emoji: '♟️',
    system: `You are the Strategist Agent inside Vision Cortex.
Your role: take visionary ideas and build concrete go-to-market strategies, business models, competitive positioning, and revenue architectures.
Focus on: TAM, moats, unit economics, GTM phases, funding strategy, and team structure.`,
  },
  inventor: {
    name: 'Inventor',
    emoji: '⚗️',
    system: `You are the Inventor Agent inside Vision Cortex.
Your role: design the technical architecture, novel mechanisms, and system blueprints for each idea.
Think in: algorithms, data flows, AI model stacks, APIs, patents, proprietary methods. Make it technically feasible and defensible.`,
  },
  predictor: {
    name: 'Predictor',
    emoji: '📡',
    system: `You are the Predictor Agent inside Vision Cortex.
Your role: simulate future market conditions, forecast adoption curves, model competitive responses, and assign probability distributions to idea success.
Use quantitative reasoning. Output specific numbers and confidence intervals.`,
  },
  coder: {
    name: 'Coder',
    emoji: '💻',
    system: `You are the Coder Agent inside Vision Cortex.
Your role: design the MVP technical implementation. Specify: tech stack, database schema, API design, key algorithms, and a 90-day build roadmap.
Make it real — specific libraries, frameworks, and code structure.`,
  },
  marketer: {
    name: 'Marketer',
    emoji: '📢',
    system: `You are the Marketer Agent inside Vision Cortex.
Your role: brand every idea powerfully. Create: brand name, tagline, positioning, launch strategy, viral growth mechanism, content pillars, and influencer strategy.
Make every idea feel inevitable and desirable.`,
  },
  validator: {
    name: 'Validator',
    emoji: '✅',
    system: `You are the Validator Agent inside Vision Cortex.
Your role: rigorously stress-test ideas. Challenge assumptions, find fatal flaws, score on 10 dimensions, and recommend specific improvements to raise the success probability.
Be brutally honest. Assign a 0-100 validation score.`,
  },
  documentor: {
    name: 'Documentor',
    emoji: '📋',
    system: `You are the Documentation Agent inside Vision Cortex.
Your role: compile everything into a complete, professional idea package. Structure: Executive Summary, Problem, Solution, Market, Technology, Financials, Roadmap, Team, Risk Analysis, and Appendix.
Write at the level of a top-tier venture pitch deck combined with a technical spec.`,
  },
};

const DOMAINS = [
  'AI & Machine Learning', 'Fintech & Crypto', 'Biotech & Health',
  'Climate & Energy', 'Space & Defense', 'Philosophy & Consciousness',
  'Social Systems', 'Robotics & Automation', 'Quantum Computing', 'Education',
];

const SEED_SOURCES = [
  'Latest AI research preprints (arXiv, Hugging Face)',
  'Crypto market structural shifts and DeFi primitives',
  'Emerging regulatory landscape in AI governance',
  'Neuroscience advances in brain-computer interfaces',
  'Global economic policy signals (Fed, ECB, central banks)',
  'Open source AI model releases and benchmarks',
  'Social media behavioral pattern shifts',
  'Climate tech investment flows',
  'Scientific breakthroughs in materials science',
  'Philosophy of mind and consciousness research',
  'Venture capital deployment patterns in deep tech',
  'Geopolitical technology competition dynamics',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { mode, ideaId, sessionId, customSeed, domain } = await req.json();
    const apiKey = Deno.env.get('GROQ_API_KEY');
    const sid = sessionId || `vc_${Date.now()}`;

    const log = async (agent, logType, message, metadata = {}) => {
      await base44.asServiceRole.entities.VisionLog.create({
        session_id: sid,
        agent,
        log_type: logType,
        message,
        idea_id: ideaId || '',
        metadata: JSON.stringify(metadata),
      });
    };

    // ── MODE: SEED — generate fresh idea from scratch ──────────────────
    if (mode === 'seed') {
      const selectedDomain = domain || DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
      const sourceSample = SEED_SOURCES.sort(() => Math.random() - 0.5).slice(0, 4).join('; ');

      await log('Analyzer', 'source', `Ingesting signals from: ${sourceSample}`);

      // Step 1: Analyze
      const analysis = await callGroq(apiKey, AGENTS.analyzer.system,
        `Domain: ${selectedDomain}. Custom seed: ${customSeed || 'none'}.
Analyze current signals from these sources: ${sourceSample}.
Identify 3 high-signal convergence points where technology meets unmet need. Be specific.`
      );
      await log('Analyzer', 'thought', analysis);

      // Step 2: Invent
      const invention = await callGroq(apiKey, AGENTS.visionary.system,
        `Based on this analysis:\n${analysis}\n\nInvent ONE specific, concrete, world-changing idea in ${selectedDomain}.
Give it a name. Describe exactly what it does, who it serves, and why now is the right moment.
Be visionary but grounded. Think: "what would a brilliant founder build if they knew everything you just analyzed?"`
      );
      await log('Visionary', 'invention', invention);

      // Extract name + description
      const meta = await callGroq(apiKey, AGENTS.visionary.system,
        `From this idea description, extract a JSON object:\n${invention}`,
        true
      );

      const title = meta.name || meta.title || `Vision Idea ${Date.now()}`;
      const description = meta.description || meta.summary || invention.substring(0, 300);

      // Save initial idea
      const idea = await base44.asServiceRole.entities.VisionIdea.create({
        title,
        origin_agent: 'Visionary',
        domain: selectedDomain,
        description,
        full_concept: invention,
        status: 'seeded',
        iteration: 0,
        sources: sourceSample,
        tags: selectedDomain,
      });

      await log('Visionary', 'invention', `Idea seeded: "${title}"`, { ideaId: idea.id });

      return Response.json({
        success: true,
        sessionId: sid,
        idea,
        analysis,
        invention,
      });
    }

    // ── MODE: DEBATE — agents argue and improve the idea ───────────────
    if (mode === 'debate') {
      const ideas = await base44.asServiceRole.entities.VisionIdea.filter({ id: ideaId });
      const idea = ideas[0];
      if (!idea) throw new Error('Idea not found');

      await log('Validator', 'debate', `Opening debate session for: "${idea.title}"`);

      const challenge = await callGroq(apiKey, AGENTS.validator.system,
        `Debate and stress-test this idea:\n\nTitle: ${idea.title}\nConcept: ${idea.full_concept}\n\nProvide: 5 sharp challenges/weaknesses, then 5 specific improvements to address each.`
      );

      const defense = await callGroq(apiKey, AGENTS.strategist.system,
        `Defend and strengthen this idea against these challenges:\n${challenge}\n\nOriginal idea: ${idea.full_concept}\n\nProvide a strengthened version of the idea addressing all concerns.`
      );

      const synthesis = await callGroq(apiKey, AGENTS.inventor.system,
        `Synthesize the debate:\nChallenge: ${challenge}\nDefense: ${defense}\n\nOutput: the IMPROVED idea concept, incorporating all valid critiques.`
      );

      const debateLog = `## CHALLENGE\n${challenge}\n\n## DEFENSE\n${defense}\n\n## SYNTHESIS\n${synthesis}`;

      await base44.asServiceRole.entities.VisionIdea.update(idea.id, {
        debate_log: debateLog,
        full_concept: synthesis,
        status: 'debating',
        iteration: (idea.iteration || 0) + 1,
      });

      await log('Validator', 'debate', 'Debate complete. Idea strengthened.', { ideaId: idea.id });

      return Response.json({ success: true, sessionId: sid, debateLog, synthesis });
    }

    // ── MODE: SIMULATE — full multi-agent pipeline ──────────────────────
    if (mode === 'simulate') {
      const ideas = await base44.asServiceRole.entities.VisionIdea.filter({ id: ideaId });
      const idea = ideas[0];
      if (!idea) throw new Error('Idea not found');

      await base44.asServiceRole.entities.VisionIdea.update(idea.id, { status: 'simulating' });

      // Strategy
      const strategy = await callGroq(apiKey, AGENTS.strategist.system,
        `Build a complete business strategy for:\n${idea.full_concept}\n\nInclude: TAM ($), revenue model, unit economics, 3 GTM phases, competitive moat, and funding strategy.`
      );
      await log('Strategist', 'thought', strategy, { ideaId: idea.id });

      // Prediction
      const prediction = await callGroq(apiKey, AGENTS.predictor.system,
        `Predict market success for this idea:\n${idea.full_concept}\n\nStrategy context:\n${strategy}\n\nOutput: probability of success (%), revenue at Y1/Y3/Y5, market adoption curve, key risk factors with probabilities.`,
        true
      );
      await log('Predictor', 'simulation', JSON.stringify(prediction), { ideaId: idea.id });

      // Tech design
      const techDesign = await callGroq(apiKey, AGENTS.inventor.system,
        `Design the technical architecture for:\n${idea.full_concept}\n\nSpecify: core algorithm, tech stack, data model, key APIs, novel mechanisms, and patent-worthy innovations.`
      );
      await log('Inventor', 'build', techDesign, { ideaId: idea.id });

      // Validation score
      const validation = await callGroq(apiKey, AGENTS.validator.system,
        `Score this idea 0-100 across: Market Need, Technical Feasibility, Competitive Advantage, Revenue Potential, Team Buildability, Timing, Innovation Level, Scalability, Defensibility, Impact.\n\nIdea: ${idea.full_concept}\nStrategy: ${strategy}`,
        true
      );
      await log('Validator', 'validation', JSON.stringify(validation), { ideaId: idea.id });

      const score = validation.total_score || validation.score || Math.round(
        Object.values(validation).filter(v => typeof v === 'number').reduce((a, b) => a + b, 0) / 10
      );

      const simResult = JSON.stringify({ strategy, prediction, techDesign, validation, score });

      await base44.asServiceRole.entities.VisionIdea.update(idea.id, {
        simulation_result: simResult,
        validation_score: score,
        revenue_potential: String(prediction.revenue_y3 || prediction.revenue_year_3 || prediction.revenue_at_year_3 || 'See simulation').substring(0, 200),
        status: score >= 60 ? 'validated' : 'debating',
        iteration: (idea.iteration || 0) + 1,
      });

      return Response.json({ success: true, sessionId: sid, strategy, prediction, techDesign, validation, score });
    }

    // ── MODE: BUILD — generate full documentation + MVP spec ────────────
    if (mode === 'build') {
      const ideas = await base44.asServiceRole.entities.VisionIdea.filter({ id: ideaId });
      const idea = ideas[0];
      if (!idea) throw new Error('Idea not found');

      await base44.asServiceRole.entities.VisionIdea.update(idea.id, { status: 'building' });

      const simData = idea.simulation_result ? JSON.parse(idea.simulation_result) : {};

      // MVP Code spec
      const mvpSpec = await callGroq(apiKey, AGENTS.coder.system,
        `Build the complete MVP technical specification for:\n${idea.full_concept}\n\nTech context:\n${simData.techDesign || ''}\n\nOutput: full tech stack, file structure, core algorithms in pseudocode, database schema, API endpoints, 90-day build roadmap with weekly milestones.`
      );
      await log('Coder', 'build', mvpSpec, { ideaId: idea.id });

      // Brand
      const brand = await callGroq(apiKey, AGENTS.marketer.system,
        `Brand this idea:\n${idea.full_concept}\n\nCreate: brand name, tagline, positioning statement, 3 key messages, launch campaign concept, viral growth mechanism, content strategy, and investor narrative.`
      );
      await log('Marketer', 'thought', brand, { ideaId: idea.id });

      // Full documentation
      const documentation = await callGroq(apiKey, AGENTS.documentor.system,
        `Create a complete professional document package for this AI venture:\n
Title: ${idea.title}
Concept: ${idea.full_concept}
Strategy: ${simData.strategy || 'See concept'}
Validation Score: ${idea.validation_score || 'TBD'}
MVP Spec: ${mvpSpec}
Branding: ${brand}

Write the complete document: Executive Summary, Problem & Opportunity, Solution Architecture, Market Analysis, Business Model, Technology Stack, Go-to-Market, Financial Projections, Risk Analysis, Team Requirements, Roadmap, and Appendix.
This is a full venture document — be comprehensive and specific.`
      );
      await log('Documentor', 'build', 'Full documentation package generated', { ideaId: idea.id });

      await base44.asServiceRole.entities.VisionIdea.update(idea.id, {
        documentation: documentation,
        status: 'documented',
      });

      return Response.json({ success: true, sessionId: sid, mvpSpec, brand, documentation });
    }

    return Response.json({ error: 'Unknown mode' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});