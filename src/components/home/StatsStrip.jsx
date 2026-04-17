import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: '40+', label: 'Industries Served' },
  { value: '120+', label: 'AI Systems Deployed' },
  { value: '99.2%', label: 'Client Retention' },
  { value: '$2.1B', label: 'Value Unlocked' },
];

export default function StatsStrip() {
  return (
    <section className="relative border-y border-border/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="text-center md:text-left"
          >
            <div className="font-display text-4xl md:text-5xl text-gradient-ivory">{s.value}</div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-3">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}