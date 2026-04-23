import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileSelect({ value, options, onChange, placeholder, disabled, name, id }) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/40 border border-border hover:border-accent/50 transition text-sm disabled:opacity-50 text-left"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>{selectedLabel}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-card/95 backdrop-blur-md border-t border-border shadow-2xl max-h-[70vh] overflow-y-auto"
            >
              <div className="sticky top-0 px-4 py-4 border-b border-border/50 flex items-center justify-between bg-card/95 backdrop-blur-md">
                <span className="text-sm font-medium text-foreground">{placeholder || 'Select'}</span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  ✕
                </button>
              </div>
              <div className="py-2">
                {options.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange({ target: { name, value: option.value } });
                      setOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition ${
                      value === option.value
                        ? 'bg-accent/15 text-accent font-medium'
                        : 'text-foreground hover:bg-secondary/40'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}