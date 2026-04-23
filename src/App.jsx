import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import SiteLayout from '@/components/layout/SiteLayout';
import PWAInstaller from '@/lib/PWAInstaller';
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import About from '@/pages/About';
import Portfolio from '@/pages/Portfolio';
import Contact from '@/pages/Contact';
import Dashboard from '@/pages/Dashboard';
import AutoInventionSystemGuide from '@/pages/AutoInventionSystemGuide';
import EliteIntelligenceSystemGuide from '@/pages/EliteIntelligenceSystemGuide';
import PageTransition from '@/components/common/PageTransition';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
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