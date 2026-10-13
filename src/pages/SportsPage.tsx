import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Article } from '../types/index.js';
import { ArticleCard } from '../components/news/ArticleCard.js';
import { Activity, Trophy, Shield, Calendar } from 'lucide-react';

export const SportsPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSports = async () => {
      setLoading(true);
      try {
        const res = await api.getArticles({
          category: 'sports',
          status: 'published',
          limit: 12,
        });
        setArticles(res.data.articles);
      } catch (err) {
        console.error('Error fetching sports news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-orange-900 via-amber-900 to-slate-900 text-white shadow-xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-600/40 text-orange-200 border border-orange-500/30">
            <Activity className="w-3.5 h-3.5" />
            <span>Varsity Athletics & Sports</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif">
            Campus Sports Bulletin
          </h1>
          <p className="text-sm sm:text-base text-orange-100 leading-relaxed">
            Match results, tournament brackets, championship highlights, player rankings, and athletic trials for the Campus Lions.
          </p>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            Latest Match Reports & Fixtures
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
