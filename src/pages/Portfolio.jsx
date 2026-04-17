import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PageHero from '@/components/shared/PageHero';
import PortfolioCard from '@/components/portfolio/PortfolioCard';
import ResultsStrip from '@/components/portfolio/ResultsStrip';
import CTASection from '@/components/home/CTASection';

const projects = [
  {
    title: 'Meridian Capital — AI Architecture',
    description: 'Designed and deployed the enterprise AI platform powering a global asset manager.',
    category: 'Architecture',
    metric: '+$420M AUM impact',
    image: 'https://base44.app/api/apps/assets/img_568e126dfb75.png',
  },
  {
    title: 'Novex Bio — Predictive Strategy',
    description: 'Agent-based simulation of market entry sequencing across 14 countries.',
    category: 'Simulation',
    metric: '+3.2x speed-to-market',
    image: 'https://base44.app/api/apps/assets/img_0037a6190430.png',
  },
  {
    title: 'Atelier Finch — Interface System',
    description: 'Design system and product UX for an AI-native creative studio platform.',
    category: 'UI / UX',
    metric: '+68% activation',
    image: 'https://base44.app/api/apps/assets/img_34402d24ede1.png',
  },
  {
    title: 'Kinesis Brands — AI Marketing',
    description: 'Generative creative operations and attribution for a multi-brand consumer group.',
    category: 'Marketing',
    metric: '+240% ROAS',
    image: 'https://base44.app/api/apps/assets/img_5952a4069222.png',
  },
  {
    title: 'Orrin Defense — Strategic Simulation',
    description: 'Scenario modeling and adversarial simulation for long-horizon planning.',
    category: 'Simulation',
    metric: '14 scenarios modeled',
    image: 'https://base44.app/api/apps/assets/img_bc972a7a6c03.png',
  },
  {
    title: 'Velora Retail — Intelligence Stack',
    description: 'Competitor telemetry and signal dashboards for a luxury retail group.',
    category: 'Intelligence',
    metric: '+11pp market share',
    image: 'https://base44.app/api/apps/assets/img_f09a6576d8dd.png',
  },
];

const categories = ['All', 'Architecture', 'Simulation', 'UI / UX', 'Marketing', 'Intelligence'];

export default function Portfolio() {
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? projects : projects.filter((p) => p.category === active);

  return (
    <>
      <PageHero
        badge="Selected Engagements"
        title={
          <>
            Work that<br />
            <span className="italic">quietly compounds.</span>
          </>
        }
        subtitle="A selection of engagements across industries. Client names are disclosed where permitted; outcomes are anonymized where required."
      />

      <section className="relative pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-5 py-2.5 rounded-full text-sm border transition-all ${
                active === c
                  ? 'btn-ivory border-transparent'
                  : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="relative pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <AnimatePresence mode="popLayout">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p, i) => (
                <PortfolioCard key={p.title} project={p} index={i} />
              ))}
            </div>
          </AnimatePresence>
        </div>
      </section>

      <ResultsStrip />
      <CTASection
        title="Your engagement could be next."
        subtitle="Tell us what you're building toward. We'll tell you how we'd approach it."
        cta="Start a Project"
      />
    </>
  );
}