import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { IContactMessage, INewsletterSubscriber } from '../db/schemaTypes.js';

export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin privileges required.' });
    return;
  }

  try {
    const [totalUsers, studentCount, facultyCount, adminCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ $or: [{ role: 'student' }, { role: 'user' }] }),
      User.countDocuments({ role: 'faculty' }),
      User.countDocuments({ role: 'admin' }),
    ]);

    const totalArticles = db.articles.length;
    const publishedArticles = db.articles.filter(a => a.status === 'published').length;
    const pendingArticles = db.articles.filter(a => a.status === 'pending').length;
    const draftArticles = db.articles.filter(a => a.status === 'draft').length;
    const rejectedArticles = db.articles.filter(a => a.status === 'rejected').length;

    const totalEvents = db.events.length;
    const upcomingEvents = db.events.filter(e => e.status === 'upcoming').length;
    const totalAnnouncements = db.announcements.length;
    const totalComments = db.comments.length;
    const totalInterviews = db.interviews.length;
    const totalViews = db.articles.reduce((acc, a) => acc + (a.views || 0), 0);
    const totalLikes = db.articles.reduce((acc, a) => acc + (a.likesCount || 0), 0);
    const totalSubscribers = db.newsletterSubscribers.filter(s => s.isActive).length;

    // Category breakdown
    const categoryStats = db.categories.map(c => {
      const count = db.articles.filter(
        a => a.categorySlug === c.slug || a.category.toLowerCase() === c.name.toLowerCase()
      ).length;
      return {
        name: c.name,
        slug: c.slug,
        count,
        color: c.color,
      };
    });

    // Top 5 most viewed articles
    const topArticles = [...db.articles]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        views: a.views,
        likesCount: a.likesCount,
        category: a.category,
        status: a.status,
      }));

    // Recent 10 activity logs
    const recentActivities = db.activityLogs.slice(0, 10);

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          studentCount,
          facultyCount,
          adminCount,
          totalArticles,
          publishedArticles,
          pendingArticles,
          draftArticles,
          rejectedArticles,
          totalEvents,
          upcomingEvents,
          totalAnnouncements,
          totalComments,
          totalInterviews,
          totalViews,
          totalLikes,
          totalSubscribers,
        },
        categoryStats,
        topArticles,
        recentActivities,
      },
    });
  } catch (err: any) {
    console.error('Error getting admin stats:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve administrative statistics.' });
  }
};

export const getActivityLogs = (req: AuthRequest, res: Response): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin privileges required.' });
    return;
  }

  const { search, limit = '50' } = req.query;
  let list = [...db.activityLogs];

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      l =>
        l.action.toLowerCase().includes(q) ||
        l.userName.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
    );
  }

  const limitNum = parseInt(limit as string, 10) || 50;
  res.json({ success: true, data: list.slice(0, limitNum) });
};

export const submitContactMessage = async (req: Request, res: Response): Promise<void> => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400).json({ success: false, message: 'All fields are required.' });
    return;
  }

  const newMsg: IContactMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
    isRead: false,
    replied: false,
    createdAt: new Date().toISOString(),
  };

  db.contactMessages.unshift(newMsg);
  db.save();

  db.logActivity('CONTACT_MESSAGE_RECEIVED', newMsg.name, `New message: ${newMsg.subject}`, undefined, 'auth');

  // Notify admins in MongoDB
  try {
    const admins = await User.find({ role: 'admin' });
    admins.forEach(admin => {
      db.createNotification(
        admin._id.toString(),
        'New Contact Inquiry Received',
        `From ${newMsg.name}: "${newMsg.subject}"`,
        'system',
        '/admin/messages'
      );
    });
  } catch (err) {
    console.error('Failed to notify admins of contact message:', err);
  }

  res.status(201).json({
    success: true,
    message: 'Thank you! Your message has been received by the editorial desk.',
  });
};

export const getContactMessages = (req: AuthRequest, res: Response): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin privileges required.' });
    return;
  }

  res.json({ success: true, data: db.contactMessages });
};

export const deleteContactMessage = (req: AuthRequest, res: Response): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin privileges required.' });
    return;
  }

  const { id } = req.params;
  const index = db.contactMessages.findIndex(m => m.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Message not found.' });
    return;
  }

  db.contactMessages.splice(index, 1);
  db.save();

  res.json({ success: true, message: 'Message deleted.' });
};

export const subscribeNewsletter = (req: Request, res: Response): void => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    return;
  }

  const existing = db.newsletterSubscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.json({ success: true, message: 'You are already subscribed to the Campus Weekly Bulletin!' });
    return;
  }

  const newSub: INewsletterSubscriber = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    email: email.toLowerCase().trim(),
    subscribedAt: new Date().toISOString(),
    isActive: true,
  };

  db.newsletterSubscribers.push(newSub);
  db.save();

  res.status(201).json({
    success: true,
    message: 'Thank you for subscribing to the Campus News Portal newsletter!',
  });
};

export const getNewsletterSubscribers = (req: AuthRequest, res: Response): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin privileges required.' });
    return;
  }

  res.json({ success: true, data: db.newsletterSubscribers });
};

export const resetDatabase = (req: AuthRequest, res: Response): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin privileges required.' });
    return;
  }

  const fresh = db.resetToSeed();
  db.logActivity('DATABASE_RESET', req.user.name, 'Reset portal content to original seeds', req.user.id);

  res.json({
    success: true,
    message: 'Database content has been refreshed successfully!',
    counts: {
      articles: fresh.articles.length,
      events: fresh.events.length,
      announcements: fresh.announcements.length,
      interviews: fresh.interviews.length,
    },
  });
};
