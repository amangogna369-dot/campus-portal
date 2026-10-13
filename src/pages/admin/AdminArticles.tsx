import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Article, Category } from '../../types/index.js';
import { AdminSidebar } from '../../components/admin/AdminSidebar.js';
import { Pagination } from '../../components/common/Pagination.js';
import { useNotifications } from '../../context/NotificationContext.js';
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  ExternalLink,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';

export const AdminArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { showToast } = useNotifications();

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await api.getArticles({
        status: statusFilter,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: searchQuery.trim() || undefined,
        page: currentPage,
        limit: 10,
      });
      setArticles(res.data.articles);
      setTotalPages(res.data.pagination.totalPages);
      setTotalCount(res.data.pagination.total);
    } catch (err: any) {
      showToast(err.message || 'Error fetching articles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getCategories().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [statusFilter, categoryFilter, searchQuery, currentPage]);

  const handleToggleStatus = async (article: Article, newStatus: string) => {
    try {
      await api.updateArticleStatus(article.id, newStatus);
      showToast(`Article status updated to ${newStatus}`, 'success');
      fetchArticles();
    } catch (err: any) {
      showToast(err.message || 'Status change failed', 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      await api.deleteArticle(id);
      showToast('Article deleted successfully.', 'success');
      fetchArticles();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Article Management
            </h1>
            <p className="text-xs text-slate-500">
              Manage all drafts, editorial submissions, and published campus articles.
            </p>
          </div>

          <Link
            to="/submit-article"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, author, or keywords..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="pending">Pending Review</option>
              <option value="draft">Drafts</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={categoryFilter}
              onChange={e => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Headline</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Beat</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Views</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Loading articles...</td>
                  </tr>
                ) : articles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No articles found matching filters.</td>
                  </tr>
                ) : (
                  articles.map(art => (
                    <tr key={art.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs">
                        <Link to={`/articles/${art.slug}`} className="hover:text-blue-600 line-clamp-2">
                          {art.title}
                        </Link>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {new Date(art.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        <div className="font-semibold">{art.authorName}</div>
                        <div className="text-[10px] text-slate-400">{art.authorRole}</div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {art.category}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            art.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : art.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : art.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {art.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-mono font-semibold">
                        {art.views.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {art.status !== 'published' ? (
                            <button
                              onClick={() => handleToggleStatus(art, 'published')}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                              title="Publish story"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(art, 'draft')}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                              title="Unpublish (Save as draft)"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          <Link
                            to={`/articles/${art.slug}`}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            title="View public page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDelete(art.id, art.title)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            title="Delete article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
    </div>
  );
};
