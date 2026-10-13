import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Comment } from '../../types/index.js';
import { AdminSidebar } from '../../components/admin/AdminSidebar.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { MessageSquare, Trash2, ExternalLink, Search } from 'lucide-react';

export const AdminComments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotifications();

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.getComments({ search: searchQuery.trim() || undefined });
      setComments(res.data);
    } catch (err: any) {
      showToast(err.message || 'Error loading comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [searchQuery]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.deleteComment(id);
      showToast('Comment deleted', 'info');
      fetchComments();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete comment', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-6 overflow-y-auto">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
            Comment Moderation Desk
          </h1>
          <p className="text-xs text-slate-500">
            Monitor, review, and moderate discussion replies across published campus articles.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search comments by keyword or commenter..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Comments Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Author</th>
                  <th className="p-4">Comment Content</th>
                  <th className="p-4">Article</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {comments.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={c.userAvatar}
                          alt={c.userName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{c.userName}</div>
                          <span className="text-[9px] uppercase font-bold text-blue-600">{c.userRole}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 max-w-sm">
                      <p className="line-clamp-2">{c.content}</p>
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs">
                      {c.articleSlug ? (
                        <Link
                          to={`/articles/${c.articleSlug}`}
                          className="hover:text-blue-600 line-clamp-1 flex items-center gap-1"
                        >
                          <span className="truncate">{c.articleTitle}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </Link>
                      ) : (
                        <span className="text-slate-400">{c.articleTitle}</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
