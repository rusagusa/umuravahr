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
app.get('/health', async (_req: Request, res: Response) => {
  const { jobRepo, profileRepo } = buildContainer();
  const [jobs, profiles] = await Promise.all([
    jobRepo.findAll(),
    profileRepo.findAll()
  ]);
  
  res.json({
    status: 'ok',
    counts: {
      jobs: jobs.length,
      profiles: profiles.length
    },
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

// ─── Real Notifications Endpoint ──────────────────────────────────────────────
import { ScreeningResultModel } from './models/mongodb/ScreeningResult';
import { JobModel } from './models/mongodb/Job';

app.get('/api/notifications', async (_req: Request, res: Response) => {
  try {
    const notifications: any[] = [];

    // 1. Recent AI screening results (grouped by job)
    const recentScreenings = await ScreeningResultModel.aggregate([
      { $sort: { evaluatedAt: -1 } },
      { $group: { _id: '$jobId', count: { $sum: 1 }, lastRun: { $first: '$evaluatedAt' } } },
      { $limit: 10 }
    ]);

    for (const s of recentScreenings) {
      const job = await JobModel.findById(s._id).lean();
      const timeAgo = getTimeAgo(s.lastRun);
      notifications.push({
        id: `screening-${s._id}`,
        type: 'screening',
        title: 'AI Screening Complete',
        description: `${job?.title || 'Unknown Job'} — ${s.count} candidates ranked by Gemini.`,
        time: timeAgo,
        read: false,
      });
    }

    // 2. Recent jobs created
    const recentJobs = await JobModel.find({}).sort({ createdAt: -1 }).limit(5).lean();
    for (const job of recentJobs) {
      notifications.push({
        id: `job-${job._id}`,
        type: 'system',
        title: 'Job Published',
        description: `${job.title} role is now live and accepting applicants.`,
        time: getTimeAgo((job as any).createdAt),
        read: true,
      });
    }

    // 3. Static payment reminder (business logic)
    notifications.push({
      id: 'payment-1',
      type: 'payment',
      title: 'Payment Due',
      description: 'Your Umurava Pro subscription ($49/mo) is due in 3 days.',
      time: '1 hour ago',
      read: false,
    });

    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

function getTimeAgo(date: Date | string | undefined): string {
  if (!date) return 'Unknown';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs !== 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

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
