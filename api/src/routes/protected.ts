import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthRequest } from '../middlewares/auth.js';
import { hashPassword } from '../utils/crypto.js';

const router = Router();

router.get('/stats', requireAuth(['ADMIN']), async (_req, res) => {
  const [registrations, users, schools] = await Promise.all([
    prisma.registration.findMany(),
    prisma.user.findMany(),
    prisma.school.findMany()
  ]);

  const pending = registrations.filter((r) => r.status === 'PENDING').length;
  const approved = registrations.filter((r) => r.status === 'APPROVED').length;
  const teachers = users.filter((u) => u.role === 'TEACHER').length;
  const activeSchools = schools.filter((s) => s.status === 'active').length;

  res.json({ pending, approved, teachers, activeSchools });
});

router.get('/registrations', requireAuth(['ADMIN']), async (_req, res) => {
  const regs = await prisma.registration.findMany({ orderBy: { createdAt: 'desc' }, include: { payments: true, school: true } });
  res.json(regs);
});

router.get('/registrations/:id', requireAuth(['ADMIN']), async (req, res) => {
  const reg = await prisma.registration.findUnique({
    where: { id: req.params.id },
    include: { payments: true, school: true, user: true }
  });

  if (!reg) return res.status(404).json({ message: 'Registro no encontrado' });
  res.json(reg);
});

router.patch('/registrations/:id/status', requireAuth(['ADMIN']), async (req: AuthRequest, res) => {
  const { status } = req.body as { status?: 'APPROVED' | 'REJECTED' | 'PENDING' };
  if (!status) return res.status(400).json({ message: 'Estado requerido' });

  const registration = await prisma.registration.findUnique({ where: { id: req.params.id } });
  if (!registration) return res.status(404).json({ message: 'Registro no encontrado' });

  let userId = registration.userId;
  if (status === 'APPROVED' && !userId) {
    const existingUser = await prisma.user.findUnique({ where: { email: registration.email } });
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const passwordHash = await hashPassword('estudiante123');
      const newUser = await prisma.user.create({
        data: {
          name: registration.fullName,
          email: registration.email,
          passwordHash,
          role: 'STUDENT',
          schoolId: registration.schoolId
        }
      });
      userId = newUser.id;
    }
  }

  const updated = await prisma.registration.update({
    where: { id: req.params.id },
    data: {
      status,
      userId,
      approvedBy: status === 'APPROVED' ? req.user?.id : undefined,
      approvedAt: status === 'APPROVED' ? new Date() : undefined,
      rejectedAt: status === 'REJECTED' ? new Date() : undefined
    },
    include: { school: true, payments: true }
  });

  res.json(updated);
});

export default router;
