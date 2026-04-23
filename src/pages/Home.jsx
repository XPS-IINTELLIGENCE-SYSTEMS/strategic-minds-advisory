import React from 'react';
import Hero from '@/components/home/Hero';
import StatsStrip from '@/components/home/StatsStrip';
import Pillars from '@/components/home/Pillars';
import Manifesto from '@/components/home/Manifesto';
import Testimonials from '@/components/home/Testimonials';
import CTASection from '@/components/home/CTASection';

const HERO_BG = 'https://base44.app/api/apps/assets/img_1e0fead8cc07.png';

export default function Home() {
  return (
    <div style={{ background: '#150f0a', color: '#f5f1e8' }}>
      <div style={{ height: '600px', background: 'linear-gradient(135deg, #d4af37 0%, #8b7500 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#150f0a', fontSize: '56px', fontWeight: 'bold', textAlign: 'center' }}>
        Strategic Intelligence Platform
      </div>
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Drive Strategic Decisions with AI</h2>
        <p style={{ fontSize: '16px', color: '#aaa', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Run simulations, predict market trends, analyze competitors, and execute strategies with AI-powered intelligence.
        </p>
        <button style={{ marginTop: '40px', padding: '12px 32px', background: '#d4af37', color: '#150f0a', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px' }}>
          Get Started
        </button>
      </div>
      <div style={{ background: '#1a1410', padding: '60px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {[
            { title: 'AI Simulations', desc: 'Model complex business scenarios' },
            { title: 'Predictions', desc: 'Forecast market trends accurately' },
            { title: 'Competitive Analysis', desc: 'Benchmark against competitors' },
            { title: 'Strategy Execution', desc: 'Turn decisions into action' }
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d4af37', marginBottom: '10px' }}>{item.title}</div>
              <div style={{ fontSize: '14px', color: '#aaa' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}