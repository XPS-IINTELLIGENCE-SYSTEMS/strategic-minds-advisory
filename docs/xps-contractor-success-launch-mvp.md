# XPS Contractor Success Interactive Flooring Planner MVP

## Product positioning

The XPS Contractor Success Interactive Flooring Planner is a mobile-friendly, editable, white-label customer workbook that flooring contractors can send before a consultation.

It helps customers compare flooring systems, review color options, clarify goals, understand maintenance, and arrive prepared for a more productive appointment.

## Landing page route

`/xps-contractor-success-flooring-planner`

## XPS ecosystem links

- Xtreme Polishing Systems: https://xtremepolishingsystems.com
- XPS Xpress: https://xpsxpress.com
- Concrete Polishing University: https://concretepolishinguniversity.com
- XPS color charts: https://xtremepolishingsystems.com/pages/color-charts

## Safe claims language

Approved contractors may qualify for contractor discounts, discounted training, lead opportunities, marketing support, product education, and additional XPS ecosystem resources. Availability is not guaranteed and may vary based on location, program status, account approval, product category, training completion, and business fit.

The XPS Contractor Success Interactive Flooring Planner is a contractor support and customer education resource. XPS Certified Material Applicator language, contractor discounts, discounted training, lead opportunities, and additional ecosystem benefits are subject to review, approval, eligibility, availability, and program terms. This planner does not promise leads, sales, certification, discounts, account approval, or project outcomes.

## Manual launch workflow

1. Publish the landing page to a Vercel preview deployment.
2. Test the route directly.
3. Submit a test lead.
4. Confirm the lead row appears in Supabase.
5. Upload starter-pack files to Google Drive.
6. Send the landing page link to 30 contractors in DMs, forums, and XPS conversations.
7. Track replies and lead quality.
8. Follow up with contractors who request branded versions.

## Google Drive folder structure

```text
XPS Contractor Success Planner Launch
├── 01 Starter Pack - Send to Contractors
├── 02 Editable Source Files
├── 03 Social + DM Images
├── 04 Landing Page Assets
├── 05 Email Scripts
├── 06 Lead Tracker
├── 07 Branded Contractor Versions
└── 08 Archive
```

## Starter pack checklist

```text
01_READ_ME_START_HERE.pdf
02_XPS_Interactive_Flooring_Planner.pdf
03_XPS_Interactive_Flooring_Planner_EDITABLE.docx
04_XPS_Floor_System_Selector.pdf
05_XPS_Color_Charts_Finish_Selector.pdf
06_XPS_Commercial_Floor_Guide.pdf
07_XPS_Residential_Floor_Guide.pdf
08_XPS_Government_Floor_Guide.pdf
09_Contractor_Send_To_Customer_Scripts.docx
10_White_Label_Customization_Instructions.pdf
11_XPS_Ecosystem_Resource_Links.pdf
```

## Lead tracker fields

- Lead ID
- Date submitted
- First name
- Last name
- Company
- Phone
- Email
- Website or social
- City
- State
- Service area
- Years in business
- Primary work type
- Systems offered
- Currently buys from XPS
- Interested in discounts
- Interested in training
- Interested in lead opportunities
- Wants branded planner
- Biggest challenge
- Lead source
- Lead status
- Priority score
- Priority label
- Last contacted
- Next follow-up date
- Notes

## DM/forum outreach script

I built a mobile-friendly flooring planner contractors can send to customers before appointments.

It helps customers compare polished concrete, epoxy, flake, metallic, quartz, stained concrete, sealed concrete, overlays, and color options before the consultation.

It is editable and white-label friendly, so contractors can add their company name, logo, phone, website, and service area.

It also connects into XPS resources like Xtreme Polishing Systems, XPS Xpress, and Concrete Polishing University.

Approved contractors may qualify for discounts, discounted training, lead opportunities, and more.

Want me to send you the starter pack?

## Customer send-to-customer script

Before our appointment, here is a quick flooring planner you can review.

It will help you think through your floor goals, design style, traffic level, budget range, color preferences, and questions before we arrive.

You do not need to know everything yet. This just helps us make the consultation more productive.

[INSERT PLANNER LINK]

## Download email

Subject: Your XPS Contractor Success Flooring Planner Starter Pack

Your XPS Contractor Success Interactive Flooring Planner Starter Pack is ready.

This is a mobile-friendly, editable, white-label customer workbook built for flooring contractors. You can send it to customers before a consultation so they can review flooring systems, think through design goals, compare color and finish options, understand maintenance expectations, and arrive more prepared.

Download the starter pack here:

[INSERT DOWNLOAD LINK]

Helpful links:

- https://xtremepolishingsystems.com
- https://xpsxpress.com
- https://concretepolishinguniversity.com
- https://xtremepolishingsystems.com/pages/color-charts

If you want a branded version, reply with company name, logo, phone, email, website, service area, and the flooring systems you want featured most.

## QA checklist

- Route loads at `/xps-contractor-success-flooring-planner`.
- Hero section renders.
- Three visual match boards render.
- External links open in new tab.
- Form validates required fields.
- Consent is required.
- API route rejects non-POST methods.
- API route writes to Supabase when configured.
- Supabase migration applies cleanly.
- No service role key appears in frontend code.
- Safe claims language appears on page.
- Vercel preview route loads directly.

## Deployment checklist

- `npm install`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Apply Supabase migration.
- Confirm Vercel environment variables:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Submit test lead on Vercel preview.
- Confirm Supabase row.
- Send page to first contractor test group.

## Rollback plan

If the route causes any issue, remove the route import and route entry from `src/App.jsx`. The API route and migration can remain unused until corrected.
