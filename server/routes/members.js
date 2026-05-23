import { Router } from 'express';
import * as ctrl from '../controllers/memberController.js';

const router = Router();

router.get('/', ctrl.getAllMembers);
router.post('/', ctrl.createMember);
router.post('/boards/:boardId', ctrl.addBoardMember);

export default router;
