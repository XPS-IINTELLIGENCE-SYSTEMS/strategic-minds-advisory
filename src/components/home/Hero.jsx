import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, LogIn } from 'lucide-react';

export default function Hero({ bgImage }) {
  return (
    <section style={{
      position: 'relative',
      minHeight: '92vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {bgImage && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.5,
        }} />
      )}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(21,15,10,0.4), rgba(21,15,10,0.6), rgb(21,15,10))',
      }} />

      <div style={{
        position: 'relative',
        maxWidth: '96rem',
        margin: '0 auto',
        padding: '0 1.5rem',
        textAlign: 'center',
        paddingTop: '112px',
        paddingBottom: '112px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            border: '1px solid rgba(212,175,55,0.2)',
            background: 'rgba(212,175,55,0.1)',
            backdropFilter: 'blur(8px)',
          }}>
            <Sparkles style={{ width: '14px', height: '14px', color: '#d4af37' }} />
            <span style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.0625em',
              color: '#9ca3af',
            }}>
              AI Consulting for Every Industry
            </span>
          </div>
        </div>

        <h1 style={{
          fontFamily: 'Fraunces, serif',
          fontSize: 'clamp(48px, 12vw, 96px)',
          lineHeight: 0.98,
          marginTop: '2.5rem',
          letterSpacing: '-0.01em',
          marginBottom: '2rem',
        }}>
          <span style={{
            background: 'linear-gradient(180deg, hsl(40 35% 96%) 0%, hsl(30 15% 62%) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}>
            Intelligence
          </span>
          <br />
          <span style={{
            fontStyle: 'italic',
            background: 'linear-gradient(120deg, hsl(40 35% 96%) 0%, hsl(36 55% 70%) 50%, hsl(30 15% 62%) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}>
            that advises.
          </span>
        </h1>

        <p style={{
          color: '#9ca3af',
          fontSize: '1.125rem',
          maxWidth: '42rem',
          margin: '0 auto 3rem',
          lineHeight: 1.5,
        }}>
          Strategic Minds Advisory engineers AI strategy, predictive simulation, data intelligence,
          and human-centered systems for organizations shaping what's next.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '1rem',
          justifyContent: 'center',
          marginTop: '3rem',
          flexWrap: 'wrap',
        }}>
          <Link to="/contact" style={{
            background: 'linear-gradient(180deg, hsl(40 30% 98%) 0%, hsl(35 15% 85%) 100%)',
            color: '#150f0a',
            borderRadius: '9999px',
            padding: '0.875rem 1.75rem',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'opacity 0.2s',
          }}>
            Begin Engagement
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
          <button onClick={() => window.location.href = '/dashboard'} style={{
            borderRadius: '9999px',
            padding: '0.875rem 1.75rem',
            fontSize: '14px',
            fontWeight: 500,
            border: '1px solid rgba(212,175,55,0.5)',
            background: 'rgba(212,175,55,0.1)',
            color: '#d4af37',
            cursor: 'pointer',
            transition: 'background 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <LogIn style={{ width: '16px', height: '16px' }} />
            Dashboard
          </button>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
        }}>
          <div style={{
            width: '26px',
            height: '42px',
            border: '1px solid #3d3229',
            borderRadius: '9999px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '6px',
          }}>
            <div style={{
              width: '4px',
              height: '6px',
              background: '#d4af37',
              borderRadius: '9999px',
            }} />
          </div>
        </div>
      </div>
    </section>
  );
}