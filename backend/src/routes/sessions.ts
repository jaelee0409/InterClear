import { Router, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { transcribeAudio, generateFeedback } from '../services/openai';
import { supabaseAdmin } from '../services/supabase';
import { authenticateUser } from '../middleware/authenticateUser';
import { verifySubscription } from '../middleware/verifySubscription';
import { enforceDailyLimit } from '../middleware/enforceDailyLimit';
import { analyzeLimiter } from '../middleware/rateLimiter';
import type { AnalyzeRequest, AnalyzeResponse } from '../types';

const router = Router();

// Store uploads in a temp directory, auto-cleaned after processing
const upload = multer({
  dest: path.join(process.cwd(), 'tmp'),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB — Whisper's limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['audio/m4a', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/webm'];
    cb(null, allowed.includes(file.mimetype) || file.mimetype.startsWith('audio/'));
  },
});

// ─── POST /sessions/analyze ───────────────────────────────────────────────────

router.post(
  '/analyze',
  analyzeLimiter,
  authenticateUser,
  verifySubscription,
  enforceDailyLimit,
  upload.single('audio'),
  async (req: Request, res: Response, next: NextFunction) => {
    const audioFile = req.file;
    if (!audioFile) {
      res.status(400).json({ error: 'audio file is required' });
      return;
    }

    const { questionId, questionText, categoryId, durationSeconds } =
      req.body as AnalyzeRequest;

    if (!questionId || !questionText || !categoryId) {
      res.status(400).json({ error: 'questionId, questionText, and categoryId are required' });
      return;
    }

    try {
      // Generate a proper UUID so we can use it in both the feedback object and the DB row
      const sessionId = randomUUID();

      // 1. Transcribe audio with Whisper
      const transcript = await transcribeAudio(audioFile.path);

      console.log('[Session] question:', questionText);
      console.log('[Session] transcript:', transcript);

      // 2. Generate feedback with GPT-4o
      const feedback = await generateFeedback(
        questionText,
        transcript,
        Number(durationSeconds ?? 0),
        sessionId,
      );

      // 3. Persist session to Supabase
      const { error: insertError } = await supabaseAdmin
        .from('interview_sessions')
        .insert({
          id: sessionId,
          user_id: req.user.id,
          question_id: questionId,
          category_id: categoryId,
          question_text: questionText,
          transcript,
          feedback,
          feedback_type: 'basic',
          duration_seconds: Number(durationSeconds ?? 0),
        });

      if (insertError) {
        console.error('[Session] insert error:', insertError.message);
        // Non-fatal — still return the result to the client
      }

      // 4. Increment daily usage counter (fire-and-forget; non-fatal if it fails)
      supabaseAdmin
        .rpc('increment_usage', { p_user_id: req.user.id })
        .then(({ error }) => {
          if (error) console.error('[Session] increment_usage error:', error.message);
        });

      const response: AnalyzeResponse = { sessionId, transcript, feedback };
      res.json(response);
    } catch (err) {
      next(err);
    } finally {
      // Clean up temp audio file regardless of outcome
      if (audioFile?.path) {
        fs.unlink(audioFile.path, () => {});
      }
    }
  },
);

// ─── GET /sessions ────────────────────────────────────────────────────────────

router.get(
  '/',
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('interview_sessions')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data ?? []);
    } catch (err) {
      next(err);
    }
  },
);

// ─── GET /sessions/:id ────────────────────────────────────────────────────────

router.get(
  '/:id',
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('interview_sessions')
        .select('*')
        .eq('id', req.params.id)
        .eq('user_id', req.user.id) // scoped to the requesting user
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
);

export { router as sessionsRouter };
