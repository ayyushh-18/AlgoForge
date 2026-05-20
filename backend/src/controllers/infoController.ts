import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getStats = async (req: Request, res: Response) => {
    try {
        const userCount = await prisma.user.count();
        const problemCount = await prisma.problem.count();
        const roadmapCount = await prisma.learningPath.count();

        // Count problems with video links (where video_link is neither null nor empty string)
        const videoCount = await prisma.problem.count({
            where: {
                video_link: { not: null, notIn: [""] }
            }
        });

        res.status(200).json({
            userCount,
            problemCount,
            roadmapCount,
            videoCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
