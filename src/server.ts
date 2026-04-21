import { app } from './app';

const PORT = parseInt(process.env.PORT ?? '8080', 10);

app.listen(PORT, () => {
  console.log(`🚀 Umurava AI Screening API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Jobs:   http://localhost:${PORT}/api/jobs`);
  console.log(`   Profiles: http://localhost:${PORT}/api/profiles/structured`);
  console.log(`   Screening: http://localhost:${PORT}/api/screenings/evaluate/:jobId`);
});
