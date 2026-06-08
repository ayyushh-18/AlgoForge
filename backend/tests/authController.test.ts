import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';



const verifyIdTokenMock = vi.hoisted(() => vi.fn());

vi.mock('google-auth-library', () => {
    return {
        OAuth2Client: function(this: any) {
            this.verifyIdToken = verifyIdTokenMock;
        }
    };
});

vi.mock('../src/config/db', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        }
    }
}));

import { registerUser, loginUser, googleAuth } from '../src/controllers/authController';
import { prisma } from '../src/config/db';

beforeEach(() => {
    vi.clearAllMocks();
});
// Helper to make mock req/res
const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const mockReq = (body: object) => ({ body } as any);

// ── registerUser ──────────────────────────────────────────────

describe('registerUser', () => {
    it('returns 400 if fields are missing', async () => {
        const req = mockReq({ name: '', email: '', password: '' });
        const res = mockRes();

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Please add all fields' });
    });

    it('returns 400 if user already exists', async () => {
        (prisma.user.findUnique as any).mockResolvedValue({ id: '1', email: 'test@test.com' });

        const req = mockReq({ name: 'Aditi', email: 'test@test.com', password: 'pass123' });
        const res = mockRes();

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });

    it('creates user and returns 201 with token', async () => {
        (prisma.user.findUnique as any).mockResolvedValue(null);
        (prisma.user.create as any).mockResolvedValue({
            id: 'abc123',
            name: 'Aditi',
            email: 'aditi@test.com',
            role: 'USER',
            xp_points: 0,
            streak_days: 0,
            solvedProblems: [],
            bookmarks: [],
            activityLog: []
        });

        const req = mockReq({ name: 'Aditi', email: 'aditi@test.com', password: 'pass123' });
        const res = mockRes();

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            _id: 'abc123',
            email: 'aditi@test.com',
            token: expect.any(String)
        }));
    });
});

// ── loginUser ─────────────────────────────────────────────────

describe('loginUser', () => {
    it('returns 400 for invalid credentials', async () => {
        (prisma.user.findUnique as any).mockResolvedValue(null);

        const req = mockReq({ email: 'wrong@test.com', password: 'wrongpass' });
        const res = mockRes();

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('returns 403 if user is banned', async () => {
        const hashed = await bcrypt.hash('pass123', 10);
        (prisma.user.findUnique as any).mockResolvedValue({
            id: '1',
            email: 'banned@test.com',
            password: hashed,
            isBanned: true
        });

        const req = mockReq({ email: 'banned@test.com', password: 'pass123' });
        const res = mockRes();

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Your account has been suspended' });
    });

    it('returns user + token for valid credentials', async () => {
        const hashed = await bcrypt.hash('pass123', 10);
        (prisma.user.findUnique as any).mockResolvedValue({
            id: 'abc123',
            name: 'Aditi',
            email: 'aditi@test.com',
            password: hashed,
            isBanned: false,
            role: 'USER',
            xp_points: 100,
            streak_days: 3,
            solvedProblems: [],
            bookmarks: [],
            activityLog: []
        });

        const req = mockReq({ email: 'aditi@test.com', password: 'pass123' });
        const res = mockRes();

        await loginUser(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            _id: 'abc123',
            token: expect.any(String)
        }));
    });
});
// ── googleAuth ────────────────────────────────────────────────


describe('googleAuth', () => {
    it('returns 400 for invalid google token', async () => {
        verifyIdTokenMock.mockRejectedValueOnce(new Error('invalid token'));
        const req = mockReq({ token: 'bad-token' });
        const res = mockRes();

        await googleAuth(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Google Auth Failed' });
    });
});