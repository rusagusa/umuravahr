import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { CreateJobSchema } from '../schemas/job.schema';
import type { IJobRepository } from '../repositories/interfaces/IJobRepository';
import type { IProfileRepository } from '../repositories/interfaces/IProfileRepository';
import { ProfileModel } from '../models/mongodb/Profile';
import mongoose from 'mongoose';

export class JobController {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly profileRepo: IProfileRepository
  ) {}

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
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { recruiterId } = req.query;
      const filter = recruiterId ? { recruiterId: recruiterId as string } : {};
      
      const jobs = await this.jobRepo.findAll(filter);
      
      const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
        const applicantCount = await this.profileRepo.countExternalByJob(job.id as string);
        return {
          ...job,
          applicantCount
        };
      }));

      res.status(200).json({ success: true, data: jobsWithCounts });
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/jobs/:id/candidates — Pre-screening candidate pool */
  getCandidates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await this.jobRepo.findById(req.params.id);
      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found.' });
        return;
      }

      const jobId = new mongoose.Types.ObjectId(req.params.id);

      // 1. External applicants who applied to this specific job
      const externalApplicants = await ProfileModel.find({
        source: 'external',
        appliedJobs: jobId
      }).lean();

      // 2. Internal talent whose skills match at least one required skill
      const requiredSkills = job.requiredSkills || [];
      const internalTalent = await ProfileModel.find({
        source: 'umurava',
        'skills.name': { $in: requiredSkills }
      }).lean();

      // Normalize IDs for frontend
      const normalize = (doc: any) => ({ ...doc, id: doc._id?.toString(), _id: undefined });

      const candidates = [
        ...externalApplicants.map(p => ({ ...normalize(p), matchReason: 'Applied via job link' })),
        ...internalTalent.map(p => ({ ...normalize(p), matchReason: 'Skill match from Umurava pool' })),
      ];

      res.json({ success: true, data: candidates });
    } catch (err) {
      next(err);
    }
  };
}
