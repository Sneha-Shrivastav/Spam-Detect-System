// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET as string

declare module 'express-serve-static-core' {
  interface Request {
    userId?: number;
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({ status: false, message: 'Please provide a token for authentication' });
    }

    const decodedToken = jwt.verify(token, secret) as jwt.JwtPayload;

    if (decodedToken.exp && decodedToken.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ status: false, message: 'Token has expired' });
    }

    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    return res.status(500).json({ status: false, message: 'Invalid token' });
  }
};


export default { authenticate };