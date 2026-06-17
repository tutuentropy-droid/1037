import { Router } from 'express';
import {
  getGameState,
  initGame,
  resetGame,
  updateGameParams,
  stepGame,
  getEntity,
  getHistory,
} from '../controllers/gameController.js';

const router = Router();

router.get('/state', getGameState);
router.post('/init', initGame);
router.post('/reset', resetGame);
router.post('/params', updateGameParams);
router.post('/step', stepGame);
router.get('/entity/:id', getEntity);
router.get('/history', getHistory);

export default router;
