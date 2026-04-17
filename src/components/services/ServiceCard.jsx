import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function ServiceCard({ icon: Icon, title, description, features, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group relative p-8 md:p-10 rounded-2xl border border-border bg-card/40 hover:bg-card/80 transition-colors overflow-hidden"
    >
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-accent/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <div className="w-12 h-12 rounded-xl bg-secondary/60 border border-border flex items-center justify-center">
            <Icon className="w-5 h-5 text-accent" />
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
            0{index + 1}
          </div>
        </div>
        <h3 className="font-display text-2xl md:text-[28px] mb-3 leading-tight">{title}</h3>
        <p className="text-muted-foreground leading-relaxed mb-7">{description}</p>
        <ul className="space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm">
              <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-foreground/85">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}