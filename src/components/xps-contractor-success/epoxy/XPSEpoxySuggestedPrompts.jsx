import React from 'react';

export const EPOXY_SUGGESTED_PROMPTS = [
  'Help me choose an epoxy system for a garage.',
  'Explain flake epoxy to a homeowner.',
  'Create a customer prep checklist.',
  'Help troubleshoot peeling epoxy.',
  'Write a quote follow-up text.',
  'Compare flake, quartz, metallic, and solid epoxy.',
  'What questions should I ask before bidding?',
  'Create a maintenance guide for a new epoxy floor.',
  'Explain why surface prep matters.',
  'Help me respond when a customer says epoxy is too expensive.',
];

export default function XPSEpoxySuggestedPrompts({ onSelect }) {
  return (
    <div className="grid md:grid-cols-2 gap-2">
      {EPOXY_SUGGESTED_PROMPTS.map((prompt) => (
        <button key={prompt} onClick={() => onSelect?.(prompt)} className="rounded-xl border border-[#d8d8d8] bg-white p-3 text-left text-sm font-bold hover:border-[#B8860B] hover:bg-[#f7f5ef]">
          {prompt}
        </button>
      ))}
    </div>
  );
}
