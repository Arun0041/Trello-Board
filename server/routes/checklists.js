import { Router } from 'express';
import * as ctrl from '../controllers/checklistController.js';

const router = Router();

router.post('/cards/:cardId/checklists', ctrl.createChecklist);
router.delete('/:id', ctrl.deleteChecklist);
router.post('/:checklistId/items', ctrl.addItem);
router.put('/items/:itemId', ctrl.updateItem);
router.delete('/items/:itemId', ctrl.deleteItem);

export default router;
