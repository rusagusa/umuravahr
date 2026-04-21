import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/apiRoutes';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Umurava AI Backend (Functional Wrapper)', 
    timestamp: new Date().toISOString() 
  });
});

app.use('/api', apiRoutes);

export { app };
