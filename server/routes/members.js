import { Router } from 'express';
import * as ctrl from '../controllers/memberController.js';

const router = Router();

router.get('/', ctrl.getAllMembers);

export default router;
