import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Announcement } from '../../types/index.js';
import { AdminSidebar } from '../../components/admin/AdminSidebar.js';
import { Modal } from '../../components/common/Modal.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { Megaphone, Plus, Trash2, Pin, Calendar, Building } from 'lucide-react';

export const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAnn, setNewAnn] = useState({
    title: '',
    description: '',
    department: 'Examination Cell',
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    pinned: false,
    attachmentName: '',
  });

  const { showToast } = useNotifications();

  const fetchAnnouncements = async () => {
    try {
      const res = await api.getAnnouncements({ status: 'all' });
      setAnnouncements(res.data);
    } catch (err: any) {
      showToast(err.message || 'Error fetching announcements', 'error');
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createAnnouncement(newAnn);
      showToast(res.message, 'success');
      setIsModalOpen(false);
      setNewAnn({
        title: '',
        description: '',
        department: 'Examination Cell',
        priority: 'normal',
        pinned: false,
        attachmentName: '',
      });
      fetchAnnouncements();
    } catch (err: any) {
      showToast(err.message || 'Failed to create circular', 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete notice "${title}"?`)) return;
    try {
      await api.deleteAnnouncement(id);
      showToast('Announcement removed', 'info');
      fetchAnnouncements();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete announcement', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Announcements & Circulars Management
            </h1>
            <p className="text-xs text-slate-500">
              Publish urgent notices, academic circulars, fee deadlines, and exam schedules.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Circular</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Pinned</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {announcements.map(ann => (
                  <tr key={ann.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-white max-w-sm">
                      <div className="line-clamp-2">{ann.title}</div>
                      {ann.attachmentName && (
                        <div className="text-[10px] text-blue-600 font-mono mt-0.5">
                          📎 {ann.attachmentName}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{ann.department}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          ann.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : ann.priority === 'important'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}
                      >
                        {ann.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      {ann.pinned ? (
                        <span className="flex items-center gap-1 text-indigo-600 font-bold">
                          <Pin className="w-3.5 h-3.5" /> Pinned
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {new Date(ann.publishDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(ann.id, ann.title)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                        title="Delete circular"
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

        {/* Publish Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Publish Campus Circular"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="text-slate-500 block mb-1">Subject / Headline *</label>
              <input
                type="text"
                required
                value={newAnn.title}
                onChange={e => setNewAnn({ ...newAnn, title: e.target.value })}
                placeholder="e.g. Schedule of Practical Assessments for BCA"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={newAnn.department}
                  onChange={e => setNewAnn({ ...newAnn, department: e.target.value })}
                  placeholder="Examination Cell"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Priority</label>
                <select
                  value={newAnn.priority}
                  onChange={e => setNewAnn({ ...newAnn, priority: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-500 block mb-1">Attachment File Name (Optional)</label>
              <input
                type="text"
                value={newAnn.attachmentName}
                onChange={e => setNewAnn({ ...newAnn, attachmentName: e.target.value })}
                placeholder="e.g. Circular_BCA_assessment_2026.pdf"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-slate-500 block mb-1">Circular Description *</label>
              <textarea
                rows={4}
                required
                value={newAnn.description}
                onChange={e => setNewAnn({ ...newAnn, description: e.target.value })}
                placeholder="Full details of notice..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newAnn.pinned}
                onChange={e => setNewAnn({ ...newAnn, pinned: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Pin this notice prominently at the top of the board</span>
            </label>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer"
            >
              Publish to Notice Board
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
};
