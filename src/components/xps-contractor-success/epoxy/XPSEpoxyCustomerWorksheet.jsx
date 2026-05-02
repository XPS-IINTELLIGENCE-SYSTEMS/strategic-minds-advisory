import React, { useState } from 'react';

const fields = [
  'customer_name','project_address','space_type','square_footage','current_floor_condition','traffic_level','exposure_notes','design_preference','budget_range','timeline','concerns','favorite_system','favorite_colors','questions'
];
const initial = Object.fromEntries(fields.map((field) => [field, '']));

export default function XPSEpoxyCustomerWorksheet({ visualizerSelection, favoriteSystem, favoriteColors }) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setError('');
    setStatus('sending');
    try {
      const payload = {
        ...form,
        favorite_system: form.favorite_system || favoriteSystem,
        favorite_colors: form.favorite_colors || favoriteColors,
        visualizer: visualizerSelection,
      };
      const response = await fetch('/api/xps-contractor-success/epoxy-floor-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Worksheet submission failed.');
      setStatus('sent');
    } catch (err) {
      setError(err.message || 'Worksheet submission failed.');
      setStatus('idle');
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-5 pb-12">
      <form onSubmit={submit} className="bg-white rounded-2xl border-[3px] border-[#B8860B] p-6 md:p-8 shadow-xl">
        <h2 className="uppercase font-black text-4xl md:text-6xl text-[#050505]">Customer Epoxy Worksheet</h2>
        <p className="mt-2 text-[#555]">Capture the floor plan before the contractor arrives.</p>
        <div className="mt-6 grid md:grid-cols-2 gap-3">
          {fields.map((field) => (
            <Field key={field} label={field.split('_').join(' ')} value={form[field]} onChange={(value) => set(field, value)} large={['questions','concerns','exposure_notes'].includes(field)} />
          ))}
        </div>
        <div className="mt-5 rounded-xl bg-[#f7f5ef] border border-[#d8d8d8] p-4 text-sm">
          <strong>Visualizer selections:</strong> {visualizerSelection ? `${visualizerSelection.scene_type} • ${visualizerSelection.floor_system} • ${visualizerSelection.selected_color_name} • ${visualizerSelection.selected_sheen}` : 'No visualizer selection saved yet.'}
        </div>
        {error && <p className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">{error}</p>}
        {status === 'sent' && <p className="mt-4 rounded-lg bg-green-50 border border-green-200 p-3 text-green-700 text-sm">Worksheet submitted.</p>}
        <button disabled={status === 'sending'} className="mt-6 rounded-full bg-[#050505] text-[#D6A21A] uppercase font-black px-8 py-4">{status === 'sending' ? 'Submitting...' : 'Submit Worksheet'}</button>
      </form>
    </section>
  );
}

function Field({ label, value, onChange, large }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.18em] font-black text-[#555]">{label}</span>
      {large ? <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-[#d8d8d8] p-3" /> : <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-[#d8d8d8] p-3" />}
    </label>
  );
}
