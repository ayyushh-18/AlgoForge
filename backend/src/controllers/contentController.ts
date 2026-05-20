import { Request, Response } from 'express';
import { prisma } from '../config/db';

// @desc    Get all learning paths
// @route   GET /api/content/paths
// @access  Public
export const getLearningPaths = async (req: Request, res: Response) => {
    try {
        const paths = await prisma.learningPath.findMany({
            orderBy: { order_index: 'asc' }
        });

        const pathsWithCounts = await Promise.all(paths.map(async (path: any) => {
            const topics = await prisma.topic.findMany({
                where: { path_slug: path.slug },
                select: { slug: true }
            });
            const topicSlugs = topics.map(t => t.slug);
            const totalProblems = await prisma.problem.count({
                where: { topic_slug: { in: topicSlugs } }
            });
            // Map slug back to id for frontend compatibility
            return { ...path, id: path.slug, totalProblems };
        }));

        res.json(pathsWithCounts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get topics by learning path ID (slug)
// @route   GET /api/content/paths/:pathId/topics
// @access  Public
export const getTopicsByPath = async (req: Request, res: Response) => {
    try {
        const { pathId } = req.params;
        const topics = await prisma.topic.findMany({
            where: { path_slug: pathId },
            orderBy: { order_index: 'asc' }
        });
        
        res.json(topics.map(t => ({ ...t, id: t.slug })));
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get topic by ID (slug)
// @route   GET /api/content/topics/:topicId
// @access  Public
export const getTopicById = async (req: Request, res: Response) => {
    try {
        const { topicId } = req.params;
        const topic = await prisma.topic.findUnique({
            where: { slug: topicId }
        });
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        res.json({ ...topic, id: topic.slug });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all topics
// @route   GET /api/content/topics
// @access  Public
export const getAllTopics = async (req: Request, res: Response) => {
    try {
        const topics = await prisma.topic.findMany({
            orderBy: { order_index: 'asc' }
        });
        res.json(topics.map(t => ({ ...t, id: t.slug })));
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get problems by topic ID (slug)
// @route   GET /api/content/topics/:topicId/problems
// @access  Public (Authenticated user will get progress status later)
export const getProblemsByTopic = async (req: Request, res: Response) => {
    try {
        const { topicId } = req.params;
        const problems = await prisma.problem.findMany({
            where: { topic_slug: topicId },
            orderBy: { order_index: 'asc' }
        });
        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all problems
// @route   GET /api/content/problems
// @access  Public
export const getAllProblems = async (req: Request, res: Response) => {
    try {
        const problems = await prisma.problem.findMany({
            orderBy: { order_index: 'asc' }
        });
        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
