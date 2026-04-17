import React from 'react';
import { motion } from 'framer-motion';
import { Target, Telescope, Handshake, Gem } from 'lucide-react';
import SectionBadge from '../shared/SectionBadge';

const values = [
  {
    icon: Telescope,
    title: 'Foresight First',
    desc: 'We optimize for what clients will need in three years, not last quarter.',
  },
  {
    icon: Target,
    title: 'Rigor Without Theater',
    desc: 'Less slide craft, more signal. Analysis that survives contact with reality.',
  },
  {
    icon: Handshake,
    title: 'Partnership Over Projects',
    desc: 'We stay engaged through deployment. Advisors become extensions of your team.',
  },
  {
    icon: Gem,
    title: 'Taste Is Strategy',
    desc: 'How a product feels is how a company thinks. We design with both in mind.',
  },
];

export default function Values() {
  return (
    <section className="py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <SectionBadge>Principles</SectionBadge>
          <h2 className="font-display text-4xl md:text-6xl mt-6 leading-[1.05] text-gradient-ivory">
            The way we<br />
            <span className="italic">choose to work.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-8 rounded-2xl border border-border bg-card/40"
            >
              <div className="w-11 h-11 rounded-xl bg-secondary/60 border border-border flex items-center justify-center mb-6">
                <v.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display text-xl mb-2">{v.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}