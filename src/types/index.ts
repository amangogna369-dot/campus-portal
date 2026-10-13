export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentFacultyId: string;
  department: string;
  course: string;
  year?: string;
  avatar: string;
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ArticleStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';

export interface Article {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  featuredImage: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorDepartment: string;
  authorAvatar?: string;
  category: string;
  categorySlug: string;
  tags: string[];
  status: ArticleStatus;
  isFeatured: boolean;
  isBreaking: boolean;
  views: number;
  likesCount: number;
  readTime: string;
  rejectionReason?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Detail page extensions
  comments?: Comment[];
  related?: Article[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  order: number;
  articleCount?: number;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  organizer: string;
  image: string;
  registrationLink?: string;
  capacity: number;
  registeredCount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export interface Announcement {
  id: string;
  title: string;
  description: string;
  department: string;
  priority: AnnouncementPriority;
  publishDate: string;
  expiryDate?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: 'active' | 'archived';
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQA {
  question: string;
  answer: string;
}

export interface Interview {
  id: string;
  interviewee: string;
  designation: string;
  department: string;
  course?: string;
  profileImage: string;
  batchOrTenure?: string;
  introduction: string;
  quote: string;
  questionsAndAnswers: InterviewQA[];
  authorId: string;
  authorName: string;
  interviewDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  articleId: string;
  articleTitle?: string;
  articleSlug?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: UserRole;
  content: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'status_update' | 'comment' | 'announcement' | 'system' | 'editorial';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  replied: boolean;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  userId?: string;
  userName: string;
  details: string;
  entityType?: 'article' | 'user' | 'event' | 'announcement' | 'category' | 'auth';
  entityId?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalUsers: number;
  studentCount: number;
  facultyCount: number;
  adminCount: number;
  totalArticles: number;
  publishedArticles: number;
  pendingArticles: number;
  draftArticles: number;
  rejectedArticles: number;
  totalEvents: number;
  upcomingEvents: number;
  totalAnnouncements: number;
  totalComments: number;
  totalInterviews: number;
  totalViews: number;
  totalLikes: number;
  totalSubscribers: number;
}

export interface CategoryStat {
  name: string;
  slug: string;
  count: number;
  color: string;
}

export interface TopArticleItem {
  id: string;
  title: string;
  slug: string;
  views: number;
  likesCount: number;
  category: string;
  status: ArticleStatus;
}
