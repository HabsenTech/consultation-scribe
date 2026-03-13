import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { profileRoutes } from './routes/profile';
import { consultationRoutes } from './routes/consultations';
import { creditsRoutes } from './routes/credits';
import { preferencesRoutes } from './routes/preferences';
import { adminRoutes } from './routes/admin';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`MedScribe Backend running on port ${PORT}`);
});
