import React from 'react';

const screens = ['Start Planning', 'Floor Goals Worksheet', 'Epoxy System Selector', 'Floor Visualizer', 'Flake Color Selector', 'Metallic Color Selector', 'Quartz Color Selector', 'Surface Prep Checklist', 'Moisture Concern Intake', 'Ask the Epoxy AI Assistant'];

export default function XPSEpoxyPhoneBoard() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-10">
      <div className="bg-[#f7f5ef] border-[3px] border-[#B8860B] rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-white px-6 py-5 border-b border-[#d8d8d8]">
          <h2 className="uppercase font-black text-4xl md:text-6xl text-[#050505] leading-none">Mobile Epoxy Planning Workbook</h2>
          <p className="text-[#B8860B] font-extrabold text-lg md:text-2xl mt-1">Planner screens built for customers to review before the consultation.</p>
        </div>
        <div className="p-5 md:p-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {screens.map((screen, index) => (
              <div key={screen} className="relative bg-[#050505] rounded-[2rem] p-3 shadow-xl min-h-[260px]">
                <div className="absolute -top-3 -left-2 w-9 h-9 rounded-full bg-[#B8860B] text-white border-2 border-white flex items-center justify-center font-black">{index + 1}</div>
                <div className="bg-white rounded-2xl overflow-hidden h-full border border-[#222] flex flex-col">
                  <div className="bg-[#050505] text-white text-center text-[10px] uppercase tracking-wider py-2">XPS Epoxy Planner</div>
                  <div className="p-4 text-center flex-1">
                    <h3 className="uppercase font-black text-[#050505] text-base leading-tight min-h-[42px]">{screen}</h3>
                    <div className="mt-4 space-y-3 text-left">
                      <div className="h-3 rounded bg-[#d8d8d8]" />
                      <div className="h-3 rounded bg-[#d8d8d8] w-10/12" />
                      <div className="h-3 rounded bg-[#d8d8d8] w-8/12" />
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="h-9 rounded bg-[#D6A21A]" />
                        <div className="h-9 rounded bg-[#111]" />
                        <div className="h-9 rounded bg-[#f7f5ef] border border-[#999]" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#050505] text-[#D6A21A] text-[10px] uppercase tracking-wide flex justify-around py-2">
                    <span>Home</span><span>Plan</span><span>Save</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-7 bg-[#050505] rounded-xl text-[#D6A21A] uppercase font-black text-sm md:text-lg grid md:grid-cols-4 text-center overflow-hidden">
            {['Plan system', 'Visualize color', 'Ask AI', 'Send to contractor'].map((item) => <div key={item} className="p-4 border-r border-[#B8860B]/50 last:border-r-0">{item}</div>)}
          </div>
        </div>
      </div>
    </section>
  );
}
