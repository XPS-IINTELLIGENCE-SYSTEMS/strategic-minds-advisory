import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp } from 'lucide-react';

const projects = [
  { title: 'TechVenture Rebrand',      category: 'Branding',          metric: '+200%', desc: 'Complete brand overhaul for a leading tech startup, resulting in 200% increase in brand recognition.',      img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop' },
  { title: 'EcoLife Digital Campaign', category: 'Digital Marketing', metric: '+340%', desc: 'Multi-channel digital campaign that drove massive engagement and conversions.',                              img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop' },
  { title: 'Luxe Fashion Social',      category: 'Social Media',      metric: '+500K', desc: 'Social media strategy that transformed a boutique brand into a viral sensation.',                            img: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800&h=600&fit=crop' },
  { title: 'FinServ SEO Domination',   category: 'SEO',               metric: '+450%', desc: 'Comprehensive SEO strategy that achieved top rankings for competitive keywords.',                            img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop' },
  { title: 'NovaCorp Identity',        category: 'Branding',          metric: '+180%', desc: 'Modern corporate identity design for an enterprise technology company.',                                     img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop' },
  { title: 'FitLife App Launch',       category: 'Digital Marketing', metric: '1M+',   desc: 'Product launch campaign that made waves in the health & wellness space.',                                   img: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&h=600&fit=crop' },
];

const filters = ['All Projects', 'Branding', 'Digital Marketing', 'Social Media', 'SEO'];

const results = [
  { v: '500%', l: 'Average ROI' },
  { v: '50M+', l: 'Impressions Generated' },
  { v: '98%',  l: 'Client Retention' },
  { v: '150+', l: 'Projects Completed' },
];

export default function Portfolio() {
  const [active, setActive] = useState('All Projects');
  const filtered = active === 'All Projects' ? projects : projects.filter(p => p.category === active);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 text-center px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle, #ffffff22 1px, transparent 1px)', backgroundSize:'60px 60px'}} />
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 bg-zinc-900/60 backdrop-blur-sm mb-8">
          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          <span className="text-sm text-zinc-300">Our Work</span>
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight max-w-3xl mx-auto mb-6">
          Portfolio of<br />Excellence
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Explore our collection of successful projects that have transformed brands and delivered exceptional results.
        </p>
      </section>

      {/* Filters */}
      <section className="pb-10 px-6">
        <div className="flex flex-wrap justify-center gap-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                active === f
                  ? 'bg-white text-black'
                  : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="pb-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => (
            <div key={p.title} className="group rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors">
              <div className="relative overflow-hidden aspect-[4/3]">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-sm border border-zinc-700 text-xs text-green-400 font-medium">
                  <TrendingUp className="w-3 h-3" /> {p.metric}
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">{p.category}</p>
                <h3 className="font-display text-xl font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="py-24 bg-zinc-950 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-white mb-3">Results That Speak</h2>
            <p className="text-zinc-400">Our work consistently delivers measurable impact for our clients.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {results.map(r => (
              <div key={r.l}>
                <div className="font-display text-5xl font-bold text-white mb-2">{r.v}</div>
                <div className="text-zinc-400 text-sm">{r.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center px-6">
        <h2 className="font-display text-4xl font-bold text-white mb-4">Your Project Could Be Next</h2>
        <p className="text-zinc-400 mb-8">Let's create something extraordinary together. Start your transformation today.</p>
        <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-zinc-200 transition">
          Start Your Project
        </Link>
      </section>
    </>
  );
}