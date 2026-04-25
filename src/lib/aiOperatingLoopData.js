import { safeSelect } from '@/lib/supabaseClient';

const fallbackLabs = [
  {
    slug: 'paper-trading-lab',
    title: 'AI Paper Trading Lab',
    category: 'financial-education',
    mission: 'Simulate a paper-only trading account using verified source data, risk controls, and educational narration.',
    status: 'active',
    risk_level: 'high',
  },
  {
    slug: 'digital-business-builder',
    title: 'AI Digital Business Builder',
    category: 'business-building',
    mission: 'Simulate building low-cost digital businesses using public research, validation, workflows, content, and launch systems.',
    status: 'queued',
    risk_level: 'medium',
  },
  {
    slug: 'ai-media-studio',
    title: 'AI Avatar Media Studio',
    category: 'media-production',
    mission: 'Turn AI run logs into educational scripts, avatar video jobs, image prompts, shorts, and newsletters.',
    status: 'queued',
    risk_level: 'medium',
  },
];

const fallbackSchedules = [
  { name: '15-minute verified market check', cadence: 'Every 15 minutes', status: 'ready', lab_slug: 'paper-trading-lab' },
  { name: 'Daily 9 AM market lesson', cadence: 'Daily 9:00 AM ET', status: 'ready', lab_slug: 'paper-trading-lab' },
  { name: 'Daily AI content package', cadence: 'Daily 5:00 PM ET', status: 'ready', lab_slug: 'ai-media-studio' },
];

const fallbackRuns = [
  {
    title: 'Operating loop initialized',
    run_kind: 'system-build',
    status: 'pending migration',
    what_ai_did: 'Created schema and seed data for visible AI work logs.',
    next_action: 'Run Supabase migration workflow and verify tables.',
    risk_level: 'medium',
  },
];

const fallbackTopics = [
  { topic: 'Paper trading and market literacy', topic_family: 'wealth-building', priority_score: 96, status: 'active' },
  { topic: 'AI automation agency', topic_family: 'digital-business', priority_score: 94, status: 'watching' },
  { topic: 'Faceless YouTube and avatar channels', topic_family: 'media-business', priority_score: 92, status: 'watching' },
  { topic: 'Local lead generation', topic_family: 'digital-business', priority_score: 90, status: 'watching' },
  { topic: 'Digital product systems', topic_family: 'creator-business', priority_score: 88, status: 'watching' },
];

const fallbackPersonas = [
  { name: 'The Risk Manager', role: 'Paper-trading safety and loss-prevention narrator', tone: 'calm, blunt, precise, protective', status: 'ready' },
  { name: 'The Builder', role: 'Digital business systems educator', tone: 'direct, optimistic, tactical, practical', status: 'ready' },
  { name: 'The Skeptic', role: 'Claim validator and bottleneck detector', tone: 'witty, skeptical, evidence-first, concise', status: 'ready' },
  { name: 'The Creator', role: 'Viral education content strategist', tone: 'engaging, human, sharp, story-driven', status: 'draft' },
];

const fallbackRiskFlags = [
  { title: 'No guaranteed wealth claims', severity: 'high', status: 'open', mitigation: 'Use education-only framing and no guarantee wording.' },
  { title: 'No fabricated prices or fills', severity: 'high', status: 'open', mitigation: 'Require source receipts before simulated fills.' },
  { title: 'Avatar content must disclose AI generation', severity: 'medium', status: 'open', mitigation: 'Use clear AI-generated educational disclosures.' },
];

export async function loadAIOperatingLoopData() {
  const [labs, schedules, runs, receipts, simulations, topics, personas, mediaJobs, riskFlags] = await Promise.all([
    safeSelect('ai_labs', fallbackLabs),
    safeSelect('ai_schedules', fallbackSchedules),
    safeSelect('ai_runs', fallbackRuns),
    safeSelect('ai_source_receipts', []),
    safeSelect('ai_strategy_simulations', []),
    safeSelect('ai_interest_topics', fallbackTopics),
    safeSelect('ai_avatar_personas', fallbackPersonas),
    safeSelect('ai_media_jobs', []),
    safeSelect('ai_risk_flags', fallbackRiskFlags),
  ]);

  const mode = [labs, schedules, runs, topics, personas, riskFlags].some((result) => result.mode === 'live') ? 'live' : 'fallback';

  return {
    mode,
    labs: labs.data?.length ? labs.data : fallbackLabs,
    schedules: schedules.data?.length ? schedules.data : fallbackSchedules,
    runs: runs.data?.length ? runs.data : fallbackRuns,
    receipts: receipts.data || [],
    simulations: simulations.data || [],
    topics: topics.data?.length ? topics.data : fallbackTopics,
    personas: personas.data?.length ? personas.data : fallbackPersonas,
    mediaJobs: mediaJobs.data || [],
    riskFlags: riskFlags.data?.length ? riskFlags.data : fallbackRiskFlags,
    errors: [labs.error, schedules.error, runs.error, receipts.error, simulations.error, topics.error, personas.error, mediaJobs.error, riskFlags.error].filter(Boolean),
  };
}
