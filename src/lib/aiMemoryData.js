import { safeSelect } from '@/lib/supabaseClient';

const fallbackSystemState = [
  {
    state_key: 'current_objective',
    state_title: 'Current AI Objective',
    state_value: 'Build AI in Action Labs as a controlled autonomous teaching platform with Supabase backend, Vercel dashboard, GitHub issue tracking, source receipts, paper-trading simulation, digital-business simulations, and avatar media workflow.',
    status: 'active',
  },
  {
    state_key: 'current_blocker',
    state_title: 'Current Blocker',
    state_value: 'Supabase migrations must be verified before dashboard can switch fully from fallback state to live Supabase data.',
    status: 'active',
  },
  {
    state_key: 'next_human_action',
    state_title: 'Next Human Action',
    state_value: 'Run or verify the GitHub Actions Supabase Database Migrations workflow, then confirm whether tables exist in Supabase.',
    status: 'active',
  },
  {
    state_key: 'next_ai_action',
    state_title: 'Next AI Action',
    state_value: 'Continue implementing controlled backend and dashboard layers through GitHub commits while tracking all work as issues.',
    status: 'active',
  },
];

const fallbackSnapshots = [
  {
    title: 'AI in Action system memory initialized',
    summary: 'Persistent memory is being added so the platform can show current objective, decisions, blockers, repo registry, and next actions.',
    current_objective: 'Build a controlled autonomous AI teaching platform for paper trading, business simulations, source receipts, and AI media.',
    current_blocker: 'Supabase migration verification is still required for live data mode.',
    next_human_action: 'Verify GitHub Actions migration workflow and Supabase tables.',
    next_ai_action: 'Build memory dashboard panel and source receipts route after migration verification.',
  },
];

const fallbackDecisions = [
  {
    decision_title: 'Use issues as writable project-board layer',
    decision_type: 'architecture',
    decision: 'Use GitHub issues and PRs as the writable task ledger, with the Project board as the visual command board.',
    rationale: 'This gives AI a reliable write path while preserving project-board visibility.',
    risk_level: 'low',
  },
  {
    decision_title: 'Reject wholesale imports of advanced stacks',
    decision_type: 'architecture',
    decision: 'Selectively extract only patterns that strengthen controlled AI in Action.',
    rationale: 'Avoids duplicate frameworks, unsafe autonomy, stale dependencies, and secret exposure.',
    risk_level: 'medium',
  },
];

const fallbackBlockers = [
  {
    blocker_title: 'Supabase migration verification pending',
    blocker_type: 'migration',
    description: 'The schema files exist in GitHub, but live Supabase table creation must be verified.',
    impact: 'Dashboard may show fallback data until migrations are applied.',
    required_human_action: 'Run GitHub Actions Supabase migration workflow and confirm table presence.',
    severity: 'high',
    status: 'open',
  },
  {
    blocker_title: 'Direct Project v2 write actions unavailable in current connector',
    blocker_type: 'tooling',
    description: 'The current GitHub connector can write issues and PRs but not edit project board settings or fields directly.',
    impact: 'AI uses issues as writable tracking layer while Project board visualizes them.',
    required_human_action: 'Use GitHub UI to auto-add issues or manually add items to Project 1.',
    severity: 'medium',
    status: 'open',
  },
];

const fallbackRepos = [
  {
    repo_full_name: 'XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory',
    classification: 'production-linked',
    purpose: 'Primary AI in Action Labs production app, docs, migrations, dashboard, and issue tracker.',
    ai_use_decision: 'USE NOW',
    production_linked: true,
  },
  {
    repo_full_name: 'XPS-IINTELLIGENCE-SYSTEMS/proofloops',
    classification: 'template-source',
    purpose: 'Template-rich app containing useful UI and workflow patterns.',
    ai_use_decision: 'REFERENCE ONLY / SELECTIVE EXTRACTION',
    production_linked: false,
  },
];

export async function loadAIMemoryData() {
  const [state, snapshots, decisions, blockers, repos] = await Promise.all([
    safeSelect('ai_system_state', fallbackSystemState),
    safeSelect('ai_memory_snapshots', fallbackSnapshots),
    safeSelect('ai_decision_log', fallbackDecisions),
    safeSelect('ai_blockers', fallbackBlockers),
    safeSelect('ai_repo_registry', fallbackRepos),
  ]);

  const liveResults = [state, snapshots, decisions, blockers, repos].filter((result) => result.mode === 'live');

  return {
    mode: liveResults.length > 0 ? 'live' : 'fallback',
    systemState: state.data?.length ? state.data : fallbackSystemState,
    snapshots: snapshots.data?.length ? snapshots.data : fallbackSnapshots,
    decisions: decisions.data?.length ? decisions.data : fallbackDecisions,
    blockers: blockers.data?.length ? blockers.data : fallbackBlockers,
    repos: repos.data?.length ? repos.data : fallbackRepos,
    errors: [state.error, snapshots.error, decisions.error, blockers.error, repos.error].filter(Boolean),
  };
}

export function stateValue(systemState, key, fallback = '') {
  return systemState.find((item) => item.state_key === key)?.state_value || fallback;
}
