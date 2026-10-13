import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { User } from '../models/User.js';
import { IAnnouncement, AnnouncementPriority } from '../db/schemaTypes.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAnnouncements = (req: Request, res: Response): void => {
  const { department, priority, search, status = 'active' } = req.query;

  let list = [...db.announcements];

  if (status && status !== 'all') {
    list = list.filter(a => a.status === status);
  }

  if (department && department !== 'all') {
    list = list.filter(a => a.department.toLowerCase() === (department as string).toLowerCase());
  }

  if (priority && priority !== 'all') {
    list = list.filter(a => a.priority === priority);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      a =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q)
    );
  }

  // Prioritize pinned and urgent announcements
  list.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const priorityWeight: Record<AnnouncementPriority, number> = { urgent: 3, important: 2, normal: 1 };
    if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.json({ success: true, data: list });
};

export const createAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'faculty')) {
    res.status(403).json({ success: false, message: 'Admin or faculty privileges required.' });
    return;
  }

  const { title, description, department, priority = 'normal', expiryDate, attachmentUrl, attachmentName, pinned = false } = req.body;

  if (!title || !description) {
    res.status(400).json({ success: false, message: 'Title and description are required.' });
    return;
  }

  const newAnn: IAnnouncement = {
    id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title: title.trim(),
    description: description.trim(),
    department: department?.trim() || req.user.department || 'Administration',
    priority: priority as AnnouncementPriority,
    publishDate: new Date().toISOString(),
    expiryDate,
    attachmentUrl,
    attachmentName,
    status: 'active',
    pinned: Boolean(pinned),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.announcements.unshift(newAnn);
  db.save();

  db.logActivity('ANNOUNCEMENT_CREATED', req.user.name, `Created announcement: ${newAnn.title}`, req.user.id, 'announcement', newAnn.id);

  // If urgent or important, broadcast notification to all active students & faculty
  if (newAnn.priority === 'urgent' || newAnn.priority === 'important') {
    try {
      const activeUsers = await User.find({ isActive: true });
      activeUsers.forEach(u => {
        db.createNotification(
          u._id.toString(),
          `New ${newAnn.priority.toUpperCase()} Announcement`,
          newAnn.title,
          'announcement',
          '/announcements'
        );
      });
    } catch (err) {
      console.error('Error notifying users:', err);
    }
  }

  res.status(201).json({ success: true, message: 'Announcement published successfully!', data: newAnn });
};

export const updateAnnouncement = (req: AuthRequest, res: Response): void => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'faculty')) {
    res.status(403).json({ success: false, message: 'Permission denied.' });
    return;
  }

  const { id } = req.params;
  const ann = db.announcements.find(a => a.id === id);

  if (!ann) {
    res.status(404).json({ success: false, message: 'Announcement not found.' });
    return;
  }

  const { title, description, department, priority, expiryDate, attachmentUrl, attachmentName, pinned, status } = req.body;

  if (title) ann.title = title.trim();
  if (description) ann.description = description.trim();
  if (department) ann.department = department.trim();
  if (priority) ann.priority = priority;
  if (expiryDate !== undefined) ann.expiryDate = expiryDate;
  if (attachmentUrl !== undefined) ann.attachmentUrl = attachmentUrl;
  if (attachmentName !== undefined) ann.attachmentName = attachmentName;
  if (pinned !== undefined) ann.pinned = Boolean(pinned);
  if (status) ann.status = status;

  ann.updatedAt = new Date().toISOString();
  db.save();

  db.logActivity('ANNOUNCEMENT_UPDATED', req.user.name, `Updated announcement "${ann.title}"`, req.user.id, 'announcement', ann.id);

  res.json({ success: true, message: 'Announcement updated successfully.', data: ann });
};

export const deleteAnnouncement = (req: AuthRequest, res: Response): void => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'faculty')) {
    res.status(403).json({ success: false, message: 'Permission denied.' });
    return;
  }

  const { id } = req.params;
  const index = db.announcements.findIndex(a => a.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Announcement not found.' });
    return;
  }

  const [removed] = db.announcements.splice(index, 1);
  db.save();

  db.logActivity('ANNOUNCEMENT_DELETED', req.user.name, `Deleted announcement "${removed.title}"`, req.user.id, 'announcement', id);

  res.json({ success: true, message: 'Announcement deleted successfully.' });
};
