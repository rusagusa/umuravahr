import type { IScreeningResult } from '../../types';

/**
 * IScreeningRepository
 * Abstracts all screening result data persistence.
 */
export interface IScreeningRepository {
  /** Persist multiple screening results for a given evaluation run. */
  bulkCreate(results: Omit<IScreeningResult, 'id' | 'evaluatedAt'>[]): Promise<IScreeningResult[]>;

  /** Fetch all results for a job, sorted by candidateRank ascending. */
  findByJobId(jobId: string): Promise<IScreeningResult[]>;

  /** Fetch top N candidates (shortlist) for a job. */
  findShortlist(jobId: string, topN?: number): Promise<IScreeningResult[]>;

  /** Delete all results for a specific job — used before a re-run. */
  deleteByJobId(jobId: string): Promise<void>;
}
