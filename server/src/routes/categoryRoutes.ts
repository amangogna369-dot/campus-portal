import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticateToken, requireRoles('admin'), createCategory);
router.put('/:id', authenticateToken, requireRoles('admin'), updateCategory);
router.delete('/:id', authenticateToken, requireRoles('admin'), deleteCategory);

export default router;
