import { Router } from 'express';
import { handleAIEditorial } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/editorial', authenticateToken, handleAIEditorial);

export default router;
