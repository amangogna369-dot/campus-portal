import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../../types/index.js';
import { Calendar, User, Eye, Heart, ArrowRight, Flame } from 'lucide-react';
import defaultAuthorAvatar from '../../assets/images/regenerated_image_1791870415651.png';

interface HeroFeaturedProps {
  article: Article;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({ article }) => {
  if (!article) return null;

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 group">
      {/* Background Image with Dark Vignette */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 p-6 sm:p-10 md:p-12 lg:p-16 flex flex-col justify-end min-h-[460px] sm:min-h-[520px] max-w-4xl">
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600 text-white shadow-md">
            {article.category}
          </span>
          {article.isBreaking && (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1 shadow-md animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              <span>Breaking Headline</span>
            </span>
          )}
          <span className="text-xs text-slate-300 font-medium bg-slate-800/80 px-2.5 py-1 rounded-md backdrop-blur-xs">
            {article.readTime}
          </span>
        </div>

        <Link to={`/articles/${article.slug}`}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white font-serif tracking-tight leading-tight hover:text-blue-300 transition-colors">
            {article.title}
          </h1>
        </Link>

        <p className="mt-4 text-sm sm:text-base text-slate-200 line-clamp-3 max-w-2xl leading-relaxed">
          {article.shortDescription}
        </p>

        {/* Metadata & Read CTA */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={article.authorAvatar && !article.authorAvatar.includes('unsplash') ? article.authorAvatar : defaultAuthorAvatar}
              alt={article.authorName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-400"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = defaultAuthorAvatar;
              }}
            />
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">
                {article.authorName}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>{article.authorDepartment}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-sky-400" />
                {article.views.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-400" />
                {article.likesCount.toLocaleString()}
              </span>
            </div>

            <Link
              to={`/articles/${article.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:gap-3"
            >
              <span>Read Full Story</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
