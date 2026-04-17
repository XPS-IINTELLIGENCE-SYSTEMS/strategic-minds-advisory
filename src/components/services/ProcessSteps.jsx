import React from 'react';
import { motion } from 'framer-motion';
import SectionBadge from '../shared/SectionBadge';

const steps = [
  {
    n: '01',
    title: 'Discovery',
    desc: 'Deep diagnostic of your business, data assets, and competitive terrain.',
  },
  {
    n: '02',
    title: 'Strategy',
    desc: 'Custom AI blueprint — scenarios simulated, priorities sequenced, risks modeled.',
  },
  {
    n: '03',
    title: 'Build',
    desc: 'Systems engineered, interfaces designed, intelligence operationalized.',
  },
  {
    n: '04',
    title: 'Compound',
    desc: 'Continuous learning loops, optimization, and advisory support that scales.',
  },
];

export default function ProcessSteps() {
  return (
    <section className="relative py-28 border-t border-border/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-20">
          <SectionBadge>Engagement Model</SectionBadge>
          <h2 className="font-display text-4xl md:text-6xl mt-6 leading-[1.05] text-gradient-ivory">
            Four phases.<br />
            <span className="italic">One compounding advantage.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card p-8 md:p-10"
            >
              <div className="font-display text-5xl md:text-6xl text-accent/70 mb-6">{s.n}</div>
              <h3 className="font-display text-2xl mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}