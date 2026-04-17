import React from 'react';
import { motion } from 'framer-motion';
import SectionBadge from './SectionBadge';

export default function PageHero({ badge, title, subtitle, children }) {
  return (
    <section className="relative overflow-hidden noise">
      <div className="absolute inset-0 ambient-glow pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-6 lg:px-10 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <SectionBadge>{badge}</SectionBadge>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl leading-[1.05] mt-8 text-gradient-ivory"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl mt-7 max-w-2xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}