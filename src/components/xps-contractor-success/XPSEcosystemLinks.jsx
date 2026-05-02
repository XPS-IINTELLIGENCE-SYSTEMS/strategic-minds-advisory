import React from 'react';

const links = [
  {
    title: 'Xtreme Polishing Systems',
    href: 'https://xtremepolishingsystems.com',
    copy: 'Professional concrete polishing, epoxy, coatings, surface preparation, tooling, and decorative concrete resources.',
  },
  {
    title: 'XPS Xpress',
    href: 'https://xpsxpress.com',
    copy: 'Product support, material pathways, ordering support, and contractor resource opportunities.',
  },
  {
    title: 'Concrete Polishing University',
    href: 'https://concretepolishinguniversity.com',
    copy: 'Training, education, and skill-development opportunities for technical and business execution.',
  },
  {
    title: 'XPS Color Charts',
    href: 'https://xtremepolishingsystems.com/pages/color-charts',
    copy: 'Color and finish resources for flake, metallic, quartz, stained concrete, and polished concrete discussions.',
  },
];

export default function XPSEcosystemLinks() {
  return (
    <section className="max-w-7xl mx-auto px-5 pb-12">
      <div className="bg-[#050505] text-white rounded-2xl border-2 border-[#B8860B] p-8">
        <p className="uppercase tracking-[0.22em] text-[#D6A21A] font-black text-sm">XPS ecosystem</p>
        <h2 className="uppercase font-black text-4xl md:text-5xl mt-2">More than materials. A contractor success system.</h2>
        <p className="mt-4 text-white/75 max-w-3xl leading-relaxed">
          XPS Contractor Success is designed to help contractors look more professional, educate customers, improve consultations, and connect into the larger XPS ecosystem.
        </p>
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          {links.map((link) => (
            <a
              key={link.title}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-white text-[#222] border-2 border-[#D6A21A] p-5 hover:-translate-y-0.5 transition"
            >
              <h3 className="uppercase font-black text-lg text-[#050505]">{link.title}</h3>
              <p className="mt-2 text-sm text-[#555] leading-relaxed">{link.copy}</p>
              <p className="mt-4 text-xs uppercase tracking-wide text-[#B8860B] font-black">Visit resource →</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
