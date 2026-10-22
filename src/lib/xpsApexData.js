import { safeSelect } from '@/lib/supabaseClient'

export const xpsTrackerUrl = 'https://docs.google.com/spreadsheets/d/1zd8RRHDkUey4g_ZhnCtL0wRmS10S_ui9CHOO1q8sn1Q/edit'

const fallbackContractors = [
  { id: 'pilot-1', company_name: 'Pilot Contractor 1', owner_name: 'Owner Name', tier: 'Approved', score: 77.5, jobs_rated: 3, avg_rating: 4.6, purchase_volume_ytd: 12500, callback_count: 0, training_complete: true },
  { id: 'elite-demo', company_name: 'Elite Demo Installer', owner_name: 'Owner Name', tier: 'Elite', score: 96.1, jobs_rated: 14, avg_rating: 4.95, purchase_volume_ytd: 78000, callback_count: 0, training_complete: true },
  { id: 'starter-demo', company_name: 'Starter Garage Coatings', owner_name: 'Owner Name', tier: 'Member', score: 61.4, jobs_rated: 2, avg_rating: 4.1, purchase_volume_ytd: 5800, callback_count: 1, training_complete: false },
]

const fallbackTasks = [
  { id: 'brand', area: 'Brand / Offer', task: 'Approve XPS APEX STANDARD name and story', owner: 'Chris / Jeremy', priority: 'High', status: 'Needs Review', due_date: '2026-05-01', stamp: 'Contractor Success' },
  { id: 'walkthrough', area: 'Walkthrough', task: 'Build customer signoff and internal rating form', owner: 'Ops / Dev', priority: 'High', status: 'In Progress', due_date: '2026-05-08', stamp: 'Contractor Success' },
  { id: 'scorecard', area: 'Scorecard', task: 'Build 100-point contractor score formula', owner: 'Home Office', priority: 'High', status: 'In Progress', due_date: '2026-05-10', stamp: 'AI Intelligence' },
  { id: 'tiers', area: 'Tiers', task: 'Tie status and pricing to measurable performance', owner: 'Leadership', priority: 'High', status: 'Not Started', due_date: '2026-05-14', stamp: 'The Holy Grail' },
  { id: 'reviews', area: 'Reviews', task: 'Separate survey gift from public review request', owner: 'Marketing', priority: 'Critical', status: 'Needs Review', due_date: '2026-05-10', stamp: 'Residential Secrets' },
]

const fallbackWalkthroughs = [
  { id: 'w1', customer_name: 'Demo Customer', contractor_company: 'Pilot Contractor 1', project_type: 'Residential', system_installed: 'Epoxy flake garage', overall_rating: 5, floor_accepted: true, care_guide_delivered: true, cleaning_package_explained: true, created_at: '2026-04-28' },
]

const fallbackSignoffs = [
  { id: 'chris', reviewer: 'Chris', role: 'Founder / Owner', decision: 'Pending', comments: '', requested_changes: '' },
  { id: 'jeremy', reviewer: 'Jeremy', role: 'System Architect', decision: 'Pending', comments: '', requested_changes: '' },
  { id: 'participant-2', reviewer: 'Participant 2', role: 'Ops / Sales', decision: 'Pending', comments: '', requested_changes: '' },
]

export function tierFromScore(score = 0) {
  if (score >= 95) return 'Elite'
  if (score >= 85) return 'Preferred'
  if (score >= 70) return 'Approved'
  if (score >= 50) return 'Member'
  return 'Starter'
}

export function calculateContractorScore(input = {}) {
  const score =
    ((input.avg_rating || 0) / 5 * 30) +
    ((input.communication || input.avg_rating || 0) / 5 * 15) +
    ((input.cleanliness || input.avg_rating || 0) / 5 * 15) +
    ((input.walkthrough_completion || 0) * 15) +
    ((input.care_guide_compliance || 0) * 10) +
    (input.training_complete ? 10 : 0) -
    Math.min((input.callback_count || 0) * 5, 20) +
    Math.min((input.purchase_volume_ytd || 0) / 50000 * 5, 5)
  return Math.max(0, Math.min(100, Number(score.toFixed(1))))
}

export async function loadXpsApexData() {
  const [contractors, tasks, walkthroughs, signoffs] = await Promise.all([
    safeSelect('xps_contractors', fallbackContractors),
    safeSelect('xps_implementation_tasks', fallbackTasks),
    safeSelect('xps_walkthroughs', fallbackWalkthroughs),
    safeSelect('xps_signoffs', fallbackSignoffs),
  ])

  const results = [contractors, tasks, walkthroughs, signoffs]
  return {
    mode: results.some((result) => result.mode === 'live') ? 'live' : 'fallback',
    contractors: contractors.data?.length ? contractors.data : fallbackContractors,
    tasks: tasks.data?.length ? tasks.data : fallbackTasks,
    walkthroughs: walkthroughs.data?.length ? walkthroughs.data : fallbackWalkthroughs,
    signoffs: signoffs.data?.length ? signoffs.data : fallbackSignoffs,
    errors: results.map((result) => result.error).filter(Boolean),
  }
}
