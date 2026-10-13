import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { CampusEvent } from '../../types/index.js';
import { AdminSidebar } from '../../components/admin/AdminSidebar.js';
import { Modal } from '../../components/common/Modal.js';
import { useNotifications } from '../../context/NotificationContext.js';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Users,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { showToast } = useNotifications();

  // Create form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'Technical',
    date: new Date().toISOString().slice(0, 10),
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: 'Seminar Hall 1',
    organizer: 'Department of Computer Applications',
    capacity: 150,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEvents({ search: searchQuery.trim() || undefined });
      setEvents(res.data);
    } catch (err: any) {
      showToast(err.message || 'Error fetching events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchQuery]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createEvent(newEvent);
      showToast(res.message, 'success');
      setIsCreateModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      showToast(err.message || 'Failed to create event', 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete event "${title}"?`)) return;
    try {
      await api.deleteEvent(id);
      showToast('Event deleted', 'info');
      fetchEvents();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete event', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Campus Events & Workshops Management
            </h1>
            <p className="text-xs text-slate-500">
              Create, publish, and track attendance capacity for university activities.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campus Event</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Event Name</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Venue</th>
                  <th className="p-4">Organizer</th>
                  <th className="p-4">Registered</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {events.map(evt => (
                  <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs">
                      <div className="line-clamp-1">{evt.title}</div>
                      <span className="text-[10px] text-blue-600 font-semibold">{evt.category}</span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      <div>{evt.date}</div>
                      <div className="text-[10px] text-slate-400">{evt.startTime}</div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{evt.venue}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{evt.organizer}</td>
                    <td className="p-4 font-mono font-semibold">
                      {evt.registeredCount} / {evt.capacity}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(evt.id, evt.title)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                        title="Delete event"
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

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Schedule New Campus Event"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="text-slate-500 block mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={newEvent.title}
                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="e.g. HackCampus 2026: 36-Hour Hackathon"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">Category</label>
                <select
                  value={newEvent.category}
                  onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Technical">Technical</option>
                  <option value="Academic">Academic</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Career">Career</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={newEvent.date}
                  onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                </input>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">Start Time</label>
                <input
                  type="text"
                  value={newEvent.startTime}
                  onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  placeholder="10:00 AM"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Capacity</label>
                <input
                  type="number"
                  value={newEvent.capacity}
                  onChange={e => setNewEvent({ ...newEvent, capacity: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 block mb-1">Venue *</label>
              <input
                type="text"
                required
                value={newEvent.venue}
                onChange={e => setNewEvent({ ...newEvent, venue: e.target.value })}
                placeholder="Auditorium Hall A"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-slate-500 block mb-1">Description *</label>
              <textarea
                rows={3}
                required
                value={newEvent.description}
                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Provide event overview and benefits..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer"
            >
              Publish Event
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
};
