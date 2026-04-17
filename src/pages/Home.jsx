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
    <>
      <Hero bgImage={HERO_BG} />
      <StatsStrip />
      <Pillars />
      <Manifesto />
      <Testimonials />
      <CTASection />
    </>
  );
}