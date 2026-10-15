import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../../types/index.js';
import { Calendar, Eye, Heart, ArrowUpRight } from 'lucide-react';
import defaultAuthorAvatar from '../../assets/images/regenerated_image_1791870415651.png';

interface ArticleCardProps {
  article: Article;
  variant?: 'standard' | 'compact' | 'horizontal' | 'trending';
  rankNumber?: number;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'standard',
  rankNumber,
}) => {
  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : new Date(article.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

  if (variant === 'trending') {
    return (
      <Link
        to={`/articles/${article.slug}`}
        className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all group"
      >
        {rankNumber !== undefined && (
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-300 dark:text-slate-700 font-serif leading-none pt-1">
            0{rankNumber}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {article.category}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {publishedDate}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h4>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="truncate">{article.authorName}</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-400" />
              {article.views}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className="flex flex-col sm:flex-row gap-5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group">
        <div className="sm:w-1/3 aspect-video sm:aspect-auto rounded-xl overflow-hidden shrink-0 relative bg-slate-100 dark:bg-slate-800">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-xs">
            {article.category}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <span>{publishedDate}</span>
              <span>•</span>
              <span>{article.readTime}</span>
            </div>

            <Link to={`/articles/${article.slug}`}>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 font-serif leading-snug">
                {article.title}
              </h3>
            </Link>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {article.shortDescription}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {article.authorName}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {article.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                {article.likesCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Card (Vertical)
  return (
    <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      {/* Thumbnail */}
      <Link
        to={`/articles/${article.slug}`}
        className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800 block"
      >
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600/90 text-white backdrop-blur-xs shadow-xs">
            {article.category}
          </span>
          {article.isFeatured && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500 text-white shadow-xs">
              Featured
            </span>
          )}
        </div>
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900/80 text-white backdrop-blur-xs">
          {article.readTime}
        </span>
      </Link>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {publishedDate}
            </span>
            <span className="truncate max-w-[120px] font-medium">
              {article.authorDepartment}
            </span>
          </div>

          <Link to={`/articles/${article.slug}`}>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 font-serif leading-snug">
              {article.title}
            </h3>
          </Link>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {article.shortDescription}
          </p>
        </div>

        {/* Card Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={article.authorAvatar && !article.authorAvatar.includes('unsplash') ? article.authorAvatar : defaultAuthorAvatar}
              alt={article.authorName}
              className="w-6 h-6 rounded-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = defaultAuthorAvatar;
              }}
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
              {article.authorName}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {article.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              {article.likesCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
