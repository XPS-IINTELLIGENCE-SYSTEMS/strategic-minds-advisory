import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Target, Lightbulb, Handshake, Star } from 'lucide-react';
import HexagonField from '@/components/shared/HexagonField';

const journey = [
  { year: '2019', text: 'MarketAI founded with a vision to revolutionize marketing' },
  { year: '2020', text: 'Launched AI-powered analytics platform' },
  { year: '2021', text: 'Expanded to serve clients in 20+ countries' },
  { year: '2022', text: 'Recognized as Top Marketing Agency by Forbes' },
  { year: '2023', text: 'Reached $10M+ in generated client revenue' },
  { year: '2024', text: 'Pioneering next-gen marketing solutions' },
];

const values = [
  { icon: Target,     title: 'Results-Driven',    desc: 'Every strategy we create is designed with measurable outcomes in mind. We don\'t just aim for vanity metrics.' },
  { icon: Lightbulb,  title: 'Innovation First',  desc: 'We stay ahead of the curve by continuously exploring new technologies and creative approaches.' },
  { icon: Handshake,  title: 'Client Partnership', desc: 'We treat every client relationship as a partnership, invested in your success as much as you are.' },
  { icon: Star,       title: 'Excellence Always', desc: 'We hold ourselves to the highest standards in everything we do, from strategy to execution.' },
];

const team = [
  { name: 'Alexandra Reed', role: 'CEO & Founder',         bio: 'Former Google executive with 15+ years in digital marketing.',   img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face' },
  { name: 'Marcus Chen',    role: 'Chief Technology Officer', bio: 'AI researcher turned marketing technologist.',                  img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face' },
  { name: 'Sophia Martinez', role: 'Creative Director',    bio: 'Award-winning designer with a passion for brand storytelling.',  img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face' },
  { name: 'David Kim',      role: 'Head of Strategy',      bio: 'Strategic mind with experience at Fortune 500 companies.',        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face' },
];

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 text-center px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle, #ffffff22 1px, transparent 1px)', backgroundSize:'60px 60px'}} />
        <HexagonField />
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 bg-zinc-900/60 backdrop-blur-sm mb-8">
          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          <span className="text-sm text-zinc-300">About Us</span>
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight max-w-3xl mx-auto mb-6">
          The Future of Marketing<br />Starts Here
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          We're a team of innovators, strategists, and creatives united by a single mission: to help
          brands thrive in the digital age through intelligent marketing solutions.
        </p>
      </section>

      {/* Story + Timeline */}
      <section className="py-20 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <h2 className="font-display text-4xl font-bold text-white mb-6">Our Story</h2>
          <div className="space-y-4 text-zinc-400 leading-relaxed text-sm">
            <p>MarketAI was born from a simple observation: traditional marketing was becoming obsolete. In 2019, our founders saw an opportunity to bridge the gap between cutting-edge AI technology and creative marketing excellence.</p>
            <p>What started as a small team of data scientists and marketers has grown into a full-service agency trusted by brands worldwide. We've helped companies of all sizes transform their digital presence and achieve unprecedented growth.</p>
            <p>Today, we continue to push the boundaries of what's possible in marketing, combining human creativity with artificial intelligence to deliver results that exceed expectations.</p>
          </div>
        </div>
        <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h3 className="font-display text-2xl font-semibold text-white mb-6">Our Journey</h3>
          <div className="space-y-0">
            {journey.map((j, i) => (
              <div key={j.year} className={`flex gap-6 py-4 ${i < journey.length - 1 ? 'border-b border-zinc-800' : ''}`}>
                <div className="font-display text-lg font-bold text-zinc-500 w-14 flex-shrink-0">{j.year}</div>
                <p className="text-zinc-300 text-sm">{j.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-zinc-950 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-zinc-400">The principles that guide everything we do.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(v => (
              <div key={v.title} className="p-7 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center mb-5">
                  <v.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-2">{v.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Meet Our Team</h2>
          <p className="text-zinc-400">The brilliant minds behind MarketAI's success.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map(m => (
            <div key={m.name} className="text-center">
              <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4 border-2 border-zinc-700">
                <img src={m.img} alt={m.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white">{m.name}</h3>
              <p className="text-zinc-400 text-xs mt-1 mb-2">{m.role}</p>
              <p className="text-zinc-500 text-sm leading-relaxed">{m.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-800 text-center px-6">
        <h2 className="font-display text-4xl font-bold text-white mb-4">Join Our Journey</h2>
        <p className="text-zinc-400 mb-8">Whether you're looking to partner with us or join our team, we'd love to hear from you.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/contact" className="px-8 py-3.5 rounded-full bg-white text-black font-medium hover:bg-zinc-200 transition text-sm">Work With Us</Link>
          <Link to="/contact" className="px-8 py-3.5 rounded-full border border-zinc-600 text-white font-medium hover:border-zinc-400 transition text-sm">View Careers</Link>
        </div>
      </section>
    </>
  );
}