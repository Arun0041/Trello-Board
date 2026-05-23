import { Router } from 'express';
import * as ctrl from '../controllers/boardController.js';

const router = Router();

router.get('/', ctrl.getAllBoards);
router.post('/', ctrl.createBoard);
router.get('/:id', ctrl.getBoardById);
router.get('/:id/archived', ctrl.getArchivedItems);
router.put('/:id', ctrl.updateBoard);
router.delete('/:id', ctrl.deleteBoard);

export default router;
