import { Router } from 'express';
import * as ctrl from '../controllers/attachmentController.js';

const router = Router();

router.get('/cards/:cardId', ctrl.getAttachments);
router.post('/cards/:cardId', ctrl.addAttachment);
router.delete('/:id', ctrl.deleteAttachment);

export default router;
