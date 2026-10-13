import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { CampusEvent } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  Users,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [statusFilter, setStatusFilter] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth();
  const { showToast } = useNotifications();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await api.getEvents({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          search: searchQuery.trim() || undefined,
        });
        setEvents(res.data);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [statusFilter, categoryFilter, searchQuery]);

  const handleRegister = async (event: CampusEvent) => {
    if (!isAuthenticated) {
      showToast('Please log in with student or faculty credentials to register.', 'info');
      return;
    }

    try {
      const res = await api.registerForEvent(event.id);
      showToast(res.message, 'success');
      setEvents(prev =>
        prev.map(e => (e.id === event.id ? { ...e, registeredCount: e.registeredCount + 1 } : e))
      );
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    }
  };

  const categories = ['All', 'Technical', 'Academic', 'Cultural', 'Sports', 'Career'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-serif">
          Campus Events & Workshops
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Discover upcoming tech fests, guest lectures, hackathons, sports meets, and cultural festivals.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search events by name, organizer, or venue..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'upcoming'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Upcoming ({events.filter(e => e.status === 'upcoming').length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Past Events
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat.toLowerCase())}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat.toLowerCase()
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-base font-bold text-slate-900 dark:text-white">
            No events found matching your criteria.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Check back later for newly announced campus workshops and activities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(evt => {
            const dateObj = new Date(evt.date);
            const isFull = evt.registeredCount >= evt.capacity;
            const progress = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100));

            return (
              <div
                key={evt.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white dark:bg-slate-900 rounded-xl p-2 text-center shadow-md min-w-[50px]">
                      <div className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">
                        {dateObj.toLocaleDateString(undefined, { month: 'short' })}
                      </div>
                      <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                        {dateObj.getDate()}
                      </div>
                    </div>

                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-900/80 text-white backdrop-blur-xs">
                      {evt.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif leading-snug group-hover:text-blue-600 transition-colors">
                      {evt.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{evt.startTime} - {evt.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Organized by: <strong className="text-slate-700 dark:text-slate-300">{evt.organizer}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer and Registration */}
                <div className="p-5 pt-0">
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Registrations</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {evt.registeredCount} / {evt.capacity} ({progress}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? 'bg-rose-500' : progress > 80 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {evt.status === 'upcoming' ? (
                    <button
                      onClick={() => handleRegister(evt)}
                      disabled={isFull}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isFull
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                      }`}
                    >
                      {isFull ? (
                        <span>Capacity Reached</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Register For Free</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 text-center">
                      Event Concluded
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
