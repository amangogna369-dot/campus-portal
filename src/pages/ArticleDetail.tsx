import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { Article, Comment } from '../types/index.js';
import { CommentSection } from '../components/news/CommentSection.js';
import { ArticleCard } from '../components/news/ArticleCard.js';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import {
  Calendar,
  Eye,
  Heart,
  Bookmark,
  Share2,
  Copy,
  Check,
  Tag,
  ArrowLeft,
  ChevronRight,
  Flame,
  MessageSquare,
} from 'lucide-react';
import defaultAuthorAvatar from '../assets/images/regenerated_image_1791870415651.png';

export const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const { isAuthenticated } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await api.getArticleBySlugOrId(slug);
        setArticle(res.data);
        setIsLiked(Boolean(res.data.isLiked));
        setLikesCount(res.data.likesCount || 0);
        setIsBookmarked(Boolean(res.data.isBookmarked));
      } catch (err: any) {
        showToast(err.message || 'Article not found', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to like this story.', 'info');
      navigate('/login');
      return;
    }
    if (!article) return;

    try {
      const res = await api.toggleLike(article.id);
      setIsLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);
      showToast(res.data.isLiked ? 'Liked story!' : 'Unliked story', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error liking story', 'error');
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to save stories to your bookmarks.', 'info');
      navigate('/login');
      return;
    }
    if (!article) return;

    try {
      const res = await api.toggleBookmark(article.id);
      setIsBookmarked(res.data.isBookmarked);
      showToast(res.message, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error bookmarking story', 'error');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Article URL copied to clipboard!', 'info');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">Loading story...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Story Not Found
        </h2>
        <p className="text-sm text-slate-500">
          The requested article may have been archived or removed by administration.
        </p>
        <Link
          to="/news"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All News</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/news" className="hover:text-blue-600">News</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/news?category=${article.categorySlug}`} className="hover:text-blue-600 font-medium">
          {article.category}
        </Link>
      </nav>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/news?category=${article.categorySlug}`}
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 transition-colors"
          >
            {article.category}
          </Link>
          {article.isBreaking && (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Breaking</span>
            </span>
          )}
          <span className="text-xs text-slate-500 font-medium">
            {article.readTime}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white font-serif leading-tight">
          {article.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          {article.shortDescription}
        </p>

        {/* Author Bio Bar & Story Stats */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={article.authorAvatar && !article.authorAvatar.includes('unsplash') ? article.authorAvatar : defaultAuthorAvatar}
              alt={article.authorName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = defaultAuthorAvatar;
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {article.authorName}
                </span>
                <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {article.authorRole}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>{article.authorDepartment}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Eye className="w-4 h-4 text-sky-500" />
              <span>{article.views} views</span>
            </span>

            {/* Social Share Buttons */}
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Copy Story Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Share on X"
            >
              <Share2 className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Featured Hero Media */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-slate-900 aspect-video max-h-[500px]">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80';
          }}
        />
      </div>

      {/* Sticky Interactive Floating Action Bar */}
      <div className="p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isLiked
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{likesCount} Likes</span>
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isBookmarked ? 'Saved in Bookmarks' : 'Bookmark Story'}</span>
          </button>
        </div>

        <a
          href="#comments"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{article.comments?.length || 0} Comments</span>
        </a>
      </div>

      {/* Main Formatted Article Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed space-y-5">
        {article.content.split('\n\n').map((paragraph, index) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={index} className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white mt-6 mb-3">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
            const listItems = paragraph.split('\n');
            return (
              <ul key={index} className="list-disc pl-6 space-y-2 my-4 text-slate-700 dark:text-slate-300">
                {listItems.map((item, i) => (
                  <li key={i}>{item.replace(/^[-*]\s*/, '')}</li>
                ))}
              </ul>
            );
          }
          return (
            <p key={index} className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              {paragraph}
            </p>
          );
        })}
      </div>

      {/* Tags Section */}
      {article.tags && article.tags.length > 0 && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <Tag className="w-4 h-4 text-slate-400 mr-1" />
          <span className="text-xs font-bold uppercase text-slate-400">Story Tags:</span>
          {article.tags.map(tag => (
            <Link
              key={tag}
              to={`/news?tag=${encodeURIComponent(tag)}`}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Comment Section */}
      <div id="comments">
        <CommentSection
          articleId={article.id}
          comments={article.comments || []}
          onCommentAdded={newComment => {
            setArticle(prev => (prev ? { ...prev, comments: [newComment, ...(prev.comments || [])] } : null));
          }}
          onCommentDeleted={delId => {
            setArticle(prev =>
              prev ? { ...prev, comments: (prev.comments || []).filter(c => c.id !== delId) } : null
            );
          }}
        />
      </div>

      {/* Related Campus Coverage */}
      {article.related && article.related.length > 0 && (
        <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            Related Campus Stories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {article.related.map(rel => (
              <ArticleCard key={rel.id} article={rel} variant="standard" />
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
