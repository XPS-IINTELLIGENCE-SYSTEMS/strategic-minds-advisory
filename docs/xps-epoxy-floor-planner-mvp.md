# XPS Epoxy Floor Planner MVP

## Route

`/xps-epoxy-floor-planner`

## Product purpose

The XPS Epoxy Floor Planner is a mobile-friendly customer workbook, floor visualizer, and embedded Epoxy AI Assistant for epoxy contractors and customers. It supports garage, commercial, flake, metallic, quartz, solid epoxy, polyaspartic/topcoat, surface prep, moisture concern intake, maintenance education, and XPS ecosystem routing.

## Floor visualizer research summary

Torginol publicly promotes a Floor Design Visualizer and Build-A-Blend flow for visualizing and customizing custom blends. Their design tool page describes Build-A-Blend and a Floor Design Visualizer. Torginol resources also describe uploading an environment to visualize Torginol blends or design new ones. Torginol's development blog says their newer visualizer incorporated 3D environments, new materials, environmental shading, and floor mapping AI technology. FloorWIZ's Torginol case study describes real-time custom blend controls, 3D scene exploration, photo upload, and AI-based room overlay.

Reference URLs:

- https://torginol.com/resources/design-tool-2
- https://torginol.com/resources
- https://torginol.com/resources/blog/meet-pikcells-the-developers-of-the-torginol-floor-visualizer-tool
- https://floor-wiz.com/case-studies/torginol-floor-visualizer
- https://floor-wiz.com/

The XPS implementation uses those as competitive references only. It does not copy Torginol branding, proprietary UI, code, images, or assets. Phase 1 uses CSS-generated room/floor previews, swatches, and selections rather than full 3D or AI floor mapping.

## Files created

Frontend:

- `src/pages/XPSEpoxyFloorPlanner.jsx`
- `src/components/xps-contractor-success/epoxy/XPSEpoxyPlannerHero.jsx`
- `src/components/xps-contractor-success/epoxy/XPSEpoxyPhoneBoard.jsx`
- `src/components/xps-contractor-success/epoxy/XPSEpoxyFloorVisualizer.jsx`
- `src/components/xps-contractor-success/epoxy/XPSEpoxySystemSelector.jsx`
- `src/components/xps-contractor-success/epoxy/XPSEpoxyColorSelector.jsx`
- `src/components/xps-contractor-success/epoxy/XPSEpoxyCustomerWorksheet.jsx`
- `src/components/xps-contractor-success/epoxy/XPSEpoxyTroubleshootingIntake.jsx`
- `src/components/xps-contractor-success/epoxy/XPSEpoxyAssistantChat.jsx`
- `src/components/xps-contractor-success/epoxy/XPSEpoxySuggestedPrompts.jsx`
- `src/components/xps-contractor-success/epoxy/XPSEpoxyLeadCapture.jsx`
- `src/components/xps-contractor-success/epoxy/XPSEpoxySafetyNotice.jsx`
- `src/components/xps-contractor-success/epoxy/XPSEpoxyEcosystemLinks.jsx`
- `src/components/xps-contractor-success/epoxy/XPSEpoxyVisualQA.jsx`

Backend:

- `api/xps-contractor-success/epoxy-floor-planner.js`
- `api/xps-contractor-success/epoxy-assistant.js`
- `api/xps-contractor-success/epoxy-leads.js`
- `api/xps-contractor-success/epoxy-visualizer.js`

Supabase:

- `src/supabase/migrations/006_xps_epoxy_floor_planner.sql`

Bridge:

- `.ai-ops/commands/xps-epoxy-floor-planner-launch.json`
- `.ai-ops/reports/xps-epoxy-floor-planner-validation.md`

## API contract

### `POST /api/xps-contractor-success/epoxy-floor-planner`

Accepts worksheet and visualizer selections. Inserts into `xps_epoxy_floor_planner_submissions` if Supabase is configured. Returns graceful fallback if not configured.

### `POST /api/xps-contractor-success/epoxy-visualizer`

Accepts standalone visualizer selections. Inserts into `xps_epoxy_visualizer_selections` if Supabase is configured.

### `POST /api/xps-contractor-success/epoxy-assistant`

Accepts message, mode, session_id, planner_context, and troubleshooting_context. Applies XPS safety rules, classifies risk, detects lead signals, calls configured provider if available, and returns deterministic fallback if no model provider is configured.

### `POST /api/xps-contractor-success/epoxy-leads`

Accepts contractor lead capture fields. Requires consent. Scores lead priority and inserts into `xps_epoxy_leads` if Supabase is configured.

## Supabase schema

Creates:

- `public.xps_epoxy_floor_planner_submissions`
- `public.xps_epoxy_ai_sessions`
- `public.xps_epoxy_ai_messages`
- `public.xps_epoxy_leads`
- `public.xps_epoxy_ai_feedback`
- `public.xps_epoxy_visualizer_selections`

RLS is enabled on all tables. Public browser access is not granted. Writes are through Vercel server-side API routes using the service role key.

## Safe assistant rules

The assistant is not a replacement for Xtreme Polishing Systems technical support, product technical data sheets, safety data sheets, manufacturer instructions, local codes, jobsite testing, or professional onsite judgment.

High-risk subjects include coating failure, moisture, contamination, chemical exposure, structural cracks, safety, warranty, cure failure, and delamination. High-risk answers must ask clarifying questions, recommend current TDS/SDS, recommend XPS technical support or onsite inspection, and avoid final jobsite-specific instructions.

## Launch copy

I’m building the XPS Epoxy Floor Planner with a Floor Visualizer and Epoxy AI Assistant.

It helps contractors send customers a mobile-friendly planning tool before the consultation, lets customers preview epoxy systems and colors, captures worksheet details, and gives contractors a safer way to structure sales, prep, maintenance, and troubleshooting conversations.

It is not a replacement for XPS technical support or product documents, but it gives contractors a faster way to guide customers toward the right next step.

Want to test it?

## QA checklist

- Route loads at `/xps-epoxy-floor-planner`.
- Hero renders in black/white/gold XPS style.
- Phone mockup board renders.
- Visualizer renders.
- Visualizer scene/system/color changes update preview.
- Save to planner updates worksheet context.
- Worksheet submits to API.
- Suggested prompt triggers assistant call.
- Assistant returns provider answer or deterministic fallback.
- Lead capture requires consent.
- Ecosystem links open in new tabs.
- Safe language appears on page.
- No service-role key appears in frontend files.
- Supabase migration applies cleanly.
- Vercel preview route loads directly.

## Deployment checklist

- `npm install`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Apply Supabase migration only after approval.
- Confirm Vercel env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and optional model provider keys.
- Verify preview route.
- Submit planner, visualizer, assistant, and lead test requests.

## Known risks

- CSS visualizer is Phase 1 only. It does not include proprietary 3D visualization, AI floor mapping, or user photo masking.
- Model provider calls depend on env vars.
- Supabase writes depend on service role env vars and migration application.
- Official certification language requires approval before public claims.

## Rollback plan

Remove the import and route from `src/App.jsx`. The added page/components/APIs/migration/docs can remain unused until corrected.
