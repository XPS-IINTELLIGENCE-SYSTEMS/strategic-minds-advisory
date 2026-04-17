import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CircleDot, BarChart2, Megaphone, Search, Palette, Share2, CheckCircle2 } from 'lucide-react';

const services = [
  {
    icon: CircleDot,
    title: 'AI Marketing Strategy',
    desc: 'Leverage advanced AI algorithms to create data-driven marketing strategies that predict trends and optimize campaigns in real-time.',
    features: ['Predictive Analytics', 'Audience Segmentation', 'Campaign Automation', 'Performance Forecasting'],
  },
  {
    icon: BarChart2,
    title: 'Data Analytics & Insights',
    desc: 'Transform raw data into actionable insights with our comprehensive analytics solutions that drive informed decision-making.',
    features: ['Custom Dashboards', 'Real-time Reporting', 'Competitor Analysis', 'ROI Tracking'],
  },
  {
    icon: Megaphone,
    title: 'Digital Advertising',
    desc: 'Maximize your ad spend with precision-targeted campaigns across all major platforms, optimized by machine learning.',
    features: ['PPC Management', 'Programmatic Ads', 'Retargeting Campaigns', 'A/B Testing'],
  },
  {
    icon: Search,
    title: 'SEO & Content Strategy',
    desc: 'Dominate search rankings with AI-powered SEO strategies and compelling content that resonates with your audience.',
    features: ['Technical SEO', 'Content Optimization', 'Link Building', 'Voice Search SEO'],
  },
  {
    icon: Palette,
    title: 'Brand Development',
    desc: 'Build a memorable brand identity that connects with your audience and sets you apart from the competition.',
    features: ['Brand Strategy', 'Visual Identity', 'Brand Guidelines', 'Messaging Framework'],
  },
  {
    icon: Share2,
    title: 'Social Media Management',
    desc: 'Engage and grow your audience across all social platforms with strategic content and community management.',
    features: ['Content Calendar', 'Community Management', 'Influencer Partnerships', 'Social Listening'],
  },
];

const process = [
  { n: '01', title: 'Discovery',  desc: 'We dive deep into your business, goals, and market landscape.' },
  { n: '02', title: 'Strategy',   desc: 'Our AI analyzes data to craft a customized marketing blueprint.' },
  { n: '03', title: 'Execution',  desc: 'We implement campaigns with precision and continuous optimization.' },
  { n: '04', title: 'Analysis',   desc: 'Track results, iterate, and scale what works best.' },
];

export default function Services() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 text-center px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle, #ffffff22 1px, transparent 1px)', backgroundSize:'60px 60px'}} />
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 bg-zinc-900/60 backdrop-blur-sm mb-8">
          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          <span className="text-sm text-zinc-300">Our Services</span>
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight max-w-3xl mx-auto mb-6">
          Marketing Solutions<br />That Drive Results
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          From AI-powered strategies to creative execution, we offer comprehensive marketing
          services designed to accelerate your business growth.
        </p>
      </section>

      {/* Cards */}
      <section className="pb-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <div key={s.title} className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-6">
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-white mb-3">{s.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">{s.desc}</p>
              <ul className="space-y-2.5">
                {s.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-zinc-950 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Our Process</h2>
            <p className="text-zinc-400">A systematic approach to delivering exceptional marketing results.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {process.map(p => (
              <div key={p.n} className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="font-display text-5xl font-bold text-zinc-700 mb-5">{p.n}</div>
                <h3 className="font-display text-2xl font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center px-6">
        <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p className="text-zinc-400 mb-8">Let's discuss how our services can help you achieve your marketing goals.</p>
        <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-zinc-200 transition">
          Schedule a Consultation
        </Link>
      </section>
    </>
  );
}