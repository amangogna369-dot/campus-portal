import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
} from '../controllers/eventController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authenticateToken, requireRoles('admin', 'faculty'), createEvent);
router.put('/:id', authenticateToken, requireRoles('admin', 'faculty'), updateEvent);
router.delete('/:id', authenticateToken, requireRoles('admin', 'faculty'), deleteEvent);
router.post('/:id/register', authenticateToken, registerForEvent);

export default router;
