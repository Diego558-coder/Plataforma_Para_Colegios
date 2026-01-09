import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middlewares/auth.js';
import { DataStore } from '../utils/dataStore.js';

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(['draft', 'published', 'closed']).default('draft')
});

router.get('/', requireAuth(['ADMIN', 'TEACHER']), async (req: AuthRequest, res) => {
  const { status, authorId } = req.query as any;
  const filter: any = {};
  if (status) filter.status = status;
  if (authorId) filter.authorId = authorId;
  const items = DataStore.listTasks(filter);
  res.json(items);
});

router.post('/', requireAuth(['TEACHER']), async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Datos inválidos' });
  const item = DataStore.createTask({
    ...parsed.data,
    authorId: req.user!.id
  });
  res.status(201).json(item);
});

router.post('/:id/publish', requireAuth(['TEACHER']), async (_req, res) => {
  const item = DataStore.updateTask(_req.params.id, { status: 'published' });
  if (!item) return res.status(404).json({ message: 'No encontrado' });
  res.json(item);
});

router.post('/:id/close', requireAuth(['TEACHER', 'ADMIN']), async (_req, res) => {
  const item = DataStore.updateTask(_req.params.id, { status: 'closed' });
  if (!item) return res.status(404).json({ message: 'No encontrado' });
  res.json(item);
});

router.delete('/:id', requireAuth(['ADMIN', 'TEACHER']), async (_req, res) => {
  DataStore.deleteTask(_req.params.id);
  res.status(204).end();
});

export default router;