import React, { useState } from 'react';
import XPSEpoxySuggestedPrompts from './XPSEpoxySuggestedPrompts';

const modes = ['Contractor Mode', 'Customer Explanation Mode', 'Troubleshooting Mode', 'Sales Helper Mode'];

export default function XPSEpoxyAssistantChat({ visualizerSelection, troubleshooting }) {
  const [mode, setMode] = useState('Contractor Mode');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function submit(prompt = message) {
    const clean = prompt.trim();
    if (!clean) return;
    setError('');
    setStatus('sending');
    setMessage('');
    setMessages((current) => [...current, { role: 'user', content: clean }]);
    try {
      const response = await fetch('/api/xps-contractor-success/epoxy-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: clean, mode, planner_context: visualizerSelection, troubleshooting_context: troubleshooting }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Assistant request failed.');
      setMessages((current) => [...current, { role: 'assistant', content: result.answer, risk_level: result.risk_level, provider_status: result.provider_status }]);
    } catch (err) {
      setError(err.message || 'Assistant request failed.');
    } finally {
      setStatus('idle');
    }
  }

  return (
    <section id="epoxy-ai-assistant" className="max-w-7xl mx-auto px-5 pb-12">
      <div className="rounded-2xl border-[3px] border-[#B8860B] bg-white shadow-xl overflow-hidden">
        <div className="bg-[#050505] text-white px-6 py-5 border-b-4 border-[#D6A21A]">
          <h2 className="uppercase font-black text-4xl md:text-6xl text-[#D6A21A]">Ask the Epoxy AI Assistant</h2>
          <p className="mt-2 text-white/75">Systems, prep, planning paths, customer explanations, sales scripts, and maintenance guidance.</p>
        </div>
        <div className="p-6 grid lg:grid-cols-[0.85fr_1.15fr] gap-6">
          <div>
            <h3 className="uppercase font-black text-[#050505] mb-3">Assistant Mode</h3>
            <div className="grid gap-2 mb-6">
              {modes.map((item) => <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-xl border-2 p-3 text-left font-black ${mode === item ? 'border-[#050505] bg-[#050505] text-[#D6A21A]' : 'border-[#d8d8d8] bg-[#f7f5ef]'}`}>{item}</button>)}
            </div>
            <XPSEpoxySuggestedPrompts onSelect={submit} />
          </div>
          <div>
            <div className="rounded-2xl border-2 border-[#d8d8d8] bg-[#f7f5ef] p-4 min-h-[360px] max-h-[520px] overflow-auto space-y-3">
              {messages.length === 0 && <p className="text-[#555]">Choose a prompt or type your question. Verify product-specific decisions with current XPS documentation and technical support.</p>}
              {messages.map((item, index) => <div key={`${item.role}-${index}`} className={`rounded-xl p-4 ${item.role === 'user' ? 'bg-[#050505] text-white ml-8' : 'bg-white border border-[#d8d8d8] mr-8'}`}><p className="whitespace-pre-wrap text-sm leading-relaxed">{item.content}</p>{item.risk_level && <p className="mt-2 text-xs uppercase font-black text-[#B8860B]">Risk: {item.risk_level} • Provider: {item.provider_status}</p>}</div>)}
            </div>
            <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="mt-4 flex gap-3">
              <input value={message} onChange={(event) => setMessage(event.target.value)} className="flex-1 rounded-full border-2 border-[#d8d8d8] px-5 py-4" placeholder="Ask about epoxy systems, prep, sales, or planning..." />
              <button disabled={status === 'sending'} className="rounded-full bg-[#050505] text-[#D6A21A] uppercase font-black px-6">{status === 'sending' ? 'Thinking...' : 'Ask'}</button>
            </form>
            {error && <p className="mt-3 rounded-lg bg-red-50 border border-red-200 text-red-700 p-3 text-sm">{error}</p>}
            <p className="mt-3 text-xs text-[#555]">Safety reminder: this assistant does not replace current product documentation, XPS technical support, jobsite testing, or professional onsite judgment.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
