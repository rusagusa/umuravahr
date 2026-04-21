import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ProfileIngestionService } from '../services/ProfileIngestionService';
import type { DocumentParserService } from '../services/DocumentParserService';
import type { GeminiGatewayService } from '../services/GeminiGatewayService';
import type { IProfileRepository } from '../repositories/interfaces/IProfileRepository';

export class ProfileController {
  constructor(
    private readonly ingestionService: ProfileIngestionService,
    private readonly documentParser: DocumentParserService,
    private readonly geminiGateway: GeminiGatewayService,
    private readonly profileRepo: IProfileRepository
  ) {}

  /**
   * GET /api/profiles
   * Returns all stored profiles.
   */
  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profiles = await this.profileRepo.findAll();
      res.json({ success: true, count: profiles.length, data: profiles });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/profiles/:id
   * Returns a single profile by Firestore doc ID.
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.profileRepo.findById(req.params.id);
      if (!profile) {
        res.status(404).json({ success: false, message: 'Profile not found.' });
        return;
      }
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/profiles/structured
   * Accepts a JSON body exactly matching the Umurava Talent Profile Schema.
   */
  ingestStructured = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.ingestionService.ingestStructured(req.body);
      res.status(201).json({ success: true, data: profile });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(422).json({
          success: false,
          message: 'Profile schema validation failed.',
          errors: err.flatten().fieldErrors,
        });
        return;
      }
      next(err);
    }
  };

  /**
   * POST /api/profiles/unstructured
   * Accepts a single file upload (PDF, CSV, TXT) via multipart/form-data field "resume".
   * Extracts text → sends to Gemini → validates → persists.
   */
  ingestUnstructured = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, message: 'No file uploaded. Use field name "resume".' });
        return;
      }

      const rawText = await this.documentParser.extractText(file.buffer, file.mimetype);
      const parsedProfile = await this.geminiGateway.parseUnstructuredToSchema(rawText);
      const profile = await this.ingestionService.ingestParsed(parsedProfile);

      res.status(201).json({ success: true, data: profile });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(422).json({
          success: false,
          message: 'Gemini-parsed profile failed schema validation.',
          errors: err.flatten().fieldErrors,
        });
        return;
      }
      next(err);
    }
  };
}
