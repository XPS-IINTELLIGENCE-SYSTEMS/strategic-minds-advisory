import React from 'react';
import { Lightbulb, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const SUGGESTION_TEMPLATES = [
  { icon: Lightbulb, text: 'Dig deeper into this', color: 'text-amber-400' },
  { icon: TrendingUp, text: 'Show me the metrics', color: 'text-green-400' },
  { icon: AlertCircle, text: 'What could go wrong?', color: 'text-red-400' },
  { icon: Zap, text: 'Make this actionable', color: 'text-blue-400' },
];

export default function MessageSuggestions({ onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {SUGGESTION_TEMPLATES.map((sug, i) => {
        const Icon = sug.icon;
        return (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(sug.text)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-secondary/40 border border-border hover:border-accent/50 hover:bg-secondary/60 transition text-xs text-muted-foreground hover:text-foreground"
          >
            <Icon className={`w-3 h-3 flex-shrink-0 ${sug.color}`} />
            <span className="hidden sm:block">{sug.text}</span>
            <span className="sm:hidden text-[10px]">{sug.text.substring(0, 4)}</span>
          </motion.button>
        );
      })}
    </div>
  );
}