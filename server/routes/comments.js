import { Router } from 'express';
import * as ctrl from '../controllers/commentController.js';

const router = Router();

router.get('/cards/:cardId/comments', ctrl.getCardComments);
router.post('/cards/:cardId/comments', ctrl.createComment);
router.delete('/:id', ctrl.deleteComment);

export default router;
