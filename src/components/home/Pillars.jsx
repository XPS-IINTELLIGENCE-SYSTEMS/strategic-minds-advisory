import React from 'react';
import { motion } from 'framer-motion';
import { Brain, LineChart, Layers, Compass } from 'lucide-react';
import SectionBadge from '../shared/SectionBadge';

const pillars = [
  {
    icon: Compass,
    title: 'Strategic Advisory',
    desc: 'Board-level counsel on AI transformation — where to invest, what to build, and how to compete.',
  },
  {
    icon: Brain,
    title: 'Predictive Simulation',
    desc: 'Model futures before committing resources. Stress-test strategy, marketing, and market entry.',
  },
  {
    icon: LineChart,
    title: 'Intelligence & Data',
    desc: 'Aggregate signal from noise. Competitor mapping, market telemetry, and decision-grade insight.',
  },
  {
    icon: Layers,
    title: 'Systems & Architecture',
    desc: 'Design AI architectures and human-centered interfaces built to scale across your organization.',
  },
];

export default function Pillars() {
  return (
    <section className="relative py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <SectionBadge>Practice Areas</SectionBadge>
            <h2 className="font-display text-4xl md:text-6xl mt-6 leading-[1.05] text-gradient-ivory">
              A firm built for the<br />
              <span className="italic">intelligence economy.</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm leading-relaxed">
            We partner with leaders across every industry — from finance and healthcare to defense and
            creative. Each engagement combines rigor with imagination.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative p-8 md:p-10 rounded-2xl border border-border bg-card/40 hover:bg-card/80 transition-colors overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-accent/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-secondary/60 border border-border flex items-center justify-center mb-6">
                  <p.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl mb-3">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-md">{p.desc}</p>
                <div className="mt-8 text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                  0{i + 1} — Practice
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}