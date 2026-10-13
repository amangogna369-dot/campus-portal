import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto shadow-md">
          <GraduationCap className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold text-blue-600 dark:text-blue-400 font-serif">
            404
          </h1>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
            Campus Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            The link you followed may be broken or the story might have been moved to university archives.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search Articles</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
