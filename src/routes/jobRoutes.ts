import { Router } from 'express';
import type { JobController } from '../controllers/JobController';

export function createJobRouter(controller: JobController): Router {
  const router = Router();

  /** POST /api/jobs — Create a new job requirement */
  router.post('/', controller.create);

  /** GET /api/jobs — List all jobs */
  router.get('/', controller.getAll);

  /** GET /api/jobs/:id — Get a single job */
  router.get('/:id', controller.getById);

  return router;
}
