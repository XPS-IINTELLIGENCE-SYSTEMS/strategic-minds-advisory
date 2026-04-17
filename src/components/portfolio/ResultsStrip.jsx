import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { v: '7.4x', l: 'Average ROI' },
  { v: '120+', l: 'Systems Deployed' },
  { v: '99.2%', l: 'Client Retention' },
  { v: '14mo', l: 'Average Partnership' },
];

export default function ResultsStrip() {
  return (
    <section className="py-24 border-y border-border/60 bg-card/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl md:text-5xl leading-[1.1] text-gradient-ivory">
            Outcomes that <span className="italic">compound.</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="font-display text-5xl md:text-6xl text-gradient-accent">{s.v}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-3">
                {s.l}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}