import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_keys_123';

export interface AuthRequest extends Request {
    user?: any; // Consider defining a proper User type
}

// 1. AUTHENTICATE: Verifies a valid JWT is present
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// 2. HAS PERMISSION: Checks for specific rights (NEW)
export const hasPermission = (required: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const userPermissions = req.user?.permissions || [];

        // Super Admins can do anything
        if (userPermissions.includes('super_admin')) {
            return next();
        }

        // Check if user has the required permission
        if (!userPermissions.includes(required)) {
            return res.status(403).json({ message: `Forbidden: Requires '${required}' permission` });
        }

        next();
    };
};

// 3. IS ADMIN (DEPRECATED - Use hasPermission instead for granularity)
// Kept for backwards compatibility during transition.
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    const userPermissions = req.user?.permissions || [];
    if (userPermissions.includes('super_admin') || userPermissions.includes('admin')) {
        return next();
    }
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
};
