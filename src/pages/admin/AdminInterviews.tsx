import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Interview } from '../../types/index.js';
import { AdminSidebar } from '../../components/admin/AdminSidebar.js';
import { Modal } from '../../components/common/Modal.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { Mic, Plus, Trash2, ExternalLink, Calendar } from 'lucide-react';

export const AdminInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useNotifications();

  const [newInterview, setNewInterview] = useState({
    interviewee: '',
    designation: '',
    department: 'Computer Applications',
    batchOrTenure: 'Class of 2020',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    introduction: '',
    quote: '',
    q1: '',
    a1: '',
    q2: '',
    a2: '',
  });

  const fetchInterviews = async () => {
    try {
      const res = await api.getInterviews();
      setInterviews(res.data);
    } catch (err: any) {
      showToast(err.message || 'Error fetching interviews', 'error');
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const questionsAndAnswers = [
        { question: newInterview.q1, answer: newInterview.a1 },
        ...(newInterview.q2 ? [{ question: newInterview.q2, answer: newInterview.a2 }] : []),
      ];

      const res = await api.createInterview({
        interviewee: newInterview.interviewee,
        designation: newInterview.designation,
        department: newInterview.department,
        batchOrTenure: newInterview.batchOrTenure,
        profileImage: newInterview.profileImage,
        introduction: newInterview.introduction,
        quote: newInterview.quote,
        questionsAndAnswers,
      });

      showToast(res.message, 'success');
      setIsModalOpen(false);
      fetchInterviews();
    } catch (err: any) {
      showToast(err.message || 'Failed to create interview', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete interview with "${name}"?`)) return;
    try {
      await api.deleteInterview(id);
      showToast('Interview deleted', 'info');
      fetchInterviews();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete interview', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Spotlight Interviews Management
            </h1>
            <p className="text-xs text-slate-500">
              Publish conversations with prominent professors, notable alumni, and student leaders.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Spotlight Interview</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Profile</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Interview Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {interviews.map(i => (
                  <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={i.profileImage}
                          alt={i.interviewee}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <div>{i.interviewee}</div>
                          <div className="text-[10px] text-slate-400">{i.batchOrTenure}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{i.designation}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{i.department}</td>
                    <td className="p-4 text-slate-400 font-mono">{i.interviewDate}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/interviews/${i.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(i.id, i.interviewee)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Interview Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Spotlight Interview"
          maxWidth="2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">Interviewee Name *</label>
                <input
                  type="text"
                  required
                  value={newInterview.interviewee}
                  onChange={e => setNewInterview({ ...newInterview, interviewee: e.target.value })}
                  placeholder="e.g. Sanya Gupta"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Designation / Role *</label>
                <input
                  type="text"
                  required
                  value={newInterview.designation}
                  onChange={e => setNewInterview({ ...newInterview, designation: e.target.value })}
                  placeholder="Founder & CEO, AgriSense (Alumna 2021)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">Department</label>
                <input
                  type="text"
                  value={newInterview.department}
                  onChange={e => setNewInterview({ ...newInterview, department: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Photo URL</label>
                <input
                  type="text"
                  value={newInterview.profileImage}
                  onChange={e => setNewInterview({ ...newInterview, profileImage: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 block mb-1">Key Quote *</label>
              <input
                type="text"
                required
                value={newInterview.quote}
                onChange={e => setNewInterview({ ...newInterview, quote: e.target.value })}
                placeholder="A memorable takeaway quote from the conversation..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-slate-500 block mb-1">Introduction *</label>
              <textarea
                rows={2}
                required
                value={newInterview.introduction}
                onChange={e => setNewInterview({ ...newInterview, introduction: e.target.value })}
                placeholder="Background introduction to the person and interview context..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-slate-500 font-bold block">First Question & Answer *</label>
              <input
                type="text"
                required
                value={newInterview.q1}
                onChange={e => setNewInterview({ ...newInterview, q1: e.target.value })}
                placeholder="Question 1..."
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <textarea
                rows={2}
                required
                value={newInterview.a1}
                onChange={e => setNewInterview({ ...newInterview, a1: e.target.value })}
                placeholder="Answer 1..."
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer"
            >
              Publish Spotlight Interview
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
};
