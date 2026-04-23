import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActionSheet({ label, value, options, onChange, disabled }) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find(o => o.value === value)?.label || label;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/40 border border-border hover:border-accent/50 transition text-sm disabled:opacity-50"
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-lg z-50 overflow-hidden"
          >
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-secondary transition border-b border-border/50 last:border-b-0 text-foreground"
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}