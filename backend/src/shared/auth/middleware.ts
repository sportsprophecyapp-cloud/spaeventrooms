import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken'; // Setup jwt later

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        // allowing guest for now or returning 401
        // return res.status(401).json({ message: 'Authentication required' });
        // For development scaffolding, pass through as guest if needed, or enforce.
        // Let's enforce 401 but generic for now.
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        // req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
