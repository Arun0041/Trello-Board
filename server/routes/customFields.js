import { Router } from 'express';
import * as ctrl from '../controllers/customFieldController.js';

const router = Router();

router.post('/boards/:boardId', ctrl.createCustomField);
router.delete('/:id', ctrl.deleteCustomField);

export default router;
