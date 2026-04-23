import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomTabBar from '@/components/common/BottomTabBar';
import MobileHeader from '@/components/common/MobileHeader';

export default function SiteLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#150f0a', color: '#f5f1e8', position: 'relative', overflowX: 'hidden' }}>
      <nav style={{ height: '64px', borderBottom: '1px solid #333', background: '#1a1410', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'fixed', top: 0, width: '100%', zIndex: 1000 }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d4af37' }}>Strategic.AI</div>
        <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
          <a href="/" style={{ color: '#f5f1e8', textDecoration: 'none' }}>Home</a>
          <a href="/services" style={{ color: '#f5f1e8', textDecoration: 'none' }}>Services</a>
          <a href="/dashboard" style={{ color: '#f5f1e8', textDecoration: 'none' }}>Dashboard</a>
        </div>
      </nav>
      <main style={{ flex: 1, paddingTop: '64px', overflowY: 'auto' }}>
        <Outlet />
      </main>
      <footer style={{ borderTop: '1px solid #333', background: '#1a1410', padding: '24px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
        © 2026 Strategic Minds. All rights reserved.
      </footer>
    </div>
  );
}