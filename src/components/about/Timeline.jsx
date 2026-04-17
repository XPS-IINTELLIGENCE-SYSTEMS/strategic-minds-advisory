import React from 'react';
import { motion } from 'framer-motion';

const milestones = [
  { year: '2021', text: 'Founded by advisors from McKinsey, Palantir, and IDEO.' },
  { year: '2022', text: 'First enterprise AI architecture engagement deployed globally.' },
  { year: '2023', text: 'Launched proprietary predictive simulation practice.' },
  { year: '2024', text: 'Recognized by Fast Company as an AI firm to watch.' },
  { year: '2025', text: 'Opened Singapore studio; expanded intelligence practice.' },
  { year: '2026', text: 'Serving 40+ industries across three continents.' },
];

export default function Timeline() {
  return (
    <div className="relative rounded-2xl border border-border bg-card/40 p-8 md:p-10">
      <h3 className="font-display text-2xl mb-8">Our Journey</h3>
      <div className="space-y-1">
        {milestones.map((m, i) => (
          <motion.div
            key={m.year}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex gap-6 py-4 border-b border-border/50 last:border-0 items-baseline"
          >
            <div className="font-display text-accent text-lg w-16 flex-shrink-0">{m.year}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{m.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}