import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomTabBar from '@/components/common/BottomTabBar';
import MobileHeader from '@/components/common/MobileHeader';
import FloatingAIChat from '@/components/services/FloatingAIChat';

export default function SiteLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-x-hidden md:pb-0 pb-16">
      <Navbar />
      <MobileHeader />
      <main className="flex-1 pt-20 md:pt-20">
        <Outlet />
      </main>
      <Footer />
      <BottomTabBar />
      <FloatingAIChat />
    </div>
  );
}