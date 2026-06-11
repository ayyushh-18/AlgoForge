import { Request, Response } from 'express';
import { prisma } from '../config/db';

// @desc    Get leaderboard data
// @route   GET /api/users/leaderboard
// @access  Public
export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const { limit = 10, sortBy = 'xp' } = req.query;

        let pipeline: any[] = [];

        pipeline.push({
            $project: {
                name: 1,
                xp_points: 1,
                streak_days: 1,
                solvedProblems: 1,
                avatar: 1,
                solvedCount: { $size: { $ifNull: ["$solvedProblems", []] } }
            }
        });

        if (sortBy === 'solved') {
            pipeline.push({ $sort: { solvedCount: -1 } });
        } else if (sortBy === 'streak') {
            pipeline.push({ $sort: { streak_days: -1 } });
        } else {
            pipeline.push({ $sort: { xp_points: -1 } });
        }

        pipeline.push({ $limit: Number(limit) });

        const leaderboard = await prisma.user.aggregateRaw({ pipeline }) as unknown as any[];

        const formattedLeaderboard = leaderboard.map((user: any, index: number) => ({
            id: user._id?.$oid || user._id,
            name: user.name,
            avatar: user.avatar || (user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'),
            xp: user.xp_points || 0,
            streak: user.streak_days || 0,
            solved: user.solvedCount || 0,
            rank: index + 1
        }));

        res.status(200).json(formattedLeaderboard);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get dashboard stats for logged-in user (rank, streak, weekly activity)
// @route   GET /api/users/dashboard-stats
// @access  Private
export const getDashboardStats = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const usersWithMoreXP = await prisma.user.count({ where: { xp_points: { gt: user.xp_points || 0 } } });
        const rank = usersWithMoreXP + 1;
        const totalUsers = await prisma.user.count();
        const topPercent = totalUsers > 0 ? Math.round((rank / totalUsers) * 100) : 100;

        let currentStreak = user.streak_days || 0;
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const lastActiveStr = user.last_active ? new Date(user.last_active).toISOString().split('T')[0] : null;

        if (lastActiveStr !== todayStr && lastActiveStr !== yesterdayStr) {
            currentStreak = 0;
        }

        const weekDays: string[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            weekDays.push(d.toISOString().split('T')[0]);
        }

        const activityLog = user.activityLog || [];
        const weeklyActivity = weekDays.map((dateStr: string) => {
            const entry = activityLog.find((log: any) => log.date === dateStr);
            return {
                date: dateStr,
                count: entry ? entry.count : 0
            };
        });

        res.status(200).json({
            rank,
            totalUsers,
            topPercent,
            currentStreak,
            weeklyActivity
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateUserProfile = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.id;
        const { name, avatar, avatarUrl } = req.body;

        // Validate inputs
        if (name !== undefined && (typeof name !== 'string' || name.length > 100)) {
            return res.status(400).json({ message: 'Invalid name' });
        }
        if (avatar !== undefined && avatar !== null && typeof avatar !== 'string') {
            return res.status(400).json({ message: 'Invalid avatar' });
        }
        if (avatarUrl !== undefined && avatarUrl !== null && typeof avatarUrl !== 'string') {
            return res.status(400).json({ message: 'Invalid avatar URL' });
        }

        const avatarData = avatar !== undefined ? avatar : avatarUrl;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name !== undefined ? name : user.name,
                avatar: avatarData !== undefined ? avatarData : user.avatar,
            }
        });

        res.status(200).json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            role: updatedUser.role,
            xp_points: updatedUser.xp_points,
            streak_days: updatedUser.streak_days,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};