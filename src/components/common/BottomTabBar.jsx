import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, LayoutDashboard } from 'lucide-react';

const TABS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/services', icon: Zap, label: 'Services' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
];

export default function BottomTabBar() {
  const { pathname } = useLocation();

  const handleTabClick = (e, tabTo) => {
    // If already on tab route, navigate to root of that tab
    if (pathname === tabTo && tabTo !== '/') {
      e.preventDefault();
      window.location.href = '/';
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-md border-t border-border z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}>
      <div className="flex justify-around items-center h-16">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = pathname === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              onClick={(e) => handleTabClick(e, tab.to)}
              className="flex flex-col items-center justify-center w-16 h-16 min-h-[44px] transition-colors"
            >
              <Icon className={`w-5 h-5 ${active ? 'text-accent' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] mt-0.5 ${active ? 'text-accent' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}