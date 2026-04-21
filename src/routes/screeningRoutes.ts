import { Router } from 'express';
import type { ScreeningController } from '../controllers/ScreeningController';

export function createScreeningRouter(controller: ScreeningController): Router {
  const router = Router();

  /**
   * POST /api/screenings/evaluate/:jobId
   * Triggers the AI screening pipeline for all profiles against the given job.
   */
  router.post('/evaluate/:jobId', controller.evaluate);

  /**
   * GET /api/screenings/:jobId/shortlist
   * Returns top-ranked candidates with Explainable AI reasoning.
   * Optional query param: ?topN=5
   */
  router.get('/:jobId/shortlist', controller.getShortlist);

  return router;
}
