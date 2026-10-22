import React from 'react';
import XPSPlannerLeadForm from '@/components/xps-contractor-success/XPSPlannerLeadForm';
import XPSPlannerBoardPreview from '@/components/xps-contractor-success/XPSPlannerBoardPreview';
import XPSEcosystemLinks from '@/components/xps-contractor-success/XPSEcosystemLinks';
import XPSQualificationDisclaimer from '@/components/xps-contractor-success/XPSQualificationDisclaimer';

const boards = [
  { type: 'planner', title: 'XPS Interactive Flooring Planner' },
  { type: 'selector', title: 'XPS Floor System Selector' },
  { type: 'colors', title: 'XPS Color Charts + Finish Selector' },
];

const customerWorkflow = [
  'Define room or space type',
  'Identify traffic level and durability needs',
  'Review floor system options',
  'Compare decorative and functional finishes',
  'Shortlist color and finish preferences',
  'Think through budget range and timeline',
  'Record questions before the appointment',
  'Prepare for proposal review and scheduling',
];

const starterPack = [
  'Interactive Flooring Planner PDF',
  'Editable white-label version',
  'Customer Floor Goals Worksheet',
  'Floor System Selector',
  'Color Charts + Finish Selector',
  'Contractor send-to-customer scripts',
  'Commercial, residential, and government guide concepts',
  'White-label customization instructions',
  'XPS ecosystem resource links',
];

export default function XPSContractorSuccessFlooringPlanner() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#222]">
      <section className="bg-white border-t-[6px] border-[#B8860B] px-5 py-10 md:px-14 text-center">
        <p className="uppercase tracking-[0.22em] text-[#B8860B] font-black text-sm">XPS Contractor Success</p>
        <h1 className="uppercase font-black tracking-tight text-5xl md:text-7xl text-[#050505] leading-none mt-2">
          XPS Interactive Flooring Planner
        </h1>
        <p className="text-[#B8860B] font-extrabold text-xl md:text-2xl mt-2">
          Designer Mobile Ebook + Workbook for Homeowners, Builders, and Facility Clients
        </p>
        <div className="mx-auto mt-6 max-w-5xl grid grid-cols-2 md:grid-cols-5 rounded-lg border-2 border-[#999] overflow-hidden bg-white text-sm font-bold">
          {['Editable', 'Mobile Friendly', 'White-Label Ready', 'XPS Certified Material Applicator', 'Built with XPS Brands'].map((item) => (
            <div key={item} className="p-3 border-r border-[#d8d8d8] last:border-r-0">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-5 mx-auto max-w-6xl bg-[#050505] text-[#D6A21A] uppercase font-black tracking-wide rounded-xl px-6 py-4">
          Send this to customers before your arrival so they can plan their floors in advance.
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-10 grid gap-8">
        {boards.map((board) => (
          <article key={board.title} aria-label={board.title}>
            <XPSPlannerBoardPreview type={board.type} />
          </article>
        ))}
      </section>

      <section className="max-w-7xl mx-auto px-5 pb-12 grid lg:grid-cols-[1fr_0.9fr] gap-8">
        <div className="bg-white rounded-2xl border-2 border-[#B8860B] p-8">
          <h2 className="uppercase font-black text-4xl text-[#050505]">Built for contractors. Designed for success.</h2>
          <p className="mt-4 text-[#555] leading-relaxed">
            This planner gives flooring contractors a mobile-friendly, white-label customer workbook they can send before the consultation. It helps customers compare sealed concrete, polished concrete, stained concrete, epoxy, flake, metallic, quartz, overlays, and color options before the contractor arrives.
          </p>
          <p className="mt-4 text-sm text-[#555] border-l-4 border-[#B8860B] pl-4">
            Approved contractors may qualify for contractor discounts, discounted training, lead opportunities, marketing support, product education, and additional XPS ecosystem resources. Availability is not guaranteed and may vary based on location, program status, account approval, product category, training completion, and business fit.
          </p>
          <div className="mt-8 grid md:grid-cols-2 gap-3">
            {customerWorkflow.map((item) => (
              <div key={item} className="rounded-xl border border-[#d8d8d8] bg-[#f7f5ef] p-3 text-sm font-semibold">✓ {item}</div>
            ))}
          </div>
        </div>
        <XPSPlannerLeadForm />
      </section>

      <section className="max-w-7xl mx-auto px-5 pb-12">
        <div className="bg-white rounded-2xl border-2 border-[#d8d8d8] p-8">
          <h2 className="uppercase font-black text-4xl text-[#050505]">Inside the Free Contractor Starter Pack</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-3">
            {starterPack.map((item) => (
              <div key={item} className="rounded-xl border border-[#d8d8d8] p-4 font-bold text-sm">{item}</div>
            ))}
          </div>
        </div>
      </section>

      <XPSEcosystemLinks />
      <XPSQualificationDisclaimer />
    </main>
  );
}
