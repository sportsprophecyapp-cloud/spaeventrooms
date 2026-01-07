import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query as dbQuery } from '../database';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_keys_123';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

/**
 * STRICT ADMIN MIDDLEWARE
 * Verifies the user has 'super_admin' or 'admin' role in the DB
 */
export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const result = await dbQuery('SELECT role FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.status(401).json({ message: 'User not found' });

        const role = result.rows[0].role;
        if (role === 'super_admin' || role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Admins only.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during auth check' });
    }
};
