import { Router } from 'express';
import * as ctrl from '../controllers/searchController.js';

const router = Router();

router.get('/boards/:boardId', ctrl.searchCards);

export default router;
