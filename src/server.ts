import 'dotenv/config';
import { app } from './app';

const PORT = Number(process.env.PORT) || 4000;

// Listen on 0.0.0.0 so Cloud Run / Docker can reach the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Local dev server listening on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   API:    http://localhost:${PORT}/api`);
});
