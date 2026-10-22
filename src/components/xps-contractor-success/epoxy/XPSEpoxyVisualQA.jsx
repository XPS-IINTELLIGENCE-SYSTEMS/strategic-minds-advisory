import React from 'react';

const checks = [
  'Black / white / gold XPS Contractor Success palette',
  'Board-style header with strong condensed uppercase hierarchy',
  'Black/gold CTA ribbon',
  'Phone mockup workbook grid',
  'Floor Visualizer black frame and gold controls',
  'Customer worksheet and lead capture as white workbook cards',
  'XPS ecosystem footer section',
  'Mobile responsive stacking',
];

export default function XPSEpoxyVisualQA(){
  return <section className="max-w-7xl mx-auto px-5 pb-12"><div className="rounded-2xl bg-white border-2 border-[#d8d8d8] p-6 md:p-8"><h2 className="uppercase font-black text-3xl md:text-5xl text-[#050505]">Visual QA Checklist</h2><p className="mt-2 text-[#555]">Launch should remain blocked if the visual style drifts from the supplied XPS concept.</p><div className="mt-5 grid md:grid-cols-2 gap-3">{checks.map(check=><div key={check} className="rounded-xl border border-[#d8d8d8] bg-[#f7f5ef] p-3 text-sm font-bold">✓ {check}</div>)}</div></div></section>
}
