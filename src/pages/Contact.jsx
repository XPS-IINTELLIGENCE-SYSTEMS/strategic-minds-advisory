import React from 'react';
import PageHero from '@/components/shared/PageHero';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';
import FAQ from '@/components/contact/FAQ';

export default function Contact() {
  return (
    <>
      <PageHero
        badge="Begin an Engagement"
        title={
          <>
            Let's design<br />
            <span className="italic">what's next.</span>
          </>
        }
        subtitle="A brief note is enough. We respond personally within one business day."
      />

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-10 items-start">
          <ContactForm />
          <ContactInfo />
        </div>
      </section>

      <FAQ />
    </>
  );
}