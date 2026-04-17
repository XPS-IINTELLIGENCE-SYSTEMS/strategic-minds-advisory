import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTASection({
  title = 'Ready to think further ahead?',
  subtitle = 'Start the conversation. Our advisors respond within one business day.',
  cta = 'Begin Engagement',
  to = '/contact',
}) {
  return (
    <section className="relative py-28">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl border border-border bg-card/60 overflow-hidden p-10 md:p-20 text-center"
        >
          <div className="absolute inset-0 ambient-glow opacity-80 pointer-events-none" />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-gradient-ivory max-w-3xl mx-auto">
              {title}
            </h2>
            <p className="text-muted-foreground text-lg mt-6 max-w-xl mx-auto leading-relaxed">
              {subtitle}
            </p>
            <Link
              to={to}
              className="btn-ivory rounded-full px-7 py-3.5 text-sm font-medium inline-flex items-center gap-2 mt-10 hover:opacity-90 transition group"
            >
              {cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}