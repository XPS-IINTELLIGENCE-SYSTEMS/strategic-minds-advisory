import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import SiteLayout from '@/components/layout/SiteLayout';
import PWAInstaller from '@/lib/PWAInstaller';
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import About from '@/pages/About';
import Portfolio from '@/pages/Portfolio';
import Contact from '@/pages/Contact';
import Dashboard from '@/pages/Dashboard';
import ProjectDashboard from '@/pages/ProjectDashboard';
import AutoInventionSystemGuide from '@/pages/AutoInventionSystemGuide';
import EliteIntelligenceSystemGuide from '@/pages/EliteIntelligenceSystemGuide';
import PageTransition from '@/components/common/PageTransition';

const AuthenticatedApp = () => {
  const context = useAuth();
  const isLoading = context?.isLoadingPublicSettings || context?.isLoadingAuth;
  const authChecked = context?.authChecked;

  // Only show loading if still checking
  if (isLoading && !authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1410' }}>
        <div style={{ width: '32px', height: '32px', border: '4px solid #333', borderTopColor: '#d4af37', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Render the main app (always show public pages)
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/auto-invention" element={<PageTransition><AutoInventionSystemGuide /></PageTransition>} />
          <Route path="/elite-intelligence" element={<PageTransition><EliteIntelligenceSystemGuide /></PageTransition>} />
        </Route>
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/projects" element={<PageTransition><ProjectDashboard /></PageTransition>} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
};


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <PWAInstaller />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App