import React from 'react';

const systems = [
  ['Solid Color Epoxy', 'Garages, shops, warehouses, clean commercial spaces', 'Seamless, durable, chemical-resistant', 'Can be slippery when wet without texture', 'Clean industrial look; decorative impact is lower than flake or metallic.', 'Confirm prep, primer, topcoat, and slip resistance requirements.'],
  ['Flake Epoxy', 'Garages, retail, service bays, utility spaces', 'Decorative, hides wear, strong traction options', 'Texture and topcoat choice affect cleanability', 'Great balance of professional look and durability.', 'Confirm broadcast rate, flake size, topcoat, and UV exposure.'],
  ['Metallic Epoxy', 'Showrooms, salons, lobbies, custom residential', 'High-end visual movement and unique appearance', 'Requires expectation setting; every floor is unique', 'Luxury decorative system, not a uniform solid finish.', 'Installer skill and sample communication matter.'],
  ['Quartz Epoxy', 'Commercial kitchens, locker rooms, labs, wet areas', 'Heavy-duty traction and impact resistance', 'Textured surface is not meant to look smooth', 'Best for performance-first environments.', 'Confirm chemical exposure, cleaning process, and topcoat profile.'],
  ['Polyaspartic / Topcoat Systems', 'Fast-return projects and protective topcoats', 'Fast cure, UV-stable options, durable protection', 'Timing, temperature, and working windows matter', 'Topcoat selection changes gloss, texture, and maintenance.', 'Verify pot life, recoat windows, and substrate conditions.'],
  ['Moisture Mitigation Pathway', 'Concrete slabs with moisture concern', 'Creates a safer planning path before coating', 'Requires proper testing and product selection', 'Moisture must be handled before coating expectations are set.', 'Do not skip moisture testing where conditions indicate risk.'],
  ['Surface Prep Pathway', 'All epoxy and coating projects', 'Drives adhesion and long-term performance', 'Bad prep can cause failure even with good materials', 'Prep quality is a major reason professional systems cost more.', 'Match surface profile to product TDS and job conditions.'],
];

export default function XPSEpoxySystemSelector({ onSelect }) {
  return (
    <section className="max-w-7xl mx-auto px-5 pb-12">
      <div className="bg-white rounded-2xl border-[3px] border-[#B8860B] p-6 md:p-8 shadow-xl">
        <h2 className="uppercase font-black text-4xl md:text-6xl text-[#050505]">Epoxy System Selector</h2>
        <p className="mt-2 text-[#B8860B] font-extrabold">Choose the system that matches performance, appearance, budget, and jobsite conditions.</p>
        <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {systems.map(([name, best, pros, watch, customer, contractor]) => (
            <article key={name} className="rounded-2xl border-2 border-[#d8d8d8] bg-[#f7f5ef] p-5">
              <h3 className="uppercase font-black text-2xl text-[#050505]">{name}</h3>
              <p className="mt-3 text-sm"><strong>Best uses:</strong> {best}</p>
              <p className="mt-2 text-sm"><strong>Pros:</strong> {pros}</p>
              <p className="mt-2 text-sm"><strong>Watch-outs:</strong> {watch}</p>
              <p className="mt-2 text-sm"><strong>Customer note:</strong> {customer}</p>
              <p className="mt-2 text-sm"><strong>Contractor note:</strong> {contractor}</p>
              <button onClick={() => onSelect?.(name)} className="mt-5 w-full rounded-full bg-[#050505] text-[#D6A21A] uppercase font-black py-3">Add to Planner</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
