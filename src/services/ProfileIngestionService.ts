import { ProfileSchema, type ProfileOutput } from '../schemas/profile.schema';
import type { IProfileRepository } from '../repositories/interfaces/IProfileRepository';
import type { IProfile } from '../types';
import { ZodError } from 'zod';

/**
 * ProfileIngestionService
 * Validates incoming JSON payloads against the Umurava Talent Profile Zod schema
 * and persists them using the injected repository.
 */
export class ProfileIngestionService {
  constructor(private readonly profileRepo: IProfileRepository) {}

  /**
   * Validates and saves a structured JSON profile (Scenario 1).
   * Throws a ZodError with full field-level detail on schema violations.
   */
  async ingestStructured(raw: unknown): Promise<IProfile> {
    // 1. Validate — throws ZodError automatically on failure
    const validated: ProfileOutput = ProfileSchema.parse(raw);

    // 2. Guard against duplicates by email
    const existing = await this.profileRepo.findByEmail(validated.email);
    if (existing) {
      // Update existing record rather than creating a duplicate
      const updated = await this.profileRepo.update(existing.id!, validated);
      if (!updated) throw new Error(`Failed to update profile with id ${existing.id}`);
      return updated;
    }

    // 3. Persist and return
    return this.profileRepo.create(validated);
  }

  /**
   * Saves a pre-parsed AI profile (called by DocumentParserService after Gemini extraction).
   */
  async ingestParsed(parsedProfile: ProfileOutput): Promise<IProfile> {
    // Re-validate to be safe — Gemini output can sometimes drift
    const validated: ProfileOutput = ProfileSchema.parse(parsedProfile);

    const existing = await this.profileRepo.findByEmail(validated.email);
    if (existing) {
      const updated = await this.profileRepo.update(existing.id!, validated);
      if (!updated) throw new Error(`Failed to update profile with id ${existing.id}`);
      return updated;
    }

    return this.profileRepo.create(validated);
  }

  /**
   * Helper to format Zod validation errors into a human-readable object.
   */
  static formatZodError(err: ZodError): Record<string, string> {
    return Object.fromEntries(
      err.issues.map((issue) => [issue.path.join('.'), issue.message])
    );
  }
}
