import { Router } from 'express';
import claimRoutes from './claims';
import patientRoutes from './patients';

const router = Router();

router.use('/claims', claimRoutes);
router.use('/patients', patientRoutes);

export default router;
