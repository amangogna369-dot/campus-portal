import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Announcement } from '../types/index.js';
import { useNotifications } from '../context/NotificationContext.js';
import {
  Megaphone,
  Pin,
  Calendar,
  Building,
  Download,
  Search,
  Filter,
  AlertCircle,
  FileText,
  Clock,
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { showToast } = useNotifications();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const res = await api.getAnnouncements({
          department: departmentFilter !== 'all' ? departmentFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
          search: searchQuery.trim() || undefined,
        });
        setAnnouncements(res.data);
      } catch (err) {
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [departmentFilter, priorityFilter, searchQuery]);

  const handleDownloadAttachment = (ann: Announcement) => {
    showToast(`Downloading official notice: ${ann.attachmentName || 'circular.pdf'}...`, 'info');
  };

  const departments = [
    'All',
    'Computer Applications',
    'Accounts & Finance',
    'Training & Placement Cell',
    'Registrar Office',
    'Library Administration',
    'Student Affairs',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-serif">
            Campus Announcements & Circulars
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Official academic notifications, fee deadlines, examination timetables, and administrative notices.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-900 shrink-0">
          <Megaphone className="w-4 h-4" />
          <span>Official Notice Board</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search circulars by subject, department, or keywords..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-400">Priority:</span>
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-2 focus:outline-hidden"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent Only</option>
                <option value="important">Important Only</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Department Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept.toLowerCase())}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                departmentFilter === dept.toLowerCase()
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-base font-bold text-slate-900 dark:text-white">
            No active announcements found for this filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(ann => {
            const isUrgent = ann.priority === 'urgent';
            const isImportant = ann.priority === 'important';

            return (
              <div
                key={ann.id}
                className={`p-6 rounded-2xl border transition-all ${
                  isUrgent
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-sm'
                    : isImportant
                    ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {ann.pinned && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-600 text-white shadow-xs">
                          <Pin className="w-3 h-3" />
                          <span>Pinned Notice</span>
                        </span>
                      )}

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isUrgent
                            ? 'bg-rose-600 text-white'
                            : isImportant
                            ? 'bg-amber-500 text-white'
                            : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {ann.priority} Priority
                      </span>

                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ann.department}</span>
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-serif leading-snug">
                      {ann.title}
                    </h3>

                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      {ann.description}
                    </p>
                  </div>

                  {ann.attachmentName && (
                    <button
                      onClick={() => handleDownloadAttachment(ann)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs transition-colors shrink-0 cursor-pointer self-start"
                    >
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>{ann.attachmentName}</span>
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Published: {new Date(ann.publishDate).toLocaleDateString()}
                    </span>
                    {ann.expiryDate && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        Valid Until: {new Date(ann.expiryDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Ref: {ann.id.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
