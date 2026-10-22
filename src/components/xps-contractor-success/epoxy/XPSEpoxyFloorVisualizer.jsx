import React, { useMemo, useState } from 'react';

const scenes = ['Garage', 'Retail / Showroom', 'Warehouse', 'Restaurant / Lobby', 'Patio / Outdoor'];
const systems = ['Flake Epoxy', 'Metallic Epoxy', 'Quartz Epoxy', 'Solid Color Epoxy', 'Polyaspartic Topcoat'];
const palettes = {
  'Flake Epoxy': [
    ['Domino', '#d8d8d8', 'flake'], ['Wombat', '#8d8479', 'flake'], ['Nightfall', '#111111', 'flake'], ['Spangle', '#c9b37e', 'flake'], ['Briar', '#7a6047', 'flake'], ['Montana', '#6c7f91', 'flake'],
  ],
  'Metallic Epoxy': [
    ['Luster Blue', '#1e5a9f', 'metallic'], ['Peach Pink', '#d9908e', 'metallic'], ['Silver Black', '#4d4d4d', 'metallic'], ['Black Pearl', '#111111', 'metallic'], ['Ruby', '#9b111e', 'metallic'], ['Gold', '#D6A21A', 'metallic'],
  ],
  'Quartz Epoxy': [
    ['Limestone', '#d6d0bf', 'quartz'], ['Flint', '#5b5b5b', 'quartz'], ['Cobblestone', '#8f8578', 'quartz'], ['Mojave', '#c8a46b', 'quartz'], ['Sandstone', '#d3b277', 'quartz'], ['Evening', '#2e3440', 'quartz'], ['Blue Moon', '#607a92', 'quartz'],
  ],
  'Solid Color Epoxy': [
    ['Charcoal', '#2b2b2b', 'solid'], ['Light Gray', '#c8c8c8', 'solid'], ['Tan', '#b99b6b', 'solid'], ['Safety Red', '#a72620', 'solid'], ['White', '#f7f5ef', 'solid'], ['Black', '#050505', 'solid'],
  ],
  'Polyaspartic Topcoat': [
    ['Gloss Clear', '#eeeeee', 'topcoat'], ['Satin Clear', '#d8d8d8', 'topcoat'], ['Matte Clear', '#cfcfcf', 'topcoat'], ['Warm Clear', '#f0d9a0', 'topcoat'], ['Cool Clear', '#dce8f2', 'topcoat'], ['High Wear', '#bdbdbd', 'topcoat'],
  ],
};

export default function XPSEpoxyFloorVisualizer({ onSave }) {
  const [scene, setScene] = useState('Garage');
  const [system, setSystem] = useState('Flake Epoxy');
  const [swatch, setSwatch] = useState(palettes['Flake Epoxy'][0]);
  const [sheen, setSheen] = useState('Gloss');
  const [notes, setNotes] = useState('');
  const selection = useMemo(() => ({
    scene_type: scene,
    floor_system: system,
    selected_palette: system,
    selected_color_name: swatch[0],
    selected_color_code: swatch[1],
    selected_texture_type: swatch[2],
    selected_sheen: sheen,
    notes,
  }), [scene, system, swatch, sheen, notes]);

  const floorStyle = textureStyle(swatch[1], swatch[2]);
  const handleSystem = (value) => { setSystem(value); setSwatch(palettes[value][0]); };
  const save = async () => {
    onSave?.(selection);
    try {
      await fetch('/api/xps-contractor-success/epoxy-visualizer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(selection),
      });
    } catch (_) {}
  };

  return (
    <section className="max-w-7xl mx-auto px-5 pb-12">
      <div className="rounded-2xl border-[3px] border-[#B8860B] bg-white overflow-hidden shadow-2xl">
        <div className="bg-[#050505] text-white px-6 py-5 border-b-4 border-[#D6A21A]">
          <h2 className="uppercase font-black text-4xl md:text-6xl leading-none text-[#D6A21A]">XPS Floor Visualizer</h2>
          <p className="mt-2 text-white/80 font-semibold">Preview floor systems, colors, and finishes before the consultation.</p>
        </div>
        <div className="p-6 grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
          <div className="space-y-6">
            <Control title="Choose Room Scene" items={scenes} value={scene} onChange={setScene} />
            <Control title="Choose Epoxy System" items={systems} value={system} onChange={handleSystem} />
            <div>
              <h3 className="uppercase font-black text-[#050505] mb-3">Sample Planning Palettes — Verify Availability With XPS</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {palettes[system].map((item) => (
                  <button key={item[0]} onClick={() => setSwatch(item)} className={`rounded-xl border-2 p-3 text-left ${swatch[0] === item[0] ? 'border-[#B8860B] bg-[#f7f5ef]' : 'border-[#d8d8d8] bg-white'}`}>
                    <div className="h-12 rounded-lg border border-[#999]" style={textureStyle(item[1], item[2])} />
                    <p className="mt-2 text-sm font-black">{item[0]}</p>
                  </button>
                ))}
              </div>
            </div>
            <Control title="Sheen" items={['Gloss', 'Satin', 'Matte']} value={sheen} onChange={setSheen} />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-xl border border-[#d8d8d8] p-3 text-sm" rows={3} placeholder="Visualizer notes for contractor..." />
          </div>
          <div className="rounded-2xl border-2 border-[#050505] bg-[#f7f5ef] p-5">
            <div className="rounded-xl bg-[#111] text-white p-4 flex justify-between gap-4 flex-wrap">
              <div><p className="text-xs uppercase text-[#D6A21A] font-black">Scene</p><p className="font-bold">{scene}</p></div>
              <div><p className="text-xs uppercase text-[#D6A21A] font-black">System</p><p className="font-bold">{system}</p></div>
              <div><p className="text-xs uppercase text-[#D6A21A] font-black">Color</p><p className="font-bold">{swatch[0]}</p></div>
            </div>
            <div className="relative mt-5 h-[360px] rounded-2xl overflow-hidden border-2 border-[#999] bg-gradient-to-b from-[#e9e4d7] via-[#d7d0c0] to-[#b9b0a0]">
              <div className="absolute inset-x-8 top-12 h-20 bg-white/70 rounded-t-xl border border-white/80" />
              <div className="absolute inset-x-16 top-28 h-24 bg-[#222]/10 rounded" />
              <div className="absolute left-0 right-0 bottom-0 h-[48%]" style={floorStyle} />
              <div className="absolute left-0 right-0 bottom-[48%] h-16 bg-gradient-to-b from-black/0 to-black/20" />
              <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-white/90 border border-[#D6A21A] p-4">
                <p className="uppercase font-black text-[#050505]">{system} • {swatch[0]} • {sheen}</p>
                <p className="text-xs text-[#555]">Digital preview only. Verify current samples and availability with XPS resources.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button onClick={save} className="flex-1 rounded-full bg-[#050505] text-[#D6A21A] uppercase font-black py-4">Save to Planner</button>
              <a href="https://xtremepolishingsystems.com/pages/color-charts" target="_blank" rel="noreferrer" className="flex-1 rounded-full border-2 border-[#B8860B] text-[#050505] uppercase font-black py-4 text-center">Request Sample / Verify With XPS</a>
            </div>
            <p className="mt-4 text-xs text-[#555] leading-relaxed">Digital colors and previews are approximate. Always verify current samples, color charts, TDS/SDS, and product availability with XPS resources before final selection.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Control({ title, items, value, onChange }) {
  return <div><h3 className="uppercase font-black text-[#050505] mb-3">{title}</h3><div className="flex flex-wrap gap-2">{items.map(item => <button key={item} onClick={() => onChange(item)} className={`rounded-full px-4 py-2 text-sm font-black border-2 ${value === item ? 'bg-[#050505] text-[#D6A21A] border-[#050505]' : 'bg-white text-[#222] border-[#d8d8d8]'}`}>{item}</button>)}</div></div>;
}

function textureStyle(color, type) {
  if (type === 'metallic') return { background: `radial-gradient(circle at 30% 30%, #fff8 0 8%, transparent 18%), linear-gradient(135deg, ${color}, #111, ${color})` };
  if (type === 'flake') return { background: `radial-gradient(circle at 20% 25%, #fff 0 3px, transparent 4px), radial-gradient(circle at 70% 60%, #111 0 4px, transparent 5px), radial-gradient(circle at 45% 75%, #D6A21A 0 3px, transparent 4px), ${color}` };
  if (type === 'quartz') return { background: `radial-gradient(circle at 15% 25%, #ffffff99 0 2px, transparent 4px), radial-gradient(circle at 60% 70%, #00000055 0 2px, transparent 4px), ${color}` };
  return { background: color };
}
