import type { IJob } from '../../types';

/**
 * IJobRepository
 * Abstracts all job data persistence.
 */
export interface IJobRepository {
  /** Persist a new job and return it with the generated id. */
  create(job: Omit<IJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<IJob>;

  /** Fetch a single job by id. Returns null if not found. */
  findById(id: string): Promise<IJob | null>;

  /** Fetch all stored jobs. */
  findAll(): Promise<IJob[]>;

  /** Update an existing job. Returns the updated document. */
  update(id: string, data: Partial<IJob>): Promise<IJob | null>;

  /** Remove a job. */
  delete(id: string): Promise<void>;
}
