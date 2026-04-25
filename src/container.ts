/**
 * container.ts — Dependency Injection Wiring
 *
 * This is the composition root of the application.
 * Repositories are instantiated once and injected into services and controllers.
 * To migrate to MongoDB: replace Firestore* classes with Mongo* classes here — nothing else changes.
 */

import { initFirebase } from './config/firebase';
import { initMongoDB } from './config/mongodb';

// Repositories
import { MongoProfileRepository } from './repositories/mongodb/MongoProfileRepository';
import { MongoJobRepository } from './repositories/mongodb/MongoJobRepository';
import { MongoScreeningRepository } from './repositories/mongodb/MongoScreeningRepository';

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
  // ── Initialize Databases (idempotent/async) ────────────────────────────────
  initFirebase();
  initMongoDB().catch(err => {
    console.error('Failed to initialize MongoDB:', err);
  });

  // ── Repositories ──────────────────────────────────────────────────────────
  const profileRepo = new MongoProfileRepository();
  const jobRepo = new MongoJobRepository();
  const screeningRepo = new MongoScreeningRepository();

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
  const jobController = new JobController(jobRepo, profileRepo);
  const profileController = new ProfileController(ingestionService, documentParser, geminiGateway, profileRepo);
  const screeningController = new ScreeningController(orchestrator);

  return { 
    jobController, 
    profileController, 
    screeningController,
    jobRepo,
    profileRepo
  };
}
