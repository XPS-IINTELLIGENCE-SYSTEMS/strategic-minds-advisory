import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl text-white tracking-tight">
          <span className="font-black">Strategic Minds</span>
          <span className="font-thin">&nbsp;&nbsp;Advisory</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm transition-colors ${pathname === l.to ? 'text-white font-medium' : 'text-zinc-400 hover:text-white'}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/contact"
            className="hidden md:inline-flex items-center px-5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 transition"
          >
            Get Started
          </Link>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-white">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800 px-6 py-5 flex flex-col gap-4">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`text-sm ${pathname === l.to ? 'text-white' : 'text-zinc-400'}`}>
              {l.label}
            </Link>
          ))}
          <Link to="/contact" className="mt-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium text-center">
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}