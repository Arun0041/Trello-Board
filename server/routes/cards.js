import { Router } from 'express';
import * as ctrl from '../controllers/cardController.js';

const router = Router();

// Specific routes MUST come before parameterized routes
router.post('/lists/:listId/cards', ctrl.createCard);
router.put('/reorder/batch', ctrl.reorderCards);
router.get('/:id', ctrl.getCardById);
router.put('/:id', ctrl.updateCard);
router.delete('/:id', ctrl.deleteCard);
router.post('/:cardId/labels/:labelId', ctrl.addLabel);
router.delete('/:cardId/labels/:labelId', ctrl.removeLabel);
router.post('/:cardId/members/:memberId', ctrl.addMember);
router.delete('/:cardId/members/:memberId', ctrl.removeMember);

export default router;
