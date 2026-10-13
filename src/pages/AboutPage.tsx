import React from 'react';
import { GraduationCap, ShieldCheck, Users, Code, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  const editorialBoard = [
    { name: 'Dr. Alok Verma', role: 'Chief Editor & Administrator', dept: 'College Administration & IT', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    { name: 'Dr. Rajesh Sharma', role: 'Faculty Editor (Science & Tech)', dept: 'Computer Applications & IT', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
    { name: 'Prof. Anita Desai', role: 'Faculty Editor (Arts & Culture)', dept: 'Electronics & Media Arts', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
    { name: 'Dr. Vikram Singhal', role: 'Placement & Industry Liaison', dept: 'Training & Placement Cell', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  ];

  const projectSpecs = [
    { title: 'Frontend Architecture', desc: 'React 19, TypeScript, Vite, Tailwind CSS with dark mode persistence and responsive layouts.' },
    { title: 'Backend REST API', desc: 'Node.js, Express.js, TypeScript with controllers, validators, and robust error middleware.' },
    { title: 'Database & Persistence', desc: 'MongoDB and resilient Mongoose schema modeling with embedded JSON storage engine and full database seed capability.' },
    { title: 'Security & RBAC', desc: 'JWT token signing, bcrypt password hashing, role-based authorization for Student, Faculty, and Admin.' },
    { title: 'AI Editorial Assistant', desc: 'Google Gemini 3.8 Flash SDK integration for automatic headline, summary, tags, and SEO generation.' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
          <GraduationCap className="w-4 h-4" />
          <span>BCA Minor Project Presentation</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-serif">
          About Campus News Portal
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          A full-stack collegiate digital publishing platform designed to inform, empower, and connect the entire academic community.
        </p>
      </div>

      {/* Mission & Purpose */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
            Verified Journalism
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Eliminating unverified rumors with direct editorial moderation and official circular notices from administrative departments.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
            Student Empowerment
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Any enrolled student or faculty member can submit articles, document club milestones, participate in discussions, and track editorial review.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
            Modern AI Tooling
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Integrated Google Gemini 3.8 Flash intelligence assisting student reporters with headline formulation, executive summaries, and tags.
          </p>
        </div>
      </div>

      {/* Editorial Board */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
            Editorial Board & Faculty Mentors
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Senior faculty coordinators responsible for news verification and student mentorship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {editorialBoard.map((member, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-3"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-20 h-20 rounded-full mx-auto object-cover ring-2 ring-blue-500/20"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</h4>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{member.role}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{member.dept}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Technical Specifications for BCA Viva */}
      <div className="p-8 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Code className="w-4 h-4" />
            <span>Academic Project Architecture</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
            System Specifications & viva Highlights
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectSpecs.map((spec, i) => (
            <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{spec.title}</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                {spec.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <span className="text-slate-500 font-medium">
            Full authentication supported with real MongoDB accounts & admin privileges.
          </span>
          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Register New Account
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
