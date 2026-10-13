import { Response } from 'express';
import { db } from '../db/index.js';
import { AuthRequest } from '../middleware/auth.js';

export const getUserNotifications = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const list = db.notifications
    .filter(n => n.userId === req.user!.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = list.filter(n => !n.isRead).length;

  res.json({
    success: true,
    data: {
      notifications: list,
      unreadCount,
    },
  });
};

export const markNotificationRead = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const { id } = req.params;
  const notif = db.notifications.find(n => n.id === id && n.userId === req.user!.id);

  if (!notif) {
    res.status(404).json({ success: false, message: 'Notification not found.' });
    return;
  }

  notif.isRead = true;
  db.save();

  res.json({ success: true, message: 'Notification marked as read.' });
};

export const markAllNotificationsRead = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  db.notifications
    .filter(n => n.userId === req.user!.id && !n.isRead)
    .forEach(n => {
      n.isRead = true;
    });

  db.save();
  res.json({ success: true, message: 'All notifications marked as read.' });
};
