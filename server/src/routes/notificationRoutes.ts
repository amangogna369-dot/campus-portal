import { Router } from 'express';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getUserNotifications);
router.put('/:id/read', authenticateToken, markNotificationRead);
router.put('/mark-all-read', authenticateToken, markAllNotificationsRead);

export default router;
