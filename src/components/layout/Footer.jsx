import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="font-display text-2xl font-bold text-white mb-4">MarketAI</div>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
            We combine cutting-edge artificial intelligence with creative excellence to deliver
            marketing strategies that drive unprecedented growth.
          </p>
        </div>
        <div>
          <div className="text-white font-semibold text-sm mb-4">Quick Links</div>
          <ul className="space-y-2.5 text-sm text-zinc-400">
            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
            <li><Link to="/services" className="hover:text-white transition">Services</Link></li>
            <li><Link to="/about" className="hover:text-white transition">About</Link></li>
            <li><Link to="/portfolio" className="hover:text-white transition">Portfolio</Link></li>
            <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold text-sm mb-4">Contact</div>
          <ul className="space-y-2.5 text-sm text-zinc-400">
            <li>hello@marketai.com</li>
            <li>+1 (234) 567-890</li>
            <li>123 Innovation Street</li>
            <li>Tech City, TC 10001</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-5">
        <p className="text-center text-xs text-zinc-600">© {new Date().getFullYear()} MarketAI. All rights reserved.</p>
      </div>
    </footer>
  );
}