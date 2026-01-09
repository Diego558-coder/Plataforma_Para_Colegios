import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { comparePassword, hashPassword } from '../utils/crypto.js';
import { signToken } from '../utils/jwt.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Datos inválidos' });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Credenciales incorrectas' });

  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId
    }
  });
});

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']).optional(),
  schoolId: z.string().optional()
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Datos inválidos' });

  const data = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) return res.status(409).json({ message: 'Email ya registrado' });

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || 'STUDENT',
      schoolId: data.schoolId
    },
    select: { id: true, name: true, email: true, role: true }
  });

  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  res.status(201).json({ token, user });
});

export default router;
