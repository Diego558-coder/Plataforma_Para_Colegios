import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string };
}

export const requireAuth = (roles?: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.userId, role: payload.role, email: payload.email };
      if (roles && !roles.includes(payload.role)) {
        return res.status(403).json({ message: 'Permisos insuficientes' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  };
};
