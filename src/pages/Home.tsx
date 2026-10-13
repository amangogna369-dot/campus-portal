import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Article, CampusEvent, Announcement, Interview } from '../types/index.js';
import { HeroFeatured } from '../components/news/HeroFeatured.js';
import { ArticleCard } from '../components/news/ArticleCard.js';
import { useNotifications } from '../context/NotificationContext.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Calendar,
  Clock,
  MapPin,
  Megaphone,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Trophy,
  Users,
  Briefcase,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export const Home: React.FC = () => {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CampusEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const { showToast } = useNotifications();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, latestRes, trendRes, evtsRes, annRes, intRes] = await Promise.all([
          api.getFeaturedArticles(),
          api.getArticles({ limit: 8, status: 'published' }),
          api.getTrendingArticles(),
          api.getEvents({ status: 'upcoming', limit: 4 }),
          api.getAnnouncements({ status: 'active', limit: 5 }),
          api.getInterviews({ limit: 3 }),
        ]);

        setFeaturedArticles(featRes.data);
        setLatestArticles(latestRes.data.articles);
        setTrendingArticles(trendRes.data);
        setUpcomingEvents(evtsRes.data);
        setAnnouncements(annRes.data);
        setInterviews(intRes.data);
      } catch (err: any) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleRegisterEvent = async (event: CampusEvent) => {
    if (!isAuthenticated) {
      showToast('Please log in with student credentials to register for campus events.', 'info');
      return;
    }
    try {
      const res = await api.registerForEvent(event.id);
      showToast(res.message, 'success');
      setUpcomingEvents(prev =>
        prev.map(e => (e.id === event.id ? { ...e, registeredCount: e.registeredCount + 1 } : e))
      );
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    }
  };

  const categories = [
    { label: 'All News', slug: 'all' },
    { label: 'Campus News', slug: 'campus-news' },
    { label: 'Events & Workshops', slug: 'events' },
    { label: 'Student Activities', slug: 'student-activities' },
    { label: 'Achievements', slug: 'achievements' },
    { label: 'Placements & Careers', slug: 'placements' },
    { label: 'Sports', slug: 'sports' },
  ];

  const filteredLatest =
    selectedCategory === 'all'
      ? latestArticles
      : latestArticles.filter(a => a.categorySlug === selectedCategory);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">Loading Campus News Portal...</p>
      </div>
    );
  }

  const heroArticle = featuredArticles[0] || latestArticles[0];
  const secondaryFeatured = featuredArticles.slice(1, 3);

  return (
    <div className="space-y-16 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Section */}
        <section className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Main Featured Big Banner */}
            <div className="lg:col-span-8">
              {heroArticle && <HeroFeatured article={heroArticle} />}
            </div>

            {/* Trending & Editor's Picks Column */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-serif">
                    Trending On Campus
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Most Read
                </span>
              </div>

              <div className="space-y-1 flex-1">
                {trendingArticles.slice(0, 4).map((art, idx) => (
                  <ArticleCard
                    key={art.id}
                    article={art}
                    variant="trending"
                    rankNumber={idx + 1}
                  />
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                <Link
                  to="/news?sort=most_viewed"
                  className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                >
                  <span>View All Trending Stories</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Priority Announcements Banner Board */}
        {announcements.length > 0 && (
          <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-md animate-bounce">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif">
                    Official Campus Notices & Bulletins
                  </h2>
                  <p className="text-xs text-blue-200">
                    Direct academic notifications from Examination Cell, Registrar, and T&P Cell
                  </p>
                </div>
              </div>

              <Link
                to="/announcements"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-colors shrink-0"
              >
                <span>All Circulars</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {announcements.slice(0, 3).map(ann => {
                const priorityBadge =
                  ann.priority === 'urgent'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : ann.priority === 'important'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/30';

                return (
                  <div
                    key={ann.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${priorityBadge}`}>
                          {ann.priority}
                        </span>
                        <span className="text-[10px] text-slate-300">
                          {ann.department}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {ann.title}
                      </h4>
                      <p className="mt-2 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {ann.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(ann.publishDate).toLocaleDateString()}</span>
                      <Link to="/announcements" className="text-blue-300 hover:text-white font-medium flex items-center gap-1">
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Latest News Grid with Category Pills */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Verified Campus Coverage</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
                Latest Campus Dispatches
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat.slug
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLatest.slice(0, 6).map(article => (
              <ArticleCard key={article.id} article={article} variant="standard" />
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              to="/news"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
            >
              <span>Explore All News & Archives</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Upcoming Campus Events & Workshops */}
        <section className="space-y-6">
          <div className="flex items-end justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4" />
                <span>Mark Your Calendar</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
                Upcoming Events & Workshops
              </h2>
            </div>
            <Link
              to="/events"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Full Schedule</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.slice(0, 4).map(evt => {
              const eventDateObj = new Date(evt.date);
              const day = eventDateObj.getDate();
              const month = eventDateObj.toLocaleDateString(undefined, { month: 'short' });

              const isFull = evt.registeredCount >= evt.capacity;

              return (
                <div
                  key={evt.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-white dark:bg-slate-900 rounded-xl p-2 text-center shadow-md min-w-[48px]">
                      <div className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">
                        {month}
                      </div>
                      <div className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">
                        {day}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 tracking-wider">
                        {evt.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mt-1 font-serif leading-snug">
                        {evt.title}
                      </h4>
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>

                    <div className="mt-4 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Capacity: {evt.registeredCount}/{evt.capacity}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {evt.startTime}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRegisterEvent(evt)}
                        disabled={isFull}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isFull
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        {isFull ? (
                          <span>Full Capacity</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Quick Register</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Spotlight Interviews */}
        {interviews.length > 0 && (
          <section className="p-8 sm:p-10 rounded-3xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <div className="flex items-end justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Campus Voices & Profiles
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif mt-1">
                  Spotlight Interviews
                </h2>
              </div>
              <Link
                to="/interviews"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Read All Interviews</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {interviews.slice(0, 3).map(interview => (
                <Link
                  key={interview.id}
                  to={`/interviews/${interview.id}`}
                  className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <img
                        src={interview.profileImage}
                        alt={interview.interviewee}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/20"
                      />
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {interview.interviewee}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {interview.designation}
                        </p>
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                          {interview.department}
                        </span>
                      </div>
                    </div>

                    <blockquote className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic border-l-2 border-indigo-500 pl-3 leading-relaxed mb-4">
                      "{interview.quote}"
                    </blockquote>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>{interview.questionsAndAnswers.length} Questions</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Full Interview</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
