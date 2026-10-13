import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Article } from '../types/index.js';
import { ArticleCard } from '../components/news/ArticleCard.js';
import { Bookmark, Code, Camera, BookOpen, Music, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ClubsPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const res = await api.getArticles({
          category: 'clubs-societies',
          status: 'published',
          limit: 12,
        });
        setArticles(res.data.articles);
      } catch (err) {
        console.error('Error fetching clubs news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const clubsList = [
    { name: 'Google Developer Student Club', icon: Code, desc: 'Mobile, Cloud, AI, and Open-Source bootcamps.', lead: 'Aarav Mehta' },
    { name: 'Robotics & Hardware Society', icon: Cpu, desc: 'IoT, Drone engineering, and autonomous rovers.', lead: 'Kavya Pillai' },
    { name: 'Aperture Photography Club', icon: Camera, desc: 'Visual arts, documentary photography, and exhibitions.', lead: 'Ananya Roy' },
    { name: 'Literary & Debating Society', icon: BookOpen, desc: 'Parliamentary debates, creative writing, and MUN.', lead: 'Priya Nair' },
    { name: 'Symphony Music Society', icon: Music, desc: 'Bands, classical vocals, and annual Battle of the Bands.', lead: 'Aditya Sen' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-600/40 text-emerald-200 border border-emerald-500/30">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Campus Societies</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif">
            Clubs & Societies Hub
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
            Find your passion outside the lecture hall. Join student-run clubs, participate in peer bootcamps, and lead university projects.
          </p>
        </div>
      </div>

      {/* Featured Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {clubsList.map((club, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <club.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {club.name}
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {club.desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
              Lead: <strong className="text-slate-700 dark:text-slate-300">{club.lead}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Club Dispatches */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            Club Updates & Event Dispatches
          </h2>
          <span className="text-xs text-slate-500">
            {articles.length} Stories
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
