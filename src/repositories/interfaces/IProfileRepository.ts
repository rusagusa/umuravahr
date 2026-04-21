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

  /** Remove a profile. */
  delete(id: string): Promise<void>;
}
