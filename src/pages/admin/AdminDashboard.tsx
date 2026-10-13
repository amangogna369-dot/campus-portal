import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { DashboardMetrics, CategoryStat, TopArticleItem, ActivityLog } from '../../types/index.js';
import { AdminSidebar } from '../../components/admin/AdminSidebar.js';
import { useNotifications } from '../../context/NotificationContext.js';
import {
  Users,
  FileText,
  Clock,
  Eye,
  Calendar,
  MessageSquare,
  TrendingUp,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Database,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [topArticles, setTopArticles] = useState<TopArticleItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const { showToast } = useNotifications();

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminStats();
      setMetrics(res.data.metrics);
      setCategoryStats(res.data.categoryStats);
      setTopArticles(res.data.topArticles);
      setRecentActivities(res.data.recentActivities);
    } catch (err: any) {
      showToast(err.message || 'Error loading dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleRestoreDefaults = async () => {
    if (!window.confirm('Are you sure you want to restore the portal to initial default news and announcements?')) return;

    setIsResetting(true);
    try {
      const res = await api.resetDatabase();
      showToast(res.message, 'success');
      await fetchDashboardStats();
    } catch (err: any) {
      showToast(err.message || 'Failed to reset database', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar pendingCount={0} />
        <div className="flex-1 p-10 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Enrolled Users', value: metrics.totalUsers, sub: `${metrics.studentCount} Students • ${metrics.facultyCount} Faculty`, icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50' },
    { label: 'Published Articles', value: metrics.publishedArticles, sub: `Across ${categoryStats.length} active categories`, icon: FileText, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' },
    { label: 'Pending Review', value: metrics.pendingArticles, sub: 'Submissions awaiting review', icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50', alert: metrics.pendingArticles > 0 },
    { label: 'Total Page Views', value: metrics.totalViews.toLocaleString(), sub: `${metrics.totalLikes} total story likes`, icon: Eye, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50' },
    { label: 'Campus Events', value: metrics.totalEvents, sub: `${metrics.upcomingEvents} upcoming sessions`, icon: Calendar, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50' },
    { label: 'Active Notices', value: metrics.totalAnnouncements, sub: 'Examination & office circulars', icon: Megaphone, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar pendingCount={metrics.pendingArticles} />

      <main className="flex-1 p-6 sm:p-10 space-y-10 overflow-y-auto">
        {/* Top bar with quick actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              <span>Varsity Administration</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
              Editorial & Portal Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
              title="Supabase connected: rkntdmyptrpzowfdejzl"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Supabase: Connected</span>
            </Link>

            <Link
              to="/admin/submissions"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>Review Submissions ({metrics.pendingArticles})</span>
            </Link>

            <button
              onClick={handleRestoreDefaults}
              disabled={isResetting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs transition-colors cursor-pointer"
              title="Restore portal initial default news and announcements"
            >
              <RotateCcw className={`w-4 h-4 text-blue-600 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Restore Defaults</span>
            </button>
          </div>
        </div>

        {/* 6 Key Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {card.label}
                </span>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 font-serif">
                  {card.value}
                </div>
                <div className="text-xs text-slate-500 mt-1">{card.sub}</div>
              </div>
              <div className={`p-3 rounded-xl ${card.color} shrink-0`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Two-column analysis: Category distribution & Top viewed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Category Distribution */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-serif">
              Published Stories by Beat
            </h2>

            <div className="space-y-3.5 pt-2">
              {categoryStats.map(cat => {
                const total = metrics.publishedArticles || 1;
                const percentage = Math.round((cat.count / total) * 100);

                return (
                  <div key={cat.slug} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {cat.name}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {cat.count} articles ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percentage}%`, backgroundColor: cat.color || '#2563eb' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Viewed Stories */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-serif">
                Most Read Articles
              </h2>
              <Link to="/admin/articles" className="text-xs text-blue-600 hover:underline font-semibold">
                Manage All
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topArticles.map(art => (
                <div key={art.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      to={`/articles/${art.slug}`}
                      className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors line-clamp-1"
                    >
                      {art.title}
                    </Link>
                    <span className="text-[11px] text-slate-400">
                      Category: {art.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-400">
                      <Eye className="w-3.5 h-3.5" />
                      {art.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                      ♥ {art.likesCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Activity Logs */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-serif">
              Recent System & Editorial Activity
            </h2>
            <Link to="/admin/activity-logs" className="text-xs text-blue-600 hover:underline font-semibold">
              Full Audit Trail
            </Link>
          </div>

          <div className="space-y-2">
            {recentActivities.slice(0, 6).map(log => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                    {log.action}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 truncate">
                    <strong>{log.userName}:</strong> {log.details}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
