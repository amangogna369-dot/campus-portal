import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { ContactMessage } from '../../types/index.js';
import { AdminSidebar } from '../../components/admin/AdminSidebar.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { Mail, Trash2, Calendar, User, Clock } from 'lucide-react';

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotifications();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.getContactMessages();
      setMessages(res.data);
    } catch (err: any) {
      showToast(err.message || 'Error loading contact messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.deleteContactMessage(id);
      showToast('Message deleted', 'info');
      fetchMessages();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete message', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-6 overflow-y-auto">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
            Visitor & Student Inquiries ({messages.length})
          </h1>
          <p className="text-xs text-slate-500">
            Messages received via the public press and contact desk.
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No contact messages received.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{msg.name}</span>
                    <span className="text-xs text-blue-600 font-mono">({msg.email})</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{msg.subject}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{msg.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-1 font-mono">
                    Received: {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <a
                    href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 font-bold text-xs hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    Reply by Email
                  </a>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
