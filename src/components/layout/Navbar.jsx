import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
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

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-background/70 backdrop-blur-xl border-b border-border/60' : 'bg-transparent'
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

        <nav className="hidden md:flex items-center gap-10">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm transition-colors relative ${
                pathname === l.to ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {l.label}
              {pathname === l.to && (
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
            to="/contact"
            className="hidden md:inline-flex btn-ivory rounded-full px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
          >
            Begin Engagement
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-foreground"
            aria-label="Menu"
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
            className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {links.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-base ${
                    pathname === l.to ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/contact"
                className="btn-ivory rounded-full px-5 py-3 text-sm font-medium text-center mt-2"
              >
                Begin Engagement
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}