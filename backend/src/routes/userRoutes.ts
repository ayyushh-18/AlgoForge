import express from 'express';
import { getLeaderboard, getDashboardStats, updateUserProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/dashboard-stats', protect, getDashboardStats);
router.put('/me', protect, updateUserProfile);

export default router;
