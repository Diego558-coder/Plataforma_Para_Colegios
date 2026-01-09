import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, AuthRequest } from '../middlewares/auth.js';

const router = Router();

const mappingDescription = 'ADMIN_MAPPING';

router.get('/', requireAuth(['ADMIN']), async (_req, res) => {
  const assignments = await prisma.assignment.findMany({
    where: { description: mappingDescription },
    include: {
      teacher: true,
      students: { include: { student: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const normalized = assignments.map((a) => ({
    id: a.id,
    teacher: a.teacher ? { id: a.teacher.id, name: a.teacher.name, email: a.teacher.email } : null,
    students: a.students.map((s) => ({ id: s.student.id, name: s.student.name, email: s.student.email })),
    createdAt: a.createdAt,
    updatedAt: a.updatedAt
  }));

  res.json(normalized);
});

// Asignaciones visibles para el docente (solo las suyas)
router.get('/mine', requireAuth(['TEACHER']), async (req: AuthRequest, res) => {
  const assignments = await prisma.assignment.findMany({
    where: { description: mappingDescription, teacherId: req.user?.id },
    include: {
      teacher: true,
      students: { include: { student: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const normalized = assignments.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    teacher: a.teacher ? { id: a.teacher.id, name: a.teacher.name, email: a.teacher.email } : null,
    students: a.students.map((s) => ({
      id: s.student.id,
      name: s.student.name,
      email: s.student.email
    })),
    createdAt: a.createdAt,
    updatedAt: a.updatedAt
  }));

  res.json(normalized);
});

const assignSchema = z.object({
  teacherId: z.string().min(1),
  studentIds: z.array(z.string().min(1)).min(1)
});

const gradeSchema = z.object({
  studentId: z.string().min(1),
  grade: z.number().min(0).max(100)
});

router.post('/', requireAuth(['ADMIN']), async (req, res) => {
  const parsed = assignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Datos inválidos' });

  const { teacherId, studentIds } = parsed.data;
  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
  if (!teacher) return res.status(404).json({ message: 'Docente no encontrado' });

  const students = await prisma.user.findMany({ where: { id: { in: studentIds } } });
  if (students.length !== studentIds.length) return res.status(404).json({ message: 'Algún estudiante no existe' });

  // Remove previous mapping assignment for this teacher (and its student links) before creating a new one
  const previousAssignments = await prisma.assignment.findMany({
    where: { teacherId, description: mappingDescription },
    select: { id: true }
  });

  if (previousAssignments.length) {
    const previousIds = previousAssignments.map((a) => a.id);
    await prisma.assignmentStudent.deleteMany({ where: { assignmentId: { in: previousIds } } });
    await prisma.assignment.deleteMany({ where: { id: { in: previousIds } } });
  }

  const assignment = await prisma.assignment.create({
    data: {
      title: 'Asignación de estudiantes',
      description: mappingDescription,
      teacherId,
      students: {
        createMany: {
          data: studentIds.map((studentId) => ({ studentId }))
        }
      }
    },
    include: { teacher: true, students: { include: { student: true } } }
  });

  res.status(201).json({
    id: assignment.id,
    teacher: assignment.teacher ? { id: assignment.teacher.id, name: assignment.teacher.name, email: assignment.teacher.email } : null,
    students: assignment.students.map((s) => ({ id: s.student.id, name: s.student.name, email: s.student.email })),
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt
  });
});

router.get('/:id', requireAuth(['ADMIN', 'TEACHER', 'STUDENT']), async (req: AuthRequest, res) => {
  const assignment = await prisma.assignment.findUnique({
    where: { id: req.params.id },
    include: { teacher: true, students: { include: { student: true } } }
  });

  if (!assignment) return res.status(404).json({ message: 'Asignación no encontrada' });

  const isTeacherOwner = req.user?.role === 'TEACHER' && assignment.teacherId === req.user.id;
  const isAdmin = req.user?.role === 'ADMIN';
  const isStudentAssigned = req.user?.role === 'STUDENT' && assignment.students.some((s) => s.studentId === req.user?.id);

  if (!isAdmin && !isTeacherOwner && !isStudentAssigned) return res.status(403).json({ message: 'Permisos insuficientes' });

  res.json({
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    dueDate: assignment.dueDate,
    teacher: assignment.teacher ? { id: assignment.teacher.id, name: assignment.teacher.name, email: assignment.teacher.email } : null,
    students: assignment.students.map((s) => ({
      id: s.student.id,
      name: s.student.name,
      email: s.student.email,
      status: s.status,
      submittedAt: s.submittedAt,
      grade: s.grade
    })),
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt
  });
});

router.post('/:id/submit', requireAuth(['STUDENT']), async (req: AuthRequest, res) => {
  const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } });
  if (!assignment) return res.status(404).json({ message: 'Asignación no encontrada' });

  const link = await prisma.assignmentStudent.findFirst({ where: { assignmentId: assignment.id, studentId: req.user?.id } });
  if (!link) return res.status(403).json({ message: 'No estás asignado a esta tarea' });

  const updated = await prisma.assignmentStudent.update({
    where: { id: link.id },
    data: {
      status: 'submitted',
      submittedAt: new Date()
    }
  });

  res.json({
    assignmentId: assignment.id,
    studentId: updated.studentId,
    status: updated.status,
    submittedAt: updated.submittedAt
  });
});

router.patch('/:id/grade', requireAuth(['ADMIN', 'TEACHER']), async (req: AuthRequest, res) => {
  const parsed = gradeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Datos inválidos' });

  const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } });
  if (!assignment) return res.status(404).json({ message: 'Asignación no encontrada' });

  if (req.user?.role === 'TEACHER' && assignment.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Solo el docente asignado puede calificar' });
  }

  const link = await prisma.assignmentStudent.findFirst({ where: { assignmentId: assignment.id, studentId: parsed.data.studentId } });
  if (!link) return res.status(404).json({ message: 'El estudiante no está asignado a esta tarea' });

  const updated = await prisma.assignmentStudent.update({
    where: { id: link.id },
    data: {
      grade: parsed.data.grade,
      status: 'graded'
    }
  });

  res.json({
    assignmentId: assignment.id,
    studentId: updated.studentId,
    status: updated.status,
    grade: updated.grade
  });
});

// Desasignar un estudiante de una asignación; si queda vacío, elimina la asignación
router.delete('/:id/student/:studentId', requireAuth(['ADMIN']), async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const link = await prisma.assignmentStudent.findFirst({ where: { assignmentId: id, studentId } });
    if (!link) return res.status(404).json({ message: 'El estudiante no está asignado' });

    await prisma.assignmentStudent.delete({ where: { id: link.id } });

    const remaining = await prisma.assignmentStudent.count({ where: { assignmentId: id } });
    if (remaining === 0) {
      await prisma.assignment.delete({ where: { id } });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error desasignando estudiante:', error);
    res.status(500).json({ message: 'Error al desasignar estudiante', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.delete('/:id', requireAuth(['ADMIN']), async (req, res) => {
  await prisma.assignmentStudent.deleteMany({ where: { assignmentId: req.params.id } });
  await prisma.assignment.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

export default router;
