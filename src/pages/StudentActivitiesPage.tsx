import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Article } from '../types/index.js';
import { ArticleCard } from '../components/news/ArticleCard.js';
import { Users, Sparkles, Trophy, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentActivitiesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const res = await api.getArticles({
          category: 'student-activities',
          status: 'published',
          limit: 12,
        });
        setArticles(res.data.articles);
      } catch (err) {
        console.error('Error fetching student activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-600/40 text-purple-200 border border-purple-500/30">
            <Users className="w-3.5 h-3.5" />
            <span>Campus Life & Council Affairs</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif">
            Student Activities & Initiatives
          </h1>
          <p className="text-sm sm:text-base text-purple-100 leading-relaxed">
            From technical hackathons and debating societies to social welfare camps and cultural festivals — explore everything happening in student life.
          </p>
          <div className="pt-2">
            <Link
              to="/submit-article"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              <span>Submit Club Activity Report</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Activity Stories Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            Recent Student Initiatives & Coverage
          </h2>
          <span className="text-xs text-slate-500">
            {articles.length} Stories Published
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-base font-bold text-slate-900 dark:text-white">
              No student activity articles found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(art => (
              <ArticleCard key={art.id} article={art} variant="standard" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
