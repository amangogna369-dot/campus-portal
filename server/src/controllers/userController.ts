import { Response } from 'express';
import { User, UserRole } from '../models/User.js';
import { db } from '../db/index.js';
import { AuthRequest } from '../middleware/auth.js';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin privileges required.' });
    return;
  }

  try {
    const { role, department, search, page = '1', limit = '15' } = req.query;

    const filter: any = {};

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (department && department !== 'all') {
      filter.department = { $regex: department as string, $options: 'i' };
    }

    if (search) {
      const q = (search as string).trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { studentFacultyId: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 15);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    const safeUsers = users.map(u => u.toSafeObject());
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        users: safeUsers,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
        },
      },
    });
  } catch (err: any) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users from database.' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin privileges required.' });
    return;
  }

  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'user', 'faculty', 'admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role specified.' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found in database.' });
      return;
    }

    // Prevent demoting the last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        res.status(400).json({
          success: false,
          message: 'Cannot demote the only remaining administrator in the system.',
        });
        return;
      }
    }

    const oldRole = user.role;
    user.role = role as UserRole;
    await user.save();

    db.logActivity(
      'USER_ROLE_CHANGED',
      req.user.name,
      `Changed role of ${user.name} from ${oldRole} to ${role}`,
      req.user.id,
      'user',
      user._id.toString()
    );

    db.createNotification(
      user._id.toString(),
      'Role Privileges Updated',
      `Your account role has been updated to ${role} by administration.`,
      'system'
    );

    res.json({
      success: true,
      message: `Role successfully updated to ${role}.`,
      data: user.toSafeObject(),
    });
  } catch (err: any) {
    console.error('Error updating user role:', err);
    res.status(500).json({ success: false, message: 'Failed to update user role.' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin privileges required.' });
    return;
  }

  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found in database.' });
      return;
    }

    if (user._id.toString() === req.user.id) {
      res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrator account.',
      });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    db.logActivity(
      'USER_STATUS_TOGGLED',
      req.user.name,
      `${user.isActive ? 'Activated' : 'Deactivated'} account for ${user.name}`,
      req.user.id,
      'user',
      user._id.toString()
    );

    res.json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      data: user.toSafeObject(),
    });
  } catch (err: any) {
    console.error('Error toggling user status:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle user status.' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin privileges required.' });
    return;
  }

  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found in database.' });
      return;
    }

    if (user._id.toString() === req.user.id) {
      res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrator account.',
      });
      return;
    }

    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete the only remaining administrator.',
        });
        return;
      }
    }

    await User.findByIdAndDelete(id);

    db.logActivity(
      'USER_DELETED',
      req.user.name,
      `Deleted user account ${user.name} (${user.email})`,
      req.user.id,
      'user',
      id
    );

    res.json({ success: true, message: 'User deleted successfully from database.' });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};
