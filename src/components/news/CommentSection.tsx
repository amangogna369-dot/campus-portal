import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment, User } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { MessageSquare, Send, Trash2, Shield, User as UserIcon } from 'lucide-react';

interface CommentSectionProps {
  articleId: string;
  comments: Comment[];
  onCommentAdded: (newComment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  articleId,
  comments,
  onCommentAdded,
  onCommentDeleted,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotifications();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.createComment({ articleId, content: content.trim() });
      showToast('Comment posted successfully!', 'success');
      onCommentAdded(res.data);
      setContent('');
    } catch (err: any) {
      showToast(err.message || 'Failed to post comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.deleteComment(id);
      showToast('Comment deleted', 'info');
      onCommentDeleted(id);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete comment', 'error');
    }
  };

  return (
    <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Campus Discussion ({comments.length})
        </h3>
      </div>

      {/* Input box */}
      {isAuthenticated && user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-start gap-3">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover shrink-0 mt-1"
            />
            <div className="flex-1">
              <textarea
                rows={3}
                required
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Share your thoughts, questions, or congratulations on this campus story..."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Posting publicly as <span className="font-semibold text-slate-700 dark:text-slate-300">{user.name}</span> ({user.role})
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Join the conversation
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Sign in with your student or faculty credentials to comment and discuss.
            </p>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shrink-0"
          >
            Log in to comment
          </Link>
        </div>
      )}

      {/* List of comments */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            No comments yet on this article. Be the first to start the discussion!
          </div>
        ) : (
          comments.map(c => {
            const isOwner = user?.id === c.userId;
            const isAdmin = user?.role === 'admin';

            return (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={c.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
                      alt={c.userName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {c.userName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded-sm text-[9px] font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {c.userRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {(isOwner || isAdmin) && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="mt-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-10">
                  {c.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
