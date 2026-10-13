import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { NewsletterSubscriber } from '../../types/index.js';
import { AdminSidebar } from '../../components/admin/AdminSidebar.js';
import { Mail, CheckCircle2, Calendar } from 'lucide-react';

export const AdminNewsletter: React.FC = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);

  useEffect(() => {
    api.getNewsletterSubscribers().then(res => setSubscribers(res.data)).catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-6 overflow-y-auto">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
            Newsletter Subscribers ({subscribers.length})
          </h1>
          <p className="text-xs text-slate-500">
            Registered recipients for the weekly campus bulletin and breaking news email digest.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden max-w-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Subscriber Email</th>
                <th className="p-4">Subscribed Date</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subscribers.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-mono font-semibold text-slate-900 dark:text-white">
                    {sub.email}
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(sub.subscribedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
