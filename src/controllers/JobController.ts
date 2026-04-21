import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { CreateJobSchema } from '../schemas/job.schema';
import type { IJobRepository } from '../repositories/interfaces/IJobRepository';

export class JobController {
  constructor(private readonly jobRepo: IJobRepository) {}

  /** POST /api/jobs */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = CreateJobSchema.parse(req.body);
      const job = await this.jobRepo.create(parsed);
      res.status(201).json({ success: true, data: job });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(422).json({ success: false, errors: err.flatten().fieldErrors });
        return;
      }
      next(err);
    }
  };

  /** GET /api/jobs/:id */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await this.jobRepo.findById(req.params.id);
      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found.' });
        return;
      }
      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/jobs */
  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobs = await this.jobRepo.findAll();
      res.json({ success: true, data: jobs });
    } catch (err) {
      next(err);
    }
  };
}
