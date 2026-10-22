import React, { useState } from 'react';

const initialForm = {
  first_name: '',
  last_name: '',
  company_name: '',
  phone: '',
  email: '',
  website_or_social: '',
  city: '',
  state: '',
  service_area: '',
  years_in_business: '',
  primary_work_type: [],
  currently_buys_from_xps: '',
  interested_in_discounts: '',
  interested_in_training: '',
  interested_in_lead_opportunities: '',
  wants_branded_planner: '',
  systems_offered: [],
  biggest_challenge: '',
  consent: false,
};

const states = ['', 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];
const workTypes = ['Residential', 'Commercial', 'Industrial', 'Government / Public Sector', 'Garage Floors', 'Polished Concrete', 'Epoxy Coatings', 'Decorative Concrete', 'Surface Prep', 'Other'];
const systems = ['Sealed Concrete', 'Polished Concrete', 'Stained Concrete', 'Solid Color Epoxy', 'Flake Epoxy', 'Metallic Epoxy', 'Quartz Epoxy', 'Overlays / Microtoppings', 'Trailer Floor Coatings', 'Concrete Countertops', 'Moisture Mitigation', 'Surface Preparation', 'Other'];

export default function XPSPlannerLeadForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const toggleArrayValue = (key, value) => {
    setForm((current) => {
      const values = current[key] || [];
      return {
        ...current,
        [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
      };
    });
  };

  async function submit(event) {
    event.preventDefault();
    setError('');

    if (!form.consent) {
      setError('Consent is required before submitting.');
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch('/api/xps-contractor-success/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          lead_source: 'xps_contractor_success_landing_page',
          page_path: window.location.pathname,
          referrer: document.referrer || '',
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Submission failed.');
      setStatus('sent');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  }

  if (status === 'sent') {
    return (
      <div className="bg-white rounded-2xl border-2 border-[#B8860B] p-8 text-center shadow-xl">
        <h3 className="text-3xl font-black uppercase text-[#050505]">Request Received</h3>
        <p className="mt-3 text-[#555] leading-relaxed">
          Watch for direct follow-up with the starter pack. If you want the planner branded with your company name and logo, reply with your logo, phone, website, and service area.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border-2 border-[#d8d8d8] p-8 space-y-5 shadow-xl">
      <div>
        <h3 className="uppercase text-3xl font-black text-[#050505]">Get the Starter Pack</h3>
        <p className="mt-2 text-sm text-[#555]">Tell us where to send it and what contractor support you are interested in.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <Field label="First Name *" value={form.first_name} onChange={(v) => set('first_name', v)} required />
        <Field label="Last Name *" value={form.last_name} onChange={(v) => set('last_name', v)} required />
        <Field label="Company Name *" value={form.company_name} onChange={(v) => set('company_name', v)} required />
        <Field label="Phone *" value={form.phone} onChange={(v) => set('phone', v)} required />
        <Field label="Email *" type="email" value={form.email} onChange={(v) => set('email', v)} required />
        <Field label="Website / Social" value={form.website_or_social} onChange={(v) => set('website_or_social', v)} />
        <Field label="City *" value={form.city} onChange={(v) => set('city', v)} required />
        <Select label="State *" value={form.state} onChange={(v) => set('state', v)} options={states} required />
        <Field label="Service Area" value={form.service_area} onChange={(v) => set('service_area', v)} />
        <Select label="Years in Business *" value={form.years_in_business} onChange={(v) => set('years_in_business', v)} required options={['', 'Not started yet', 'Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years']} />
      </div>

      <CheckboxGroup label="Primary Work Type *" options={workTypes} selected={form.primary_work_type} onToggle={(value) => toggleArrayValue('primary_work_type', value)} />
      <CheckboxGroup label="Flooring Systems Offered *" options={systems} selected={form.systems_offered} onToggle={(value) => toggleArrayValue('systems_offered', value)} />

      <div className="grid md:grid-cols-2 gap-3">
        <Select label="Do you currently buy from XPS? *" value={form.currently_buys_from_xps} onChange={(v) => set('currently_buys_from_xps', v)} required options={['', 'Yes', 'No', 'Not yet, but interested', 'I have bought before', 'Not sure']} />
        <Select label="Interested in contractor discounts? *" value={form.interested_in_discounts} onChange={(v) => set('interested_in_discounts', v)} required options={['', 'Yes', 'No', 'Maybe']} />
        <Select label="Interested in discounted training? *" value={form.interested_in_training} onChange={(v) => set('interested_in_training', v)} required options={['', 'Yes', 'No', 'Maybe']} />
        <Select label="Interested in lead opportunities? *" value={form.interested_in_lead_opportunities} onChange={(v) => set('interested_in_lead_opportunities', v)} required options={['', 'Yes', 'No', 'Maybe']} />
        <Select label="Want this planner branded? *" value={form.wants_branded_planner} onChange={(v) => set('wants_branded_planner', v)} required options={['', 'Yes', 'No', 'Maybe later']} />
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.18em] text-[#555] font-black mb-2 block">Biggest business challenge right now *</label>
        <textarea required rows={5} value={form.biggest_challenge} onChange={(e) => set('biggest_challenge', e.target.value)} className="w-full border border-[#d8d8d8] rounded-lg p-3 text-sm" placeholder="Lead flow, estimating, closing jobs, crew systems, training, pricing, product knowledge..." />
      </div>

      <label className="flex gap-3 text-sm text-[#555] leading-relaxed">
        <input type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} className="mt-1" />
        <span>I agree to receive follow-up about the XPS Contractor Success Starter Pack, contractor resources, training, product support, and related opportunities. I understand that discounts, training access, lead opportunities, and certification language may require approval and are not promised.</span>
      </label>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">{error}</p>}

      <button className="w-full rounded-full bg-[#050505] text-[#D6A21A] uppercase font-black py-4" disabled={status === 'sending'}>
        {status === 'sending' ? 'Submitting...' : 'Request Starter Pack'}
      </button>
    </form>
  );
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.18em] text-[#555] font-black mb-2 block">{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-[#d8d8d8] rounded-lg p-3 text-sm" />
    </div>
  );
}

function Select({ label, value, onChange, options, required }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.18em] text-[#555] font-black mb-2 block">{label}</label>
      <select required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-[#d8d8d8] rounded-lg p-3 text-sm bg-white">
        {options.map((option) => <option key={option} value={option}>{option || 'Select'}</option>)}
      </select>
    </div>
  );
}

function CheckboxGroup({ label, options, selected, onToggle }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-[#555] font-black mb-3">{label}</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 rounded-lg border border-[#d8d8d8] p-3 text-sm">
            <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}
