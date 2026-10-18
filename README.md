# InterClear (인터클리어)

An AI interview-practice app for Korean job seekers. Pick a field, hear each question read aloud, answer by voice, and get structured feedback.

Built in March 2026 with AI assistance: 3 of the 4 commits carry a `Co-Authored-By: Claude Sonnet 4.6` trailer, including the main "launch InterClear v1.0.0" MVP scaffold.

## How it works

1. Pick a field. The app reads a question aloud with text-to-speech (`expo-speech`).
2. Answer by voice. The app records the answer (`expo-audio`) and uploads it to the backend.
3. The Express backend transcribes the recording with OpenAI `whisper-1`.
4. `gpt-4o` returns JSON feedback: an overall score (0–100) and five scored dimensions, each with a comment (structure, including use of STAR; logic; tone; confidence; relevance), plus strengths, improvements, and a model answer.
5. Sessions are kept on the device (Zustand + AsyncStorage) and synced to Supabase, which also handles sign-in and holds the question bank.

## Stack

- App: React Native 0.81, Expo 54 (Expo Router), Zustand, AsyncStorage
- Backend: Node.js, Express, multer, OpenAI API
- Data and auth: Supabase

## Structure

```
app/        screens (Expo Router): onboarding, (auth), (tabs), interview, legal
backend/    Express API: /api/sessions, /api/categories; OpenAI calls in src/services/openai.ts
supabase/   seed_questions.sql (question bank)
domain/     shared types, such as the feedback dimensions
services/   API clients used by the app
store/      Zustand stores (auth, interview, settings)
```

## Run locally

Backend: create `backend/.env` with `OPENAI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` (optional: `PORT`, default 3001, and `ALLOWED_ORIGINS`).

```bash
cd backend
npm install
npm run dev
```

App: create `.env` with `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL`, and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. In development the app uses built-in sample questions unless `EXPO_PUBLIC_MOCK_DATA=false`.

```bash
npm install
npx expo start
```
