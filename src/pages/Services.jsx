import React from 'react';
import { Compass, Palette, Radar, LineChart, Megaphone, Cpu } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import ServiceCard from '@/components/services/ServiceCard';
import ProcessSteps from '@/components/services/ProcessSteps';
import CTASection from '@/components/home/CTASection';

const services = [
  {
    icon: Compass,
    title: 'AI Strategic Advisory',
    description:
      'Board-level counsel on where AI creates durable advantage — from portfolio strategy to M&A diligence and operating model redesign.',
    features: [
      'AI opportunity mapping',
      'Competitive positioning',
      'Investment sequencing',
      'Executive workshops',
    ],
  },
  {
    icon: Palette,
    title: 'Advanced UI / UX Systems',
    description:
      'Human-centered interfaces for AI products. Design systems that make complex intelligence feel effortless and inevitable.',
    features: [
      'Product & interaction design',
      'Design systems at scale',
      'Conversational & agent UX',
      'Prototyping & validation',
    ],
  },
  {
    icon: Radar,
    title: 'Intelligence & Data Gathering',
    description:
      'Decision-grade intelligence from public and proprietary sources. Competitor telemetry, market signal, and continuous awareness.',
    features: [
      'Competitive intelligence',
      'Market & consumer telemetry',
      'OSINT pipelines',
      'Signal synthesis dashboards',
    ],
  },
  {
    icon: LineChart,
    title: 'Predictive & Simulated Strategy',
    description:
      'Stress-test strategy before committing capital. Agent-based models and Monte Carlo simulations of go-to-market and portfolio decisions.',
    features: [
      'Scenario simulation',
      'Agent-based modeling',
      'Forecasting & stress tests',
      'Decision intelligence',
    ],
  },
  {
    icon: Megaphone,
    title: 'AI-Driven Marketing',
    description:
      'Marketing engineered as a learning system — segmentation, creative iteration, and measurement powered by generative and predictive AI.',
    features: [
      'Audience modeling',
      'Generative creative ops',
      'Attribution & media mix',
      'Lifecycle personalization',
    ],
  },
  {
    icon: Cpu,
    title: 'AI System Architecture',
    description:
      'Enterprise-grade architecture for AI products and platforms — model orchestration, evaluation, governance, and continuous deployment.',
    features: [
      'LLM & agent orchestration',
      'Evaluation & guardrails',
      'Data & retrieval architecture',
      'MLOps & observability',
    ],
  },
];

export default function Services() {
  return (
    <>
      <PageHero
        badge="Practice"
        title={
          <>
            Six disciplines.<br />
            <span className="italic">One advisory firm.</span>
          </>
        }
        subtitle="From boardroom strategy to deployed architecture, every engagement weaves foresight, design, and engineering into a single intelligence practice."
      />

      <section className="relative pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <ServiceCard key={s.title} {...s} index={i} />
            ))}
          </div>
        </div>
      </section>

      <ProcessSteps />
      <CTASection
        title="Define your intelligence advantage."
        subtitle="Tell us about the problem worth solving. We'll tell you if it's a fit."
        cta="Schedule a Briefing"
      />
    </>
  );
}