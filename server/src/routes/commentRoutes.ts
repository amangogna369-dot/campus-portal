import { Router } from 'express';
import {
  getComments,
  createComment,
  deleteComment,
} from '../controllers/commentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', getComments);
router.post('/', authenticateToken, createComment);
router.delete('/:id', authenticateToken, deleteComment);

export default router;
