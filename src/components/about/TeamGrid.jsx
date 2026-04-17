import React from 'react';
import { motion } from 'framer-motion';
import SectionBadge from '../shared/SectionBadge';

const team = [
  {
    name: 'Alexandra Reed',
    role: 'Founder & CEO',
    bio: 'Former partner at a Tier-1 strategy firm. Advises boards on AI transformation.',
    img: 'https://base44.app/api/apps/assets/img_747d9feff616.png',
  },
  {
    name: 'Marcus Chen',
    role: 'Head of AI Architecture',
    bio: 'Built large-scale ML platforms at two hyperscalers before joining the firm.',
    img: 'https://base44.app/api/apps/assets/img_ea1b3ba39bf3.png',
  },
  {
    name: 'Sophia Martinez',
    role: 'Director of Design',
    bio: 'Award-winning designer shaping the interfaces of AI-native products.',
    img: 'https://base44.app/api/apps/assets/img_27122604ca86.png',
  },
  {
    name: 'David Okafor',
    role: 'Head of Intelligence',
    bio: 'Former defense-sector analyst specializing in strategic simulation.',
    img: 'https://base44.app/api/apps/assets/img_e9f69e05568b.png',
  },
];

export default function TeamGrid() {
  return (
    <section className="py-28 border-t border-border/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <SectionBadge>The Practice</SectionBadge>
          <h2 className="font-display text-4xl md:text-6xl mt-6 leading-[1.05] text-gradient-ivory">
            Advisors &<br />
            <span className="italic">architects.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border bg-card">
                <img
                  src={m.img}
                  alt={m.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              <div className="pt-5">
                <h3 className="font-display text-xl">{m.name}</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-accent mt-1">{m.role}</p>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{m.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}