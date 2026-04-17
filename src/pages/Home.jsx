import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Brain, TrendingUp, Users, Clock, Quote } from 'lucide-react';
import HexagonField from '@/components/shared/HexagonField';
import HexGlowCorner from '@/components/shared/HexGlowCorner';
import HexPattern from '@/components/shared/HexPattern';

const LAPTOP_BG = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&h=900&fit=crop';

const stats = [
  { value: '500+', label: 'Clients Worldwide' },
  { value: '98%',  label: 'Client Satisfaction' },
  { value: '10M+', label: 'Revenue Generated' },
  { value: '24/7', label: 'AI-Powered Support' },
];

const features = [
  { icon: Brain,     title: 'AI-Driven Insights',      desc: 'Leverage machine learning to understand your audience like never before.' },
  { icon: TrendingUp, title: 'Growth Optimization',    desc: 'Data-backed strategies that consistently deliver measurable results.' },
  { icon: Users,     title: 'Audience Targeting',      desc: 'Precision targeting that connects your brand with the right customers.' },
  { icon: Clock,     title: 'Real-Time Analytics',     desc: 'Monitor and adapt your campaigns with instant performance data.' },
];

const testimonials = [
  { quote: 'MarketAI transformed our digital presence completely. The results exceeded all expectations.', name: 'Sarah Chen',     role: 'CEO, TechStart Inc.' },
  { quote: 'The AI-powered insights gave us an edge over competitors we never thought possible.',          name: 'Michael Torres', role: 'Marketing Director, Nova Corp' },
  { quote: 'Professional, innovative, and results-driven. The best marketing decision we ever made.',      name: 'Emma Williams',  role: 'Founder, Bloom Studios' },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        {/* dot grid */}
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle, #ffffff22 1px, transparent 1px)', backgroundSize:'60px 60px'}} />
        <HexPattern />
        <HexagonField />
        <HexGlowCorner />

        <div className="relative text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 bg-zinc-900/60 backdrop-blur-sm mb-8">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span className="text-sm text-zinc-300">AI-Powered Marketing Solutions</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Elevate Your Brand<br />With Intelligence
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">
            We combine cutting-edge artificial intelligence with creative excellence to deliver
            marketing strategies that drive unprecedented growth and engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black font-medium hover:bg-zinc-200 transition text-sm">
              Start Your Journey <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/portfolio" className="inline-flex items-center px-7 py-3.5 rounded-full border border-zinc-600 text-white font-medium hover:border-zinc-400 transition text-sm">
              View Our Work
            </Link>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-zinc-600 rounded-full flex justify-center items-start pt-1.5">
            <div className="w-1 h-2 bg-zinc-400 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <div className="font-display text-4xl md:text-5xl font-bold text-white">{s.value}</div>
              <div className="text-zinc-400 text-sm mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Why Choose MarketAI
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            We don't just follow trends—we create them. Our approach combines human creativity with AI precision.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(f => (
            <div key={f.title} className="p-7 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition">
              <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center mb-5">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-zinc-950 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Client Testimonials</h2>
            <p className="text-zinc-400">Don't just take our word for it. Here's what our clients have to say.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map(t => (
              <div key={t.name} className="p-7 rounded-2xl bg-zinc-900 border border-zinc-800">
                <Quote className="w-6 h-6 text-zinc-600 mb-4" />
                <p className="text-zinc-300 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div>
                  <div className="text-white font-medium text-sm">{t.name}</div>
                  <div className="text-zinc-500 text-xs mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
          Ready to Transform Your Marketing?
        </h2>
        <p className="text-zinc-400 mb-10 max-w-xl mx-auto">
          Join hundreds of forward-thinking brands that have elevated their digital presence with MarketAI.
        </p>
        <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-zinc-200 transition">
          Get Your Free Consultation
        </Link>
      </section>
    </>
  );
}