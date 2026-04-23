import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const budgets = [
  { v: 'under_25k', l: 'Under $25,000' },
  { v: '25k_50k', l: '$25,000 — $50,000' },
  { v: '50k_100k', l: '$50,000 — $100,000' },
  { v: '100k_250k', l: '$100,000 — $250,000' },
  { v: '250k_plus', l: '$250,000+' },
];

export default function ContactForm() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    company: '',
    industry: '',
    budget: '',
    project_details: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | sent

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await base44.entities.ContactInquiry.create({ ...form, status: 'new' });
      setStatus('sent');
    } catch (error) {
      console.error('Failed to submit contact form:', error);
      setStatus('idle');
    }
  };

  if (status === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card/60 p-10 md:p-14 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-6 h-6 text-accent" />
        </div>
        <h3 className="font-display text-3xl mb-3 text-gradient-ivory">Message received.</h3>
        <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
          An advisor will reach out within one business day. In the meantime, consider it the
          beginning of something considered.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-card/60 p-8 md:p-10 space-y-6"
    >
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Full Name *" value={form.full_name} onChange={(v) => set('full_name', v)} required placeholder="Jane Doe" />
        <Field label="Email *" type="email" value={form.email} onChange={(v) => set('email', v)} required placeholder="jane@company.com" />
        <Field label="Company" value={form.company} onChange={(v) => set('company', v)} placeholder="Your organization" />
        <Field label="Industry" value={form.industry} onChange={(v) => set('industry', v)} placeholder="e.g. Finance, Healthcare" />
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">
          Engagement Budget
        </label>
        <select
          value={form.budget}
          onChange={(e) => set('budget', e.target.value)}
          className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm outline-none focus:border-accent transition"
        >
          <option value="">Select a range</option>
          {budgets.map((b) => (
            <option key={b.v} value={b.v}>{b.l}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">
          Project Details *
        </label>
        <textarea
          required
          value={form.project_details}
          onChange={(e) => set('project_details', e.target.value)}
          rows={5}
          placeholder="What are you building toward? What has been tried?"
          className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm outline-none focus:border-accent transition resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn-ivory rounded-full w-full py-4 text-sm font-medium inline-flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
      >
        {status === 'sending' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
        ) : (
          <>Send Message <Send className="w-4 h-4" /></>
        )}
      </button>
    </form>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm outline-none focus:border-accent transition"
      />
    </div>
  );
}