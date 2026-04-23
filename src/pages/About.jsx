import React from 'react';
import { motion } from 'framer-motion';
import PageHero from '@/components/shared/PageHero';
import Timeline from '@/components/about/Timeline';
import Values from '@/components/about/Values';
import TeamGrid from '@/components/about/TeamGrid';
import CTASection from '@/components/home/CTASection';

export default function About() {
  return (
    <>
      <PageHero
        badge="About the Firm"
        title={
          <>
            The future is<br />
            <span className="italic">a discipline.</span>
          </>
        }
        subtitle="Strategic Minds Advisory was founded to give leaders a calmer way to compete in a noisier decade — with foresight, design, and intelligence woven together."
      />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-14 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-5xl leading-[1.1] text-gradient-ivory">
              An advisory firm<br />for the intelligence era.
            </h2>
            <div className="hairline my-8 max-w-xs" />
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                We were founded in 2021 by advisors, engineers, and designers who had spent two
                decades deploying AI inside the world's most demanding organizations. We saw a gap:
                strategy firms couldn't build, and engineering shops couldn't advise.
              </p>
              <p>
                Strategic Minds exists in the space between. We think in quarters and decades. We
                work in diagrams and in code. We present to boards and deploy to production.
              </p>
              <p>
                Today we serve clients across finance, healthcare, defense, consumer, and creative
                industries — helping them treat intelligence as an operating discipline rather than
                a passing trend.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <Timeline />
          </motion.div>
        </div>
      </section>

      <Values />
      <TeamGrid />
      <CTASection
        title="Work with us — or join us."
        subtitle="We partner with leaders who think long. We hire people who do the same."
        cta="Start a Conversation"
      />
    </>
  );
}