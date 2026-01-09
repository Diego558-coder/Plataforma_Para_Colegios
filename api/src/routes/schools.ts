import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  const schools = await prisma.school.findMany({ orderBy: { name: 'asc' } });
  res.json(schools);
});

router.post('/', requireAuth(['ADMIN']), async (req, res) => {
  const { name, city, address, phone } = req.body;
  if (!name) return res.status(400).json({ message: 'Nombre requerido' });
  const school = await prisma.school.create({ data: { name, city, address, phone } });
  res.status(201).json(school);
});

router.patch('/:id', requireAuth(['ADMIN']), async (req, res) => {
  const { name, city, address, phone, status } = req.body;
  const school = await prisma.school.update({
    where: { id: req.params.id },
    data: {
      name,
      city,
      address,
      phone,
      status
    }
  });
  res.json(school);
});

export default router;
