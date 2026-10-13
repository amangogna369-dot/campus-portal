const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('campus_news_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; message: string; data: { user: any; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: any) =>
    request<{ success: boolean; message: string; data: { user: any; token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () =>
    request<{ success: boolean; data: any }>('/auth/me'),

  updateProfile: (profileData: any) =>
    request<{ success: boolean; message: string; data: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  changePassword: (passwords: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords),
    }),

  // Articles
  getArticles: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    return request<{ success: boolean; data: { articles: any[]; pagination: any } }>(`/articles?${query.toString()}`);
  },

  getFeaturedArticles: () =>
    request<{ success: boolean; data: any[] }>('/articles/featured'),

  getTrendingArticles: () =>
    request<{ success: boolean; data: any[] }>('/articles/trending'),

  getArticleBySlugOrId: (idOrSlug: string) =>
    request<{ success: boolean; data: any }>(`/articles/${idOrSlug}`),

  createArticle: (articleData: any) =>
    request<{ success: boolean; message: string; data: any }>('/articles', {
      method: 'POST',
      body: JSON.stringify(articleData),
    }),

  updateArticle: (id: string, articleData: any) =>
    request<{ success: boolean; message: string; data: any }>(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(articleData),
    }),

  deleteArticle: (id: string) =>
    request<{ success: boolean; message: string }>(`/articles/${id}`, {
      method: 'DELETE',
    }),

  updateArticleStatus: (id: string, status: string, rejectionReason?: string) =>
    request<{ success: boolean; message: string; data: any }>(`/articles/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, rejectionReason }),
    }),

  toggleLike: (id: string) =>
    request<{ success: boolean; data: { isLiked: boolean; likesCount: number } }>(`/articles/${id}/like`, {
      method: 'POST',
    }),

  toggleBookmark: (id: string) =>
    request<{ success: boolean; message: string; data: { isBookmarked: boolean } }>(`/articles/${id}/bookmark`, {
      method: 'POST',
    }),

  getUserBookmarks: () =>
    request<{ success: boolean; data: any[] }>('/articles/user/bookmarked'),

  getUserSubmissions: () =>
    request<{ success: boolean; data: any[] }>('/articles/user/my-submissions'),

  // Categories
  getCategories: () =>
    request<{ success: boolean; data: any[] }>('/categories'),

  createCategory: (categoryData: any) =>
    request<{ success: boolean; message: string; data: any }>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    }),

  updateCategory: (id: string, categoryData: any) =>
    request<{ success: boolean; message: string; data: any }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    }),

  deleteCategory: (id: string) =>
    request<{ success: boolean; message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    }),

  // Events
  getEvents: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    return request<{ success: boolean; data: any[] }>(`/events?${query.toString()}`);
  },

  getEventById: (id: string) =>
    request<{ success: boolean; data: any }>(`/events/${id}`),

  createEvent: (eventData: any) =>
    request<{ success: boolean; message: string; data: any }>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  updateEvent: (id: string, eventData: any) =>
    request<{ success: boolean; message: string; data: any }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }),

  deleteEvent: (id: string) =>
    request<{ success: boolean; message: string }>(`/events/${id}`, {
      method: 'DELETE',
    }),

  registerForEvent: (id: string) =>
    request<{ success: boolean; message: string; data: any }>(`/events/${id}/register`, {
      method: 'POST',
    }),

  // Announcements
  getAnnouncements: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    return request<{ success: boolean; data: any[] }>(`/announcements?${query.toString()}`);
  },

  createAnnouncement: (announcementData: any) =>
    request<{ success: boolean; message: string; data: any }>('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    }),

  updateAnnouncement: (id: string, announcementData: any) =>
    request<{ success: boolean; message: string; data: any }>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(announcementData),
    }),

  deleteAnnouncement: (id: string) =>
    request<{ success: boolean; message: string }>(`/announcements/${id}`, {
      method: 'DELETE',
    }),

  // Interviews
  getInterviews: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    return request<{ success: boolean; data: any[] }>(`/interviews?${query.toString()}`);
  },

  getInterviewById: (id: string) =>
    request<{ success: boolean; data: any }>(`/interviews/${id}`),

  createInterview: (interviewData: any) =>
    request<{ success: boolean; message: string; data: any }>('/interviews', {
      method: 'POST',
      body: JSON.stringify(interviewData),
    }),

  updateInterview: (id: string, interviewData: any) =>
    request<{ success: boolean; message: string; data: any }>(`/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(interviewData),
    }),

  deleteInterview: (id: string) =>
    request<{ success: boolean; message: string }>(`/interviews/${id}`, {
      method: 'DELETE',
    }),

  // Comments
  getComments: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    return request<{ success: boolean; data: any[] }>(`/comments?${query.toString()}`);
  },

  createComment: (commentData: { articleId: string; content: string }) =>
    request<{ success: boolean; message: string; data: any }>('/comments', {
      method: 'POST',
      body: JSON.stringify(commentData),
    }),

  deleteComment: (id: string) =>
    request<{ success: boolean; message: string }>(`/comments/${id}`, {
      method: 'DELETE',
    }),

  // Users (Admin)
  getUsers: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    return request<{ success: boolean; data: { users: any[]; pagination: any } }>(`/users?${query.toString()}`);
  },

  updateUserRole: (id: string, role: string) =>
    request<{ success: boolean; message: string; data: any }>(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  toggleUserStatus: (id: string) =>
    request<{ success: boolean; message: string; data: any }>(`/users/${id}/status`, {
      method: 'PUT',
    }),

  deleteUser: (id: string) =>
    request<{ success: boolean; message: string }>(`/users/${id}`, {
      method: 'DELETE',
    }),

  // Notifications
  getUserNotifications: () =>
    request<{ success: boolean; data: { notifications: any[]; unreadCount: number } }>('/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean; message: string }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: () =>
    request<{ success: boolean; message: string }>('/notifications/mark-all-read', {
      method: 'PUT',
    }),

  // Misc & Admin Dashboard
  getAdminStats: () =>
    request<{ success: boolean; data: any }>('/stats'),

  getActivityLogs: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    return request<{ success: boolean; data: any[] }>(`/activity-logs?${query.toString()}`);
  },

  submitContactMessage: (msg: { name: string; email: string; subject: string; message: string }) =>
    request<{ success: boolean; message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(msg),
    }),

  getContactMessages: () =>
    request<{ success: boolean; data: any[] }>('/contact'),

  deleteContactMessage: (id: string) =>
    request<{ success: boolean; message: string }>(`/contact/${id}`, {
      method: 'DELETE',
    }),

  subscribeNewsletter: (email: string) =>
    request<{ success: boolean; message: string }>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  getNewsletterSubscribers: () =>
    request<{ success: boolean; data: any[] }>('/newsletter/subscribers'),

  resetDatabase: () =>
    request<{ success: boolean; message: string; counts: any }>('/seed/reset', {
      method: 'POST',
    }),

  // AI Assistant
  callAIEditorial: (payload: { action: string; title?: string; content: string; category?: string }) =>
    request<{ success: boolean; source: string; data: { result: string; action: string } }>('/ai/editorial', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Supabase Database & Auth Integration
  getSupabaseStatus: () =>
    request<{
      success: boolean;
      data: {
        connected: boolean;
        url: string;
        projectId: string;
        authStatus: string;
        storageStatus: string;
        restStatus: string;
        authVersion: string;
        latencyMs: number;
        message: string;
        timestamp: string;
        config: {
          projectUrl: string;
          projectId: string;
          hasAnonKey: boolean;
          hasPublishableKey: boolean;
          publishableKeyPrefix: string | null;
        };
      };
    }>('/supabase/status'),

  getSupabaseSchema: () =>
    request<{
      success: boolean;
      data: {
        projectId: string;
        schemaSql: string;
        instructions: string[];
      };
    }>('/supabase/schema'),

  pingSupabase: () =>
    request<{
      success: boolean;
      message: string;
      latencyMs: number;
      data: any;
    }>('/supabase/ping', {
      method: 'POST',
    }),

  testSupabaseSignup: (data: { email: string; password: string; name?: string }) =>
    request<{
      success: boolean;
      message: string;
      data: any;
    }>('/supabase/test-signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSupabaseProfiles: () =>
    request<{
      success: boolean;
      count: number;
      data: any[];
      error?: string;
    }>('/supabase/profiles'),

  syncAllSupabaseProfiles: () =>
    request<{
      success: boolean;
      message: string;
      data: {
        syncedCount: number;
        totalUsers: number;
        errors: string[];
      };
    }>('/supabase/sync-all-profiles', {
      method: 'POST',
    }),

  getSupabaseFixPermissionsSql: () =>
    request<{
      success: boolean;
      data: {
        projectId: string;
        sql: string;
      };
    }>('/supabase/fix-permissions-sql'),
};
