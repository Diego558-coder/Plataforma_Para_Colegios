import { Router } from 'express';
import authRoutes from './auth.js';
import schoolRoutes from './schools.js';
import registrationRoutes from './registrations.js';
import paymentRoutes from './payments.js';
import dashboardRoutes from './protected.js';
import userRoutes from './users.js';
import assignmentRoutes from './assignments.js';
import profileRoutes from './profile.js';
import contentRoutes from './contents.js';
import taskRoutes from './tasks.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/schools', schoolRoutes);
router.use('/registrations', registrationRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/profile', profileRoutes);
router.use('/contents', contentRoutes);
router.use('/tasks', taskRoutes);

export default router;
