import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const ROUTES_WITH_BACK = ['/contact', '/services', '/about', '/portfolio', '/dashboard'];

export default function MobileHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const showBack = ROUTES_WITH_BACK.includes(pathname);

  if (!showBack) return null;

  return (
    <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-card/95 backdrop-blur-md border-b border-border z-40 flex items-center px-4" style={{ paddingTop: 'env(safe-area-inset-top)', paddingLeft: 'calc(1rem + env(safe-area-inset-left))', paddingRight: 'calc(1rem + env(safe-area-inset-right))' }}>
      <button
        onClick={() => navigate(-1)}
        className="p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-secondary transition"
        aria-label="Go back"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    </div>
  );
}