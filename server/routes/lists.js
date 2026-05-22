import { Router } from 'express';
import * as ctrl from '../controllers/listController.js';

const router = Router();

// Specific routes MUST come before parameterized routes
router.post('/boards/:boardId/lists', ctrl.createList);
router.put('/reorder/batch', ctrl.reorderLists);
router.put('/:id', ctrl.updateList);
router.delete('/:id', ctrl.deleteList);

export default router;
