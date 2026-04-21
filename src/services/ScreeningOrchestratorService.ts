import type { IJobRepository } from '../repositories/interfaces/IJobRepository';
import type { IProfileRepository } from '../repositories/interfaces/IProfileRepository';
import type { IScreeningRepository } from '../repositories/interfaces/IScreeningRepository';
import type { GeminiGatewayService } from './GeminiGatewayService';
import type { IJob, IScreeningResult } from '../types';

/**
 * ScreeningOrchestratorService
 * The brain that connects all the other pieces.
 * It fetches the job, fetches all profiles, calls Gemini for evaluation,
 * and saves the ranked results back to the database.
 */
export class ScreeningOrchestratorService {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly profileRepo: IProfileRepository,
    private readonly screeningRepo: IScreeningRepository,
    private readonly geminiGateway: GeminiGatewayService
  ) {}

  /**
   * Runs a full AI screening session for a given job.
   * Steps:
   *  1. Fetch the job from DB — throws if not found.
   *  2. Fetch all candidate profiles from DB.
   *  3. Delete any previous screening results for this job (re-run support).
   *  4. Send batch to GeminiGatewayService for evaluation.
   *  5. Persist and return all ranked ScreeningResult records.
   */
  async runScreening(jobId: string): Promise<IScreeningResult[]> {
    // 1. Fetch job
    const job: IJob | null = await this.jobRepo.findById(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);

    // 2. Fetch all profiles
    const profiles = await this.profileRepo.findAll();
    if (profiles.length === 0) {
      throw new Error('No candidate profiles found in the database. Ingest candidates first.');
    }

    // 3. Clear any existing results for this job
    await this.screeningRepo.deleteByJobId(jobId);

    // 4. Evaluate via Gemini
    const evaluations = await this.geminiGateway.evaluateCandidates(job, profiles);

    // 5. Attach jobId and persist
    const toSave: Omit<IScreeningResult, 'id' | 'evaluatedAt'>[] = evaluations.map((e) => ({
      ...e,
      jobId,
    }));

    return this.screeningRepo.bulkCreate(toSave);
  }

  /**
   * Fetches the ranked shortlist for a job.
   * @param jobId  The job to fetch results for.
   * @param topN   Maximum number of candidates to return (default: 10).
   */
  async getShortlist(jobId: string, topN = 10): Promise<IScreeningResult[]> {
    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);
    return this.screeningRepo.findShortlist(jobId, topN);
  }
}
