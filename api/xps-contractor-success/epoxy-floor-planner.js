import { insertRows } from '../_lib/supabaseAdmin.js';
import { asString } from '../_lib/validators.js';

function methodNotAllowed(res) { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok:false, error:'Method not allowed.' }); }
function clean(value) { return asString(value).trim().slice(0, 5000); }

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const visualizer = body.visualizer || {};
    const row = {
      customer_name: clean(body.customer_name),
      contractor_company: clean(body.contractor_company || body.company_name),
      email: clean(body.email).toLowerCase(),
      phone: clean(body.phone),
      project_address: clean(body.project_address),
      state: clean(body.state),
      space_type: clean(body.space_type),
      square_footage: clean(body.square_footage),
      current_floor_condition: clean(body.current_floor_condition),
      traffic_level: clean(body.traffic_level),
      exposure_notes: clean(body.exposure_notes),
      design_preference: clean(body.design_preference),
      budget_range: clean(body.budget_range),
      timeline: clean(body.timeline),
      concerns: clean(body.concerns),
      favorite_system: clean(body.favorite_system),
      favorite_colors: clean(body.favorite_colors),
      questions: clean(body.questions),
      visualizer_scene_type: clean(visualizer.scene_type),
      visualizer_floor_system: clean(visualizer.floor_system),
      visualizer_palette: clean(visualizer.selected_palette),
      visualizer_color_name: clean(visualizer.selected_color_name),
      visualizer_color_code: clean(visualizer.selected_color_code),
      visualizer_texture_type: clean(visualizer.selected_texture_type),
      visualizer_sheen: clean(visualizer.selected_sheen),
      visualizer_notes: clean(visualizer.notes),
      metadata: { source: 'xps_epoxy_floor_planner' },
    };
    const insert = await insertRows('xps_epoxy_floor_planner_submissions', row);
    if (insert.error) return res.status(200).json({ ok:false, mode:'supabase-write-unavailable', error: insert.error });
    return res.status(200).json({ ok:true, saved:true, mode: insert.mode, id: insert.data?.[0]?.id || null });
  } catch (error) {
    return res.status(500).json({ ok:false, error: error.message || 'Unexpected server error.' });
  }
}
