import React from 'react';

const boardContent = {
  planner: {
    title: 'XPS INTERACTIVE FLOORING PLANNER',
    subtitle: 'Designer Mobile Ebook + Workbook for Homeowners, Builders, and Facility Clients',
    ribbon: 'SEND THIS TO CUSTOMERS BEFORE YOUR ARRIVAL SO THEY CAN PLAN THEIR FLOORS IN ADVANCE.',
    phones: ['The Ultimate Flooring Planner', 'Why This Guide Matters', 'About Your Contractor', 'Floor Goals Worksheet', 'Step-by-Step Planner', 'Floor Options Overview', 'Tips & Tricks', 'Next Steps'],
  },
  selector: {
    title: 'XPS FLOOR SYSTEM SELECTOR',
    subtitle: 'Interactive Mobile Workbook Pages That Help Customers Compare Flooring Options Before the Consultation.',
    ribbon: 'Powered by XPS Contractor Success • XPS Certified Material Applicator • Built with XPS Brands',
    phones: ['Sealed Concrete', 'Polished Concrete', 'Stained Concrete', 'Solid Color Epoxy', 'Flake Epoxy', 'Metallic Epoxy', 'Quartz Epoxy', 'Specialty Solutions'],
  },
  colors: {
    title: 'XPS COLOR CHARTS + FINISH SELECTOR',
    subtitle: 'Mobile-Friendly Swatch Pages for Customers to Explore Colors Before the Contractor Arrives.',
    ribbon: 'USE THESE PAGES TO SHORTLIST YOUR FAVORITE COLORS AND FINISHES. THEN REVIEW THEM WITH YOUR CONTRACTOR.',
    phones: ['Flake Color Chart', 'Metallic Color Chart', 'Quartz Color Chart', 'Stained Concrete Color Chart', 'Polished Concrete Finish + Color Options'],
  },
};

const swatches = ['#d8d8d8', '#555', '#B8860B', '#D6A21A', '#111', '#f7f5ef'];

export default function XPSPlannerBoardPreview({ type = 'planner' }) {
  const board = boardContent[type] || boardContent.planner;
  return (
    <div className="bg-[#f7f5ef] border-[3px] border-[#B8860B] rounded-xl overflow-hidden shadow-2xl">
      <div className="bg-white px-5 py-5 md:px-8 flex flex-col md:flex-row md:items-center gap-4 border-b border-[#d8d8d8]">
        <div className="w-20 h-20 rounded-full bg-[#050505] border-4 border-[#D6A21A] flex items-center justify-center shrink-0">
          <span className="text-[#D6A21A] text-xl font-black">XPS</span>
        </div>
        <div>
          <h3 className="uppercase font-black tracking-tight text-4xl md:text-6xl text-[#050505] leading-none">{board.title}</h3>
          <p className="text-[#B8860B] font-extrabold text-lg md:text-2xl mt-1">{board.subtitle}</p>
        </div>
      </div>

      <div className="px-5 md:px-8 py-5">
        <div className="rounded-xl bg-[#050505] text-[#D6A21A] text-center uppercase font-black tracking-wide px-4 py-4 mb-6">
          {board.ribbon}
        </div>

        <div className={type === 'colors' ? 'grid md:grid-cols-5 gap-4' : 'grid md:grid-cols-4 gap-4'}>
          {board.phones.map((phone, index) => (
            <div key={phone} className="relative bg-[#050505] rounded-[2rem] p-3 shadow-xl min-h-[250px]">
              <div className="absolute -top-3 -left-2 w-9 h-9 rounded-full bg-[#B8860B] text-white border-2 border-white flex items-center justify-center font-black">{index + 1}</div>
              <div className="bg-white rounded-2xl overflow-hidden h-full border border-[#222]">
                <div className="bg-[#050505] text-white text-center text-[10px] uppercase tracking-wider py-2">XPS Interactive</div>
                <div className="p-4 text-center">
                  <h4 className="uppercase font-black text-[#050505] text-base leading-tight min-h-[42px]">{phone}</h4>
                  {type === 'colors' ? <SwatchGrid /> : <PhoneLines />}
                </div>
                <div className="mt-auto bg-[#050505] text-[#D6A21A] text-[10px] uppercase tracking-wide flex justify-around py-2">
                  <span>Home</span><span>Notes</span><span>Save</span><span>Tips</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-[#050505] rounded-xl text-[#D6A21A] uppercase font-black text-sm md:text-lg grid md:grid-cols-4 gap-1 text-center overflow-hidden">
          {['Swap in your logo', 'Add your company name', 'Send by text or email', 'Use before consultation'].map((item) => (
            <div key={item} className="p-4 border-r border-[#B8860B]/50 last:border-r-0">{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhoneLines() {
  return (
    <div className="mt-4 space-y-3 text-left">
      {[1, 2, 3, 4].map((line) => <div key={line} className="h-3 rounded bg-[#d8d8d8]" />)}
      <div className="h-8 rounded-full bg-[#D6A21A] mt-5" />
    </div>
  );
}

function SwatchGrid() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      {swatches.map((color) => <div key={color} className="h-10 rounded border border-[#999]" style={{ backgroundColor: color }} />)}
      <div className="col-span-2 h-10 rounded border border-dashed border-[#B8860B] bg-[#f7f5ef]" />
    </div>
  );
}
