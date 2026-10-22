import { insertRows } from '../_lib/supabaseAdmin.js';
import { asString } from '../_lib/validators.js';

function methodNotAllowed(res) { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok:false, error:'Method not allowed.' }); }
function clean(value) { return asString(value).trim().slice(0, 1000); }

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const row = {
      scene_type: clean(body.scene_type),
      floor_system: clean(body.floor_system),
      palette: clean(body.selected_palette || body.palette),
      color_name: clean(body.selected_color_name || body.color_name),
      color_code: clean(body.selected_color_code || body.color_code),
      texture_type: clean(body.selected_texture_type || body.texture_type),
      sheen: clean(body.selected_sheen || body.sheen),
      notes: clean(body.notes),
      metadata: { source: 'visualizer_mvp' },
    };
    if (!row.scene_type || !row.floor_system || !row.color_name) return res.status(400).json({ ok:false, error:'Scene, floor system, and color are required.' });
    const insert = await insertRows('xps_epoxy_visualizer_selections', row);
    if (insert.error) return res.status(200).json({ ok:false, mode:'supabase-write-unavailable', error: insert.error });
    return res.status(200).json({ ok:true, saved:true, mode: insert.mode, id: insert.data?.[0]?.id || null });
  } catch (error) {
    return res.status(500).json({ ok:false, error: error.message || 'Unexpected server error.' });
  }
}
