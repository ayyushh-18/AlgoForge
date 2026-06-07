import { rateLimit } from 'express-rate-limit';
import { Request, Response } from 'express';

export const executionRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req: Request) => {
        return req.user?.id || req.ip;
    },

    handler: (req: Request, res: Response) => {
        const resetTime = (req as any).rateLimit?.resetTime;
        const retryAfter = resetTime
            ? Math.ceil((resetTime.getTime() - Date.now()) / 1000)
            : 60;

        res.setHeader('Retry-After', String(retryAfter));

        res.status(429).json({
            message: 'Too many requests, please try again later.'
        });
    }
});