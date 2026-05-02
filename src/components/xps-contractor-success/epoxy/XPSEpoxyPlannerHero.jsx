import React from 'react';

const badges = ['Editable', 'Mobile Friendly', 'White-Label Ready', 'Floor Visualizer', 'XPS Certified Material Applicator', 'Built with XPS Brands', 'AI Planning Assistant'];

export default function XPSEpoxyPlannerHero() {
  return (
    <section className="bg-white border-t-[7px] border-[#B8860B] px-5 py-10 md:px-12 text-center shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full bg-[#050505] border-4 border-[#D6A21A] grid place-items-center shadow-xl">
            <span className="text-[#D6A21A] text-2xl font-black tracking-tight">XPS</span>
          </div>
        </div>
        <p className="uppercase tracking-[0.28em] text-[#B8860B] font-black text-sm">XPS Contractor Success</p>
        <h1 className="uppercase font-black tracking-tight text-5xl md:text-8xl text-[#050505] leading-none mt-2">
          XPS Epoxy Floor Planner
        </h1>
        <p className="text-[#B8860B] font-extrabold text-xl md:text-3xl mt-3 max-w-5xl mx-auto">
          Interactive Mobile Workbook + Floor Visualizer + AI Assistant for Garage, Commercial, Flake, Metallic, Quartz, and Solid Epoxy Floors
        </p>
        <div className="mx-auto mt-7 max-w-6xl grid grid-cols-2 md:grid-cols-7 rounded-xl border-2 border-[#999] overflow-hidden bg-white text-xs md:text-sm font-black uppercase">
          {badges.map((item) => (
            <div key={item} className="p-3 border-r border-b md:border-b-0 border-[#d8d8d8] last:border-r-0 flex items-center justify-center">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-6 mx-auto max-w-6xl bg-[#050505] text-[#D6A21A] uppercase font-black tracking-wide rounded-xl px-6 py-5 text-sm md:text-2xl shadow-xl">
          Send this to customers before your arrival so they can plan their epoxy floor in advance.
        </div>
      </div>
    </section>
  );
}
