import { Router } from 'express';
import {
  getUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} from '../controllers/userController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, requireRoles('admin'), getUsers);
router.put('/:id/role', authenticateToken, requireRoles('admin'), updateUserRole);
router.put('/:id/status', authenticateToken, requireRoles('admin'), toggleUserStatus);
router.delete('/:id', authenticateToken, requireRoles('admin'), deleteUser);

export default router;
