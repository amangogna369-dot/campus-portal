import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Article } from '../../types/index.js';
import { AdminSidebar } from '../../components/admin/AdminSidebar.js';
import { Modal } from '../../components/common/Modal.js';
import { useNotifications } from '../../context/NotificationContext.js';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  AlertCircle,
  Send,
  User,
} from 'lucide-react';

export const AdminSubmissions: React.FC = () => {
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { showToast } = useNotifications();

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.getArticles({ status: 'pending', limit: 50 });
      setPendingArticles(res.data.articles);
    } catch (err: any) {
      showToast(err.message || 'Error fetching pending submissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApprove = async (article: Article) => {
    setIsProcessing(true);
    try {
      await api.updateArticleStatus(article.id, 'published');
      showToast(`Article "${article.title}" approved and published to portal!`, 'success');
      fetchSubmissions();
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !rejectionReason.trim()) return;

    setIsProcessing(true);
    try {
      await api.updateArticleStatus(selectedArticle.id, 'rejected', rejectionReason.trim());
      showToast(`Article rejected. Author has been notified with feedback.`, 'info');
      setIsRejectModalOpen(false);
      setRejectionReason('');
      setSelectedArticle(null);
      fetchSubmissions();
    } catch (err: any) {
      showToast(err.message || 'Rejection failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar pendingCount={pendingArticles.length} />

      <main className="flex-1 p-6 sm:p-10 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <Clock className="w-4 h-4" />
            <span>Editorial Review Queue</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
            Pending Student & Faculty Submissions ({pendingArticles.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review article submissions, ensure institutional compliance, and approve for public publication.
          </p>
        </div>

        {/* List of pending articles */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : pendingArticles.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Editorial Queue is Empty
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All submitted student and faculty articles have been reviewed and processed!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingArticles.map(art => (
              <div
                key={art.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
              >
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={art.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={art.authorName}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {art.authorName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {art.authorRole} • {art.authorDepartment}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                      Pending Approval
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                      {art.category}
                    </span>
                  </div>
                </div>

                {/* Content summary */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    {art.shortDescription}
                  </p>

                  <details className="mt-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <summary className="font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
                      Click to expand and inspect full article text ({art.content.length} characters)
                    </summary>
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                      {art.content}
                    </div>
                  </details>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400">
                    Submitted on: {new Date(art.createdAt).toLocaleString()}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedArticle(art);
                        setIsRejectModalOpen(true);
                      }}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject with Notes</span>
                    </button>

                    <button
                      onClick={() => handleApprove(art)}
                      disabled={isProcessing}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Publish to Varsity</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rejection Modal */}
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title="Provide Editorial Rejection Feedback"
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Please state why this submission requires revisions. This note will be sent directly to the author's notification center.
            </p>

            <textarea
              rows={4}
              required
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Please verify exam dates with the official Examination Cell circular or cite official campus sources."
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500 resize-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || !rejectionReason.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback & Reject</span>
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};
