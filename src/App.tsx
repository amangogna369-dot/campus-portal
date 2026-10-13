import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { Header } from './components/common/Header.js';
import { Navbar } from './components/common/Navbar.js';
import { Footer } from './components/common/Footer.js';
import { ToastContainer } from './components/common/Toast.js';

// Public & User Pages
import { Home } from './pages/Home.js';
import { NewsList } from './pages/NewsList.js';
import { ArticleDetail } from './pages/ArticleDetail.js';
import { EventsPage } from './pages/EventsPage.js';
import { AnnouncementsPage } from './pages/AnnouncementsPage.js';
import { InterviewsPage } from './pages/InterviewsPage.js';
import { InterviewDetail } from './pages/InterviewDetail.js';
import { StudentActivitiesPage } from './pages/StudentActivitiesPage.js';
import { AchievementsPage } from './pages/AchievementsPage.js';
import { ClubsPage } from './pages/ClubsPage.js';
import { SportsPage } from './pages/SportsPage.js';
import { PlacementsPage } from './pages/PlacementsPage.js';
import { SearchPage } from './pages/SearchPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { SubmitArticlePage } from './pages/SubmitArticlePage.js';
import { BookmarksPage } from './pages/BookmarksPage.js';
import { MySubmissionsPage } from './pages/MySubmissionsPage.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AdminArticles } from './pages/admin/AdminArticles.js';
import { AdminSubmissions } from './pages/admin/AdminSubmissions.js';
import { AdminEvents } from './pages/admin/AdminEvents.js';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements.js';
import { AdminInterviews } from './pages/admin/AdminInterviews.js';
import { AdminCategories } from './pages/admin/AdminCategories.js';
import { AdminUsers } from './pages/admin/AdminUsers.js';
import { AdminComments } from './pages/admin/AdminComments.js';
import { AdminMessages } from './pages/admin/AdminMessages.js';
import { AdminNewsletter } from './pages/admin/AdminNewsletter.js';
import { AdminActivityLogs } from './pages/admin/AdminActivityLogs.js';
import { AdminSettings } from './pages/admin/AdminSettings.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <Header />
      {!isAdminRoute && <Navbar />}

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/interviews" element={<InterviewsPage />} />
          <Route path="/interviews/:id" element={<InterviewDetail />} />
          <Route path="/activities" element={<StudentActivitiesPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/sports" element={<SportsPage />} />
          <Route path="/placements" element={<PlacementsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* User Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/submit-article" element={<SubmitArticlePage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/my-submissions" element={<MySubmissionsPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/articles" element={<AdminArticles />} />
          <Route path="/admin/submissions" element={<AdminSubmissions />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/interviews" element={<AdminInterviews />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/comments" element={<AdminComments />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/newsletter" element={<AdminNewsletter />} />
          <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      {!isAdminRoute && <Footer />}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
