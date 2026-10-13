import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Article } from '../types/index.js';
import { ArticleCard } from '../components/news/ArticleCard.js';
import { Briefcase, TrendingUp, Building, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PlacementsPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlacements = async () => {
      setLoading(true);
      try {
        const res = await api.getArticles({
          category: 'placements',
          status: 'published',
          limit: 12,
        });
        setArticles(res.data.articles);
      } catch (err) {
        console.error('Error fetching placement news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlacements();
  }, []);

  const stats = [
    { label: 'Highest Package', value: '₹44.0 LPA', sub: 'CloudScale Global' },
    { label: 'Average Package', value: '₹8.75 LPA', sub: '24% increase YoY' },
    { label: 'Total Offers Extended', value: '485+', sub: 'Phase 1 Recruitment' },
    { label: 'Recruiting Companies', value: '70+', sub: 'MNCs & Unicorns' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-cyan-950 via-blue-900 to-slate-900 text-white shadow-xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-600/40 text-cyan-200 border border-cyan-500/30">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Training & Placement Cell</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif">
            Placements & Career Hub
          </h1>
          <p className="text-sm sm:text-base text-cyan-100 leading-relaxed">
            Corporate recruitment circulars, internship roadmaps, interview preparation bootcamps, and batch placement statistics.
          </p>
        </div>
      </div>

      {/* Placement Statistics Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {s.label}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 font-serif">
              {s.value}
            </div>
            <div className="text-xs text-slate-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            Placement Stories & Recruiter Reports
          </h2>
          <span className="text-xs text-slate-500">
            {articles.length} Reports Published
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
