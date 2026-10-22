import React from 'react';

const groups = {
  'Flake options': ['Domino', 'Wombat', 'Nightfall', 'Spangle', 'Briar', 'Montana'],
  'Metallic options': ['Luster Blue', 'Peach Pink', 'Silver Black', 'Black Pearl', 'Ruby', 'Gold'],
  'Quartz options': ['Limestone', 'Flint', 'Cobblestone', 'Mojave', 'Sandstone', 'Evening', 'Blue Moon'],
  'Solid color options': ['Charcoal', 'Light Gray', 'Tan', 'Safety Red', 'White', 'Black'],
};

const colorMap = {
  Domino: '#d8d8d8', Wombat: '#8d8479', Nightfall: '#111111', Spangle: '#c9b37e', Briar: '#7a6047', Montana: '#6c7f91',
  'Luster Blue': '#1e5a9f', 'Peach Pink': '#d9908e', 'Silver Black': '#4d4d4d', 'Black Pearl': '#111111', Ruby: '#9b111e', Gold: '#D6A21A',
  Limestone: '#d6d0bf', Flint: '#5b5b5b', Cobblestone: '#8f8578', Mojave: '#c8a46b', Sandstone: '#d3b277', Evening: '#2e3440', 'Blue Moon': '#607a92',
  Charcoal: '#2b2b2b', 'Light Gray': '#c8c8c8', Tan: '#b99b6b', 'Safety Red': '#a72620', White: '#f7f5ef', Black: '#050505',
};

export default function XPSEpoxyColorSelector({ onSelect }) {
  return (
    <section className="max-w-7xl mx-auto px-5 pb-12">
      <div className="rounded-2xl bg-[#050505] text-white border-[3px] border-[#B8860B] p-6 md:p-8 shadow-xl">
        <h2 className="uppercase font-black text-4xl md:text-6xl text-[#D6A21A]">Color + Finish Selector</h2>
        <p className="mt-2 text-white/75">Sample planning palettes — verify availability with XPS resources. Always verify current color availability and samples with XPS resources.</p>
        <div className="mt-6 grid md:grid-cols-2 gap-5">
          {Object.entries(groups).map(([title, colors]) => (
            <article key={title} className="rounded-2xl bg-white text-[#222] p-5 border-2 border-[#D6A21A]">
              <h3 className="uppercase font-black text-2xl text-[#050505]">{title}</h3>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {colors.map((name) => (
                  <button key={name} onClick={() => onSelect?.(name)} className="rounded-xl border border-[#d8d8d8] p-3 text-left hover:border-[#B8860B]">
                    <div className="h-11 rounded-lg border border-[#999]" style={{ backgroundColor: colorMap[name] }} />
                    <p className="mt-2 text-xs font-black">{name}</p>
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-6 rounded-xl bg-white text-[#222] border-2 border-[#D6A21A] p-5">
          <h3 className="uppercase font-black text-xl">Sheen options</h3>
          <div className="mt-3 flex flex-wrap gap-3">{['Gloss', 'Satin', 'Matte'].map((sheen) => <span key={sheen} className="rounded-full bg-[#f7f5ef] border border-[#d8d8d8] px-4 py-2 font-black text-sm">{sheen}</span>)}</div>
        </div>
      </div>
    </section>
  );
}
