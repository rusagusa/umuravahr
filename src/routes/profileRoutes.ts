import { Router } from 'express';
import multer from 'multer';
import type { ProfileController } from '../controllers/ProfileController';

// Store uploads in memory so DocumentParserService can access the buffer directly
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export function createProfileRouter(controller: ProfileController): Router {
  const router = Router();

  /** GET /api/profiles — list all profiles */
  router.get('/', controller.getAll);

  /** GET /api/profiles/:id — get one profile by ID */
  router.get('/:id', controller.getById);

  /** PATCH /api/profiles/:id/status — update recruitment state */
  router.patch('/:id/status', controller.updateStatus);

  /**
   * POST /api/profiles/structured
   * Accepts JSON body matching the Umurava Talent Profile Schema.
   */
  router.post('/structured', controller.ingestStructured);

  /**
   * POST /api/profiles/unstructured
   * Accepts a multipart/form-data upload with field name "resume" (PDF / CSV / TXT).
   */
  router.post('/unstructured', upload.single('resume'), controller.ingestUnstructured);

  return router;
}
