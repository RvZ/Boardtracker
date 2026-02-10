import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const navLinks = [
  { label: 'Dashboard', path: '/' },
  { label: 'Season', path: '/season' },
  { label: 'Map', path: '/map' },
  { label: 'Import', path: '/import' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isDemo = useAppStore((state) => state.isDemo);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#0a0e1a]/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🏂</span>
            <span className="font-display text-2xl tracking-wider text-white">
              BOARDTRACKER
            </span>
            {isDemo && (
              <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30 animate-pulse">
                DEMO
              </span>
            )}
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-[#38bdf8] bg-[#38bdf8]/10'
                    : 'text-[#dce4f5]/60 hover:text-[#dce4f5] hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-[#dce4f5]/60 hover:text-white transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0e1a]/95 backdrop-blur-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-[#38bdf8] bg-[#38bdf8]/10'
                    : 'text-[#dce4f5]/60 hover:text-[#dce4f5] hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
