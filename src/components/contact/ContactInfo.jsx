import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const items = [
  { icon: Mail, label: 'Email', value: 'hello@strategicminds.ai' },
  { icon: Phone, label: 'Phone', value: '+1 (212) 555-0144' },
  { icon: MapPin, label: 'Studios', value: 'New York · London · Singapore' },
  { icon: Clock, label: 'Hours', value: 'Mon – Fri · 9:00 – 18:00 (ET)' },
];

export default function ContactInfo() {
  return (
    <div className="space-y-5">
      <h3 className="font-display text-3xl md:text-4xl text-gradient-ivory">Get in touch</h3>
      <p className="text-muted-foreground leading-relaxed max-w-md">
        Engagements begin with a confidential briefing. Share as much or as little as you'd like —
        an advisor will take it from there.
      </p>

      <div className="space-y-3 pt-3">
        {items.map((i) => (
          <div
            key={i.label}
            className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card/50"
          >
            <div className="w-11 h-11 rounded-xl bg-secondary/60 border border-border flex items-center justify-center flex-shrink-0">
              <i.icon className="w-4 h-4 text-accent" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {i.label}
              </div>
              <div className="text-sm mt-1 truncate">{i.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}