import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-border/60 mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="font-display text-3xl tracking-tight">
              Strategic<span className="text-accent">.</span>Minds
            </div>
            <p className="text-muted-foreground mt-4 max-w-sm leading-relaxed">
              An AI advisory firm engineering intelligence, foresight, and architecture for
              industries navigating the next decade.
            </p>
            <div className="hairline mt-8 max-w-sm" />
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mt-6">
              Est. 2021 — Operating Worldwide
            </p>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Navigate</div>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-accent transition">Home</Link></li>
              <li><Link to="/services" className="hover:text-accent transition">Services</Link></li>
              <li><Link to="/about" className="hover:text-accent transition">About</Link></li>
              <li><Link to="/portfolio" className="hover:text-accent transition">Portfolio</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Practice</div>
            <ul className="space-y-3 text-sm">
              <li>AI Strategic Advisory</li>
              <li>Intelligence & Data</li>
              <li>Predictive Simulation</li>
              <li>UI / UX Systems</li>
              <li>AI Architecture</li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Contact</div>
            <a href="mailto:strategicmindsadvisory@gmail.com" className="flex items-center gap-2 text-sm hover:text-accent transition">
              strategicmindsadvisory@gmail.com <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Pompano Beach<br />Florida
            </p>
          </div>
        </div>

        <div className="hairline mt-16" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-8 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Strategic Minds Advisory. All rights reserved.</p>
          <p className="tracking-[0.2em] uppercase">Intelligence · Foresight · Design</p>
        </div>
      </div>
    </footer>
  );
}