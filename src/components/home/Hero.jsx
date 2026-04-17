import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero({ bgImage }) {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden noise">
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      <div className="absolute inset-0 ambient-glow pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-10 text-center py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/80 bg-secondary/40 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              AI Consulting for Every Industry
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-[48px] md:text-[96px] leading-[0.98] mt-10 tracking-tight"
        >
          <span className="text-gradient-ivory">Intelligence</span>
          <br />
          <span className="italic text-gradient-accent">that advises.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="text-muted-foreground text-lg md:text-xl mt-8 max-w-2xl mx-auto leading-relaxed"
        >
          Strategic Minds Advisory engineers AI strategy, predictive simulation, data intelligence,
          and human-centered systems for organizations shaping what's next.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
        >
          <Link
            to="/contact"
            className="btn-ivory rounded-full px-7 py-3.5 text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 transition group"
          >
            Begin Engagement
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/services"
            className="rounded-full px-7 py-3.5 text-sm font-medium border border-border bg-secondary/40 backdrop-blur-sm hover:bg-secondary transition"
          >
            Explore Practice
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-[26px] h-[42px] border border-border rounded-full flex justify-center items-start p-1.5">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-1.5 bg-accent rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}