/**
 * container.ts — Dependency Injection Wiring
 *
 * This is the composition root of the application.
 * Repositories are instantiated once and injected into services and controllers.
 * To migrate to MongoDB: replace Firestore* classes with Mongo* classes here — nothing else changes.
 */

import { initFirebase } from './config/firebase';

// Repositories
import { FirestoreProfileRepository } from './repositories/firestore/FirestoreProfileRepository';
import { FirestoreJobRepository } from './repositories/firestore/FirestoreJobRepository';
import { FirestoreScreeningRepository } from './repositories/firestore/FirestoreScreeningRepository';

// Services
import { ProfileIngestionService } from './services/ProfileIngestionService';
import { DocumentParserService } from './services/DocumentParserService';
import { GeminiGatewayService } from './services/GeminiGatewayService';
import { ScreeningOrchestratorService } from './services/ScreeningOrchestratorService';

// Controllers
import { JobController } from './controllers/JobController';
import { ProfileController } from './controllers/ProfileController';
import { ScreeningController } from './controllers/ScreeningController';

export function buildContainer() {
  // ── Initialize Firebase (idempotent) ──────────────────────────────────────
  initFirebase();

  // ── Repositories ──────────────────────────────────────────────────────────
  const profileRepo = new FirestoreProfileRepository();
  const jobRepo = new FirestoreJobRepository();
  const screeningRepo = new FirestoreScreeningRepository();

  // ── Services ──────────────────────────────────────────────────────────────
  const ingestionService = new ProfileIngestionService(profileRepo);
  const documentParser = new DocumentParserService();
  const geminiGateway = new GeminiGatewayService();
  const orchestrator = new ScreeningOrchestratorService(
    jobRepo,
    profileRepo,
    screeningRepo,
    geminiGateway
  );

  // ── Controllers ───────────────────────────────────────────────────────────
  const jobController = new JobController(jobRepo);
  const profileController = new ProfileController(ingestionService, documentParser, geminiGateway, profileRepo);
  const screeningController = new ScreeningController(orchestrator);

  return { jobController, profileController, screeningController };
}
