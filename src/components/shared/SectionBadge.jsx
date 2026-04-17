import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SectionBadge({ children, icon: Icon = Sparkles }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary/60 backdrop-blur-sm">
      <Icon className="w-3.5 h-3.5 text-accent" />
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{children}</span>
    </div>
  );
}