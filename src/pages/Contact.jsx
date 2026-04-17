import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Mail, Phone, MapPin, Clock, Send, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import HexagonField from '@/components/shared/HexagonField';

const budgets = ['Under $5,000', '$5,000 - $10,000', '$10,000 - $25,000', '$25,000 - $50,000', '$50,000+'];

const contactItems = [
  { icon: Mail,   label: 'Email',  value: 'hello@marketai.com',                   href: 'mailto:hello@marketai.com' },
  { icon: Phone,  label: 'Phone',  value: '+1 (234) 567-890',                     href: 'tel:+1234567890' },
  { icon: MapPin, label: 'Office', value: '123 Innovation Street, Tech City, TC 10001', href: '#' },
  { icon: Clock,  label: 'Hours',  value: 'Mon - Fri: 9AM - 6PM EST',             href: '#' },
];

const faqs = [
  { q: 'How long does a typical project take?',     a: 'Project timelines vary based on scope and complexity. Most projects range from 4-12 weeks, with ongoing retainer options available.' },
  { q: 'What industries do you specialize in?',     a: 'We work across all industries but have deep expertise in technology, e-commerce, finance, and healthcare sectors.' },
  { q: 'Do you offer ongoing support?',             a: 'Yes! We offer flexible retainer packages for ongoing marketing support, optimization, and continuous improvement.' },
  { q: 'How do you measure success?',               a: 'We establish clear KPIs at project start and provide regular reporting dashboards to track performance against goals.' },
];

export default function Contact() {
  const [form, setForm] = useState({ full_name: '', email: '', company: '', budget: '', project_details: '' });
  const [status, setStatus] = useState('idle');
  const [openFaq, setOpenFaq] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    await base44.entities.ContactInquiry.create({ ...form, status: 'new' });
    setStatus('sent');
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 text-center px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle, #ffffff22 1px, transparent 1px)', backgroundSize:'60px 60px'}} />
        <HexagonField />
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 bg-zinc-900/60 backdrop-blur-sm mb-8">
          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          <span className="text-sm text-zinc-300">Contact Us</span>
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight max-w-3xl mx-auto mb-6">
          Let's Build<br />Something Great
        </h1>
        <p className="text-zinc-400 max-w-xl mx-auto">
          Ready to elevate your marketing? Get in touch and let's discuss how we can help your brand reach new heights.
        </p>
      </section>

      {/* Form + Info */}
      <section className="pb-24 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-start">
        {/* Form */}
        <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
          {status === 'sent' ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-display text-2xl font-bold text-white mb-2">Message Sent!</h3>
              <p className="text-zinc-400">We'll get back to you within one business day.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Full Name *</label>
                  <input required value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="John Doe" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Email *</label>
                  <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@company.com" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Company</label>
                  <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Your Company" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Budget Range</label>
                  <select value={form.budget} onChange={e => set('budget', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-zinc-500 transition">
                    <option value="">Select budget</option>
                    {budgets.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">Project Details *</label>
                <textarea required value={form.project_details} onChange={e => set('project_details', e.target.value)} rows={5} placeholder="Tell us about your project, goals, and timeline..." className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition resize-none" />
              </div>
              <button type="submit" disabled={status === 'sending'} className="w-full py-3.5 rounded-full bg-white text-black font-medium text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition disabled:opacity-60">
                {status === 'sending' ? 'Sending…' : <><Send className="w-4 h-4" /> Send Message</>}
              </button>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="font-display text-3xl font-bold text-white mb-3">Get in Touch</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-7">
            Have a project in mind? We'd love to hear about it. Reach out through any of the channels below or fill out the form.
          </p>
          <div className="space-y-3">
            {contactItems.map(item => (
              <a key={item.label} href={item.href} className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors">
                <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-0.5">{item.label}</div>
                  <div className="text-sm text-white">{item.value}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-white mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-6 py-5 flex items-center justify-between text-left gap-4">
                  <span className="font-medium text-white text-sm">{f.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-zinc-400 text-sm leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}