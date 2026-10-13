import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  Menu,
  X,
  Newspaper,
  Calendar,
  Megaphone,
  Trophy,
  Users,
  Activity,
  Briefcase,
  Mic,
  PenTool,
  Shield,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Latest News', path: '/news' },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Announcements', path: '/announcements', icon: Megaphone },
    { name: 'Activities', path: '/activities', icon: Users },
    { name: 'Achievements', path: '/achievements', icon: Trophy },
    { name: 'Clubs', path: '/clubs' },
    { name: 'Sports', path: '/sports', icon: Activity },
    { name: 'Placements', path: '/placements', icon: Briefcase },
    { name: 'Interviews', path: '/interviews', icon: Mic },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-20 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2 overflow-x-auto no-scrollbar py-1">
            {navLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                {link.icon && <link.icon className="w-3.5 h-3.5 opacity-80" />}
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>

          {/* Quick Submit & Admin Actions on Right */}
          <div className="hidden lg:flex items-center gap-2">
            <NavLink
              to="/submit-article"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm transition-all whitespace-nowrap"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Submit News</span>
            </NavLink>

            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </NavLink>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center justify-between w-full">
            <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
              Campus Sections
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 px-4 pt-2 pb-5 space-y-1 bg-slate-900">
          <div className="grid grid-cols-2 gap-1.5 py-2">
            {navLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {link.icon && <link.icon className="w-3.5 h-3.5" />}
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <NavLink
              to="/submit-article"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold bg-emerald-600 text-white text-center"
            >
              <PenTool className="w-4 h-4" />
              <span>Submit News Article</span>
            </NavLink>

            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold bg-blue-600 text-white text-center"
              >
                <Shield className="w-4 h-4" />
                <span>Open Admin Dashboard</span>
              </NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
