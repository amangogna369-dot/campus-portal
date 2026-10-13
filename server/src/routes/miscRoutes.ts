import { Router } from 'express';
import {
  getAdminStats,
  getActivityLogs,
  submitContactMessage,
  getContactMessages,
  deleteContactMessage,
  subscribeNewsletter,
  getNewsletterSubscribers,
  resetDatabase,
} from '../controllers/miscController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticateToken, requireRoles('admin'), getAdminStats);
router.get('/admin/stats', authenticateToken, requireRoles('admin'), getAdminStats);
router.get('/activity-logs', authenticateToken, requireRoles('admin'), getActivityLogs);
router.post('/contact', submitContactMessage);
router.get('/contact', authenticateToken, requireRoles('admin'), getContactMessages);
router.delete('/contact/:id', authenticateToken, requireRoles('admin'), deleteContactMessage);
router.post('/newsletter/subscribe', subscribeNewsletter);
router.get('/newsletter/subscribers', authenticateToken, requireRoles('admin'), getNewsletterSubscribers);
router.post('/seed/reset', authenticateToken, requireRoles('admin'), resetDatabase);

export default router;
