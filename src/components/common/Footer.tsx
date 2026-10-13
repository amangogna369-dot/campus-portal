import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useNotifications } from '../../context/NotificationContext.js';
import {
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Send,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Heart,
  ShieldCheck,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { showToast } = useNotifications();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    setIsSubscribing(true);
    try {
      const res = await api.subscribeNewsletter(email);
      showToast(res.message, 'success');
      setEmail('');
    } catch (err: any) {
      showToast(err.message || 'Failed to subscribe to newsletter', 'error');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1 & 2: Branding & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white font-serif">
                  CAMPUS NEWS PORTAL
                </span>
                <p className="text-xs text-blue-400 font-semibold tracking-wide">
                  BCA MINOR PROJECT
                </p>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The central digital media and news publication hub for students, faculty, and administrative departments. Delivering timely verified bulletins, achievements, and events.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Subscribe to Weekly Digest
              </span>
              <form onSubmit={handleSubscribe} className="mt-2 flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your university email..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Join</span>
                </button>
              </form>
            </div>
          </div>

          {/* Col 3: Campus Coverage */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              News Beats
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/news?category=campus-news" className="hover:text-blue-400 transition-colors">
                  Campus News & Notices
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-blue-400 transition-colors">
                  Workshops & Hackathons
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="hover:text-blue-400 transition-colors">
                  Exam & Academic Circulars
                </Link>
              </li>
              <li>
                <Link to="/achievements" className="hover:text-blue-400 transition-colors">
                  Student & Faculty Honors
                </Link>
              </li>
              <li>
                <Link to="/placements" className="hover:text-blue-400 transition-colors">
                  Placements & Career Cell
                </Link>
              </li>
              <li>
                <Link to="/sports" className="hover:text-blue-400 transition-colors">
                  Varsity Sports & Tournaments
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Portals & Services
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/submit-article" className="hover:text-blue-400 transition-colors">
                  Submit News Article
                </Link>
              </li>
              <li>
                <Link to="/clubs" className="hover:text-blue-400 transition-colors">
                  Clubs & Tech Societies
                </Link>
              </li>
              <li>
                <Link to="/interviews" className="hover:text-blue-400 transition-colors">
                  Alumni & Dean Spotlights
                </Link>
              </li>
              <li>
                <Link to="/activities" className="hover:text-blue-400 transition-colors">
                  Cultural Affairs & Festivals
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors">
                  Editorial Board & Standards
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition-colors">
                  Press & Grievance Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Campus Address & Emergency */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Varsity Desk
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Media Wing, Administrative Complex, University Campus, Knowledge Park III</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+91 11 2345 6789 (Ext: 204)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>editorial@campusnews.local</span>
              </div>
              <div className="pt-2 flex items-center gap-3 text-slate-400">
                <a href="#github" className="hover:text-white transition-colors" title="GitHub">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#twitter" className="hover:text-white transition-colors" title="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#linkedin" className="hover:text-white transition-colors" title="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#instagram" className="hover:text-white transition-colors" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & project credit */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>© 2026 Campus News Portal. All rights reserved. BCA Final Capstone Project.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-300 transition-colors">
              Project Architecture
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">
              Editorial Guidelines
            </Link>
            <span>•</span>
            <Link to="/login" className="hover:text-slate-300 transition-colors">
              Staff Sign In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
