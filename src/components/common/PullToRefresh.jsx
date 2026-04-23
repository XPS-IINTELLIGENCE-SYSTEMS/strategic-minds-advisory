import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (containerRef.current?.scrollTop === 0 && startY.current) {
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0) {
        setPull(Math.min(diff / 60, 1));
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pull > 0.5 && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPull(0);
    startY.current = 0;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchmove', handleTouchMove);
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pull, isRefreshing, onRefresh]);

  return (
    <div ref={containerRef} className="relative overflow-hidden h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: pull > 0.2 ? 1 : 0 }}
        className="absolute top-0 inset-x-0 h-12 flex items-center justify-center pointer-events-none"
      >
        <motion.div animate={{ rotate: isRefreshing ? 360 : pull * 180 }} transition={{ duration: isRefreshing ? 1 : 0 }} className="repeat-infinite">
          <RefreshCw className="w-5 h-5 text-accent" />
        </motion.div>
      </motion.div>
      <div style={{ transform: `translateY(${pull * 40}px)` }}>
        {children}
      </div>
    </div>
  );
}