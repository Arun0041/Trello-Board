import { Router } from 'express';
import * as ctrl from '../controllers/labelController.js';

const router = Router();

router.get('/boards/:boardId/labels', ctrl.getBoardLabels);
router.post('/boards/:boardId/labels', ctrl.createLabel);
router.put('/:id', ctrl.updateLabel);
router.delete('/:id', ctrl.deleteLabel);

export default router;
