import { Router } from 'express';
import {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
} from '../controllers/interviewController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', getInterviews);
router.get('/:id', getInterviewById);
router.post('/', authenticateToken, requireRoles('admin', 'faculty'), createInterview);
router.put('/:id', authenticateToken, requireRoles('admin', 'faculty'), updateInterview);
router.delete('/:id', authenticateToken, requireRoles('admin', 'faculty'), deleteInterview);

export default router;
