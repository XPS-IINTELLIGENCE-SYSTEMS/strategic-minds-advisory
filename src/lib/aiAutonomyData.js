import { safeSelect } from '@/lib/supabaseClient';

const fallbackReceipts = [
  { title: 'Source Receipts Engine pending live Supabase', url: 'https://github.com/XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory', source_type: 'system', verification_status: 'fallback', robots_status: 'not_checked', rate_limit_status: 'not_checked', notes: 'Fallback only. No proof claim.' },
];

const fallbackAgents = [
  { name: 'Operator Agent', role: 'Coordinates tasks and blockers.', status: 'ready', risk_level: 'medium', capabilities: ['route work', 'log status'] },
  { name: 'Builder Agent', role: 'Creates code, docs, migrations, and components.', status: 'ready', risk_level: 'medium', capabilities: ['code', 'docs', 'migrations'] },
  { name: 'Risk Manager Agent', role: 'Flags unsafe claims and approval gates.', status: 'ready', risk_level: 'high', capabilities: ['risk flags', 'approval routing'] },
  { name: 'Source Receipts Agent', role: 'Records source metadata and proof notes.', status: 'ready', risk_level: 'high', capabilities: ['source receipts', 'url validation'] },
];

const fallbackTools = [
  { tool_name: 'Supabase', category: 'database/backend', use_case: 'Auth, Postgres, storage, logs, dashboard state.', integration_status: 'integrated', recommendation_status: 'primary' },
  { tool_name: 'Vercel', category: 'hosting/deployment', use_case: 'Frontend, routes, cron.', integration_status: 'integrated', recommendation_status: 'primary' },
  { tool_name: 'GitHub Actions', category: 'automation', use_case: 'Migrations, checks, failover scheduling.', integration_status: 'integrated', recommendation_status: 'primary' },
  { tool_name: 'HeyGen', category: 'ai-video/avatar', use_case: 'Avatar videos after review.', integration_status: 'planned', recommendation_status: 'candidate' },
];

const fallbackSignals = [
  { topic: 'Paper trading education', topic_family: 'wealth-building', confidence: 85, strategy_angle: 'Show no-fake-fill trading education.', safety_notes: 'No financial advice.' },
  { topic: 'AI automation agency', topic_family: 'digital-business', confidence: 82, strategy_angle: 'Simulate offer, outreach, fulfillment.', safety_notes: 'No income guarantees.' },
  { topic: 'Faceless/avatar YouTube', topic_family: 'media-business', confidence: 80, strategy_angle: 'Transparent script-to-avatar workflow.', safety_notes: 'Disclose AI-generated media.' },
];

const fallbackLifecycle = [
  { lab_slug: 'paper-trading-lab', lifecycle_state: 'validate', validation_status: 'pending_migration', blocker: 'Supabase migration verification required.', next_ai_action: 'Implement source receipts dashboard.', next_human_action: 'Run migration workflow.' },
  { lab_slug: 'digital-business-builder', lifecycle_state: 'design', validation_status: 'in_progress', blocker: null, next_ai_action: 'Build discovery/lifecycle panels.', next_human_action: 'Approve paid tools later.' },
];

const fallbackReviews = [
  { review_title: 'Verify Supabase migrations', item_type: 'database', risk_level: 'high', status: 'pending', reason: 'Dashboard live mode depends on migrated tables.', required_admin_action: 'Run migration workflow and confirm tables.' },
];

const fallbackNotifications = [
  { title: 'Supabase migration verification needed', message: 'Run the Supabase migration workflow and confirm tables exist.', severity: 'high', notification_type: 'blocker', channel: 'supabase_log', status: 'queued', requires_admin_action: true },
];

export async function loadAIAutonomyData() {
  const [receipts, agents, tools, signals, lifecycle, reviews, notifications] = await Promise.all([
    safeSelect('ai_source_receipts', fallbackReceipts),
    safeSelect('ai_agent_registry', fallbackAgents),
    safeSelect('ai_tool_registry', fallbackTools),
    safeSelect('ai_trend_signals', fallbackSignals),
    safeSelect('ai_lab_lifecycle', fallbackLifecycle),
    safeSelect('ai_admin_reviews', fallbackReviews),
    safeSelect('ai_notifications', fallbackNotifications),
  ]);

  const results = [receipts, agents, tools, signals, lifecycle, reviews, notifications];
  return {
    mode: results.some((r) => r.mode === 'live') ? 'live' : 'fallback',
    receipts: receipts.data?.length ? receipts.data : fallbackReceipts,
    agents: agents.data?.length ? agents.data : fallbackAgents,
    tools: tools.data?.length ? tools.data : fallbackTools,
    signals: signals.data?.length ? signals.data : fallbackSignals,
    lifecycle: lifecycle.data?.length ? lifecycle.data : fallbackLifecycle,
    reviews: reviews.data?.length ? reviews.data : fallbackReviews,
    notifications: notifications.data?.length ? notifications.data : fallbackNotifications,
    errors: results.map((r) => r.error).filter(Boolean),
  };
}
