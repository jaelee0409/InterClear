import OpenAI, { toFile } from 'openai';
import fs from 'fs';
import { config } from '../config';
import type { AIFeedback, DimensionScore, FeedbackDimension } from '../types';

const openai = new OpenAI({ apiKey: config.openaiApiKey });

// ─── Whisper STT ──────────────────────────────────────────────────────────────

export async function transcribeAudio(filePath: string): Promise<string> {
  // Multer saves files without an extension; toFile lets us tell Whisper the format
  const audioFile = await toFile(
    fs.createReadStream(filePath),
    'recording.m4a',
    { type: 'audio/m4a' },
  );

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'ko',
    response_format: 'text',
  });

  const text = transcription as unknown as string;
  console.log('\n[Whisper transcript]\n', text, '\n');
  return text;
}

// ─── GPT-4o Feedback ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
당신은 한국 취업 면접 전문 코치입니다. 지원자의 면접 답변을 분석하고 구조화된 JSON 피드백을 제공합니다.

피드백은 반드시 다음 5가지 기준으로 평가하세요:
- structure (구조): 답변의 논리적 구성 (STAR 방법론 활용 여부 등)
- logic (논리성): 주장과 근거의 일관성
- tone (어조): 전문적이고 자신감 있는 표현
- confidence (자신감): 말의 확신도와 명확성
- relevance (적합성): 질문과 답변의 관련성

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.
`.trim();

type GPTFeedbackShape = {
  overallScore: number;
  summary: string;
  dimensions: Array<{ dimension: FeedbackDimension; score: number; comment: string }>;
  strengths: string[];
  improvements: string[];
  rewrittenAnswer: string;
};

export async function generateFeedback(
  questionText: string,
  transcript: string,
  durationSeconds: number,
  sessionId: string,
): Promise<AIFeedback> {
  const userPrompt = `
면접 질문: ${questionText}

지원자 답변 (전사):
${transcript}

답변 시간: ${Math.floor(durationSeconds / 60)}분 ${durationSeconds % 60}초

아래 JSON 형식으로 피드백을 제공하세요:
{
  "overallScore": <0-100 정수>,
  "summary": "<2-3문장 한국어 종합 평가>",
  "dimensions": [
    { "dimension": "structure", "score": <0-100>, "comment": "<한국어 코멘트>" },
    { "dimension": "logic",     "score": <0-100>, "comment": "<한국어 코멘트>" },
    { "dimension": "tone",      "score": <0-100>, "comment": "<한국어 코멘트>" },
    { "dimension": "confidence","score": <0-100>, "comment": "<한국어 코멘트>" },
    { "dimension": "relevance", "score": <0-100>, "comment": "<한국어 코멘트>" }
  ],
  "strengths": ["<강점1>", "<강점2>", "<강점3>"],
  "improvements": ["<개선점1>", "<개선점2>", "<개선점3>"],
  "rewrittenAnswer": "<AI가 재작성한 모범 답안 (한국어, 2-4문단)>"
}
`.trim();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    temperature: 0.4,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('GPT-4o returned empty response');

  const parsed: GPTFeedbackShape = JSON.parse(raw);

  return {
    id: `feedback-${Date.now()}`,
    sessionId,
    overallScore: Math.round(Math.max(0, Math.min(100, parsed.overallScore))),
    summary: parsed.summary,
    dimensions: parsed.dimensions as DimensionScore[],
    strengths: parsed.strengths.slice(0, 3),
    improvements: parsed.improvements.slice(0, 3),
    rewrittenAnswer: parsed.rewrittenAnswer,
    generatedAt: new Date().toISOString(),
    model: 'gpt-4o',
  };
}
