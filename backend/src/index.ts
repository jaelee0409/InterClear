import express from 'express';
import cors from 'cors';
import { config } from './config';
import { sessionsRouter } from './routes/sessions';
import { categoriesRouter } from './routes/categories';
// Side-effect import: registers req.user / req.subscription on Express.Request
import './types';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({ origin: config.allowedOrigins }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/sessions', sessionsRouter);
app.use('/api/categories', categoriesRouter);

// ─── Error handler ────────────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: err.message ?? 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(config.port, () => {
  console.log(`\n🚀 Interview Lab API running on http://localhost:${config.port}`);
  console.log(`   Health:     GET  /health`);
  console.log(`   Analyze:    POST /api/sessions/analyze`);
  console.log(`   Sessions:   GET  /api/sessions`);
  console.log(`   Categories: GET  /api/categories\n`);
});
