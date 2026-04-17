import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import SectionBadge from '../shared/SectionBadge';

const items = [
  {
    quote:
      'Strategic Minds designed the AI architecture behind our global rollout. Their foresight compressed a 3-year roadmap into 14 months.',
    name: 'Sarah Chen',
    role: 'Chief Strategy Officer, Meridian Capital',
  },
  {
    quote:
      'The simulation work alone paid for the engagement twice over. They found market moves we had not even considered.',
    name: 'Michael Torres',
    role: 'President, Nova Defense Systems',
  },
  {
    quote:
      'Rare advisors who can hold the boardroom and the engineering floor in one conversation. Exceptional taste and rigor.',
    name: 'Emma Williams',
    role: 'Founder & CEO, Bloom Health',
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <SectionBadge>Client Voices</SectionBadge>
          <h2 className="font-display text-4xl md:text-6xl mt-6 leading-[1.05] text-gradient-ivory">
            Quiet confidence.<br />
            <span className="italic">Loud results.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="p-8 rounded-2xl border border-border bg-card/40 flex flex-col"
            >
              <Quote className="w-6 h-6 text-accent mb-6" />
              <p className="font-display text-xl leading-relaxed text-foreground/90 flex-1">
                "{t.quote}"
              </p>
              <div className="mt-8 pt-6 border-t border-border/60">
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}