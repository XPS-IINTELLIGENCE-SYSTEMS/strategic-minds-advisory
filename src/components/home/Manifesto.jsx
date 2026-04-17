import React from 'react';
import { motion } from 'framer-motion';
import SectionBadge from '../shared/SectionBadge';

const lines = [
  'We believe intelligence is not a product — it is a discipline.',
  'That strategy must be simulated before it is shipped.',
  'That data without design is noise, and design without data is guesswork.',
  'We build for companies that refuse to be surprised by the future.',
];

export default function Manifesto() {
  return (
    <section className="relative py-28 border-y border-border/60 overflow-hidden">
      <div className="absolute inset-0 ambient-glow opacity-70 pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-6 lg:px-10 text-center">
        <SectionBadge>Manifesto</SectionBadge>
        <div className="mt-10 space-y-8">
          {lines.map((l, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="font-display text-2xl md:text-4xl leading-[1.25] text-gradient-ivory"
            >
              {l}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}