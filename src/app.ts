import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';

import { buildContainer } from './container';
import { createJobRouter } from './routes/jobRoutes';
import { createProfileRouter } from './routes/profileRoutes';
import { createScreeningRouter } from './routes/screeningRoutes';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Umurava AI Talent Screening API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Dependency Injection & Route Mounting ────────────────────────────────────
const { jobController, profileController, screeningController } = buildContainer();

app.use('/api/jobs', createJobRouter(jobController));
app.use('/api/profiles', createProfileRouter(profileController));
app.use('/api/screenings', createScreeningRouter(screeningController));

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected error occurred.',
  });
});

export { app };
