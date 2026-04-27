import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { to: '/', label: 'Home' },
  { to: '/ai-in-action', label: 'AI In Action' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/services', label: 'Services' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (to) => pathname === to || (to !== '/' && pathname.startsWith(to));

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-background/70 backdrop-blur-xl border-b border-border/60' : 'bg-background/35 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-display text-[22px] md:text-2xl tracking-tight leading-none">
            Strategic<span className="text-accent">.</span>Minds
          </span>
          <span className="hidden md:block text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-l border-border pl-2 ml-1">
            Advisory
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm transition-colors relative ${
                isActive(l.to) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {l.label}
              {isActive(l.to) && (
                <motion.span
                  layoutId="nav-dot"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden md:inline-flex btn-ivory rounded-full px-5 py-2.5 text-sm font-medium hover:opacity-90 transition min-h-[44px] min-w-[44px] justify-center"
          >
            Open Dashboard
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-border/60 bg-background/60 hover:bg-secondary transition"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-background/95 backdrop-blur-xl border-t border-border shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-6 py-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {links.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`rounded-2xl border px-5 py-4 transition text-left ${
                    isActive(l.to)
                      ? 'border-accent/60 bg-accent/10 text-foreground'
                      : 'border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                >
                  <span className="block text-sm font-medium">{l.label}</span>
                  <span className="block text-xs mt-1 opacity-75">
                    {l.to === '/dashboard' && 'Live command center and operating dashboard'}
                    {l.to === '/projects' && 'Project and proof backlog'}
                    {l.to === '/ai-in-action' && 'Million-Dollar GPT Challenge surface'}
                    {l.to === '/' && 'Public homepage'}
                    {l.to === '/services' && 'Advisory services'}
                    {l.to === '/portfolio' && 'Proof and work examples'}
                    {l.to === '/contact' && 'Contact and intake'}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}