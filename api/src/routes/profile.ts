import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthRequest } from '../middlewares/auth.js';
import { hashPassword } from '../utils/crypto.js';

const router = Router();

const updateProfileSchema = z
  .object({
    name: z.string().min(2).optional(),
    phone: z.string().min(5).optional(),
    password: z.string().min(6).optional()
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'Sin cambios' });

router.get('/me', requireAuth(), async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'No autorizado' });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, schoolId: true, school: true, createdAt: true }
  });
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user);
});

router.get('/student/registration', requireAuth(['STUDENT']), async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'No autorizado' });
  const reg = await prisma.registration.findFirst({
    where: { OR: [{ userId }, { email: req.user?.email }] },
    orderBy: { createdAt: 'desc' },
    include: { school: true, payments: true }
  });
  if (!reg) return res.status(404).json({ message: 'Registro no encontrado' });
  res.json(reg);
});

router.get('/student/assignments', requireAuth(['STUDENT']), async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'No autorizado' });
  const items = await prisma.assignmentStudent.findMany({
    where: { studentId: userId },
    include: {
      assignment: { include: { teacher: true } }
    }
  });

  const normalized = items.map((item) => ({
    id: item.assignmentId,
    title: item.assignment.title,
    teacher: item.assignment.teacher ? { id: item.assignment.teacher.id, name: item.assignment.teacher.name, email: item.assignment.teacher.email } : null,
    status: item.status,
    dueDate: item.assignment.dueDate,
    submittedAt: item.submittedAt,
    grade: item.grade
  }));

  res.json(normalized);
});

router.get('/teacher/assignments', requireAuth(['TEACHER']), async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'No autorizado' });
  const assignments = await prisma.assignment.findMany({
    where: { teacherId: userId },
    include: {
      students: { include: { student: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const normalized = assignments.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    dueDate: a.dueDate,
    students: a.students.map((s) => ({ id: s.student.id, name: s.student.name, email: s.student.email, status: s.status }))
  }));

  res.json(normalized);
});

router.patch('/me', requireAuth(), async (req: AuthRequest, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Datos inválidos', issues: parsed.error.flatten() });

  const data = parsed.data;
  const passwordHash = data.password ? await hashPassword(data.password) : undefined;

  const updated = await prisma.user.update({
    where: { id: req.user?.id },
    data: {
      name: data.name,
      phone: data.phone,
      passwordHash
    },
    select: { id: true, name: true, email: true, role: true, schoolId: true, phone: true, createdAt: true }
  });

  res.json(updated);
});

export default router;
