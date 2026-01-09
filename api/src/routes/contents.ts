import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middlewares/auth.js';
import { DataStore } from '../utils/dataStore.js';

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  scope: z.enum(['course', 'global']).default('course'),
  status: z.enum(['draft', 'published', 'pendingApproval']).default('draft')
});

router.get('/', requireAuth(['ADMIN', 'TEACHER']), async (req: AuthRequest, res) => {
  const { scope, status, authorId } = req.query as any;
  const filter: any = {};
  if (scope) filter.scope = scope;
  if (status) filter.status = status;
  if (authorId) filter.authorId = authorId;
  const items = DataStore.listContents(filter);
  res.json(items);
});

router.post('/', requireAuth(['TEACHER']), async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Datos inválidos' });
  const item = DataStore.createContent({
    ...parsed.data,
    authorId: req.user!.id
  });
  res.status(201).json(item);
});

router.post('/:id/publish', requireAuth(['TEACHER']), async (req: AuthRequest, res) => {
  const item = DataStore.updateContent(req.params.id, { status: 'published' });
  if (!item) return res.status(404).json({ message: 'No encontrado' });
  res.json(item);
});

router.post('/:id/request-approval', requireAuth(['TEACHER']), async (_req, res) => {
  const item = DataStore.updateContent(_req.params.id, { status: 'pendingApproval', scope: 'global' });
  if (!item) return res.status(404).json({ message: 'No encontrado' });
  res.json(item);
});

router.post('/:id/approve', requireAuth(['ADMIN']), async (_req, res) => {
  const item = DataStore.updateContent(_req.params.id, { status: 'approved' });
  if (!item) return res.status(404).json({ message: 'No encontrado' });
  res.json(item);
});

router.post('/:id/reject', requireAuth(['ADMIN']), async (_req, res) => {
  const item = DataStore.updateContent(_req.params.id, { status: 'rejected' });
  if (!item) return res.status(404).json({ message: 'No encontrado' });
  res.json(item);
});

router.delete('/:id', requireAuth(['ADMIN', 'TEACHER']), async (_req, res) => {
  DataStore.deleteContent(_req.params.id);
  res.status(204).end();
});

export default router;