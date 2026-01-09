import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middlewares/auth.js';
import { hashPassword } from '../utils/crypto.js';

const router = Router();

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
  schoolId: z.string().optional()
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']).optional(),
  schoolId: z.string().optional()
});

router.get('/', requireAuth(['ADMIN']), async (req, res) => {
  const roleParam = (req.query.role as string | undefined)?.toUpperCase();
  const where = roleParam ? { role: roleParam as Role } : {};
  const users = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, role: true, schoolId: true, school: true, createdAt: true }
  });
  res.json(users);
});

router.post('/', requireAuth(['ADMIN']), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
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
      role: data.role as Role,
      schoolId: data.schoolId
    },
    select: { id: true, name: true, email: true, role: true, schoolId: true, createdAt: true }
  });

  res.status(201).json(user);
});

router.patch('/:id', requireAuth(['ADMIN']), async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Datos inválidos' });

  const data = parsed.data;
  const passwordHash = data.password ? await hashPassword(data.password) : undefined;

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      name: data.name,
      role: data.role as Role | undefined,
      schoolId: data.schoolId,
      passwordHash
    },
    select: { id: true, name: true, email: true, role: true, schoolId: true, createdAt: true }
  });

  res.json(user);
});

router.delete('/:id', requireAuth(['ADMIN']), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Eliminar en orden para evitar FK constraints
    await prisma.assignmentStudent.deleteMany({ where: { studentId: userId } });
    await prisma.assignment.deleteMany({ where: { teacherId: userId } });
    await prisma.registration.updateMany({ where: { userId }, data: { userId: null } });
    await prisma.user.delete({ where: { id: userId } });
    
    res.status(204).end();
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
