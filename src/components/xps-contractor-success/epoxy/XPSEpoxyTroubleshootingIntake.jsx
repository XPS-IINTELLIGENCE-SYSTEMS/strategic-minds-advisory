import React, { useState } from 'react';

const fields = ['project_type','flooring_system','substrate_type','surface_prep_method','moisture_test_performed','primer_used','system_details','temperature_humidity','cure_time_before_traffic','failure_or_concern','photos_available','urgency_level'];
const initial = Object.fromEntries(fields.map((field) => [field, '']));

export default function XPSEpoxyTroubleshootingIntake({ onChange }) {
  const [form, setForm] = useState(initial);
  const set = (key, value) => {
    const next = { ...form, [key]: value };
    setForm(next);
    onChange?.(next);
  };
  return (
    <section className="max-w-7xl mx-auto px-5 pb-12">
      <div className="rounded-2xl bg-[#050505] text-white border-[3px] border-[#B8860B] p-6 md:p-8 shadow-xl">
        <h2 className="uppercase font-black text-4xl md:text-6xl text-[#D6A21A]">Troubleshooting Intake</h2>
        <p className="mt-2 text-white/75">Collect jobsite facts before asking for recommendations. High-risk issues require current TDS/SDS review, XPS technical support, and onsite judgment.</p>
        <div className="mt-6 grid md:grid-cols-2 gap-3">
          {fields.map((field) => <label key={field} className="block"><span className="text-xs uppercase tracking-[0.18em] font-black text-[#D6A21A]">{field.split('_').join(' ')}</span><textarea rows={field.includes('details') || field.includes('concern') ? 3 : 1} value={form[field]} onChange={(event) => set(field, event.target.value)} className="mt-1 w-full rounded-lg border border-[#d8d8d8] p-3 text-[#222]" /></label>)}
        </div>
      </div>
    </section>
  );
}
