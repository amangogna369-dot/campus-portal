export type UserRole = 'student' | 'faculty' | 'admin';

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
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

export interface IArticle {
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
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  order: number;
}

export interface IEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
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

export interface IAnnouncement {
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

export interface IInterviewQA {
  question: string;
  answer: string;
}

export interface IInterview {
  id: string;
  interviewee: string;
  designation: string;
  department: string;
  course?: string;
  profileImage: string;
  batchOrTenure?: string;
  introduction: string;
  quote: string;
  questionsAndAnswers: IInterviewQA[];
  authorId: string;
  authorName: string;
  interviewDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface IComment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: UserRole;
  content: string;
  createdAt: string;
}

export interface ILike {
  id: string;
  articleId: string;
  userId: string;
  createdAt: string;
}

export interface IBookmark {
  id: string;
  articleId: string;
  userId: string;
  createdAt: string;
}

export interface INotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'status_update' | 'comment' | 'announcement' | 'system' | 'editorial';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface IContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  replied: boolean;
  createdAt: string;
}

export interface INewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export interface IActivityLog {
  id: string;
  action: string;
  userId?: string;
  userName: string;
  details: string;
  entityType?: 'article' | 'user' | 'event' | 'announcement' | 'category' | 'auth';
  entityId?: string;
  createdAt: string;
}
