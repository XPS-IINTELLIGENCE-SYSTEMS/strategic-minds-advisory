import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {showInstall && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-display text-sm font-medium text-foreground">Install App</h3>
              <p className="text-xs text-muted-foreground mt-1">Download Strategic.AI to your device for offline access</p>
            </div>
            <button onClick={() => setShowInstall(false)} className="p-1 hover:bg-secondary rounded transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleInstall}
            className="w-full mt-3 py-2 bg-accent text-primary-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Install
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}