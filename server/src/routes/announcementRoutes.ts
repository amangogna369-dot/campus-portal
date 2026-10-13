import { Router } from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', getAnnouncements);
router.post('/', authenticateToken, requireRoles('admin', 'faculty'), createAnnouncement);
router.put('/:id', authenticateToken, requireRoles('admin', 'faculty'), updateAnnouncement);
router.delete('/:id', authenticateToken, requireRoles('admin', 'faculty'), deleteAnnouncement);

export default router;
