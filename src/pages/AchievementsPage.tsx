import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Article } from '../types/index.js';
import { ArticleCard } from '../components/news/ArticleCard.js';
import { Trophy, Award, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AchievementsPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      try {
        const res = await api.getArticles({
          category: 'achievements',
          status: 'published',
          limit: 12,
        });
        setArticles(res.data.articles);
      } catch (err) {
        console.error('Error fetching achievements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/40 text-amber-100 border border-amber-400/30">
            <Trophy className="w-3.5 h-3.5" />
            <span>Campus Hall of Fame</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif">
            Student & Faculty Achievements
          </h1>
          <p className="text-sm sm:text-base text-amber-100 leading-relaxed">
            Celebrating academic accolades, hackathon victories, patent filings, research publication honors, and national awards won by our campus community.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            Honors & Accolades
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
              No achievement stories found.
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
