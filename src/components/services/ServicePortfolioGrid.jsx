import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, ArrowUpRight } from 'lucide-react';
import SectionBadge from '../shared/SectionBadge';

const PROJECTS = [
  {
    title: 'Meridian Capital AI Platform',
    category: 'Architecture',
    metric: '+$420M AUM impact',
    description: 'Enterprise AI architecture powering a global asset manager\'s investment intelligence layer.',
    detail: 'Designed end-to-end MLOps infrastructure, model governance, and real-time signal pipelines across 14 asset classes. Reduced time-to-insight from weeks to minutes.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    tags: ['LLM Orchestration', 'MLOps', 'Governance'],
  },
  {
    title: 'Novex Bio Market Entry',
    category: 'Simulation',
    metric: '+3.2× speed-to-market',
    description: 'Agent-based market entry simulation for a biotech group expanding across 14 countries.',
    detail: 'Built a Monte Carlo simulation engine modeling regulatory risk, competitor response, and demand curves — enabling the client to sequence entry order with confidence.',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
    tags: ['Agent-Based Models', 'Risk Modeling', 'Strategy'],
  },
  {
    title: 'Atelier Finch Design System',
    category: 'UI / UX',
    metric: '+68% activation rate',
    description: 'End-to-end design system and product UX for an AI-native creative studio platform.',
    detail: 'Established tokens, component library, and interaction patterns across web and mobile. Paired with user research sprints that surfaced critical friction points before engineering.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    tags: ['Design Systems', 'Interaction Design', 'Research'],
  },
  {
    title: 'Kinesis Multi-Brand Marketing',
    category: 'Marketing',
    metric: '+240% ROAS',
    description: 'Generative creative operations and AI attribution for a multi-brand consumer group.',
    detail: 'Deployed an AI creative ops pipeline producing 400+ monthly variants, combined with a media mix model that reallocated $12M in spend toward high-signal channels.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    tags: ['Creative AI', 'Attribution', 'Media Mix'],
  },
  {
    title: 'Orrin Defense Scenario Lab',
    category: 'Simulation',
    metric: '14 scenarios modeled',
    description: 'Long-horizon planning and adversarial simulation for a defense contractor.',
    detail: 'Developed a classified simulation environment stress-testing strategic decisions against 14 geopolitical and technological scenarios over a 10-year planning horizon.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    tags: ['Adversarial Modeling', 'Scenario Planning', 'Intelligence'],
  },
  {
    title: 'Velora Retail Intelligence',
    category: 'Intelligence',
    metric: '+11pp market share',
    description: 'Competitor telemetry and signal synthesis for a luxury retail group.',
    detail: 'Built a continuous intelligence stack aggregating pricing, sentiment, assortment, and store-level data from 40+ competitors — surfaced daily in an executive dashboard.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    tags: ['Competitive Intel', 'OSINT', 'Dashboards'],
  },
];

const CATEGORIES = ['All', 'Architecture', 'Simulation', 'UI / UX', 'Marketing', 'Intelligence'];

export default function ServicePortfolioGrid() {
  const [active, setActive] = useState('All');
  const [modal, setModal] = useState(null);

  const filtered = active === 'All' ? PROJECTS : PROJECTS.filter(p => p.category === active);

  return (
    <section className="py-28 border-t border-border/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <SectionBadge>Case Studies</SectionBadge>
            <h2 className="font-display text-4xl md:text-5xl mt-6 leading-[1.05] text-gradient-ivory">
              Work across<br />
              <span className="italic">every practice.</span>
            </h2>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`px-4 py-2 rounded-full text-xs border transition-all ${
                  active === c
                    ? 'btn-ivory border-transparent'
                    : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.div
                key={p.title}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                onClick={() => setModal(p)}
                className="group relative rounded-2xl overflow-hidden border border-border bg-card cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border text-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-accent" />
                    <span>{p.metric}</span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-accent">{p.category}</span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="font-display text-xl leading-tight">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {p.tags.map(t => (
                      <span key={t} className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-secondary/50 text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => setModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className="fixed inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 top-1/2 -translate-y-1/2 z-50 w-full md:max-w-2xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={modal.image} alt={modal.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <button
                  onClick={() => setModal(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center hover:bg-background transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-8">
                <span className="text-xs uppercase tracking-[0.2em] text-accent">{modal.category}</span>
                <h3 className="font-display text-3xl mt-2 mb-3 text-gradient-ivory">{modal.title}</h3>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm text-accent mb-6">
                  <TrendingUp className="w-3.5 h-3.5" /> {modal.metric}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">{modal.detail}</p>
                <div className="flex flex-wrap gap-2">
                  {modal.tags.map(t => (
                    <span key={t} className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary text-muted-foreground">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}