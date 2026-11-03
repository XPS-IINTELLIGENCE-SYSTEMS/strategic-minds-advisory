import React from 'react';

const links = [
  ['Xtreme Polishing Systems', 'https://xtremepolishingsystems.com', 'Materials, coating systems, tools, surface prep, and product resources.'],
  ['XPS Color Charts', 'https://xtremepolishingsystems.com/pages/color-charts', 'Verify color charts, samples, and available finish options before final selection.'],
  ['XPS Xpress', 'https://xpsxpress.com', 'Ordering support, product pathways, and contractor resource opportunities.'],
  ['Concrete Polishing University', 'https://concretepolishinguniversity.com', 'Training, education, and contractor skill-development resources.'],
];

export default function XPSEpoxyEcosystemLinks() {
  return (
    <section className="max-w-7xl mx-auto px-5 pb-12">
      <div className="rounded-2xl bg-[#050505] text-white border-[3px] border-[#B8860B] p-6 md:p-8 shadow-xl">
        <h2 className="uppercase font-black text-4xl md:text-6xl text-[#D6A21A]">XPS Ecosystem Links</h2>
        <p className="mt-2 text-white/75">Use the planner to connect customer selections to materials, samples, training, and support pathways.</p>
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          {links.map(([title, href, copy]) => (
            <a key={title} href={href} target="_blank" rel="noreferrer" className="rounded-2xl bg-white text-[#222] border-2 border-[#D6A21A] p-5 hover:-translate-y-1 transition">
              <h3 className="uppercase font-black text-xl text-[#050505]">{title}</h3>
              <p className="mt-2 text-sm text-[#555]">{copy}</p>
              <p className="mt-4 text-xs uppercase font-black text-[#B8860B]">Open resource →</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
