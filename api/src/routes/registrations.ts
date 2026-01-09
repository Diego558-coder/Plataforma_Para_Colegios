import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthRequest } from '../middlewares/auth.js';
import { hashPassword } from '../utils/crypto.js';

const router = Router();

const registrationSchema = z.object({
  fullName: z.string().min(3),
  document: z.string().min(5),
  email: z.string().email(),
  phone: z.string().min(6),
  birthdate: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  schoolId: z.string().optional(),
  grade: z.coerce.number(),
  gradeName: z.string().min(1),
  guardianName: z.string().min(3),
  guardianPhone: z.string().min(5),
  guardianEmail: z.string().email().optional(),
  paymentMethod: z.enum(['CARD', 'PSE', 'TRANSFER']),
  amount: z.number().positive().default(150000)
});

router.post('/', async (req, res) => {
  const parsed = registrationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Datos inválidos', issues: parsed.error.flatten() });

  const data = parsed.data;

  const existing = await prisma.registration.findFirst({
    where: {
      email: data.email,
      status: { in: ['PENDING', 'APPROVED'] }
    }
  });

  if (existing) {
    return res.status(409).json({
      message: 'Ya existe una solicitud activa para este correo',
      registrationId: existing.id,
      status: existing.status
    });
  }

  const reg = await prisma.registration.create({
    data: {
      fullName: data.fullName,
      document: data.document,
      email: data.email,
      phone: data.phone,
      birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
      gender: data.gender,
      address: data.address,
      schoolId: data.schoolId,
      grade: data.grade,
      gradeName: data.gradeName,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      guardianEmail: data.guardianEmail,
      paymentMethod: data.paymentMethod,
      amount: data.amount,
      status: 'PENDING',
      paymentStatus: 'PENDING'
    }
  });

  res.status(201).json(reg);
});

router.get('/', requireAuth(['ADMIN']), async (_req, res) => {
  const regs = await prisma.registration.findMany({
    orderBy: { createdAt: 'desc' },
    include: { school: true, payments: true }
  });
  res.json(regs);
});

router.get('/:id', requireAuth(['ADMIN']), async (req, res) => {
  const reg = await prisma.registration.findUnique({
    where: { id: req.params.id },
    include: { school: true, payments: true, user: true }
  });

  if (!reg) return res.status(404).json({ message: 'Registro no encontrado' });
  res.json(reg);
});

router.patch('/:id/status', requireAuth(['ADMIN']), async (req: AuthRequest, res) => {
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
