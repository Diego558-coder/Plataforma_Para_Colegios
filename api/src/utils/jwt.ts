import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export type JwtPayload = { userId: string; role: string; email: string };

export const signToken = (payload: JwtPayload): string => {
  const options: SignOptions = { expiresIn: env.tokenExpiresIn as any };
  return jwt.sign(payload, env.jwtSecret as string, options);
};

export const verifyToken = (token: string): JwtPayload => jwt.verify(token, env.jwtSecret as string) as JwtPayload;
