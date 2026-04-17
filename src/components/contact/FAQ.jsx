import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import SectionBadge from '../shared/SectionBadge';

const faqs = [
  {
    q: 'How long does a typical engagement last?',
    a: 'Advisory sprints run 6–12 weeks. Build engagements typically run 3–9 months, with ongoing advisory retainers thereafter.',
  },
  {
    q: 'Which industries do you serve?',
    a: 'We work across finance, healthcare, defense, consumer, enterprise software, and creative industries. Our playbook adapts; our discipline does not.',
  },
  {
    q: 'Do you build, or only advise?',
    a: 'Both. Our team includes engineers, designers, and data scientists. Strategy without execution is a slide deck.',
  },
  {
    q: 'How do you measure success?',
    a: 'We define engagement-specific KPIs in week one and track them transparently. Most engagements target durable P&L or velocity impact.',
  },
  {
    q: 'Do you sign NDAs and work under confidentiality?',
    a: 'Always. Discretion is a default, not a feature.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <SectionBadge>Frequently Asked</SectionBadge>
          <h2 className="font-display text-4xl md:text-5xl mt-6 leading-[1.1] text-gradient-ivory">
            Questions we<br /><span className="italic">often hear.</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border border-border rounded-2xl bg-card/40 overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full px-7 py-5 flex items-center justify-between text-left gap-4"
                >
                  <span className="font-display text-lg md:text-xl">{f.q}</span>
                  <span className="w-8 h-8 rounded-full border border-border flex items-center justify-center flex-shrink-0">
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-7 pb-6 text-muted-foreground leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}