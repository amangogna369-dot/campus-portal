import { Router } from 'express';
import {
  getArticles,
  getFeaturedArticles,
  getTrendingArticles,
  getArticleBySlugOrId,
  createArticle,
  updateArticle,
  deleteArticle,
  updateArticleStatus,
  toggleLike,
  toggleBookmark,
  getUserBookmarks,
  getUserSubmissions,
} from '../controllers/articleController.js';
import { authenticateToken, optionalAuth, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getArticles);
router.get('/featured', getFeaturedArticles);
router.get('/trending', getTrendingArticles);
router.get('/user/bookmarked', authenticateToken, getUserBookmarks);
router.get('/user/my-submissions', authenticateToken, getUserSubmissions);
router.get('/:idOrSlug', optionalAuth, getArticleBySlugOrId);

router.post('/', authenticateToken, createArticle);
router.put('/:id', authenticateToken, updateArticle);
router.delete('/:id', authenticateToken, deleteArticle);
router.put('/:id/status', authenticateToken, requireRoles('admin'), updateArticleStatus);

router.post('/:id/like', authenticateToken, toggleLike);
router.post('/:id/bookmark', authenticateToken, toggleBookmark);

export default router;
