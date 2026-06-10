import { rateLimit } from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Express rate-limiter middleware for the code-execution endpoint.
 *
 * Limits each user (identified by their authenticated user ID, falling back to
 * IP address) to 20 execution requests per 60-second window. When the limit is
 * exceeded it responds with HTTP 429 and a `Retry-After` header indicating how
 * many seconds remain before the window resets.
 */
export const executionRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,

    /**
     * Generates a unique key per requester.
     * Uses the authenticated user's ID when available, otherwise falls back to
     * the client IP address so that unauthenticated callers are still throttled.
     *
     * @param req - The incoming Express request.
     * @returns A string key identifying the requester.
     */
    keyGenerator: (req: Request) => {
        return req.user?.id || req.ip;
    },

    /**
     * Custom rate-limit exceeded handler.
     * Sets the `Retry-After` header and returns a 429 JSON response.
     *
     * @param req - The incoming Express request.
     * @param res - The Express response object.
     */
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