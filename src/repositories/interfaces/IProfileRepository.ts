import type { IProfile } from '../../types';

/**
 * IProfileRepository
 * Abstracts all profile data persistence.
 * Swap the concrete implementation (Firestore → MongoDB) without touching business logic.
 */
export interface IProfileRepository {
  /** Persist a new profile and return it with the generated id. */
  create(profile: Omit<IProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProfile>;

  /** Fetch a single profile by id. Returns null if not found. */
  findById(id: string): Promise<IProfile | null>;

  /** Fetch a single profile by email. Returns null if not found. */
  findByEmail(email: string): Promise<IProfile | null>;

  /** Fetch all stored profiles. */
  findAll(): Promise<IProfile[]>;

  /** Replace an existing profile's data. Returns the updated document. */
  update(id: string, data: Partial<IProfile>): Promise<IProfile | null>;

  /** Specifically updates the pipeline state of a candidate */
  updateStatus(id: string, status: 'pending' | 'shortlisted' | 'rejected'): Promise<IProfile | null>;

  /** Count external profiles applied to a specific job. */
  countExternalByJob(jobId: string): Promise<number>;

  /** Remove a profile. */
  delete(id: string): Promise<void>;
}
