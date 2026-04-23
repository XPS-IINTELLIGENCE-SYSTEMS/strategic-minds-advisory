import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import PWAInstaller from '@/lib/PWAInstaller';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';

function MainLayout({ children }) {
  return (
    <div style={{ background: '#150f0a', color: '#f5f1e8', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#1a1410', borderBottom: '1px solid #333', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d4af37' }}>Strategic.AI</div>
        <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
          <a href="/" style={{ color: '#f5f1e8', textDecoration: 'none', cursor: 'pointer' }}>Home</a>
          <a href="/dashboard" style={{ color: '#f5f1e8', textDecoration: 'none', cursor: 'pointer' }}>Dashboard</a>
        </div>
      </nav>
      <main style={{ flex: 1, width: '100%', overflowY: 'auto' }}>
        {children}
      </main>
      <footer style={{ background: '#1a1410', borderTop: '1px solid #333', padding: '24px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
        © 2026 Strategic Minds. All rights reserved.
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<MainLayout><PageNotFound /></MainLayout>} />
          </Routes>
        </AnimatePresence>
      </Router>
      <Toaster />
      <PWAInstaller />
    </QueryClientProvider>
  )
}

export default App